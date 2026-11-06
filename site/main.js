const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

/* ---------- La vidéo et ses chapitres ---------- */

// Mêmes instants que .github/media/video/scenario.js ; le dernier passage (retour à l'accueil) boucle sur le premier
const CHAPTERS = [
  { id: 'accueil', start: 0, end: 3.2 },
  { id: 'boutique', start: 3.2, end: 11.0 },
  { id: 'etiree', start: 11.0, end: 20.0 },
  { id: 'partie', start: 20.0, end: 27.6 },
  { id: 'stats', start: 27.6, end: 35.2 },
];
const video = $('#demo');
const buttons = new Map($$('.chapters button').map((b) => [b.dataset.chapter, b]));
const features = $$('.feature');
let range = null; // chapitre que l'écran rejoue en boucle quand une fonction est lue, sinon toute la vidéo
let userPaused = reduce;

const chapterAt = (t) => CHAPTERS.find((c) => t >= c.start && t < c.end) || CHAPTERS[0];

function play() {
  if (userPaused) return;
  video.play().catch(() => {});
}
function setPaused(paused) {
  userPaused = paused;
  const b = $('#pause');
  b.setAttribute('aria-pressed', String(paused));
  b.querySelector('span').textContent = paused ? 'Lire' : 'Pause';
  if (paused) video.pause();
  else play();
}
$('#pause').addEventListener('click', () => setPaused(!userPaused));
if (reduce) setPaused(true);

// Une fonction lue fait rejouer son chapitre ; revenir au titre rend toute la vidéo
function setRange(id) {
  const next = id ? CHAPTERS.find((c) => c.id === id) : null;
  if (next === range) return;
  range = next;
  features.forEach((f) => f.classList.toggle('on', f.dataset.chapter === id));
  if (range && (video.currentTime < range.start || video.currentTime >= range.end)) video.currentTime = range.start;
}

