const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Même format que fmtDuration dans renderer/app.js
function fmtDuration(ms) {
  ms = Math.max(0, ms);
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h) return `${h}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
  return `${m}m ${String(sec).padStart(2, '0')}s`;
}

// La boutique du jour se renouvelle à 00:00 UTC ; les chiffres du grand minuteur passent par crans
const nextReset = () => {
  const n = new Date();
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + 1);
};
const plain = document.querySelectorAll('[data-reset]');
const stepped = document.querySelectorAll('[data-reset-steps]');
function tick() {
  const t = fmtDuration(nextReset() - Date.now());
  plain.forEach((el) => (el.textContent = t));
  stepped.forEach((el) => {
    const prev = el.dataset.v || '';
    if (prev.length !== t.length) {
      el.innerHTML = [...t].map((c) => `<span>${c === ' ' ? ' ' : c}</span>`).join('');
    } else {
      [...t].forEach((c, i) => {
        if (c === prev[i]) return;
        const sp = el.children[i];
        sp.textContent = c === ' ' ? ' ' : c;
        if (reduce) return;
        sp.classList.remove('t');
        void sp.offsetWidth;
        sp.classList.add('t');
      });
    }
    el.dataset.v = t;
  });
}
tick();
setInterval(tick, 1000);

// Heure locale du renouvellement
const resetAt = new Date(nextReset());
const hm = resetAt.getMinutes() ? `${resetAt.getHours()} h ${String(resetAt.getMinutes()).padStart(2, '0')}` : `${resetAt.getHours()} h`;
document.querySelectorAll('[data-reset-hour]').forEach((el) => (el.textContent = hm));

// Liens directs vers les fichiers de la dernière version ; sans réponse de GitHub, les liens restent sur la page Releases
const fmtSize = (b) => `${Math.round(b / 1048576)} Mo`;
fetch('https://api.github.com/repos/NOUSSS/precise-gunplay/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then((rel) => {
    const find = (re) => rel.assets.find((a) => re.test(a.name));
    const files = { setup: find(/Setup.*\.exe$/i), portable: find(/Portable.*\.exe$/i) };
    for (const [kind, asset] of Object.entries(files)) {
      if (!asset) continue;
      document.querySelectorAll(`[data-dl="${kind}"]`).forEach((a) => (a.href = asset.browser_download_url));
      document.querySelectorAll(`[data-size="${kind}"]`).forEach((s) => (s.textContent = fmtSize(asset.size)));
    }
    if (rel.tag_name) document.querySelectorAll('[data-version]').forEach((v) => (v.textContent = rel.tag_name));
  })
  .catch(() => {});

// Feutre : chaque tracé connaît sa longueur, puis se dessine
function measure(root = document) {
  root.querySelectorAll('.draw').forEach((p) => {
    if (p.getTotalLength) p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1);
  });
}
function draw(el, dur = 1200) {
  el.style.setProperty('--dur', dur + 'ms');
  el.classList.remove('on');
  // lire le style force le point de départ, sans dépendre des images d'animation (onglet en arrière-plan)
  void getComputedStyle(el).strokeDashoffset;
  el.classList.add('on');
  return wait(dur);
}
const show = (el) => el.classList.add('on');

// La carte d'ouverture : mise à l'échelle de la feuille, puis la manche se joue en boucle
const map = document.querySelector('.map');
const stage = document.querySelector('[data-stage]');
new ResizeObserver(([e]) => stage.style.setProperty('--s', e.contentRect.width / 600)).observe(map);

const hero = document.querySelector('.hero');
const q = (sel) => [...hero.querySelectorAll(sel)];
const tokens = q('.token.move');
function moveTokens() {
  tokens.forEach((t) => t.classList.add('in'));
  return Promise.all(tokens.map((t) => t.animate([{ offsetDistance: '0%' }, { offsetDistance: '100%' }], {
    duration: +t.dataset.d, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards',
  }).finished));
}
async function round(first) {
  // la première manche attend que la carte soit posée et que le titre soit souligné
  if (first) { await wait(1000); draw(q('[data-step="1"]')[0], 700); await wait(500); }
  q('[data-step="2"]').forEach((p, i) => draw(p, 1300 + i * 150));
  await wait(1600);
  await moveTokens();
  q('[data-step="4"]').forEach((el) => (el.matches('.draw') ? draw(el, 800) : show(el)));
  await wait(600);
  await draw(q('[data-step="5"]')[0], 700);
  await wait(5200);
  // on efface le tableau et on rejoue la manche, le soulignement reste
  q('[data-step="2"],[data-step="4"],[data-step="5"]').forEach((el) => el.classList.remove('on'));
  tokens.forEach((t) => { t.classList.remove('in'); t.getAnimations().forEach((a) => a.cancel()); });
  await wait(700);
  round(false);
}

// Les zones plus bas : leurs tracés et notes apparaissent quand la zone arrive à l'écran
function reveal(zone) {
  const items = [...zone.querySelectorAll('.draw, .marker')];
  items.forEach((el, i) => setTimeout(() => (el.matches('.draw') ? draw(el, el.classList.contains('line') ? 1800 : 900) : show(el)), 200 + i * 220));
}

// Partie en direct : lasso au feutre autour des joueurs groupés, note sur la ligne du titre de l'équipe
const roster = document.querySelector('.roster');
const lasso = roster.querySelector('.brackets');
function drawGroups() {
  const parts = [];
  roster.querySelectorAll('.grp-note').forEach((note) => {
    const rows = [...roster.querySelectorAll(`tr[data-grp="${note.dataset.for}"]`)];
    if (!rows.length) return;
    const table = rows[0].closest('table');
    const x0 = table.offsetLeft - 8, x1 = table.offsetLeft + table.offsetWidth + 6;
    const y0 = table.offsetTop + rows[0].offsetTop + 2, y1 = table.offsetTop + rows.at(-1).offsetTop + rows.at(-1).offsetHeight - 2;
    const r = 14, color = note.classList.contains('red') ? 'var(--red)' : 'var(--blue)';
    const d = `M${x0 + r + 6} ${y0 - 3} L${x1 - r} ${y0} Q${x1} ${y0} ${x1} ${y0 + r} L${x1 + 2} ${y1 - r} Q${x1} ${y1} ${x1 - r} ${y1 + 1} L${x0 + r} ${y1} Q${x0} ${y1} ${x0 - 1} ${y1 - r} L${x0} ${y0 + r} Q${x0 + 2} ${y0 - 2} ${x0 + r + 14} ${y0 - 4}`;
    parts.push(`<path class="draw" d="${d}" stroke="${color}" stroke-width="3"/>`);
    const cap = table.querySelector('caption');
    note.style.left = 'auto';
    note.style.right = `${roster.clientWidth - x1 + 2}px`;
    note.style.top = `${table.offsetTop + cap.offsetTop - 4}px`;
  });
  const done = roster.classList.contains('revealed');
  lasso.innerHTML = parts.join('');
  measure(lasso);
  if (done) lasso.querySelectorAll('.draw').forEach((p) => p.classList.add('on'));
}
drawGroups();
addEventListener('resize', drawGroups);
document.fonts?.ready.then(drawGroups);

// Évolution du RR : vingt matchs, du premier au dernier
const deltas = [21, -16, 24, 18, -15, 19, 22, -14, 20, -17, 23, 16, -18, 9, -13, 19, -16, 22, 18, -20];
(function chart() {
  const svg = document.querySelector('.chart');
  const W = 560, H = 240, L = 40, R = 16, T = 16, B = 28;
  const pts = deltas.reduce((acc, d) => (acc.push(acc.at(-1) + d), acc), [0]);
  const lo = -20, hi = 120;
  const x = (i) => L + (i * (W - L - R)) / (pts.length - 1);
  const y = (v) => T + ((hi - v) * (H - T - B)) / (hi - lo);
  const grid = [0, 50, 100].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v > 0 ? '+' + v : v}</text>`).join('');
  svg.querySelector('.grid').innerHTML = grid + `<text x="${L}" y="${H - 6}">il y a 20 matchs</text><text x="${W - R}" y="${H - 6}" text-anchor="end">aujourd’hui</text>`;
  svg.querySelector('.line').setAttribute('d', pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' '));
})();

