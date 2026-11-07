// Moteur de tournage, côté page. Pour un instant t (en secondes) il calcule la caméra, le curseur,
// le défilement et les clics décrits par window.SCENARIO, puis fait avancer l'horloge virtuelle
// de l'app (timeshim.js) jusqu'à t. record.js envoie les vrais événements souris et capture l'image.
'use strict';
const W = 1440, H = 810, SW = 1920, SH = 1080, K0 = SW / W;
const $ = (s) => document.querySelector(s);
const camEl = $('#cam'), cursorEl = $('#cursor'), rippleEl = $('#ripple'), stampEl = $('#stamp');
let aw, ad; // fenêtre et document de l'app
const T0 = 2000; // ms de temps virtuel laissés à l'app pour démarrer avant la première image
// l'adresse de la scène passe ses options à la démo (?keep garde le localStorage de l'app)
$('#app').src = `demo/index.html${location.search}`;

const EASE = {
  inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  out: (p) => 1 - Math.pow(1 - p, 3),
  in: (p) => p * p * p,
  // geste de la main : profil à secousse minimale (mouvement humain naturel)
  hand: (p) => p * p * p * (10 + p * (-15 + 6 * p)),
  lin: (p) => p,
};
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, p) => a + (b - a) * p;

const cam = { cx: W / 2, cy: H / 2, z: 1 };
const cur = { x: W * 0.6, y: H * 0.56, shape: 'arrow', hidden: false };
const clicks = []; // instants des clics, pour l'onde et l'appui

const ARROW = '<svg width="17" height="26" viewBox="-1 -1 17 26"><path d="M0 0v20.6l4.9-4.7 3.4 7.9 3.1-1.3-3.3-7.7H15z" fill="#fff" stroke="#000" stroke-width="1.1" stroke-linejoin="round"/></svg>';
const HAND = '<svg width="21" height="26" viewBox="-1 -1 21 26"><path d="M6.4.5c1 0 1.8.8 1.8 1.8v7.1c.3-.2.8-.4 1.3-.4 1 0 1.7.7 1.8 1.6.3-.3.8-.4 1.2-.4 1 0 1.8.8 1.8 1.8v.3c.3-.2.7-.3 1.1-.3 1 0 1.8.8 1.8 1.8v4.4c0 3.6-2.5 6.3-6 6.3H9.6c-2.2 0-3.6-1-4.7-2.8L1.2 15.6c-.5-.9-.2-2 .6-2.5.9-.5 1.9-.2 2.4.6l.4.7V2.3c0-1 .8-1.8 1.8-1.8z" fill="#fff" stroke="#000" stroke-width="1.1" stroke-linejoin="round"/><path d="M8.2 9.4v5.2M11.3 10.6v4.3M14.3 12.3v3.4" stroke="#000" stroke-width="1" stroke-linecap="round"/></svg>';

function el(target) {
  const e = typeof target === 'string' ? ad.querySelector(target) : target;
  if (!e) throw new Error(`Élément introuvable dans l'app : ${target}`);
  return e;
}
function rect(target) {
  const r = el(target).getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}
