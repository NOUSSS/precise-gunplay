// Filme la vraie interface de l'app, alimentée par des données fictives (demo/), image par image.
// Usage, depuis la racine du dépôt (ffmpeg dans le PATH) :
//   npx electron .github/media/video/record.js            vidéo complète -> .cache/master.mp4
//   STILLS=3.5,12 npx electron .github/media/video/record.js   seulement ces instants, en PNG dans .cache/stills/
//   FPS=20 npx electron ...                                aperçu rapide
// Puis node .github/media/video/encode.js tire de master.mp4 les fichiers du site et du README.
// Le temps de l'app est virtuel (timeshim.js) : chaque image est calculée pour un instant exact,
// sans dépendre de la vitesse de la machine. Les images de valorant-api.com sont gardées dans .cache/.
const { app, BrowserWindow, protocol, net, session } = require('electron');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const HERE = __dirname;
const CACHE = path.join(HERE, '.cache');
const SW = 1920, SH = 1080;
const FPS = Number(process.env.FPS) || 60;
const STILLS = process.env.STILLS ? process.env.STILLS.split(',').map(Number) : null;
let ff = null; // encodeur ffmpeg, arrêté si le tournage échoue

// profil propre au tournage : un autre Electron lancé en même temps ne se dispute pas le cache
app.setPath('userData', path.join(CACHE, 'profile'));
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };

// Petit serveur statique local : la scène et l'app partagent ainsi la même origine.
function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

// Images de valorant-api.com : téléchargées une fois, puis servies depuis .cache/vapi/
function cacheRemoteImages() {
  session.defaultSession.protocol.handle('https', async (req) => {
    const u = new URL(req.url);
    if (u.hostname !== 'media.valorant-api.com') return net.fetch(req, { bypassCustomProtocolHandlers: true });
    const file = path.join(CACHE, 'vapi', u.pathname.replace(/[^a-z0-9./-]/gi, '_'));
    if (!fs.existsSync(file)) {
      const res = await net.fetch(req.url, { bypassCustomProtocolHandlers: true, headers: { 'User-Agent': 'agent-local' } });
      if (!res.ok) return res;
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    }
    return new Response(fs.readFileSync(file), { headers: { 'Content-Type': u.pathname.endsWith('.png') ? 'image/png' : 'image/jpeg' } });
  });
}

const decode = (buf, x, y) => {
  const o = (y * SW + x) * 4; // BGRA
  const c = (v) => Math.round((v - 8) / 16);
  return c(buf[o + 2]) + c(buf[o + 1]) * 16 + c(buf[o]) * 256;
};