measure();

if (reduce) {
  document.querySelectorAll('.draw, .marker').forEach(show);
  tokens.forEach((t) => { t.style.offsetDistance = '100%'; t.classList.add('in'); });
} else {
  round(true);
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    e.target.classList.add('revealed');
    reveal(e.target);
  }), { threshold: 0.25 });
  document.querySelectorAll('.zone').forEach((z) => io.observe(z));
}
if (reduce) document.querySelectorAll('.zone').forEach((z) => z.classList.add('revealed'));

// Résolution étirée : l'interrupteur étire l'écran ; il s'active seul la première fois que l'écran devient visible
const toggle = document.getElementById('stretch-toggle');
const screen = document.getElementById('screen');
const res = document.getElementById('res');
let touched = false;
function apply() {
  screen.classList.toggle('stretched', toggle.checked);
  res.textContent = toggle.checked ? '1440 × 1080' : '1920 × 1080';
}
toggle.addEventListener('change', () => { touched = true; apply(); });
new IntersectionObserver((entries, obs) => {
  if (!entries[0].isIntersecting) return;
  obs.disconnect();
  setTimeout(() => { if (!touched) { toggle.checked = true; apply(); } }, 900);
}, { threshold: 0.6 }).observe(screen);

// Profondeur : les feuilles flottent au-dessus de l'émail et le reflet glisse avec le pointeur
const sheen = document.querySelector('.sheen');
const layers = [...document.querySelectorAll('[data-depth]')];
const fine = matchMedia('(pointer: fine) and (min-width: 1181px)');
if (!reduce) {
  addEventListener('pointermove', (e) => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    sheen.style.transform = `translateX(${x * 18}%)`;
    if (!fine.matches) return;
    layers.forEach((l) => { const d = +l.dataset.depth; l.style.translate = `${-x * d}px ${-y * d}px`; });
  }, { passive: true });
}

// Aimant flottant : visible entre le tableau d'ouverture et l'installation
const float = document.querySelector('.float');
const seen = new Map();
const fio = new IntersectionObserver((entries) => {
  entries.forEach((e) => seen.set(e.target, e.isIntersecting));
  const on = ![...seen.values()].some(Boolean);
  float.classList.toggle('show', on);
  float.tabIndex = on ? 0 : -1;
  float.toggleAttribute('aria-hidden', !on);
});
[hero, document.getElementById('installation'), document.querySelector('.foot-zone')].forEach((el) => fio.observe(el));