// Point visé : {x, y} en pixels de l'app, ou un sélecteur (centre), ou {sel, ax, ay, dx, dy}
function point(target) {
  if (target && typeof target === 'object' && 'x' in target) return { x: target.x, y: target.y };
  const t = typeof target === 'string' ? { sel: target } : target;
  const r = rect(t.sel);
  return { x: r.x + r.w * (t.ax ?? 0.5) + (t.dx || 0), y: r.y + r.h * (t.ay ?? 0.5) + (t.dy || 0) };
}
// Cadre de caméra : {x, y, z}, ou {sel, pad, zmax} qui cadre un élément.
// fit: 'width' cadre sur la largeur seule (élément plus haut que l'écran) ; top: true cale le haut de l'élément en haut du cadre.
function frameFor(spec) {
  if ('z' in spec && 'x' in spec) return { cx: spec.x, cy: spec.y, z: spec.z };
  const r = rect(spec.sel);
  const pad = spec.pad ?? 40;
  const fits = [spec.zmax ?? 1.8, W / (r.w + pad * 2)];
  if (spec.fit !== 'width') fits.push(H / (r.h + pad * 2));
  const z = Math.max(1, Math.min(...fits));
  const cy = spec.top ? r.y - pad + H / (2 * z) : r.y + r.h / 2;
  return { cx: r.x + r.w / 2 + (spec.dx || 0), cy: cy + (spec.dy || 0), z };
}
function scroller(spec) { return el(spec.el || '.content'); }
// Images encore en chargement dans la partie visible de l'app (une image différée hors champ ne compte pas)
const loading = () => [...ad.images].some((i) => {
  if (i.complete) return false;
  const r = i.getBoundingClientRect();
  return r.bottom > 0 && r.top < H && r.right > 0 && r.left < W;
});

// Chaque événement démarre au premier instant t >= at (on capture alors son point de départ),
// puis s'applique à chaque image jusqu'à at + dur.
function step(ev, t) {
  const dur = ev.dur || 0;
  const p = dur ? clamp01((t - ev.at) / dur) : 1;
  const e = (EASE[ev.ease] || EASE.inOut)(p);
  if (ev.cam) {
    if (!ev._s) ev._s = { from: { ...cam }, to: frameFor(ev.cam) };
    const { from, to } = ev._s;
    // zoom interpolé en logarithme : vitesse perçue constante
    cam.z = Math.exp(lerp(Math.log(from.z), Math.log(to.z), e));
    cam.cx = lerp(from.cx, to.cx, e);
    cam.cy = lerp(from.cy, to.cy, e);
  } else if (ev.move) {
    if (!ev._s) {
      const to = point(ev.move);
      const from = { x: cur.x, y: cur.y };
      // arc léger, perpendiculaire au trajet, comme un vrai geste
      const dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy) || 1;
      const bend = (ev.arc ?? 0.12) * len;
      ev._s = { from, to, c: { x: (from.x + to.x) / 2 - (dy / len) * bend, y: (from.y + to.y) / 2 + (dx / len) * bend } };
    }
    const { from, to, c } = ev._s;
    const q = (EASE[ev.ease] || EASE.hand)(p);
    cur.x = (1 - q) * (1 - q) * from.x + 2 * (1 - q) * q * c.x + q * q * to.x;
    cur.y = (1 - q) * (1 - q) * from.y + 2 * (1 - q) * q * c.y + q * q * to.y;
  } else if (ev.scroll !== undefined) {
    const s = scroller(ev);
    if (!ev._s) {
      let to = ev.scroll;
      if (typeof to === 'object') to = s.scrollTop + rect(to.sel).y - s.getBoundingClientRect().top - (to.offset ?? 24);
      to = Math.max(0, Math.min(to, s.scrollHeight - s.clientHeight));
      ev._s = { from: s.scrollTop, to, cx: cur.x, cy: cur.y };
    }
    s.scrollTop = Math.round(lerp(ev._s.from, ev._s.to, e));
  } else if (ev.cursor) {
    cur.hidden = ev.cursor === 'hide';
  }
}