async function record() {
  cacheRemoteImages();
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}`;
  const win = new BrowserWindow({ width: SW, height: SH + 1, useContentSize: true, enableLargerThanScreen: true, show: false,
    paintWhenInitiallyHidden: true, frame: false, webPreferences: { offscreen: true, backgroundThrottling: false } });
  win.setContentSize(SW, SH + 1);
  const wc = win.webContents;
  wc.setFrameRate(60);
  wc.on('console-message', (_e, level, msg) => { if (level >= 2 && !/Electron Security Warning/.test(msg)) console.log('[page]', msg); });
  // L'image capturée doit porter le repère de l'image demandée : sinon elle date d'avant, on recommence.
  const grab = async (f) => {
    const seen = [];
    for (let attempt = 0; attempt < 40; attempt++) {
      if (attempt) { wc.invalidate(); await new Promise((r) => setTimeout(r, Math.min(100, 8 * attempt))); }
      const img = await wc.capturePage();
      const size = img.getSize();
      if (size.width !== SW || size.height !== SH + 1) throw new Error(`Capture de ${size.width}×${size.height} au lieu de ${SW}×${SH + 1}`);
      const bmp = img.toBitmap();
      const got = decode(bmp, 960, SH);
      if (got === (f + 1) % 4096) return bmp; // repère décalé de 1 (stage.js) : le fond se lit comme 0
      seen.push(got);
    }
    // diagnostic : l'image fautive et ce qui recouvre la ligne du repère
    const img = await wc.capturePage();
    fs.writeFileSync(path.join(CACHE, 'echec.png'), img.toPNG());
    const under = await exec(`JSON.stringify({ scroll: [scrollX, scrollY], at: (document.elementFromPoint(960, 1080) || {}).id,
      stamp: document.getElementById('stamp').getBoundingClientRect().toJSON(), bg: document.getElementById('stamp').style.background })`);
    throw new Error(`Image ${f} introuvable : repère lu ${seen.slice(0, 3).join(', ')}… ; ${under} ; image dans .cache/echec.png`);
  };
  const exec = (js) => wc.executeJavaScript(js, true);

  await win.loadURL(`${base}/.github/media/video/stage.html`);
  // Premier passage : chaque page visitée une fois pour remplir le cache d'images, puis on recharge.
  await exec(`(async () => {
    const aw = document.getElementById('app').contentWindow;
    while (!aw.__vt || !aw.navigate) await new Promise((r) => setTimeout(r, 20));
    let t = 0;
    const run = async (ms) => { for (const end = t + ms; t < end;) { t += 50; await aw.__vt.advanceTo(t); } };
    await run(1500);
    for (const p of ${JSON.stringify(['store', 'wishlist', 'stretch', 'live', 'history', 'stats', 'friends', 'collection', 'home'])}) {
      aw.navigate(p); await run(1500);
      const t0 = performance.now();
      // les images différées hors champ ne se chargent pas : on n'attend que celles qui sont visibles
      const seen = (i) => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < aw.innerHeight; };
      while ([...aw.document.images].some((i) => !i.complete && seen(i)) && performance.now() - t0 < 8000) await new Promise((r) => setTimeout(r, 30));
    }
    aw.localStorage.setItem('pg-new-pages-seen', JSON.stringify(['wishlist']));
  })()`);
  await win.loadURL(`${base}/.github/media/video/stage.html?keep`);
  const { duration } = await exec(`(async () => {
    const aw = document.getElementById('app').contentWindow;
    while (!aw.__vt || !aw.navigate || aw.document.readyState !== 'complete') await new Promise((r) => setTimeout(r, 20));
    return __stage.init(window.SCENARIO_DEF);
  })()`);

  // PROBE="expression" : évalue une expression dans l'app après le démarrage, l'affiche et s'arrête (mise au point du scénario)
  if (process.env.PROBE) {
    console.log(await exec(`(async () => { const w = document.getElementById('app').contentWindow, d = w.document; return JSON.stringify(await (${process.env.PROBE})); })()`));
    srv.close();
    return;
  }
  const frames = Math.round(duration * FPS);
  let done = null;
  if (!STILLS) {
    fs.mkdirSync(CACHE, { recursive: true });
    ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', `${SW}x${SH + 1}`, '-r', String(FPS), '-i', '-',
      '-vf', `crop=${SW}:${SH}:0:0`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      path.join(CACHE, 'master.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
    done = new Promise((res, rej) => ff.on('exit', (c) => (c ? rej(new Error(`ffmpeg ${c}`)) : res())));
  }
  const wanted = STILLS ? new Set(STILLS.map((s) => Math.round(s * FPS))) : null;
  const last = STILLS ? Math.max(...wanted) + 1 : frames;
  let inputs = 0, mx = -1, my = -1;
  const started = Date.now();
  for (let f = 0; f < last; f++) {
    const t = f / FPS;
    const r = await exec(`__stage.frame(${t})`);
    if (r.x !== mx || r.y !== my) { wc.sendInputEvent({ type: 'mouseMove', x: r.x, y: r.y }); mx = r.x; my = r.y; }
    for (const a of r.actions) {
      wc.sendInputEvent({ type: a === 'down' ? 'mouseDown' : 'mouseUp', x: r.x, y: r.y, button: 'left', clickCount: 1 });
      inputs++;
    }
    await exec(`__stage.settle(${t}, ${f}, ${inputs})`);
    if (STILLS && !wanted.has(f)) continue;
    const bmp = await grab(f);
    if (STILLS) {
      const { nativeImage } = require('electron');
      const img = nativeImage.createFromBitmap(bmp, { width: SW, height: SH + 1 }).crop({ x: 0, y: 0, width: SW, height: SH });
      fs.mkdirSync(path.join(CACHE, 'stills'), { recursive: true });
      fs.writeFileSync(path.join(CACHE, 'stills', `${(f / FPS).toFixed(2)}.png`), img.toPNG());
    } else if (!ff.stdin.write(bmp)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % FPS === 0) process.stdout.write(`\r${f}/${last} images, ${((Date.now() - started) / 1000).toFixed(0)} s`);
  }
  if (ff) { ff.stdin.end(); await done; }
  process.stdout.write(`\rTerminé : ${last} images en ${((Date.now() - started) / 1000).toFixed(0)} s\n`);
  srv.close();
}

app.disableHardwareAcceleration();
app.whenReady().then(record).then(() => app.quit(), (e) => { console.error(e); try { ff?.kill(); } catch {} app.exit(1); });
