// Rendu image par image de index.html en MP4 (Chromium via Playwright + ffmpeg).
// Usage : node render.mjs [--fps 60] [--workers 4] [--stills 1.5,12,40] [--no-audio]
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'out');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const fps = Number(opt('fps', 60));
const workers = Number(opt('workers', Math.max(1, Math.min(6, os.cpus().length - 1))));
const stills = opt('stills', '');
const noAudio = args.includes('--no-audio');

// ffmpeg : variable FFMPEG, sinon celui du système, sinon imageio-ffmpeg (pip install imageio-ffmpeg)
function findFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return 'ffmpeg'; } catch {}
  try { return execFileSync('python3', ['-c', 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())']).toString().trim(); } catch {}
  throw new Error('ffmpeg introuvable : installe-le ou définis FFMPEG=/chemin/vers/ffmpeg');
}
const FFMPEG = findFfmpeg();
mkdirSync(out, { recursive: true });

// Les ressources distantes (polices, images valorant-api.com) passent par Node et sont gardées
// dans .cache/ : les rendus suivants sont reproductibles, même hors ligne.
const cache = path.join(dir, '.cache');
mkdirSync(cache, { recursive: true });
async function cached(u, ua) {
  const f = path.join(cache, createHash('sha1').update(u).digest('hex'));
  if (existsSync(f)) return { body: readFileSync(f), type: readFileSync(`${f}.type`, 'utf8') };
  const r = await fetch(u, { headers: { 'user-agent': ua } });
  if (!r.ok) throw new Error(`${r.status} ${u}`);
  const body = Buffer.from(await r.arrayBuffer());
  const type = r.headers.get('content-type') || 'application/octet-stream';
  writeFileSync(f, body);
  writeFileSync(`${f}.type`, type);
  return { body, type };
}

const url = pathToFileURL(path.join(dir, 'index.html')).href + '?render';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
  args: ['--disable-web-security', '--allow-file-access-from-files', '--force-color-profile=srgb', '--hide-scrollbars'],
});

async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', (m) => m.type() === 'warning' || m.type() === 'error' ? console.log('[page]', m.text()) : null);
  page.on('pageerror', (e) => console.log('[page error]', e.message));
  await page.route(/^https:/, async (route) => {
    try {
      const { body, type } = await cached(route.request().url(), route.request().headers()['user-agent']);
      await route.fulfill({ status: 200, body, contentType: type, headers: { 'access-control-allow-origin': '*' } });
    } catch (e) {
      console.log('[ressource]', e.message);
      await route.abort();
    }
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  return page;
}

if (stills) {
  const page = await openPage();
  for (const t of stills.split(',').map(Number)) {
    await page.evaluate((t) => window.seek(t), t);
    await page.screenshot({ path: path.join(out, `still-${String(t).replace('.', '_')}.png`) });
    console.log('image', t);
  }
  await browser.close();
  process.exit(0);
}

const probe = await openPage();
const DURATION = await probe.evaluate(() => window.DURATION);
const CUES = await probe.evaluate(() => window.CUES);
await probe.close();
writeFileSync(path.join(out, 'cues.json'), JSON.stringify({ duration: DURATION, cues: CUES }, null, 1));

const total = Math.round(DURATION * fps);
const per = Math.ceil(total / workers);
console.log(`${total} images à ${fps} i/s, ${workers} processus`);
const started = Date.now();
let done = 0;

async function renderChunk(k) {
  const from = k * per, to = Math.min(total, from + per);
  if (from >= to) return null;
  const file = path.join(out, `part-${k}.mp4`);
  const page = await openPage();
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(fps), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = from; f < to; f++) {
    await page.evaluate((t) => window.seek(t), f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    done++;
    if (done % 120 === 0) {
      const el = (Date.now() - started) / 1000;
      console.log(`${done}/${total} — ${el.toFixed(0)} s écoulées, ~${((el / done) * (total - done)).toFixed(0)} s restantes`);
    }
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await page.close();
  return file;
}

const parts = (await Promise.all(Array.from({ length: workers }, (_, k) => renderChunk(k)))).filter(Boolean);
await browser.close();

const list = path.join(out, 'parts.txt');
writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
const silent = path.join(out, 'video-silent.mp4');
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
parts.forEach((p) => rmSync(p));
rmSync(list);

const final = path.join(out, 'precise-gunplay.mp4');
if (noAudio) {
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', silent, '-c', 'copy', '-movflags', '+faststart', final]);
} else {
  const wav = path.join(out, 'soundtrack.wav');
  execFileSync('python3', [path.join(dir, 'soundtrack.py'), path.join(out, 'cues.json'), wav], { stdio: 'inherit' });
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
}
console.log(`Terminé en ${((Date.now() - started) / 1000).toFixed(0)} s → ${final}`);