// À chaque image : la boucle du chapitre, la barre du chapitre en cours
function frame() {
  const t = video.currentTime;
  if (range && t >= range.end - 0.02) video.currentTime = range.start;
  const now = chapterAt(t);
  for (const c of CHAPTERS) {
    const b = buttons.get(c.id);
    // les chapitres déjà passés restent pleins quand toute la vidéo tourne ; pendant une boucle, seul le sien avance
    const p = c === now ? (t - c.start) / (c.end - c.start) : !range && t >= c.end ? 1 : 0;
    b.style.setProperty('--p', p.toFixed(4));
    b.setAttribute('aria-current', String(c === now));
  }
}
if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
  const loop = () => { frame(); video.requestVideoFrameCallback(loop); };
  video.requestVideoFrameCallback(loop);
} else {
  const loop = () => { frame(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
video.addEventListener('seeked', frame);

// Un chapitre choisi : pendant la visite, on va à sa fonction ; en haut de page, l'écran y saute
buttons.forEach((b, id) => b.addEventListener('click', () => {
  const target = features.find((f) => f.dataset.chapter === id);
  if (range && target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  else if (range && id === 'accueil') scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  else {
    video.currentTime = CHAPTERS.find((c) => c.id === id).start + 0.01;
    frame();
  }
}));

/* ---------- La lumière de l'écran ---------- */

// La couleur de la lumière est prise sur l'image affichée : les pixels vifs et colorés comptent plus que le fond sombre de l'app
const probe = document.createElement('canvas');
probe.width = 32; probe.height = 18;
const ctx = probe.getContext('2d', { willReadFrequently: true });
const target = [118, 136, 168];
const glow = [118, 136, 168];

function sample(source) {
  try {
    ctx.drawImage(source, 0, 0, probe.width, probe.height);
    const d = ctx.getImageData(0, 0, probe.width, probe.height).data;
    let r = 0, g = 0, b = 0, w = 0;
    for (let i = 0; i < d.length; i += 4) {
      const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
      const sat = (mx - mn) / 255, lum = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
      const k = 0.02 + sat * sat * 2 + lum * lum;
      r += d[i] * k; g += d[i + 1] * k; b += d[i + 2] * k; w += k;
    }
    if (w) Object.assign(target, normalize(r / w, g / w, b / w));
  } catch { /* image pas encore décodée */ }
}
// Teinte gardée, saturation et clarté ramenées dans une plage lisible sur la pénombre
function normalize(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, dl = mx - mn;
  let h = 0, s = 0;
  if (dl) {
    s = dl / (1 - Math.abs(2 * l - 1));
    h = mx === r ? ((g - b) / dl) % 6 : mx === g ? (b - r) / dl + 2 : (r - g) / dl + 4;
    h *= 60;
  }
  s = Math.min(0.78, Math.max(0.22, s * 1.5));
  const L = 0.6, c = (1 - Math.abs(2 * L - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = L - c / 2;
  const [r1, g1, b1] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255];
}

const poster = new Image();
poster.src = video.getAttribute('poster');
poster.decode().then(() => { sample(poster); glow.splice(0, 3, ...target); paintGlow(); }).catch(() => {});

function paintGlow() {
  root.style.setProperty('--glow', glow.map(Math.round).join(' '));
}
let lastSample = 0;
function light(now) {
  if (!video.paused && video.readyState >= 2 && now - lastSample > 100) { sample(video); lastSample = now; }
  let moved = false;
  for (let i = 0; i < 3; i++) {
    const dv = target[i] - glow[i];
    if (Math.abs(dv) > 0.4) { glow[i] += dv * (reduce ? 1 : 0.08); moved = true; }
  }
  if (moved) paintGlow();
  requestAnimationFrame(light);
}
requestAnimationFrame(light);
video.addEventListener('seeked', () => { if (video.paused) sample(video); });

// La lumière part de l'écran, où qu'il soit dans la page
const spill = $('.spill');
const screen = $('.screen');
let placing = false;
function place() {
  placing = false;
  const r = screen.getBoundingClientRect();
  spill.style.setProperty('--gx', `${r.left + r.width / 2}px`);
  spill.style.setProperty('--gy', `${r.top + r.height / 2}px`);
  spill.style.setProperty('--gw', `${r.width * 1.7}px`);
  spill.style.setProperty('--gh', `${r.height * 2.1}px`);
}
const schedule = () => { if (!placing) { placing = true; requestAnimationFrame(place); } };

/* ---------- La visite : l'écran reste à l'écran, la fonction lue choisit le chapitre ---------- */

const monitor = $('.monitor');
const screenCol = $('.screen-col');
const narrow = matchMedia('(max-width: 1023px)');
function layout() {
  // grand écran : l'écran est centré dans la hauteur sous l'en-tête ; téléphone : il reste en haut
  const header = $('.top').offsetHeight;
  const h = monitor.offsetHeight;
  root.style.setProperty('--stick', `${Math.round(header + Math.max(16, (innerHeight - header - h) / 2))}px`);
  // téléphone : l'écran ne reste en haut que s'il laisse au texte près de la moitié de la hauteur ; sinon (paysage, fenêtre basse) il défile avec la page
  const loose = narrow.matches && screenCol.offsetHeight > innerHeight * 0.55;
  screenCol.classList.toggle('loose', loose);
  root.style.setProperty('--mon-h', `${loose ? 32 : screenCol.offsetHeight + 16}px`);
  schedule();
  pick();
}
// La fonction lue est celle qui passe au milieu de ce que l'écran laisse voir
function pick() {
  // sur téléphone, la visite commence quand l'écran arrive en haut (à la ligne « Gratuit… » près) ; avant, il passe toute la vidéo
  if (narrow.matches && screenCol.getBoundingClientRect().top > (parseFloat(getComputedStyle(screenCol).top) || 0) + 48) return setRange(null);
  const top = narrow.matches ? Math.max(0, screenCol.getBoundingClientRect().bottom) : 0;
  const y = top + (innerHeight - top) / 2;
  const on = features.find((f) => { const r = f.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
  setRange(on ? on.dataset.chapter : null);
}
addEventListener('scroll', () => { schedule(); pick(); }, { passive: true });
addEventListener('resize', layout);
new ResizeObserver(layout).observe(monitor);
document.fonts?.ready.then(layout);
layout();

// L'écran ne tourne que s'il est visible
new IntersectionObserver(([e]) => { if (e.isIntersecting) play(); else video.pause(); }).observe(screen);

// Allumage : l'écran d'abord, la pièce ensuite
const lightUp = () => root.classList.add('room-lit');
if (reduce) lightUp();
else { video.addEventListener('playing', () => setTimeout(lightUp, 500), { once: true }); setTimeout(lightUp, 1600); }

/* ---------- La vidéo avec le son ---------- */

const film = $('#film');
const filmVideo = film.querySelector('video');
$('#watch').addEventListener('click', (e) => {
  if (!film.showModal) return; // sans <dialog>, le lien ouvre le fichier
  e.preventDefault();
  video.pause();
  film.showModal();
  filmVideo.currentTime = 0;
  filmVideo.play().catch(() => {});
});
film.querySelector('.close').addEventListener('click', () => film.close());
film.addEventListener('click', (e) => { if (e.target === film) film.close(); });
film.addEventListener('close', () => { filmVideo.pause(); play(); });

/* ---------- Téléchargement ---------- */

// Le bouton flottant apparaît une fois le titre passé, et se retire devant l'installation
const float = $('.dl-float');
const seen = new Map();
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => seen.set(e.target, e.isIntersecting));
  float.classList.toggle('show', ![...seen.values()].some(Boolean));
});
[$('.lead .cta'), $('#installation')].forEach((el) => { seen.set(el, true); io.observe(el); });

// Liens directs vers les fichiers de la dernière version ; sans réponse de GitHub, les liens restent sur la page Releases
const fmtSize = (b) => `${Math.round(b / 1048576)} Mo`;
fetch('https://api.github.com/repos/NOUSSS/precise-gunplay/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then((rel) => {
    const find = (re) => rel.assets.find((a) => re.test(a.name));
    const files = { setup: find(/Setup.*\.exe$/i), portable: find(/Portable.*\.exe$/i) };
    for (const [kind, asset] of Object.entries(files)) {
      if (!asset) continue;
      $$(`[data-dl="${kind}"]`).forEach((a) => (a.href = asset.browser_download_url));
      $$(`[data-size="${kind}"]`).forEach((s) => (s.textContent = fmtSize(asset.size)));
    }
    if (rel.tag_name) $$('[data-version]').forEach((v) => (v.textContent = rel.tag_name));
  })
  .catch(() => {});

/* ---------- La boutique se renouvelle à 00:00 UTC ---------- */

// « 5 h 56 min 17 s », avec les mêmes espaces insécables que « 79 Mo » et « 1 h »
function fmtDuration(ms) {
  ms = Math.max(0, ms);
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const tail = `${h ? String(m).padStart(2, '0') : m} min ${String(sec).padStart(2, '0')} s`;
  return h ? `${h} h ${tail}` : tail;
}
const nextReset = () => {
  const n = new Date();
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + 1);
};
const resets = $$('[data-reset]');
const tick = () => resets.forEach((el) => (el.textContent = fmtDuration(nextReset() - Date.now())));
tick();
setInterval(tick, 1000);
const at = new Date(nextReset());
const hour = at.getMinutes() ? `${at.getHours()} h ${String(at.getMinutes()).padStart(2, '0')}` : `${at.getHours()} h`;
$$('[data-reset-hour]').forEach((el) => (el.textContent = hour));
