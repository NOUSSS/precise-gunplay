// Rend la vidéo de présentation (presentation.mp4 + aperçu presentation.webp) à partir de index.html.
// Usage, depuis la racine du dépôt : npx electron .github/media/video/render.js   (ffmpeg doit être dans le PATH)
// La page expose seek(t) : chaque image est calculée pour un instant précis, puis envoyée brute à ffmpeg.
const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const W = 1600;
const H = 900;
const FPS = 30;
const DURATION = 16; // même durée que music.m4a
const MEDIA = path.join(__dirname, '..');
const CACHE = path.join(__dirname, '.cache');

// Images de valorant-api.com et polices Google Fonts (SIL OFL), téléchargées une fois dans .cache/
const VAPI = 'https://media.valorant-api.com';
const GFONTS = 'https://github.com/google/fonts/raw/main/ofl';
const ASSETS = {
  'fonts/bebas-neue.ttf': `${GFONTS}/bebasneue/BebasNeue-Regular.ttf`,
  'fonts/barlow-medium.ttf': `${GFONTS}/barlow/Barlow-Medium.ttf`,
  'fonts/barlow-bold.ttf': `${GFONTS}/barlow/Barlow-Bold.ttf`,
  'fonts/jetbrains-mono.ttf': `${GFONTS}/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf`,
  'img/jett.png': `${VAPI}/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png`,
  'img/jett-full.png': `${VAPI}/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/fullportrait.png`,
  'img/omen.png': `${VAPI}/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png`,
  'img/sova.png': `${VAPI}/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png`,
  'img/killjoy.png': `${VAPI}/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png`,
  'img/raze.png': `${VAPI}/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png`,
  'img/reyna.png': `${VAPI}/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png`,
  'img/clove.png': `${VAPI}/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png`,
  'img/rank-plat2.png': `${VAPI}/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/16/largeicon.png`,
  'img/rank-dia3.png': `${VAPI}/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/20/largeicon.png`,
  'img/rank-asc1.png': `${VAPI}/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/21/largeicon.png`,
  'img/rank-asc2.png': `${VAPI}/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/22/largeicon.png`,
  'img/rank-imm1.png': `${VAPI}/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/24/largeicon.png`,
  'img/map-ascent.png': `${VAPI}/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png`,
  'img/list-ascent.png': `${VAPI}/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/listviewicon.png`,
  'img/list-haven.png': `${VAPI}/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/listviewicon.png`,
  'img/list-lotus.png': `${VAPI}/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/listviewicon.png`,
  'img/card.png': `${VAPI}/playercards/e9c8d760-4d06-4037-4882-6bab3610d9ea/wideart.png`,
  'img/skin-kuronami.png': `${VAPI}/weaponskins/d8d5d7a1-4d81-8560-54bc-0692ab40f69b/displayicon.png`,
  'img/skin-oni.png': `${VAPI}/weaponskins/36791b03-452d-8dad-0091-898cc28d2196/displayicon.png`,
  'img/skin-glitchpop.png': `${VAPI}/weaponskins/a491b943-43e3-4e98-64a6-fc87fca43605/displayicon.png`,
  'img/skin-rgx.png': `${VAPI}/weaponskins/142be691-42a0-c0a1-f6ed-57b3158def7e/displayicon.png`,
  'img/skin-reaver.png': `${VAPI}/weaponskins/30388628-42f0-606c-82c0-73ad43de997f/displayicon.png`,
  'img/skin-prime.png': `${VAPI}/weaponskins/b9ee2457-481c-6776-3f5b-0ca8e8f90c89/displayicon.png`,
};

async function downloadAssets() {
  for (const [file, url] of Object.entries(ASSETS)) {
    const dest = path.join(CACHE, file);
    if (fs.existsSync(dest)) continue;
    const res = await fetch(url, { headers: { 'User-Agent': 'agent-local' } });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  }
}

function run(args) {
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('exit', (code) => (code ? reject(new Error(`ffmpeg ${code}`)) : resolve()));
  });
}

async function render() {
  await downloadAssets();
  const win = new BrowserWindow({ width: W, height: H, useContentSize: true, show: false, webPreferences: { offscreen: true } });
  await win.loadFile(path.join(__dirname, 'index.html'));
  await win.webContents.executeJavaScript('ready()');

  const capture = async (t) => {
    await win.webContents.executeJavaScript(`seek(${t})`);
    const img = await win.webContents.capturePage();
    const size = img.getSize();
    return size.width === W && size.height === H ? img : img.resize({ width: W, height: H, quality: 'best' });
  };

  // Aperçu rapide : STILLS=4.5,8.2 écrit seulement ces instants en PNG dans .cache/stills/
  if (process.env.STILLS) {
    const dir = path.join(CACHE, 'stills');
    fs.mkdirSync(dir, { recursive: true });
    for (const t of process.env.STILLS.split(',')) fs.writeFileSync(path.join(dir, `${t}.png`), (await capture(+t)).toPNG());
    return;
  }

  const mp4 = path.join(MEDIA, 'presentation.mp4');
  const ff = spawn('ffmpeg', [
    '-v', 'error', '-y',
    '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-i', path.join(__dirname, 'music.m4a'),
    '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'copy', '-movflags', '+faststart', '-shortest', mp4,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((resolve, reject) => ff.on('exit', (code) => (code ? reject(new Error(`ffmpeg ${code}`)) : resolve())));

  const frames = Math.round(DURATION * FPS);
  for (let f = 0; f < frames; f++) {
    const img = await capture(f / FPS);
    if (!ff.stdin.write(img.toBitmap())) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % FPS === 0) process.stdout.write(`\r${f}/${frames}`);
  }
  ff.stdin.end();
  await done;
  process.stdout.write(`\r${frames}/${frames}\n`);

  // Aperçu animé affiché dans le README (sans le son)
  await run(['-i', mp4, '-vf', 'fps=20,scale=960:-1:flags=lanczos', '-c:v', 'libwebp_anim', '-loop', '0',
    '-quality', '72', '-compression_level', '6', '-an', path.join(MEDIA, 'presentation.webp')]);
}

app.disableHardwareAcceleration();
app.whenReady().then(render).then(() => app.quit(), (e) => {
  console.error(e);
  app.exit(1);
});