window.__stage = {
  async init(scenario) {
    aw = $('#app').contentWindow;
    ad = $('#app').contentDocument;
    window.SCENARIO = scenario.map((e) => ({ ...e })).sort((a, b) => a.at - b.at);
    aw.__inputs = 0;
    for (const type of ['mousedown', 'mouseup']) ad.addEventListener(type, () => { aw.__inputs++; }, true);
    // démarrage de l'app (accueil chargé, animations d'entrée finies) avant la première image
    for (let t = 0; t <= T0; t += 50) {
      await aw.__vt.advanceTo(t);
      const t1 = performance.now();
      while (loading() && performance.now() - t1 < 5000) await new Promise((r) => setTimeout(r, 15));
    }
    return { duration: Math.max(...window.SCENARIO.map((e) => e.at + (e.dur || 0))) };
  },

  // Calcule l'état à l'instant t et renvoie la position écran du curseur et les clics à envoyer.
  frame(t, prevT) {
    const actions = [];
    for (const ev of window.SCENARIO) {
      if (ev.at > t) break;
      if (ev.click) {
        if (!ev._s) { ev._s = true; actions.push('down'); clicks.push(ev.at); }
        if (!ev._up && t >= ev.at + 0.09) { ev._up = true; actions.push('up'); }
        continue;
      }
      if (ev.run) { if (!ev._s) { ev._s = true; ev.run(aw, ad); } continue; }
      if (ev._done) continue; // un événement fini a posé son état final une fois, il ne le réimpose plus
      step(ev, t);
      if (t >= ev.at + (ev.dur || 0)) ev._done = true;
    }
    const k = K0 * cam.z;
    let tx = SW / 2 - cam.cx * k, ty = SH / 2 - cam.cy * k;
    tx = Math.min(0, Math.max(SW - W * k, tx));
    ty = Math.min(0, Math.max(SH - H * k, ty));
    cam.tx = tx; cam.ty = ty; cam.k = k;
    return { x: Math.round(tx + cur.x * k), y: Math.round(ty + cur.y * k), actions };
  },

  // Fait avancer l'app jusqu'à t, attend images et clics, puis pose caméra, curseur et repère.
  async settle(t, f, inputs) {
    const t0 = performance.now();
    while (aw.__inputs < inputs && performance.now() - t0 < 400) await new Promise((r) => setTimeout(r, 2));
    await aw.__vt.advanceTo(T0 + Math.round(t * 1000 * 1000) / 1000);
    const t1 = performance.now();
    while (loading() && performance.now() - t1 < 5000) await new Promise((r) => setTimeout(r, 15));
    // forme du curseur selon ce qu'il survole, comme sous Windows
    let shape = 'arrow';
    for (let n = ad.elementFromPoint(cur.x, cur.y); n && n.nodeType === 1; n = n.parentElement) {
      const c = aw.getComputedStyle(n).cursor;
      if (c === 'pointer') { shape = 'hand'; break; }
      if (c !== 'auto') break;
    }
    if (shape !== cur.shape || !cursorEl.firstChild) { cur.shape = shape; cursorEl.innerHTML = shape === 'hand' ? HAND : ARROW; }

    if (scrollX || scrollY) scrollTo(0, 0);
    camEl.style.transform = `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.k})`;
    const since = t - (clicks.length ? clicks[clicks.length - 1] : -9);
    const press = since >= 0 && since < 0.16 ? 1 - 0.12 * Math.sin((since / 0.16) * Math.PI) : 1;
    const cs = K0 * Math.sqrt(cam.z) * 1.12 * press;
    const ox = shape === 'hand' ? -6.4 : 0;
    cursorEl.style.transform = `translate(${cam.tx + cur.x * cam.k + ox * cs}px, ${cam.ty + cur.y * cam.k}px) scale(${cs})`;
    cursorEl.style.opacity = cur.hidden ? 0 : 1;
    if (since >= 0 && since < 0.5) {
      const p = since / 0.5;
      const r = (10 + 34 * EASE.out(p)) * K0 * Math.sqrt(cam.z);
      Object.assign(rippleEl.style, {
        opacity: String(0.55 * (1 - p)), width: `${r * 2}px`, height: `${r * 2}px`,
        transform: `translate(${cam.tx + cur.x * cam.k - r}px, ${cam.ty + cur.y * cam.k - r}px)`,
      });
    } else rippleEl.style.opacity = '0';
    // repère = f + 1 : le fond de la scène se lit comme 0, une image d'avant le premier placement passerait pour l'image 0
    const n = f + 1;
    stampEl.style.background = `rgb(${(n % 16) * 16 + 8},${(Math.floor(n / 16) % 16) * 16 + 8},${(Math.floor(n / 256) % 16) * 16 + 8})`;
    return true;
  },
};
