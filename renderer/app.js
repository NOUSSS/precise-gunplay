/* Precise Gunplay — interface */
'use strict';

// ================= Utilitaires =================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const content = $('#content');

async function call(channel, ...args) {
  const res = await window.api.call(channel, ...args);
  if (!res.ok) throw new Error(res.error);
  return res.data;
}

const CURRENCY_ICON = {
  vp: 'https://media.valorant-api.com/currencies/85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741/displayicon.png',
  rp: 'https://media.valorant-api.com/currencies/e59aa87c-4cbf-517a-5983-6e81511be9b7/displayicon.png',
  kc: 'https://media.valorant-api.com/currencies/85ca954a-41f2-ce94-9b45-8ca3dd39a00d/displayicon.png',
};

const QUEUES = {
  competitive: 'Compétition', unrated: 'Non classé', swiftplay: 'Vélocité', spikerush: 'Spike Rush',
  deathmatch: 'Combat à mort', hurm: 'Combat à mort par équipe', ggteam: 'Escalade', premier: 'Premier',
  onefa: 'Réplication', skirmish2v2: 'Escarmouche 2c2', abilitydraftarena: 'Draft de compétences', snowball: 'Bataille de boules de neige', newmap: 'Nouvelle carte', '': 'Personnalisée', custom: 'Personnalisée',
};
const queueName = (q) => QUEUES[q] ?? (q ? q.charAt(0).toUpperCase() + q.slice(1) : 'Personnalisée');

const fmtNum = (n) => Number(n || 0).toLocaleString('fr-FR');

function fmtDuration(ms) {
  ms = Math.max(0, ms);
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (d) return `${d}j ${h}h ${String(m).padStart(2, '0')}m`;
  if (h) return `${h}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
  return `${m}m ${String(sec).padStart(2, '0')}s`;
}

function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 3600) return `il y a ${Math.max(1, Math.round(diff / 60))} min`;
  if (diff < 86400) return `il y a ${Math.round(diff / 3600)} h`;
  return `il y a ${Math.round(diff / 86400)} j`;
}

function priceHtml(p, discounted) {
  if (!p) return '';
  const icon = `<img src="${CURRENCY_ICON[p.currency] || CURRENCY_ICON.vp}" alt="">`;
  if (discounted) return `<span class="price">${icon}<s>${fmtNum(p.amount)}</s>${fmtNum(discounted.amount)}</span>`;
  return `<span class="price">${icon}${fmtNum(p.amount)}</span>`;
}

function toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// ---- Fonctions qui agissent sur le compte (sélection d'agent, groupe, messagerie) ----
// Désactivées côté app (voir src/restrictions.js) : on les affiche grisées, un clic explique pourquoi.
const actionsLocked = () => state.restrictions?.clientActions === false;
const lockedMessage = () => state.restrictions?.message || 'Fonction désactivée.';
const lockedNotice = () => `<div class="warn-box locked-notice">${esc(lockedMessage())}</div>`;
// Enveloppe une zone : grisée et non cliquable, avec le message au clic.
const lockZone = (html) => (actionsLocked() ? `<div class="locked-zone" title="${esc(lockedMessage())}">${html}</div>` : html);
const lockAttr = () => (actionsLocked() ? 'disabled' : '');

document.addEventListener('click', (e) => {
  if (!e.target.closest('.locked-zone')) return;
  e.preventDefault();
  e.stopPropagation();
  // Un seul message à la fois, même si on clique plusieurs fois.
  $$('#toasts .toast').filter((t) => t.textContent === lockedMessage()).forEach((t) => t.remove());
  toast(lockedMessage(), 'error');
}, true);

const loader = () => '<div class="loader"></div>';
const errorBox = (msg) => `<div class="error-box">${esc(msg)}</div>`;

// ================= État global =================
const state = {
  status: { connected: false, message: 'Recherche du Riot Client…' },
  assets: null,
  settings: null,
  owned: null,
  page: 'home',
  timers: [],
  renderId: 0,
  update: null,
  unread: {}, // { pid: nombre de messages non lus }
  profile: null, // carte du compte dans la barre latérale
  onUnread: null,
};

const agentOf = (id) => (id && state.assets?.agents.find((a) => a.uuid.toLowerCase() === String(id).toLowerCase())) || null;
const tierOf = (t) => state.assets?.tiers.find((x) => x.tier === t) || null;

function rankHtml(rank, { peak = true } = {}) {
  if (!rank) return '<div class="rank muted">—</div>';
  const t = tierOf(rank.tier);
  const p = tierOf(rank.peak);
  const name = rank.tier ? `${esc(t?.name || '')}${rank.rr != null && rank.tier ? ` <span class="muted">${rank.rr} RR</span>` : ''}` : '<span class="muted">Non classé</span>';
  return `<div class="rank">${t?.icon ? `<img src="${t.icon}" alt="">` : ''}<div>${name}</div>${
    peak && rank.peak > rank.tier && p?.icon ? `<span class="peak" title="Meilleur rang : ${esc(p.name)}"><img src="${p.icon}" alt=""></span>` : ''
  }</div>`;
}

// Couleur d'un groupe (duo, trio…) dans une partie : barre à gauche de ses joueurs, comme sur Tracker.
// Ni turquoise ni rouge ni or, déjà pris par les équipes et par toi.
const PARTY_COLORS = ['#a78bfa', '#4c9dff', '#ff8c42', '#f472b6', '#b7e34a'];
function partyAttrs(p) {
  if (!p.party) return { cls: '', style: '' };
  return { cls: 'in-party', style: `style="--pc:${PARTY_COLORS[(p.partyIdx || 0) % PARTY_COLORS.length]}"` };
}
const partyTag = (p) => (p.party ? ` · <span class="party-tag" title="Joue en groupe avec les autres « Groupe ${p.party} »">Groupe ${p.party}</span>` : '');

// Lien vers le profil Tracker d'un joueur (jamais pour un joueur en mode anonyme).
function trackerBtn(name, tag, hidden = false) {
  if (hidden || !name || !tag) return '';
  const url = `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(`${name}#${tag}`)}/overview`;
  return `<button class="trn-btn" data-tracker="${esc(url)}" title="Voir le profil de ${esc(name)}#${esc(tag)} sur Tracker">TRN<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg></button>`;
}

// Capture : le bouton Tracker ne déclenche pas l'action de la ligne qui le contient.
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-tracker]');
  if (!b) return;
  e.stopPropagation();
  e.preventDefault();
  call('open-external', b.dataset.tracker).catch(() => {});
}, true);

// Nettoie les rafraîchissements automatiques quand on change de page.
function every(ms, fn) {
  const id = setInterval(fn, ms);
  state.timers.push(id);
  return id;
}

// Comptes à rebours : tout élément [data-ends] se met à jour chaque seconde.
setInterval(() => {
  for (const el of $$('[data-ends]')) el.textContent = fmtDuration(Number(el.dataset.ends) - Date.now());
}, 1000);

// ================= Navigation =================
const ICONS = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  store: '<path d="M4 7h16l-1.5 12.5a1 1 0 0 1-1 .5H6.5a1 1 0 0 1-1-.5zM9 7V5a3 3 0 0 1 6 0v2"/>',
  agent: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
  live: '<circle cx="12" cy="12" r="3"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  party: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 6 5"/>',
  friends: '<path d="M4 5h16v11H9l-5 4z"/>',
  stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  collection: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 15l5-5 4 4 3-3 6 6"/>',
  stretch: '<rect x="2.5" y="4" width="19" height="13" rx="1.5"/><path d="M8 21h8M12 17v4M6.5 10.5h11M6.5 10.5l2-2M6.5 10.5l2 2M17.5 10.5l-2-2M17.5 10.5l-2 2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

const NAV = [
  ['home', 'Accueil'],
  ['store', 'Boutique'],
  ['agent', 'Agent auto'],
  ['stretch', 'Résolution étirée'],
  ['live', 'Partie en direct'],
  ['history', 'Historique'],
  ['stats', 'Statistiques'],
  'sep',
  ['party', 'Groupe'],
  ['friends', 'Amis'],
  ['collection', 'Collection'],
  'sep',
  ['settings', 'Paramètres'],
];

function renderNav() {
  const autolockOn = state.settings?.autolock?.enabled && !actionsLocked();
  $('#nav').innerHTML = NAV.map((n) =>
    n === 'sep'
      ? '<div class="nav-sep"></div>'
      : `<button class="nav-item ${state.page === n[0] ? 'active' : ''}" data-page="${n[0]}">${icon(n[0])}${n[1]}${
          (n[0] === 'agent' && autolockOn) || (n[0] === 'stretch' && state.settings?.stretch?.enabled) ? '<span class="nav-dot" title="Activé"></span>' : ''
        }${n[0] === 'friends' && unreadTotal() ? `<span class="nav-badge">${unreadTotal()}</span>` : ''}</button>`
  ).join('');
  syncNavPill();
}

$('#nav').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-page]');
  if (btn) navigate(btn.dataset.page);
});

// ---- Messages non lus (le Riot Client ne sait pas qu'on les a lus dans l'app : on retient le dernier vu) ----
const SEEN_KEY = 'pg-chat-seen';
let chatSeen = {};
try { chatSeen = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch { /* stockage indisponible */ }
let rawUnread = {};
function markChatSeen(pid, ids) {
  const last = ids.slice(-20);
  if (!last.length || JSON.stringify(chatSeen[pid]) === JSON.stringify(last)) return;
  chatSeen[pid] = last;
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(chatSeen)); } catch { /* facultatif */ }
  applyUnread();
}
function applyUnread() {
  const next = {};
  for (const [pid, u] of Object.entries(rawUnread)) if (!(chatSeen[pid] || []).includes(u.last)) next[pid] = u.count;
  if (JSON.stringify(next) === JSON.stringify(state.unread)) return;
  state.unread = next;
  renderNav();
  state.onUnread?.();
}
const unreadTotal = () => Object.values(state.unread).reduce((a, b) => a + b, 0);
async function refreshUnread() {
  if (!state.status.connected) return;
  try { rawUnread = await call('chat-unread'); applyUnread(); } catch { /* chat indisponible */ }
}

// État hors ligne : ce qui bloque la liaison et l'action proposée pour s'en sortir.
function offlineState() {
  const s = state.status;
  const launching = state.launchingUntil > Date.now();
  if (s.code === 'NOT_LOGGED_IN') {
    return { kind: 'login', title: 'Connexion requise', text: 'Connectez-vous à votre compte dans le Riot Client.', action: 'launch', label: 'Ouvrir le client', launching };
  }
  if (s.code === 'RIOT_CLIENT_CLOSED' || launching) {
    return { kind: 'closed', title: launching ? 'Démarrage…' : 'Riot Client fermé', text: launching ? 'Connectez-vous : le compte sera lié automatiquement.' : 'Lancez le Riot Client pour lier votre compte.', action: 'launch', label: 'Lancer Riot Client', launching };
  }
  if (s.code) return { kind: 'error', title: 'Liaison impossible', text: s.message || '', action: 'retry', label: 'Réessayer' };
  return { kind: 'search', title: 'Recherche…', text: s.message || 'Recherche du Riot Client…' };
}

const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
const ICON_RETRY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>';
const ICON_OFFLINE = {
  closed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v8"/><path d="M6.3 7.3a8 8 0 1 0 11.4 0"/></svg>',
  login: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9"/></svg>',
  search: '<span class="spinner"></span>',
};

function offlineButton(o, cls = '') {
  if (!o.action) return '';
  const busy = o.launching;
  return `<button class="btn primary ${cls}" data-offline="${o.action}" ${busy ? 'disabled' : ''}>
    ${busy ? '<span class="spinner"></span>En attente…' : `${o.action === 'launch' ? ICON_PLAY : ICON_RETRY}${esc(o.label)}`}</button>`;
}

async function launchRiot() {
  try {
    await call('launch-riot');
    // Le Riot Client met quelques secondes à démarrer : on garde le bouton occupé le temps qu'il apparaisse.
    state.launchingUntil = Date.now() + 30000;
    setTimeout(() => { if (!state.status.connected) onStatus(state.status); }, 30500);
  } catch (e) {
    toast(e.message, 'error');
  }
  onStatus(state.status);
}

async function retryConnect() {
  const s = await call('connect').catch(() => null);
  if (s) onStatus(s);
}

// Les boutons hors ligne vivent dans la carte et sur la page de connexion : un seul gestionnaire pour les deux.
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-offline]');
  if (!btn || btn.disabled) return;
  e.stopPropagation();
  btn.disabled = true;
  (btn.dataset.offline === 'launch' ? launchRiot() : retryConnect()).finally(() => { if (btn.isConnected) btn.disabled = false; });
}, true);

// Carte du compte en bas de la barre latérale : bannière de la carte de joueur, niveau et rang.
function renderAccount() {
  const s = state.status;
  const el = $('#account');
  if (!s.connected) {
    const o = offlineState();
    el.className = `account off ${o.kind}`;
    el.style.backgroundImage = '';
    el.title = '';
    el.innerHTML = `
      <div class="acc-top">
        <div class="acc-avatar acc-off-icon">${ICON_OFFLINE[o.kind]}</div>
        <div class="acc-id">
          <div class="acc-state">${esc(o.title)}</div>
          <div class="acc-hint">${esc(o.text)}</div>
        </div>
      </div>
      ${offlineButton(o, 'acc-btn')}`;
    return;
  }
  const p = state.profile?.puuid === s.puuid ? state.profile : null;
  const t = tierOf(p?.rank?.tier);
  el.className = 'account';
  el.style.backgroundImage = p?.card?.wide ? `url('${p.card.wide}')` : '';
  el.title = 'Voir mon profil';
  el.innerHTML = `
    <div class="acc-top">
      <div class="acc-avatar">${p?.card?.small ? `<img src="${p.card.small}" alt="">` : ''}<span class="dot on"></span>${p?.level != null ? `<span class="acc-lvl">${esc(p.level)}</span>` : ''}</div>
      <div class="acc-id">
        <div class="who">${esc(p?.name || s.name || 'Connecté')}<span>#${esc(p?.tag || s.tag || '')}</span></div>
        <div class="acc-title">${esc(p?.title || 'Compte lié')}</div>
      </div>
    </div>
    <div class="acc-foot">
      <span class="acc-rank">${t?.icon ? `<img src="${t.icon}" alt="">` : ''}${p ? (p.rank?.tier ? `${esc(t?.name)}<b>${p.rank.rr} RR</b>` : 'Non classé') : ''}</span>
      <span class="acc-chip" title="Région">${esc((s.region || '').toUpperCase())}</span>
    </div>`;
}

async function refreshProfile() {
  if (!state.status.connected) return;
  try { state.profile = await call('profile'); renderAccount(); } catch { /* on garde l'ancienne carte */ }
}
$('#account').addEventListener('click', () => state.status.connected && navigate('home'));

function navigate(page) {
  state.onUnread = null;
  state.onStretch = null;
  state.timers.forEach(clearInterval);
  state.timers = [];
  state.page = page;
  state.renderId++;
  content.onclick = content.onchange = null;
  renderNav();
  content.scrollTop = 0;
  chipPos.clear();
  const needsAuth = page !== 'settings' && page !== 'stretch';
  if (needsAuth && !state.status.connected) return renderConnect();
  state.entering = true;
  content.innerHTML = loader();
  PAGES[page]().catch((e) => {
    content.innerHTML = errorBox(e.message);
  });
}

// Pose la pastille de fond (pseudo-élément du conteneur, variables CSS --pill-*) ; `instant` évite la glissade.
function placePill(box, pos, instant) {
  if (instant) box.style.setProperty('--pill-t', 'none');
  for (const [k, v] of Object.entries(pos)) box.style.setProperty(`--pill-${k}`, `${v}px`);
  box.style.setProperty('--pill-o', '1');
  if (instant) { void box.offsetWidth; box.style.removeProperty('--pill-t'); }
}

// Menu : #nav reste en place quand ses onglets sont reconstruits, sa pastille glisse donc de l'ancien au nouveau.
function syncNavPill() {
  const nav = $('#nav');
  const on = nav.querySelector('.nav-item.active');
  if (!on) return nav.style.setProperty('--pill-o', '0');
  placePill(nav, { y: on.offsetTop, h: on.offsetHeight }, !nav.style.getPropertyValue('--pill-h'));
}

// Groupes de choix (filtres, modes) : souvent recréés au clic, ils repartent de la dernière position connue.
const chipPos = new Map();
function syncChips() {
  $$('.chip-group', content).forEach((g, i) => {
    const on = g.querySelector('button.on');
    if (!on) return g.style.setProperty('--pill-o', '0');
    const key = `${state.page}:${g.id || i}`;
    const pos = { x: on.offsetLeft, w: on.offsetWidth };
    const prev = chipPos.get(key);
    chipPos.set(key, pos);
    const fresh = !g.style.getPropertyValue('--pill-w');
    if (fresh && prev) placePill(g, prev, true);
    placePill(g, pos, fresh && !prev);
  });
}

// Animations de contenu : `enter` au premier vrai rendu d'une page (le loader passé), `refresh` après un changement
// de filtre ; jamais aux rafraîchissements automatiques.
let revealTimer = 0;
function reveal(cls) {
  content.classList.remove('enter', 'refresh');
  void content.offsetWidth;
  content.classList.add(cls);
  clearTimeout(revealTimer);
  revealTimer = setTimeout(() => content.classList.remove(cls), 1000);
}
new MutationObserver(() => {
  syncChips();
  const pending = state.entering ? 'enter' : state.refreshing ? 'refresh' : null;
  // L'entrée attend que la page ait quitté son loader ; un rafraîchissement attend aussi ceux d'une sous-partie (#hlist).
  if (!pending || content.querySelector(pending === 'enter' ? ':scope > .loader' : '.loader')) return;
  state.entering = state.refreshing = false;
  reveal(pending);
}).observe(content, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

// Évite d'afficher une page obsolète si l'utilisateur a navigué entre-temps.
function guard() {
  const id = state.renderId;
  return () => id === state.renderId;
}

// ================= Mises à jour =================
function renderUpdate() {
  const u = state.update;
  const el = $('#update');
  if (!u || !['downloading', 'ready', 'available'].includes(u.status)) return (el.innerHTML = '');
  if (u.status === 'downloading') {
    el.innerHTML = `<div class="update-card"><b>Mise à jour v${esc(u.latest)}</b>Téléchargement… ${u.progress || 0}%<div class="update-bar"><div style="width:${u.progress || 0}%"></div></div></div>`;
  } else {
    el.innerHTML = `<div class="update-card"><b>Mise à jour v${esc(u.latest)} ${u.status === 'ready' ? 'prête' : 'disponible'}</b>
      ${u.status === 'ready' ? "Redémarrez l'app pour passer à la nouvelle version." : 'Téléchargez la nouvelle version sur GitHub.'}
      <button class="btn primary" id="update-btn">${u.status === 'ready' ? 'Redémarrer' : 'Télécharger'}</button></div>`;
    $('#update-btn').onclick = (e) => {
      if (u.status === 'ready') {
        e.currentTarget.disabled = true;
        e.currentTarget.textContent = 'Redémarrage…';
      }
      call('update-install');
    };
  }
}

function updateLabel(u) {
  if (!u) return '';
  return {
    dev: 'Mode développement : mises à jour désactivées.',
    idle: 'Pas encore vérifié.',
    checking: 'Recherche de mises à jour…',
    none: 'Vous avez la dernière version.',
    downloading: `Téléchargement de la v${u.latest}… ${u.progress || 0}%`,
    ready: `v${u.latest} prête : redémarrez l'app pour l'installer.`,
    available: `v${u.latest} disponible sur GitHub (version portable : mise à jour manuelle).`,
    error: `Erreur : ${u.error || 'inconnue'}`,
  }[u.status] || '';
}

// ================= Connexion =================
function renderConnect() {
  content.innerHTML = `
    <div class="connect">
      <img class="logo" src="logo-mark.png" alt="">
      <h1>Precise Gunplay</h1>
      <p class="muted">L'application se lie à votre compte via le Riot Client ouvert sur ce PC. Aucun mot de passe n'est demandé ni stocké.</p>
      <div class="steps">
        <div class="step"><b>1</b><div>Lancez le <strong>Riot Client</strong> ou <strong>VALORANT</strong>.</div></div>
        <div class="step"><b>2</b><div>Connectez-vous à votre compte Riot. Cochez « Rester connecté » pour ne plus avoir à le faire.</div></div>
        <div class="step"><b>3</b><div>Precise Gunplay détecte la session et lie le compte.</div></div>
      </div>
      <div class="warn-box" style="text-align:left;margin-bottom:22px">État : ${esc(state.status.message || 'En attente…')}</div>
      <div class="connect-actions">
        ${offlineButton({ ...offlineState(), action: 'launch', label: 'Lancer Riot Client' }, 'big')}
        <button class="btn big" data-offline="retry">${ICON_RETRY}Réessayer</button>
      </div>
    </div>`;
}

function onUpdate(u) {
  if (!u) return;
  const prev = state.update?.status;
  state.update = u;
  renderUpdate();
  const label = $('#s-update-label');
  if (label) label.textContent = updateLabel(u);
  if (u.status === 'ready' && prev !== 'ready') toast(`Mise à jour v${u.latest} téléchargée : redémarrez l'app pour l'installer.`);
}

function onStatus(s) {
  const was = state.status.connected;
  state.status = s;
  renderAccount();
  if (s.connected !== was) {
    if (s.connected) {
      state.launchingUntil = 0;
      state.owned = null;
      state.profile = null;
      if (state.page !== 'home') refreshProfile(); // l'accueil charge déjà le profil
      toast(`Compte lié : ${s.name || ''}#${s.tag || ''}`);
    }
    navigate(state.page);
  } else if (!s.connected && state.page !== 'settings') {
    renderConnect();
  }
}

async function ownedAgents() {
  if (!state.owned) state.owned = new Set(await call('owned-agents').catch(() => state.assets.agents.map((a) => a.uuid)));
  return state.owned;
}

// ================= Pages =================
const PAGES = {};

// ---------- Accueil ----------
// Tableau de bord façon tracker sur les matchs de l'acte en cours (modes classiques, voir Statistiques) :
// agent favori, agents et cartes, rang, derniers matchs et armes favorites.
const DASH_MIN_ACT_MATCHES = 10; // en dessous, l'acte en cours ne dit pas encore grand-chose : on prend le précédent
const DASH_AGENTS = 5;
const DASH_MAPS = 4;
const DASH_MATCHES = 5;
const DASH_WEAPONS = 3;

// Couleurs d'un agent (valorant-api, RRGGBBAA) en variables CSS --c1…--c3 ; la page garde ses couleurs sans elles.
const agentVars = (ag) => (ag?.colors || []).slice(0, 3).map((c, i) => `--c${i + 1}:#${String(c).slice(0, 6)}`).join(';');

PAGES.home = async () => {
  const alive = guard();
  let p = null;
  let data = null;
  let sync = null;
  let refreshTimer = null;

  async function load() {
    [p, data] = await Promise.all([call('profile'), call('stats-data').catch(() => null)]);
    state.profile = p;
    renderAccount();
  }

  // Première synchronisation : la page se complète à mesure que les matchs arrivent (au plus toutes les 3 s).
  async function refresh() {
    refreshTimer = null;
    try { data = await call('stats-data'); } catch { return; }
    if (!alive()) return;
    const scroll = content.scrollTop;
    draw();
    content.scrollTop = scroll;
  }
  const off = window.api.on('stats-sync', (s) => {
    if (!alive()) return off();
    const ended = sync?.running && !s.running;
    sync = s;
    if (ended) {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(refresh, 0);
    } else if (s.running && s.done && !refreshTimer) {
      refreshTimer = setTimeout(refresh, 3000);
    }
  });

  const mapOf = (id) => state.assets.maps.find((m) => m.uuid === id) || null;

  // Période affichée : l'acte en cours, ou le précédent tant que l'acte en cours a trop peu de matchs.
  function actScope(recs) {
    const acts = state.assets.acts || [];
    const actOf = (r) => r.seasonId || acts.find((a) => r.startedAt >= a.start && r.startedAt < a.end)?.uuid || null;
    const i = Math.max(0, acts.findIndex((a) => a.uuid === state.assets.currentAct?.uuid));
    const inAct = (a) => (a ? recs.filter((r) => actOf(r) === a.uuid) : []);
    const now = inAct(acts[i]);
    const prev = inAct(acts[i + 1]);
    if (now.length < DASH_MIN_ACT_MATCHES && prev.length > now.length) return { recs: prev, label: 'acte précédent', act: acts[i + 1] };
    if (now.length) return { recs: now, label: 'acte en cours', act: acts[i] };
    return { recs, label: 'tous vos matchs', act: null }; // rien sur les deux derniers actes
  }
  const scopeTag = (scope) => `<span title="${esc(scope.act?.name || '')}">${esc(scope.label)}</span>`;

  function head() {
    const sub = [p.level != null ? `Niveau ${esc(p.level)}` : '', p.title ? esc(p.title) : ''].filter(Boolean).join(' · ');
    return `
      <div class="page-head dash-head">
        <h1>${sub ? `<small>${sub}</small>` : ''}${esc(p.name)}<span class="dash-tag">#${esc(p.tag)}</span></h1>
        <div class="wallet">
          <div class="coin" title="Valorant Points"><img src="${CURRENCY_ICON.vp}" alt="">${fmtNum(p.wallet.vp)}</div>
          <div class="coin" title="Radianite"><img src="${CURRENCY_ICON.rp}" alt="">${fmtNum(p.wallet.rp)}</div>
          <div class="coin" title="Kingdom Credits"><img src="${CURRENCY_ICON.kc}" alt="">${fmtNum(p.wallet.kc)}</div>
        </div>
      </div>`;
  }

  function topAgent(g, scope) {
    const ag = agentOf(g.key);
    const stat = (label, value) => `<div class="ta-stat"><span>${label}</span><b>${value}</b></div>`;
    return `
      <section class="top-agent" data-go="stats" style="${agentVars(ag)}">
        <div class="ta-bg"></div>
        ${ag?.portrait ? `<div class="ta-art"><img src="${ag.portrait}" alt=""></div>` : ''}
        <div class="ta-body">
          <div class="ta-label">Agent favori · ${scopeTag(scope)}</div>
          <div class="ta-name">${esc(ag?.name || '?')}</div>
          <div class="ta-abilities">
            ${(ag?.abilities || []).map((x) => `<img src="${x.icon}" alt="" title="${esc(x.name.replace(/\s+/g, ' '))}">`).join('')}
            ${g.timed === g.n && g.lengthMs ? `<span>Temps de jeu <b>${hours(g.lengthMs)}</b></span>` : ''}
          </div>
          <div class="ta-stats">
            ${stat('Victoires', `${g.winRate.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`)}
            ${stat('Matchs', `${g.n} <em>${g.wins} V · ${g.losses} D</em>`)}
            ${stat('ACS', f1(g.acs))}
            ${stat('K/D', f2(g.kd))}
            ${stat('Headshot %', f1(g.hs))}
            ${stat('Dégâts / manche', f1(g.adr))}
          </div>
        </div>
      </section>`;
  }

  // Avant le premier match synchronisé : la bannière du joueur à la place de l'agent favori.
  function noMatches() {
    const st = sync || data?.sync;
    const syncing = st && (st.running || !st.lastSync); // premier lancement : la synchro n'a encore jamais tourné
    return `
      <section class="top-agent no-matches">
        <div class="ta-bg" ${p.card?.wide ? `style="background-image:url('${p.card.wide}')"` : ''}></div>
        <div class="ta-body">
          <div class="ta-label">Agent favori</div>
          <div class="ta-name">${syncing ? 'Synchronisation…' : 'Aucun match'}</div>
          <p>${syncing
            ? 'Synchronisation des matchs : agents, cartes et armes favoris s’afficheront ici.'
            : 'Jouez une partie : vos agents, cartes et armes favoris s’afficheront ici.'}</p>
        </div>
      </section>`;
  }

  function agentCards(list, scope) {
    if (!list.length) return '';
    return `
      <h2>Agents <span class="timer">les plus joués · ${scopeTag(scope)}</span></h2>
      <div class="ag-cards">
        ${list.map((g) => {
          const ag = agentOf(g.key);
          return `<div class="ag-card" data-go="stats" style="${agentVars(ag)}">
            ${ag?.portrait ? `<img class="ag-art" src="${ag.portrait}" alt="" loading="lazy">` : ''}
            ${ag?.roleIcon ? `<img class="ag-role" src="${ag.roleIcon}" alt="" title="${esc(ag.role)}">` : ''}
            <div class="ag-info"><b>${esc(ag?.name || '?')}</b><span>${g.n} match${g.n > 1 ? 's' : ''} · <i class="${tone(g.winRate, 50)}">${f0(g.winRate)} %</i></span></div>
          </div>`;
        }).join('')}
      </div>`;
  }

  function mapCards(maps, scope) {
    // Meilleures cartes : au moins 2 matchs dessus quand c'est possible.
    const pool = maps.some((m) => m.n >= 2) ? maps.filter((m) => m.n >= 2) : maps;
    const list = [...pool].sort((x, y) => y.winRate - x.winRate || y.n - x.n).slice(0, DASH_MAPS);
    if (!list.length) return '';
    return `
      <h2>Cartes <span class="timer">meilleur taux de victoire · ${scopeTag(scope)}</span></h2>
      <div class="map-cards">
        ${list.map((g) => {
          const mp = mapOf(g.key);
          return `<div class="map-card" data-go="stats" ${mp?.splash ? `style="--map:url('${mp.splash}')"` : ''}>
            <span class="map-count">${g.n} match${g.n > 1 ? 's' : ''}</span>
            <b>${esc(mp?.name || '?')}</b>
            <span><i class="${tone(g.winRate, 50)}">${f0(g.winRate)} %</i> de victoires</span>
          </div>`;
        }).join('')}
      </div>`;
  }

  function rankCard() {
    const r = p.rank || data?.rank;
    const t = tierOf(r?.tier || 0); // le palier 0 a sa propre icône « non classé »
    const peak = r?.peak > (r?.tier || 0) ? tierOf(r.peak) : null;
    return `
      <div class="rank-card" data-go="stats" ${t?.color && r?.tier ? `style="--tier:${t.color}"` : ''}>
        <div class="rc-main">
          ${r?.tier
            ? `<div class="rc-value"><b>${r.rr}</b><span>/ 100 RR</span></div><div class="rc-name">${esc(t?.name || '')}</div>`
            : '<div class="rc-value"><b class="rc-none">Non classé</b></div><div class="rc-name">Rang actuel</div>'}
          ${peak ? `<div class="st-sub">Meilleur : ${esc(peak.name)}</div>` : ''}
          ${r?.tier ? `<div class="rc-bar"><div style="width:${Math.min(100, r.rr)}%"></div></div>` : ''}
        </div>
        <div class="rc-badge">${t?.icon ? `<img src="${t.icon}" alt="">` : ''}</div>
      </div>`;
  }

  function lastMatches(recs) {
    return `
      <div class="dash-card">
        <div class="dash-title">Derniers matchs <button class="dash-link" data-go="history">Tout voir</button></div>
        ${recs.slice(0, DASH_MATCHES).map((r) => {
          const ag = agentOf(r.agentId), mp = mapOf(r.mapId), t = tierOf(r.tier);
          return `<div class="lm-row ${r.result}" data-go="history" ${mp?.listIcon ? `style="--map:url('${mp.listIcon}')"` : ''}>
            ${ag ? `<img class="lm-agent" src="${ag.icon}" alt="" title="${esc(ag.name)}">` : '<span class="lm-agent"></span>'}
            <div class="lm-info"><b>${esc(mp?.name || '?')}</b><span>${timeAgo(r.startedAt)}${r.queue === 'competitive' ? '' : ` · ${esc(queueName(r.queue))}`}</span></div>
            <div class="lm-score">${r.score ? `${r.score[0]} : ${r.score[1]}` : '—'}</div>
            <div class="lm-tier">${t?.icon && r.tier ? `<img src="${t.icon}" alt="" title="${esc(t.name)}">` : ''}</div>
          </div>`;
        }).join('')}
      </div>`;
  }

  function topWeapons(recs) {
    const kills = {};
    for (const r of recs) for (const [k, v] of Object.entries(r.weapons || {})) kills[k] = (kills[k] || 0) + v;
    const total = Object.values(kills).reduce((s, v) => s + v, 0);
    const weapon = (k) => state.assets.weapons?.find((w) => w.uuid.toLowerCase() === k) || null;
    const list = Object.entries(kills).filter(([k]) => weapon(k)).sort((x, y) => y[1] - x[1]).slice(0, DASH_WEAPONS);
    if (!list.length) return '';
    return `
      <div class="dash-card">
        <div class="dash-title">Armes favorites <button class="dash-link" data-go="stats">Détails</button></div>
        ${list.map(([k, v]) => {
          const w = weapon(k);
          const cat = WEAPON_CATEGORY[String(w.category || '').split('::').pop()] || '';
          const art = p.skins?.[k] || w.art || w.icon; // ton skin équipé, sinon le modèle de base
          return `<div class="wp-card" data-go="stats">
            <div class="wp-info"><b>${esc(w.name)}</b>${cat ? `<span>${esc(cat)}</span>` : ''}<em>${f0(v)} éliminations · ${pct((v / total) * 100)}</em></div>
            ${art ? `<img src="${art}" alt="">` : ''}
          </div>`;
        }).join('')}
      </div>`;
  }

  function draw() {
    const recs = (data?.records || []).filter((r) => !EXCLUDED_FROM_ALL.has(r.queue));
    const scope = actScope(recs);
    const agents = groupBy(scope.recs, 'agentId');
    content.innerHTML = `${head()}
      <div class="dash">
        <div class="dash-main">
          ${agents.length ? topAgent(agents[0], scope) : noMatches()}
          ${agentCards(agents.slice(1, 1 + DASH_AGENTS), scope)}
          ${mapCards(groupBy(scope.recs, 'mapId'), scope)}
        </div>
        <aside class="dash-side">
          ${rankCard()}
          ${recs.length ? lastMatches(recs) : ''}
          ${topWeapons(scope.recs)}
        </aside>
      </div>`;
  }

  await load();
  if (!alive()) return;
  sync ||= data?.sync || null;
  draw();
  content.onclick = (e) => {
    const t = e.target.closest('[data-go]');
    if (t) navigate(t.dataset.go);
  };
};

// ---------- Boutique ----------
function offerCard(o, { small = false } = {}) {
  return `
    <div class="offer ${small ? 'small' : ''} ${o.icon ? '' : 'hidden-card'}" style="${o.color ? `--tier:${o.color}` : ''}">
      ${o.tierIcon ? `<img class="tier-icon" src="${o.tierIcon}" alt="">` : ''}
      ${o.percent ? `<div class="discount">-${o.percent}%</div>` : ''}
      <div class="art">${o.icon ? `<img src="${o.icon}" alt="" loading="lazy">` : '✦'}</div>
      <div class="kind">${esc(o.kind)}</div>
      <div class="oname">${esc(o.name)}</div>
      ${priceHtml(o.price, o.discounted)}
    </div>`;
}

PAGES.store = async () => {
  const alive = guard();
  const s = await call('store');
  if (!alive()) return;
  content.innerHTML = `
    <div class="page-head">
      <h1>Boutique</h1>
      <div class="wallet">
        <div class="coin"><img src="${CURRENCY_ICON.vp}" alt="">${fmtNum(s.wallet.vp)}</div>
        <div class="coin"><img src="${CURRENCY_ICON.rp}" alt="">${fmtNum(s.wallet.rp)}</div>
        <div class="coin"><img src="${CURRENCY_ICON.kc}" alt="">${fmtNum(s.wallet.kc)}</div>
      </div>
    </div>

    <h2>Offres du jour <span class="timer">Renouvellement dans <b data-ends="${s.dailyEndsAt}">${fmtDuration(s.dailyEndsAt - Date.now())}</b></span></h2>
    <div class="offers">${s.daily.map((o) => offerCard(o)).join('') || '<div class="muted">Aucune offre.</div>'}</div>

    ${s.night ? `
      <h2 style="color:#b388ff">Marché nocturne <span class="timer">Fin dans <b data-ends="${s.night.endsAt}">${fmtDuration(s.night.endsAt - Date.now())}</b></span></h2>
      <div class="offers">${s.night.offers.map((o) => offerCard(o)).join('')}</div>` : ''}

    ${s.bundles.length ? `<h2>Packs en vedette</h2>` : ''}
    ${s.bundles.map((b) => `
      <div class="bundle">
        <div class="bundle-art" style="${b.icon ? `background-image:url('${b.icon}')` : ''}">
          <div class="bundle-title">
            <div class="bn">${esc(b.name)}</div>
            <div class="row">${priceHtml(b.basePrice && b.basePrice.amount !== b.price.amount ? b.basePrice : b.price, b.basePrice && b.basePrice.amount !== b.price.amount ? b.price : null)}
              <span class="muted">· encore <b data-ends="${b.endsAt}">${fmtDuration(b.endsAt - Date.now())}</b></span></div>
          </div>
        </div>
        <div class="bundle-items">
          ${b.items.map((i) => `
            <div class="bitem">${i.icon ? `<img src="${i.icon}" alt="" loading="lazy">` : '<div style="width:56px"></div>'}
              <div class="bi-name">${esc(i.name)}<div class="muted" style="font-size:11px">${esc(i.kind)}${i.amount > 1 ? ` ×${i.amount}` : ''}</div></div>
              ${i.price.amount ? priceHtml(i.price) : '<span class="muted">Offert</span>'}</div>`).join('')}
        </div>
      </div>`).join('')}

    ${s.accessories?.offers.length ? `
      <h2>Boutique d'accessoires <span class="timer">Renouvellement dans <b data-ends="${s.accessories.endsAt}">${fmtDuration(s.accessories.endsAt - Date.now())}</b></span></h2>
      <div class="offers">${s.accessories.offers.map((o) => offerCard(o, { small: true })).join('')}</div>` : ''}`;
};

// ---------- Agent auto ----------
// Une seule grille d'agents : elle édite la liste par défaut (ordre de priorité) ou l'agent d'une carte précise.
const MAX_DEFAULT_AGENTS = 4;
const defaultAgents = (al) => [al.agentId, ...(al.fallbacks || [])].filter(Boolean);
// Fenêtre de confirmation intégrée à l'app : résout true (bouton principal) ou false (Annuler, Échap, clic à côté).
function ask({ title, body, ok = 'OK', cancel = 'Annuler' }) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'modal-back';
    el.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
      <h3>${esc(title)}</h3><p>${body}</p>
      <div class="modal-actions"><button class="btn ghost" data-v="0">${esc(cancel)}</button><button class="btn primary" data-v="1">${esc(ok)}</button></div>
    </div>`;
    const close = (v) => { document.removeEventListener('keydown', onKey); el.remove(); resolve(v); };
    const onKey = (e) => { if (e.key === 'Escape') close(false); if (e.key === 'Enter') close(true); };
    el.onclick = (e) => {
      if (e.target === el) return close(false);
      const b = e.target.closest('[data-v]');
      if (b) close(b.dataset.v === '1');
    };
    document.addEventListener('keydown', onKey);
    document.body.appendChild(el);
    el.querySelector('[data-v="1"]').focus();
  });
}

const secs =(ms) => `${(Number(ms) / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}s`;
const autolockReady =(al) => !!al.agentId || Object.values(al.perMap || {}).some(Boolean);

PAGES.agent = async () => {
  const alive = guard();
  const owned = await ownedAgents();
  if (!alive()) return;
  let roleFilter = '';
  let scope = ''; // '' = liste par défaut, sinon uuid de la carte
  const roles = [...new Set(state.assets.agents.map((a) => a.role))].sort();
  const maps = state.assets.maps.filter((m) => m.tactical);

  const save = async (patch) => {
    state.settings = await call('settings-set', { autolock: patch });
    // Plus rien de configuré : on coupe pour ne pas laisser un interrupteur « ON » qui ne fait rien.
    const al = state.settings.autolock;
    if (al.enabled && !autolockReady(al)) state.settings = await call('settings-set', { autolock: { enabled: false } });
    renderNav();
    draw();
  };
  const saveDefaults = (list) => save({ agentId: list[0] || null, fallbacks: list.slice(1) });

  function scopeTile(m) {
    const al = state.settings.autolock;
    const id = m?.uuid || '';
    const picks = (m ? [al.perMap?.[id]] : defaultAgents(al)).map(agentOf).filter(Boolean);
    return `<button class="scope ${m ? '' : 'default'} ${scope === id ? 'on' : ''}" data-scope="${id}"
        style="${m ? `background-image:url('${m.listIcon || m.splash}')` : ''}">
      <span class="sname">${m ? esc(m.name) : 'Par défaut'}</span>
      <span class="spicks">${picks.length
        ? picks.map((a) => `<img src="${a.icon}" alt="" title="${esc(a.name)}">`).join('')
        : `<em>${m ? 'Liste par défaut' : 'Aucun agent'}</em>`}</span>
    </button>`;
  }

  function draw() {
    const al = state.settings.autolock;
    const defaults = defaultAgents(al);
    const map = maps.find((m) => m.uuid === scope);
    const mapPick = map ? al.perMap?.[map.uuid] : null;
    const defaultNames = esc(defaults.map((x) => agentOf(x)?.name).filter(Boolean).join(' → '));

    const hint = map
      ? mapPick
        ? `Sur <b>${esc(map.name)}</b>, l'app prend <b>${esc(agentOf(mapPick)?.name)}</b>. S'il est déjà pris : ${defaults.length ? `liste par défaut (${defaultNames}).` : 'rien n\'est fait.'}`
        : defaults.length
          ? `Aucun agent dédié : la liste par défaut s'applique (${defaultNames}). Cliquez sur un agent pour en choisir un pour cette carte.`
          : `Aucun agent dédié et liste par défaut vide : rien n'est fait sur ${esc(map.name)}. Cliquez sur un agent pour en choisir un.`
      : defaults.length
        ? `Utilisée sur les cartes sans agent dédié, et en secours si l'agent de la carte est déjà pris. Le premier disponible dans l'ordre est choisi (${MAX_DEFAULT_AGENTS} max).`
        : `Vide : l'app n'agit que sur les cartes où vous avez choisi un agent. Cliquez sur des agents pour les ajouter par ordre de priorité (${MAX_DEFAULT_AGENTS} max).`;
    const canClear = map ? !!mapPick : defaults.length > 0;

    const grid = state.assets.agents
      .filter((a) => !roleFilter || a.role === roleFilter)
      .map((a) => {
        const has = owned.has(a.uuid.toLowerCase());
        const order = map ? -1 : defaults.indexOf(a.uuid);
        const on = map ? mapPick === a.uuid : order >= 0;
        return `<button class="agent ${on ? 'on' : ''}" data-pick="${a.uuid}" ${has ? '' : 'disabled title="Agent non débloqué"'}>
          ${order >= 0 ? `<span class="order">${order + 1}</span>` : ''}
          <img src="${a.icon}" alt=""><span class="aname">${esc(a.name)}</span></button>`;
      }).join('');

    content.innerHTML = `
      <div class="page-head">
        <h1>Agent auto</h1>
        ${lockZone(`<label class="switch" title="Activer / désactiver"><input type="checkbox" id="al-enabled" ${al.enabled && !actionsLocked() ? 'checked' : ''} ${lockAttr()}><span></span></label>`)}
      </div>

      ${actionsLocked() ? lockedNotice() : `<div class="warn-box">
        Quand une partie est trouvée, Precise Gunplay choisit automatiquement votre agent pendant la phase de sélection.
        L'app utilise les mêmes API que le client officiel, mais l'automatisation n'est pas approuvée par Riot :
        le mode <b>Verrouiller</b> est le plus risqué vis-à-vis des conditions d'utilisation. Utilisez-le à vos risques ; le mode <b>Survoler</b> vous laisse confirmer vous-même.
      </div>`}
${actionsLocked() ? '<div class="locked-zone">' : ''}

      <div class="panel" style="margin-top:16px">
        <div class="setting-row">
          <div class="label"><div>Mode</div><div>Survoler : l'agent est présélectionné, vous cliquez sur « Verrouiller ». Verrouiller : l'agent est validé directement.</div></div>
          <div class="chip-group" id="al-mode">
            <button data-mode="select" class="${al.mode === 'select' ? 'on' : ''}">Survoler</button>
            <button data-mode="lock" class="${al.mode === 'lock' ? 'on' : ''}">Verrouiller</button>
          </div>
        </div>
        <div class="setting-row">
          <div class="label"><div>Délai avant sélection</div><div>Laisse le temps aux coéquipiers de choisir avant vous.</div></div>
          <input type="range" id="al-delay" min="0" max="8000" step="250" value="${al.delayMs}">
          <b id="al-delay-val" style="width:52px;text-align:right">${secs(al.delayMs)}</b>
        </div>
        ${al.mode === 'lock' ? `
        <div class="setting-row">
          <div class="label"><div>Délai avant verrouillage</div><div>Temps entre le survol et le verrouillage. Un verrouillage instantané est plus facilement détecté comme automatique.</div></div>
          <input type="range" id="al-lock-delay" min="0" max="2000" step="50" value="${al.lockDelayMs}">
          <b id="al-lock-delay-val" style="width:52px;text-align:right">${secs(al.lockDelayMs)}</b>
        </div>` : ''}
      </div>

      <h2>Cartes</h2>
      <div class="scopes">${scopeTile(null)}${maps.map(scopeTile).join('')}</div>

      <div class="scope-head">
        <div>
          <h2>${map ? `Agent sur ${esc(map.name)}` : 'Liste par défaut'}</h2>
          <div class="muted">${hint}</div>
        </div>
        ${canClear ? `<button class="btn ghost" data-clear="1">${map ? 'Retirer' : 'Vider la liste'}</button>` : ''}
      </div>
      <div class="chip-group role-filter" id="role-filter">
        <button data-role="" class="${!roleFilter ? 'on' : ''}">Tous</button>
        ${roles.map((r) => `<button data-role="${esc(r)}" class="${roleFilter === r ? 'on' : ''}">${esc(r)}</button>`).join('')}
      </div>
      <div class="agents">${grid}</div>
${actionsLocked() ? '</div>' : ''}`;
    if (actionsLocked()) return;

    $('#al-enabled').onchange = (e) => {
      if (e.target.checked && !autolockReady(state.settings.autolock)) {
        e.target.checked = false;
        return toast('Choisissez d\'abord un agent, par défaut ou pour une carte.', 'error');
      }
      save({ enabled: e.target.checked });
    };
    $('#al-delay').oninput = (e) => ($('#al-delay-val').textContent = secs(e.target.value));
    $('#al-delay').onchange = (e) => save({ delayMs: Number(e.target.value) });
    if ($('#al-lock-delay')) {
      $('#al-lock-delay').oninput = (e) => ($('#al-lock-delay-val').textContent = secs(e.target.value));
      $('#al-lock-delay').onchange = (e) => save({ lockDelayMs: Number(e.target.value) });
    }
  }

  content.onclick = (e) => {
    const al = state.settings.autolock;
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    if (t.dataset.mode) {
      if (t.dataset.mode === 'lock' && al.mode !== 'lock') {
        return ask({
          title: 'Verrouillage automatique',
          body: `Votre agent sera validé sans que vous ayez à cliquer. Un verrouillage instantané se repère facilement :
            garde un <b>délai avant sélection</b> et un <b>délai avant verrouillage</b> pour rester discret.
            Vous pouvez les régler juste en dessous.`,
          ok: 'Activer',
        }).then((yes) => yes && save({ mode: 'lock' }));
      }
      return save({ mode: t.dataset.mode });
    }
    if (t.dataset.role !== undefined) { roleFilter = t.dataset.role; return draw(); }
    if (t.dataset.scope !== undefined) { scope = t.dataset.scope; return draw(); }
    if (t.dataset.clear) {
      if (!scope) return saveDefaults([]);
      const perMap = { ...(al.perMap || {}) };
      delete perMap[scope];
      return save({ perMap });
    }
    if (t.dataset.pick) {
      const id = t.dataset.pick;
      if (scope) {
        const perMap = { ...(al.perMap || {}) };
        if (perMap[scope] === id) delete perMap[scope];
        else perMap[scope] = id;
        return save({ perMap });
      }
      let list = defaultAgents(al);
      if (list.includes(id)) list = list.filter((x) => x !== id);
      else if (list.length < MAX_DEFAULT_AGENTS) list.push(id);
      else return toast(`${MAX_DEFAULT_AGENTS} agents maximum dans la liste par défaut.`, 'error');
      return saveDefaults(list);
    }
  };
  draw();
};

// ---------- Partie en direct ----------
// Colonnes K/D/A · K/D · HS : toujours trois cellules pour que tout reste aligné d'un joueur à l'autre.
function recentCells(r) {
  if (r == null) return '<div class="pc num muted" title="Chargement de ses derniers matchs…"><span class="mini-loader"></span></div><div class="pc num muted">—</div><div class="pc num muted">—</div>';
  if (!r.n) return '<div class="pc num muted" title="Aucun match récent">—</div><div class="pc num muted">—</div><div class="pc num muted">—</div>';
  const n = (v) => Math.round(v);
  const title = `Moyenne sur ses ${r.n} derniers matchs (${r.wins} victoire${r.wins > 1 ? 's' : ''})`;
  const kdClass = r.kd >= 1.2 ? 'good' : r.kd < 0.8 ? 'bad' : '';
  return `<div class="pc num" title="${title}"><b>${n(r.kills)} / ${n(r.deaths)} / ${n(r.assists)}</b></div>
    <div class="pc num ${kdClass}" title="${title}">${r.kd.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    <div class="pc num" title="${title}">${r.hs != null ? `${Math.round(r.hs)} %` : '—'}</div>`;
}

function playerRow(p, { pregame = false } = {}) {
  const a = agentOf(p.agentId);
  const pa = partyAttrs(p);
  return `
    <div class="player ${p.isMe ? 'me' : ''} ${pa.cls}" ${pa.style}>
      ${a ? `<img class="pagent" src="${a.icon}" alt="">` : '<div class="pagent empty-agent">?</div>'}
      <div class="pname">
        <div>${esc(p.name)}${p.tag ? `<span class="muted">#${esc(p.tag)}</span>` : ''}</div>
        <div>${a ? esc(a.name) : 'En sélection…'}${p.level != null ? ` · Niv. ${p.level}` : ''}${p.hidden ? ' · nom masqué' : ''}${partyTag(p)}</div>
      </div>
      ${pregame ? `<div class="pc">${p.state ? `<span class="pstate ${p.state}">${p.state === 'locked' ? 'Verrouillé' : 'Survol'}</span>` : ''}</div>` : ''}
      ${recentCells(p.recent)}
      ${rankHtml(p.rank)}
      <div class="pc">${p.isMe ? '' : trackerBtn(p.name, p.tag, p.hidden)}</div>
    </div>`;
}

function teamHtml(side, title, players, { pregame = false, score = null } = {}) {
  return `
    <div class="team ${side} ${pregame ? 'pregame' : ''}">
      <div class="player player-head">
        <div class="ph-title"><h3>${title}${score != null ? ` <span class="team-score">${score}</span>` : ''}</h3></div>
        ${pregame ? '<div></div>' : ''}
        <div class="num">K / D / A</div><div class="num">K/D</div><div class="num">HS</div><div class="ph-rank">Rang</div><div></div>
      </div>
      ${players.map((p) => playerRow(p, { pregame })).join('')}
    </div>`;
}

PAGES.live = async () => {
  const alive = guard();
  let pick = null;
  let owned = await ownedAgents();
  let last = null;

  async function refresh() {
    let data;
    try {
      data = await call('live');
    } catch (e) {
      if (alive()) content.innerHTML = errorBox(e.message);
      return;
    }
    if (!alive()) return;
    last = data;
    draw();
  }

  function draw() {
    const d = last;
    if (d.state === 'idle') {
      content.innerHTML = `
        <div class="page-head"><h1>Partie en direct</h1></div>
        <div class="empty">
          <h3>Pas de partie en cours</h3><div>Cette page se met à jour toute seule dès que la sélection d'agent commence.</div></div>`;
      return;
    }
    const me = d.allies.find((p) => p.isMe);
    const takenByOthers = new Set(d.allies.filter((p) => !p.isMe && p.state === 'locked').map((p) => p.agentId));
    const myLocked = me?.state === 'locked';
    content.innerHTML = `
      <div class="match-head" style="${d.map?.splash ? `background-image:url('${d.map.splash}')` : ''}">
        <div>
          <div>
            <div class="phase">${d.state === 'pregame' ? 'Sélection d\'agent' : 'En jeu'} · ${esc(queueName(d.queue))}</div>
            <div class="mapname">${esc(d.map?.name || 'Carte inconnue')}${d.side ? `<span class="pill side ${d.side}">${d.side === 'attack' ? 'Attaque' : 'Défense'}</span>` : ''}</div>
          </div>
          ${d.state === 'pregame' ? `<div class="countdown" data-ends="${d.endsAt}">${fmtDuration(d.endsAt - Date.now())}</div>` : ''}
          ${d.score ? `<div class="live-score" title="Round ${d.score[0] + d.score[1] + 1}"><span class="ally">${d.score[0]}</span><span class="sep">–</span><span class="enemy">${d.score[1]}</span></div>` : ''}
        </div>
      </div>

      ${d.state === 'pregame' && !myLocked ? lockZone(`
        <div class="panel" style="margin-bottom:16px">
          <div class="row" style="margin-bottom:12px">
            <b style="letter-spacing:.1em;text-transform:uppercase">Choisir mon agent</b>
            <div class="spacer"></div>
            <button class="btn primary" id="lock-btn" ${pick && !actionsLocked() ? '' : 'disabled'}>Verrouiller ${pick ? esc(agentOf(pick)?.name) : ''}</button>
            <button class="btn danger" id="dodge-btn" title="Quitter la sélection (pénalité possible)" ${lockAttr()}>Esquiver</button>
          </div>
          <div class="agents">${state.assets.agents.map((a) => {
            const ok = !actionsLocked() && owned.has(a.uuid.toLowerCase()) && !takenByOthers.has(a.uuid.toLowerCase());
            return `<button class="agent ${pick === a.uuid ? 'on' : ''}" data-pick="${a.uuid}" ${ok ? '' : 'disabled'}><img src="${a.icon}" alt=""><span class="aname">${esc(a.name)}</span></button>`;
          }).join('')}</div>
        </div>`) : ''}

      <div class="live-note muted">K/D/A, K/D et HS : moyenne sur les 3 derniers matchs de chaque joueur dans ce mode (pas la partie en cours).</div>
      ${teamHtml('ally', 'Votre équipe', d.allies, { pregame: d.state === 'pregame', score: d.score?.[0] })}
      ${d.enemies.length ? teamHtml('enemy', 'Adversaires', d.enemies, { score: d.score?.[1] }) : ''}`;
  }

  content.onclick = async (e) => {
    const t = e.target.closest('button');
    if (!t || t.disabled || !last) return;
    if (t.dataset.pick) {
      pick = t.dataset.pick;
      call('pregame-select', last.matchId, pick).catch((err) => toast(err.message, 'error'));
      return draw();
    }
    if (t.id === 'lock-btn' && pick) {
      try {
        await call('pregame-lock', last.matchId, pick);
        toast(`${agentOf(pick)?.name} verrouillé.`);
        refresh();
      } catch (err) { toast(err.message, 'error'); }
    }
    if (t.id === 'dodge-btn') {
      if (!confirm('Quitter la sélection d\'agent ? Vous risquez une pénalité (RR, temps d\'attente).')) return;
      try {
        await call('pregame-dodge', last.matchId);
        toast('Partie esquivée.');
        refresh();
      } catch (err) { toast(err.message, 'error'); }
    }
  };

  await refresh();
  every(2500, refresh);
};

// ---------- Historique ----------
const SB_VIEW_KEY = 'pg-scoreboard-view';
let sbView = 'teams';
try { sbView = localStorage.getItem(SB_VIEW_KEY) === 'all' ? 'all' : 'teams'; } catch { /* stockage indisponible */ }

PAGES.history = async () => {
  const alive = guard();
  let filter = '';
  const FILTERS = [['', 'Tous'], ['competitive', 'Compétition'], ['unrated', 'Non classé'], ['swiftplay', 'Vélocité'], ['deathmatch', 'Combat à mort'], ['premier', 'Premier']];

  // En-tête et filtres ne sont posés qu'une fois : un changement de filtre ne recharge que #hlist
  // (pas de saut d'affichage, et la pastille des filtres glisse sans être recréée).
  let loadId = 0;
  async function load() {
    const id = ++loadId;
    const box = $('#hlist');
    if (box) box.innerHTML = loader(); else content.innerHTML = loader();
    let body;
    try {
      const list = await call('history', filter || undefined);
      const wins = list.filter((m) => m.result === 'win').length;
      const k = list.reduce((s, m) => s + m.kills, 0), dth = list.reduce((s, m) => s + m.deaths, 0);
      body = list.length ? `
        <div class="wallet" style="margin-bottom:16px">
          <div class="coin">${list.length} <span class="muted">matchs</span></div>
          <div class="coin" style="color:var(--win)">${Math.round((wins / list.length) * 100)}% <span class="muted">victoires</span></div>
          <div class="coin">${(k / Math.max(1, dth)).toFixed(2)} <span class="muted">K/D</span></div>
          <div class="coin">${Math.round(list.reduce((s, m) => s + m.acs, 0) / list.length)} <span class="muted">ACS moyen</span></div>
        </div>
        ${list.map(matchHtml).join('')}` : '<div class="empty"><h3>Aucun match</h3><div>Jouez une partie dans ce mode pour la voir ici.</div></div>';
    } catch (e) {
      body = errorBox(e.message);
    }
    if (!alive() || id !== loadId) return;
    const current = $('#hlist');
    if (current) current.innerHTML = body;
    else content.innerHTML = head() + `<div id="hlist" class="${sbView === 'all' ? 'sb-all' : ''}">${body}</div>`;
  }

  const head = () => `
    <div class="page-head"><h1>Historique</h1></div>
    <div class="chip-group" id="hfilter" style="margin-bottom:16px">${FILTERS.map(([v, l]) => `<button data-filter="${v}" class="${filter === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;

  function placementBadge(m) {
    if (m.mvp === 'match') return '<span class="badge mvp">MVP</span>';
    if (m.mvp === 'team') return '<span class="badge team-mvp">MVP équipe</span>';
    return `<span class="badge place" title="Place dans la partie (ACS)">${m.placement}<sup>${m.placement === 1 ? 'er' : 'e'}</sup></span>`;
  }

  // `mixed` : classement unique des deux équipes (comme le tableau des scores du jeu), place et équipe sur chaque ligne.
  function sbTable(players, mixed = false) {
    return `
        <table class="sb ${mixed ? 'mixed' : ''}">
          <tr>${mixed ? '<th class="sb-pos">#</th>' : ''}<th>Joueur</th><th>Rang</th><th>ACS</th><th>K</th><th>D</th><th>A</th><th>+/−</th><th>K/D</th><th>ADR</th><th>HS</th><th>FB</th><th></th></tr>
          ${players.map((p, i) => {
            const pa = agentOf(p.agentId), pt = tierOf(p.tier);
            const diff = p.kills - p.deaths;
            const party = partyAttrs(p);
            return `<tr class="${p.isMe ? 'me' : ''} ${mixed ? `t-${p.team}` : ''} ${party.cls}" ${party.style}>
              ${mixed ? `<td class="sb-pos">${i + 1}</td>` : ''}
              <td class="sb-pl">
                <div class="sb-player">
                  ${pa ? `<img class="sb-agent" src="${pa.icon}" alt="" title="${esc(pa.name)}">` : '<span class="sb-agent"></span>'}
                  <div class="sb-name">
                    <div><b>${esc(p.name)}</b><span class="muted">${p.tag ? `#${esc(p.tag)}` : ''}</span>${p.mvp === 'match' ? '<span class="badge mvp">MVP</span>' : p.mvp === 'team' ? '<span class="badge team-mvp">MVP équipe</span>' : ''}</div>
                    <div class="muted">${esc(pa?.name || '')}${p.level != null ? ` · Niv. ${p.level}` : ''}${partyTag(p)}</div>
                  </div>
                </div>
              </td>
              <td>${pt?.icon && p.tier ? `<img class="sb-rank" src="${pt.icon}" alt="" title="${esc(pt.name)}">` : '<span class="muted">—</span>'}</td>
              <td><b>${p.acs}</b></td><td>${p.kills}</td><td>${p.deaths}</td><td>${p.assists}</td>
              <td class="${diff > 0 ? 'pos' : diff < 0 ? 'neg' : ''}">${diff > 0 ? '+' : ''}${diff}</td>
              <td>${(p.kills / Math.max(1, p.deaths)).toFixed(2).replace('.', ',')}</td>
              <td>${p.adr}</td><td>${p.hs != null ? `${p.hs} %` : '—'}</td><td>${p.fb}</td>
              <td>${p.isMe ? '' : trackerBtn(p.name, p.tag)}</td>
            </tr>`;
          }).join('')}
        </table>`;
  }

  function teamTable(t) {
    const title = t.side === 'all' ? 'Classement' : t.side === 'ally' ? 'Votre équipe' : 'Adversaires';
    const outcome = t.side === 'all' ? '' : t.won ? 'Victoire' : 'Défaite';
    return `
      <div class="sb-team ${t.side}">
        <div class="sb-head"><b>${title}</b>${t.rounds != null ? `<span class="sb-score">${t.rounds}</span>` : ''}${outcome ? `<span class="muted">${outcome}</span>` : ''}</div>
        ${sbTable(t.players)}
      </div>`;
  }

  // Deux équipes : bascule entre la vue par équipe et le classement commun (choix mémorisé, appliqué à tous les matchs).
  function scoreboardHtml(m) {
    if (m.teams.length < 2) return m.teams.map(teamTable).join('');
    const all = m.teams.flatMap((t) => t.players).sort((x, y) => y.acs - x.acs);
    const [ally, enemy] = [m.teams.find((t) => t.side === 'ally'), m.teams.find((t) => t.side === 'enemy')];
    return `
      <div class="sb-bar">
        <div class="chip-group sb-switch">
          <button data-sbview="teams" class="${sbView === 'teams' ? 'on' : ''}">Par équipe</button>
          <button data-sbview="all" class="${sbView === 'all' ? 'on' : ''}">Tous les joueurs</button>
        </div>
      </div>
      <div class="sb-view-teams">${m.teams.map(teamTable).join('')}</div>
      <div class="sb-view-all">
        <div class="sb-team mixed">
          <div class="sb-head"><b>Classement de la partie</b>${ally && enemy ? `<span class="sb-score"><span class="ally">${ally.rounds}</span> – <span class="enemy">${enemy.rounds}</span></span>` : ''}<span class="muted">par ACS</span>
            <span class="sb-legend"><i class="ally"></i>Votre équipe<i class="enemy"></i>Adversaires</span></div>
          ${sbTable(all, true)}
        </div>
      </div>`;
  }

  function matchHtml(m) {
    const a = agentOf(m.agentId);
    const t = tierOf(m.tier);
    const label = { win: 'Victoire', loss: 'Défaite', draw: 'Égalité' }[m.result];
    return `
      <div class="match ${m.result}">
        <div class="match-row" data-toggle>
          <div class="bar"></div>
          ${m.map?.listIcon ? `<img class="mimg" src="${m.map.listIcon}" alt="" loading="lazy">` : '<div></div>'}
          ${a ? `<img class="magent" src="${a.icon}" alt="" title="${esc(a.name)}">` : '<div></div>'}
          <div class="minfo"><div class="mmap">${esc(m.map?.name || '?')}</div><div class="mmeta">${esc(queueName(m.queue))} · ${m.startedAt ? timeAgo(m.startedAt) : ''} · ${Math.round((m.lengthMs || 0) / 60000)} min</div></div>
          <div><div class="stat-label">${label}</div><div class="mscore">${m.score ? `${m.score[0]} - ${m.score[1]}` : '—'}</div></div>
          <div>${placementBadge(m)}</div>
          <div><div class="stat-label">K / D / A</div><div class="stat-val">${m.kills} / ${m.deaths} / ${m.assists}</div></div>
          <div><div class="stat-label">ACS</div><div class="stat-val">${m.acs}</div></div>
          <div class="col-hs"><div class="stat-label">HS</div><div class="stat-val">${m.hs != null ? `${m.hs} %` : '—'}</div></div>
          <div class="col-adr"><div class="stat-label">ADR</div><div class="stat-val">${m.adr}</div></div>
          <div>${t?.icon && m.tier ? `<img src="${t.icon}" alt="" title="${esc(t.name)}" style="width:36px;height:36px">` : ''}</div>
          <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div class="scoreboard"><div class="sb-inner"><div class="sb-pad">${scoreboardHtml(m)}</div></div></div>
      </div>`;
  }

  content.onclick = (e) => {
    const f = e.target.closest('[data-filter]');
    if (f) {
      if (f.dataset.filter === filter) return;
      filter = f.dataset.filter;
      $$('#hfilter button').forEach((b) => b.classList.toggle('on', b === f));
      state.refreshing = true;
      return load();
    }
    const v = e.target.closest('[data-sbview]');
    if (v) {
      sbView = v.dataset.sbview;
      try { localStorage.setItem(SB_VIEW_KEY, sbView); } catch { /* facultatif */ }
      $('#hlist')?.classList.toggle('sb-all', sbView === 'all');
      $$('[data-sbview]').forEach((b) => b.classList.toggle('on', b.dataset.sbview === sbView));
      return;
    }
    const row = e.target.closest('[data-toggle]');
    if (row) row.parentElement.classList.toggle('open');
  };
  await load();
};

// ---------- Statistiques ----------
const CHART = { pos: '#12d6a0', neg: '#ff2e4d', draw: '#6b7590', line: '#12d6a0', grid: '#222941', surface: '#121626' };

// Infobulle unique pour tous les graphiques (contenu inséré via textContent).
function chartTip() {
  let tip = $('#chart-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'chart-tip';
    tip.className = 'chart-tip';
    document.body.appendChild(tip);
  }
  return {
    show(e, title, rows) {
      tip.replaceChildren();
      const h = document.createElement('div');
      h.className = 'tip-title';
      h.textContent = title;
      tip.appendChild(h);
      for (const [value, label, color] of rows) {
        const r = document.createElement('div');
        r.className = 'tip-row';
        const k = document.createElement('span');
        k.className = 'tip-key';
        if (color) k.style.background = color;
        const v = document.createElement('b');
        v.textContent = value;
        const l = document.createElement('span');
        l.textContent = label;
        r.append(k, v, l);
        tip.appendChild(r);
      }
      tip.style.display = 'block';
      const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8);
      const y = Math.min(e.clientY + 14, innerHeight - tip.offsetHeight - 8);
      tip.style.left = `${x}px`;
      tip.style.top = `${y}px`;
    },
    hide() { tip.style.display = 'none'; },
  };
}

const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};

function niceStep(range, target = 4) {
  const raw = range / target;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || mag * 10;
}

const shortDate = (ts) => new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

/** Courbe d'évolution du RR (une série, crosshair + infobulle). */
function rrChart(el, pts) {
  const W = el.clientWidth || 800, H = 240, m = { l: 96, r: 70, t: 14, b: 14 };
  const vals = pts.map((p) => p.tier * 100 + p.rr);
  const y0 = Math.floor(Math.min(...vals) / 100) * 100;
  const y1 = Math.max(y0 + 100, Math.ceil(Math.max(...vals) / 100) * 100);
  const last = pts.length - 1;
  const x = (i) => m.l + (last === 0 ? (W - m.l - m.r) / 2 : (i * (W - m.l - m.r)) / last);
  const y = (v) => m.t + (1 - (v - y0) / (y1 - y0)) * (H - m.t - m.b);
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'chart' });

  // Une ligne par palier de rang (100 points = 1 palier).
  const every = (y1 - y0) / 100 > 6 ? 2 : 1;
  for (let v = y0, i = 0; v <= y1; v += 100, i++) {
    svg.appendChild(svgEl('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: CHART.grid, 'stroke-width': 1 }));
    if (i % every === 0 && v / 100 <= 27) {
      const t = svgEl('text', { x: m.l - 10, y: y(v) + 4, 'text-anchor': 'end', class: 'axis' });
      t.textContent = tierOf(v / 100)?.name || '';
      svg.appendChild(t);
    }
  }
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(vals[i])}`).join('');
  svg.appendChild(svgEl('path', { d: `${line}L${x(last)},${y(y0)}L${x(0)},${y(y0)}Z`, fill: CHART.line, opacity: 0.1 }));
  svg.appendChild(svgEl('path', { d: line, fill: 'none', stroke: CHART.line, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  svg.appendChild(svgEl('circle', { cx: x(last), cy: y(vals[last]), r: 4, fill: CHART.line, stroke: CHART.surface, 'stroke-width': 2 }));
  const endLabel = svgEl('text', { x: x(last) + 10, y: y(vals[last]) + 4, class: 'end-label' });
  endLabel.textContent = `${pts[last].rr} RR`;
  svg.appendChild(endLabel);

  const cross = svgEl('line', { y1: m.t, y2: H - m.b, stroke: '#8a99a6', 'stroke-width': 1, visibility: 'hidden' });
  const dot = svgEl('circle', { r: 5, fill: CHART.line, stroke: CHART.surface, 'stroke-width': 2, visibility: 'hidden' });
  const hit = svgEl('rect', { x: m.l - 12, y: 0, width: W - m.l - m.r + 24, height: H, fill: 'transparent' });
  svg.append(cross, dot, hit);
  const tip = chartTip();
  hit.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = last === 0 ? 0 : Math.max(0, Math.min(last, Math.round(((px - m.l) / (W - m.l - m.r)) * last)));
    const p = pts[i];
    cross.setAttribute('x1', x(i));
    cross.setAttribute('x2', x(i));
    cross.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', x(i));
    dot.setAttribute('cy', y(vals[i]));
    dot.setAttribute('visibility', 'visible');
    const map = state.assets.maps.find((mp) => mp.uuid === p.mapId);
    tip.show(e, `${shortDate(p.at)}${map ? ` · ${map.name}` : ''}`, [
      [`${p.earned > 0 ? '+' : ''}${p.earned} RR`, p.earned >= 0 ? 'gagnés' : 'perdus', p.earned >= 0 ? CHART.pos : CHART.neg],
      [`${tierOf(p.tier)?.name || ''} · ${p.rr} RR`, 'après le match', CHART.line],
    ]);
  });
  hit.addEventListener('pointerleave', () => {
    cross.setAttribute('visibility', 'hidden');
    dot.setAttribute('visibility', 'hidden');
    tip.hide();
  });
  el.replaceChildren(svg);
}

/** Colonnes : ACS par match, couleur = résultat, ligne de moyenne. */
function acsChart(el, recs) {
  const W = el.clientWidth || 800, H = 220, m = { l: 44, r: 84, t: 14, b: 10 };
  const vals = recs.map((r) => Math.round(r.combat / Math.max(1, r.rounds)));
  const top = Math.max(...vals, 100);
  const step = niceStep(top);
  const yMax = Math.ceil(top / step) * step;
  const y = (v) => m.t + (1 - v / yMax) * (H - m.t - m.b);
  const slot = (W - m.l - m.r) / recs.length;
  const bw = Math.max(2, Math.min(24, slot - 2));
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'chart' });
  for (let v = 0; v <= yMax; v += step) {
    svg.appendChild(svgEl('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: CHART.grid, 'stroke-width': 1 }));
    const t = svgEl('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'axis' });
    t.textContent = v;
    svg.appendChild(t);
  }
  const color = { win: CHART.pos, loss: CHART.neg, draw: CHART.draw };
  const label = { win: 'Victoire', loss: 'Défaite', draw: 'Égalité' };
  const tip = chartTip();
  recs.forEach((r, i) => {
    const cx = m.l + slot * i + slot / 2;
    const yt = y(vals[i]), base = y(0), x0 = cx - bw / 2, rad = Math.min(4, bw / 2, base - yt);
    const bar = svgEl('path', {
      d: `M${x0},${base}V${yt + rad}Q${x0},${yt} ${x0 + rad},${yt}H${x0 + bw - rad}Q${x0 + bw},${yt} ${x0 + bw},${yt + rad}V${base}Z`,
      fill: color[r.result],
      class: 'bar',
    });
    const hit = svgEl('rect', { x: m.l + slot * i, y: m.t, width: slot, height: H - m.t - m.b, fill: 'transparent' });
    hit.addEventListener('pointermove', (e) => {
      bar.classList.add('hover');
      const map = state.assets.maps.find((mp) => mp.uuid === r.mapId);
      const agent = agentOf(r.agentId);
      tip.show(e, `${map?.name || '?'} · ${agent?.name || '?'} · ${shortDate(r.startedAt)}`, [
        [`${vals[i]} ACS`, label[r.result] + (r.score ? ` ${r.score[0]}-${r.score[1]}` : ''), color[r.result]],
        [`${r.kills} / ${r.deaths} / ${r.assists}`, 'K / D / A'],
      ]);
    });
    hit.addEventListener('pointerleave', () => {
      bar.classList.remove('hover');
      tip.hide();
    });
    svg.append(bar, hit);
  });
  const avg = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
  svg.appendChild(svgEl('line', { x1: m.l, x2: W - m.r, y1: y(avg), y2: y(avg), stroke: '#ece8e1', 'stroke-width': 1, opacity: 0.45 }));
  const al = svgEl('text', { x: W - m.r + 8, y: y(avg) + 4, class: 'end-label' });
  al.textContent = `Moy. ${avg}`;
  svg.appendChild(al);
  el.replaceChildren(svg);
}

function aggregate(recs) {
  const keys = ['kills', 'deaths', 'assists', 'combat', 'rounds', 'damage', 'head', 'body', 'leg', 'fb', 'fd', 'kast', 'k3', 'k4', 'k5', 'flawless'];
  const s = { n: recs.length, wins: 0, losses: 0, draws: 0, clutches: 0, roundsWon: 0, roundsTotal: 0, dd: 0, ddRounds: 0, detailed: 0, lengthMs: 0, timed: 0 };
  for (const k of keys) s[k] = 0;
  for (const r of recs) {
    if (r.result === 'win') s.wins++;
    else if (r.result === 'loss') s.losses++;
    else s.draws++;
    for (const k of keys) s[k] += r[k] || 0;
    s.clutches += r.clutches?.length || 0;
    if (r.score) { s.roundsWon += r.score[0]; s.roundsTotal += r.score[0] + r.score[1]; }
    // Résumés v1 (anciens matchs) : ni dégâts reçus ni durée, ils sont laissés de côté pour ces deux stats.
    if (r.received != null) { s.dd += r.damage - r.received; s.ddRounds += r.rounds; s.detailed++; }
    if (r.lengthMs) { s.lengthMs += r.lengthMs; s.timed++; }
  }
  const shots = s.head + s.body + s.leg;
  return {
    ...s,
    shots,
    winRate: s.n ? (s.wins / s.n) * 100 : 0,
    kd: s.kills / Math.max(1, s.deaths),
    kda: (s.kills + s.assists) / Math.max(1, s.deaths),
    acs: s.combat / Math.max(1, s.rounds),
    adr: s.damage / Math.max(1, s.rounds),
    hs: shots ? (s.head / shots) * 100 : 0,
    bodyPct: shots ? (s.body / shots) * 100 : 0,
    legPct: shots ? (s.leg / shots) * 100 : 0,
    kastPct: s.rounds ? (s.kast / s.rounds) * 100 : 0,
    kpm: s.n ? s.kills / s.n : 0,
    kpr: s.kills / Math.max(1, s.rounds),
    ddDelta: s.ddRounds ? s.dd / s.ddRounds : null,
    roundWin: s.roundsTotal ? (s.roundsWon / s.roundsTotal) * 100 : null,
    entry: s.fb + s.fd ? (s.fb / (s.fb + s.fd)) * 100 : null,
  };
}

function groupBy(recs, key) {
  const g = new Map();
  for (const r of recs) {
    const k = typeof key === 'function' ? key(r) : r[key];
    if (!k) continue;
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(r);
  }
  return [...g.entries()].map(([k, list]) => ({ key: k, list, ...aggregate(list) })).sort((a, b) => b.n - a.n || b.acs - a.acs);
}

const f2 = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const f1 = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const f0 = (n) => Math.round(n).toLocaleString('fr-FR');
const pct = (n) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
const DD_TITLE = 'Écart de dégâts : dégâts infligés moins dégâts reçus, par manche';
const signed = (n) => (n == null ? '—' : `${n > 0 ? '+' : ''}${f0(n)}`);
const hours = (ms) => `${(ms / 3600000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} h`;
// Couleur d'une valeur autour d'un seuil (vert au-dessus, rouge en dessous).
const tone = (v, mid) => (v == null || v === mid ? '' : v > mid ? 'pos' : 'neg');

const WEAPON_CATEGORY = {
  Rifle: "Fusil d'assaut", SMG: 'Mitraillette', Shotgun: 'Fusil à pompe', Sniper: 'Fusil de précision',
  Heavy: 'Mitrailleuse', Sidearm: 'Arme de poing', Melee: 'Corps à corps',
};

/** Silhouette : chaque zone est d'autant plus vive qu'elle reçoit de balles. */
function hitFigure(a) {
  const max = Math.max(a.hs, a.bodyPct, a.legPct, 1);
  const op = (v) => (0.16 + 0.84 * (v / max)).toFixed(2);
  return `<svg class="hit-figure" viewBox="0 0 60 120" aria-hidden="true">
    <circle cx="30" cy="11" r="9.5" fill-opacity="${op(a.hs)}"/>
    <g fill-opacity="${op(a.bodyPct)}"><rect x="17" y="24" width="26" height="41" rx="8"/><rect x="6" y="26" width="9" height="36" rx="4.5"/><rect x="45" y="26" width="9" height="36" rx="4.5"/></g>
    <g fill-opacity="${op(a.legPct)}"><rect x="18" y="67" width="11.5" height="50" rx="5.5"/><rect x="30.5" y="67" width="11.5" height="50" rx="5.5"/></g>
  </svg>`;
}

/** Petite courbe (HS % par match), sans texte : l'échelle est posée à côté en HTML. */
function sparkline(vals) {
  if (vals.length < 2) return '';
  const top = Math.max(10, Math.ceil(Math.max(...vals) / 10) * 10);
  const x = (i) => (i / (vals.length - 1)) * 200;
  const y = (v) => 56 - (v / top) * 52;
  const line = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  return `<div class="spark">
    <div class="spark-axis"><span>${top}</span><span>${top / 2}</span><span>0</span></div>
    <svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
      <path class="spark-grid" d="M0,4H200M0,30H200M0,56H200"/>
      <path class="spark-area" d="${line}L200,56L0,56Z"/>
      <path class="spark-line" d="${line}"/>
    </svg>
  </div>`;
}

/** Anneau victoires / défaites. */
function winRing(a) {
  const C = 2 * Math.PI * 26;
  const played = a.wins + a.losses + a.draws || 1;
  const w = (a.wins / played) * C, l = (a.losses / played) * C;
  return `<div class="wl-ring">
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="26" class="ring-bg"/>
      <circle cx="32" cy="32" r="26" class="ring-loss" stroke-dasharray="${l} ${C}" stroke-dashoffset="${-w}"/>
      <circle cx="32" cy="32" r="26" class="ring-win" stroke-dasharray="${w} ${C}"/>
    </svg>
    <div><b class="pos">${a.wins} V</b><b class="neg">${a.losses} D</b></div>
  </div>`;
}

// Badges d'un match : multi-kills et clutchs (les plus forts d'abord).
function matchBadges(r) {
  const out = [];
  const times = (n) => (n > 1 ? ` <i>x${n}</i>` : '');
  if (r.k5) out.push(`<span class="mbadge ace">Ace${times(r.k5)}</span>`);
  const clutch = new Map();
  for (const n of r.clutches || []) clutch.set(n, (clutch.get(n) || 0) + 1);
  for (const [n, c] of [...clutch].sort((x, y) => y[0] - x[0])) out.push(`<span class="mbadge clutch">1v${n}${times(c)}</span>`);
  if (r.k4) out.push(`<span class="mbadge">4K${times(r.k4)}</span>`);
  if (r.k3) out.push(`<span class="mbadge">3K${times(r.k3)}</span>`);
  return out.join('');
}

function placeBadge(r) {
  if (!r.place) return '';
  if (r.mvp === 'match') return '<span class="badge mvp">MVP</span>';
  if (r.mvp === 'team') return '<span class="badge team-mvp">MVP équipe</span>';
  return `<span class="badge place" title="Place dans la partie (score de combat)">${r.place}<sup>${r.place === 1 ? 'er' : 'e'}</sup></span>`;
}

// Modes exclus de « Tous les modes » (comme sur les trackers) : parties perso et modes « fun ».
const EXCLUDED_FROM_ALL = new Set(['', 'custom', 'deathmatch', 'hurm', 'ggteam', 'snowball', 'newmap', 'skirmish2v2', 'abilitydraftarena']);

PAGES.stats = async () => {
  const alive = guard();
  const acts = state.assets.acts || [];
  state.statsFilter ||= { queue: 'competitive', act: state.assets.currentAct?.uuid || 'all' };
  const f = state.statsFilter;
  const QUEUE_F = [['competitive', 'Compétition'], ['unrated', 'Non classé'], ['swiftplay', 'Vélocité'], ['deathmatch', 'Combat à mort'], ['all', 'Tous les modes']];
  const MATCH_PAGE = 20;
  const mf = { agent: '', map: '' }; // filtres de la liste des matchs
  let shown = MATCH_PAGE;
  let allAgents = false;
  let data = null;
  let sync = null;
  let refreshedAt = 0;
  let refreshTimer = null;

  const actOf = (r) => r.seasonId || acts.find((a) => r.startedAt >= a.start && r.startedAt < a.end)?.uuid || null;
  const inQueue = (r) => (f.queue === 'all' ? !EXCLUDED_FROM_ALL.has(r.queue) : r.queue === f.queue);
  const inAct = (r) => f.act === 'all' || actOf(r) === f.act;
  const actName = (id) => (id === 'all' ? 'toutes les saisons' : acts.find((a) => a.uuid === id)?.name || 'cet acte');
  const mapOf = (id) => state.assets.maps.find((m) => m.uuid === id) || null;

  function syncLine() {
    const s = sync || data?.sync;
    if (!s) return '';
    if (s.running) {
      if (s.waitUntil && s.waitUntil > Date.now()) {
        return `<span class="rate-wait">Pause imposée par Riot : reprise dans <b data-ends="${s.waitUntil}">${fmtDuration(s.waitUntil - Date.now())}</b></span> · ${s.done} / ${s.total} nouveaux matchs`;
      }
      return s.total ? `<span class="sync-dot"></span>Synchronisation… ${s.done} / ${s.total} nouveaux matchs` : '<span class="sync-dot"></span>Recherche de nouveaux matchs…';
    }
    if (s.error) return `Synchronisation impossible : ${esc(s.error)}`;
    return `À jour · ${data?.records.length || 0} matchs en mémoire`;
  }

  async function refresh() {
    refreshedAt = Date.now();
    try {
      data = await call('stats-data');
    } catch (e) {
      if (alive()) content.innerHTML = errorBox(e.message);
      return;
    }
    if (!alive()) return;
    const scroll = content.scrollTop;
    draw();
    content.scrollTop = scroll;
  }

  // Rafraîchit au plus toutes les 3 s, mais toujours après le dernier événement : les matchs reçus
  // juste avant une pause imposée par Riot s'affichent quand même.
  function scheduleRefresh(now = false) {
    clearTimeout(refreshTimer);
    const delay = now ? 0 : Math.max(0, 3000 - (Date.now() - refreshedAt));
    refreshTimer = setTimeout(() => alive() && refresh(), delay);
  }

  const off = window.api.on('stats-sync', (s) => {
    if (!alive()) return off();
    const wasRunning = sync?.running;
    sync = s;
    const line = $('#sync-line');
    if (line) line.innerHTML = syncLine();
    if (wasRunning && !s.running) scheduleRefresh(true);
    else if (s.running && s.done) scheduleRefresh();
    else if (data && $('.empty')) draw(); // met à jour le message « synchronisation en cours »
  });

  // ---------- Colonne de gauche ----------
  function rankSide(actRank) {
    const current = state.assets.currentAct?.uuid;
    const past = f.act !== 'all' && f.act !== current;
    // Meilleur rang de tous les actes connus, avec l'acte où il a été atteint.
    let best = null;
    for (const [id, r] of Object.entries(data.actRanks || {})) if (r.peak && (!best || r.peak > best.peak)) best = { peak: r.peak, act: id };
    if (!best && data.rank?.peak) best = { peak: data.rank.peak, act: null };
    if (!actRank?.tier && !best) return '';
    const rt = tierOf(actRank?.tier), at = tierOf(actRank?.peak), bt = tierOf(best?.peak);
    const bestAct = acts.find((x) => x.uuid === best?.act);
    return `
      <div class="panel side-card rank-side">
        <div class="side-title">${past ? "Rang de fin d'acte" : 'Rang actuel'}</div>
        <div class="rank-line">
          ${rt?.icon && actRank?.tier ? `<img src="${rt.icon}" alt="">` : '<span class="rank-none"></span>'}
          <div><div class="rank-name">${actRank?.tier ? esc(rt?.name) : 'Non classé'}</div>
          <div class="st-sub">${actRank?.tier ? `${actRank.rr} RR` : ''}${actRank?.peak && actRank.peak !== actRank.tier ? `${actRank?.tier ? ' · ' : ''}max de l'acte : ${esc(at?.name || '')}` : ''}</div></div>
        </div>
        ${bt ? `
          <div class="side-title" style="margin-top:14px">Meilleur rang</div>
          <div class="rank-line">
            ${bt.icon ? `<img src="${bt.icon}" alt="">` : ''}
            <div><div class="rank-name">${esc(bt.name)}</div>${bestAct ? `<div class="st-sub">${esc(bestAct.name)}</div>` : ''}</div>
          </div>` : ''}
      </div>`;
  }

  function accuracySide(a, recs) {
    const hsTrend = [...recs].reverse().filter((r) => r.head + r.body + r.leg > 0).slice(-20)
      .map((r) => (r.head / (r.head + r.body + r.leg)) * 100);
    return `
      <div class="panel side-card">
        <div class="side-title">Précision <span>${a.n} matchs</span></div>
        <div class="acc-body">
          ${hitFigure(a)}
          <div class="acc-rows">
            ${[['Tête', a.hs, a.head], ['Corps', a.bodyPct, a.body], ['Jambes', a.legPct, a.leg]].map(([l, v, hits], i) => `
              <div class="acc-row ${i === 0 ? 'head' : ''}"><span>${l}</span><b>${pct(v)}</b><em>${f0(hits)} touches</em></div>`).join('')}
          </div>
        </div>
        ${hsTrend.length >= 2 ? `<div class="side-sub">Headshot % par match <span>${hsTrend.length} derniers</span></div>${sparkline(hsTrend)}` : ''}
      </div>`;
  }

  function rolesSide(recs) {
    const roles = groupBy(recs, (r) => agentOf(r.agentId)?.role || null);
    if (!roles.length) return '';
    return `
      <div class="panel side-card">
        <div class="side-title">Rôles</div>
        ${roles.map((g) => {
          const icon = state.assets.agents.find((x) => x.role === g.key)?.roleIcon;
          return `<div class="side-row">
            ${icon ? `<img class="role-icon" src="${icon}" alt="">` : '<span class="role-icon"></span>'}
            <div class="side-main"><b>${esc(g.key)}</b><div class="st-sub">${g.wins} V · ${g.losses} D</div></div>
            <div class="side-num"><b class="${tone(g.winRate, 50)}">${pct(g.winRate)}</b><div class="st-sub">victoires</div></div>
            <div class="side-num"><b>${f2(g.kda)}</b><div class="st-sub">KDA</div></div>
          </div>`;
        }).join('')}
      </div>`;
  }

  function weaponsSide(recs) {
    const kills = {};
    for (const r of recs) for (const [k, v] of Object.entries(r.weapons || {})) kills[k] = (kills[k] || 0) + v;
    const total = Object.values(kills).reduce((s, v) => s + v, 0);
    const info = (k) => (k === 'ability' ? { name: 'Capacités' } : state.assets.weapons?.find((w) => w.uuid.toLowerCase() === k) || null);
    const list = Object.entries(kills).filter(([k]) => info(k)).sort((x, y) => y[1] - x[1]).slice(0, 6);
    if (!list.length) return '';
    return `
      <div class="panel side-card">
        <div class="side-title">Armes favorites <span>éliminations</span></div>
        ${list.map(([k, v]) => {
          const w = info(k);
          const cat = WEAPON_CATEGORY[String(w.category || '').split('::').pop()] || '';
          return `<div class="weapon-row">
            <div class="weapon-art">${w.icon ? `<img src="${w.icon}" alt="">` : ''}</div>
            <div class="side-main"><b>${esc(w.name)}</b>${cat ? `<div class="st-sub">${esc(cat)}</div>` : ''}</div>
            <div class="side-num"><b>${f0(v)}</b><div class="st-sub">${pct((v / total) * 100)}</div></div>
            <div class="weapon-bar"><div style="width:${(v / list[0][1]) * 100}%"></div></div>
          </div>`;
        }).join('')}
      </div>`;
  }

  function mapsSide(maps) {
    if (!maps.length) return '';
    return `
      <div class="panel side-card">
        <div class="side-title">Cartes <span>victoires</span></div>
        ${[...maps].sort((x, y) => y.winRate - x.winRate || y.n - x.n).map((g) => {
          const mp = mapOf(g.key);
          return `<div class="map-row" ${mp?.listIcon ? `style="--map:url('${mp.listIcon}')"` : ''}>
            <b>${esc(mp?.name || '?')}</b>
            <div class="side-num"><b class="${tone(g.winRate, 50)}">${pct(g.winRate)}</b><div class="st-sub">${g.wins} V · ${g.losses} D</div></div>
          </div>`;
        }).join('')}
      </div>`;
  }

  // ---------- Vue d'ensemble ----------
  function overview(a, recs, actRank) {
    const resultLabel = { win: 'Victoire', loss: 'Défaite', draw: 'Égalité' };
    const queueLabel = QUEUE_F.find(([v]) => v === f.queue)?.[1] || '';
    const rt = tierOf(actRank?.tier);
    const key = (label, value, sub, cls = '') => `<div class="ov-key"><div class="st-label">${label}</div><div class="ov-key-val ${cls}">${value}</div>${sub ? `<div class="st-sub">${sub}</div>` : ''}</div>`;
    const cell = (label, value, cls = '') => `<div class="ov-cell"><div class="st-label">${label}</div><b class="${cls}">${value}</b></div>`;
    const showRank = (f.queue === 'competitive' || f.queue === 'all') && actRank?.tier;
    return `
      <div class="panel st-overview">
        <div class="ov-head">
          <div>
            <div class="ov-title">${esc(actName(f.act))} · ${esc(queueLabel)}</div>
            <div class="st-sub">${a.timed === a.n && a.lengthMs ? `${hours(a.lengthMs)} de jeu · ` : ''}${a.n} matchs · ${f0(a.rounds)} manches</div>
          </div>
          <div class="form">${recs.slice(0, 10).map((r) => `<span class="form-dot ${r.result}" title="${resultLabel[r.result]}">${r.result === 'win' ? 'V' : r.result === 'loss' ? 'D' : 'N'}</span>`).join('')}</div>
        </div>
        <div class="ov-top">
          ${showRank ? `<div class="ov-rank">${rt?.icon ? `<img src="${rt.icon}" alt="">` : ''}<div><div class="st-label">Rang</div><div class="ov-rank-name">${esc(rt?.name || '')}</div></div></div>` : ''}
          <div class="ov-hero"><div class="st-label">K/D</div><div class="hero-value">${f2(a.kd)}</div></div>
          ${winRing(a)}
        </div>
        <div class="ov-keys">
          ${key('Dégâts / manche', f1(a.adr), 'ADR')}
          ${key('K/D', f2(a.kd), `${f0(a.kills)} K · ${f0(a.deaths)} D`, tone(a.kd, 1))}
          ${key('Headshot', pct(a.hs), `${f0(a.head)} touches à la tête`)}
          ${key('Victoires', pct(a.winRate), `${a.wins} V · ${a.losses} D${a.draws ? ` · ${a.draws} N` : ''}`, tone(a.winRate, 50))}
        </div>
        <div class="ov-grid">
          ${cell('Victoires', f0(a.wins))}
          ${cell('KAST', pct(a.kastPct))}
          ${cell(`<span title="${DD_TITLE}">DDΔ / manche</span>`, signed(a.ddDelta), tone(a.ddDelta, 0))}
          ${cell('Kills', f0(a.kills))}
          ${cell('Morts', f0(a.deaths))}
          ${cell('Assists', f0(a.assists))}
          ${cell('ACS', f1(a.acs))}
          ${cell('KAD', f2(a.kda))}
          ${cell('Kills / manche', f2(a.kpr))}
          ${cell('First bloods', f0(a.fb))}
          ${cell('Manches parfaites', a.detailed ? f0(a.flawless) : '—')}
          ${cell('Aces', f0(a.k5))}
        </div>
      </div>
      <div class="ov-strip">
        <div><div class="st-label">Manches gagnées</div><b class="${tone(a.roundWin, 50)}">${a.roundWin == null ? '—' : pct(a.roundWin)}</b><div class="st-sub">${f0(a.roundsWon)} / ${f0(a.roundsTotal)}</div></div>
        <div><div class="st-label">Duels d'ouverture</div><b class="${tone(a.entry, 50)}">${a.entry == null ? '—' : pct(a.entry)}</b><div class="st-sub">${f0(a.fb)} FB · ${f0(a.fd)} FD</div></div>
        <div><div class="st-label">Clutchs</div><b>${a.detailed ? f0(a.clutches) : '—'}</b><div class="st-sub">manches sauvées seul</div></div>
        <div><div class="st-label">Multi-kills</div><b>${f0(a.k3 + a.k4 + a.k5)}</b><div class="st-sub">${f0(a.k3)} 3K · ${f0(a.k4)} 4K · ${f0(a.k5)} ACE</div></div>
      </div>`;
  }

  function agentsTable(agents) {
    const AGENTS_SHOWN = 6;
    return `
      <h2>Agents <span class="timer">${agents.length} joués</span></h2>
      <div class="table-wrap"><table class="stats-table agents-table">
        <tr><th>Agent</th><th>Matchs</th><th>Victoires</th><th>K/D</th><th>ADR</th><th>ACS</th><th title="${DD_TITLE}">DDΔ</th><th>Meilleure carte</th></tr>
        ${(allAgents ? agents : agents.slice(0, AGENTS_SHOWN)).map((g) => {
          const ag = agentOf(g.key);
          // Meilleure carte : au moins 2 matchs dessus quand c'est possible, et jamais une carte sans victoire.
          const byMap = groupBy(g.list, 'mapId');
          const pool = byMap.some((m) => m.n >= 2) ? byMap.filter((m) => m.n >= 2) : byMap;
          const best = pool.sort((x, y) => y.winRate - x.winRate || y.n - x.n)[0];
          const bm = best?.wins && mapOf(best.key);
          return `<tr>
            <td><div class="row">${ag ? `<img src="${ag.icon}" alt="">` : ''}<div><b>${esc(ag?.name || '?')}</b><div class="st-sub">${g.timed === g.n && g.lengthMs ? hours(g.lengthMs) : esc(ag?.role || '')}</div></div></div></td>
            <td>${g.n}</td>
            <td class="${tone(g.winRate, 50)}">${pct(g.winRate)}</td>
            <td class="${tone(g.kd, 1)}">${f2(g.kd)}</td>
            <td>${f1(g.adr)}</td><td>${f1(g.acs)}</td>
            <td class="${tone(g.ddDelta, 0)}">${signed(g.ddDelta)}</td>
            <td>${bm ? `<b>${esc(bm.name)}</b> <span class="${tone(best.winRate, 50)}">${pct(best.winRate)}</span>` : '—'}</td>
          </tr>`;
        }).join('')}
      </table></div>
      ${agents.length > AGENTS_SHOWN ? `<div class="sm-more"><button class="btn ghost" data-all-agents>${allAgents ? 'Réduire' : `Voir les ${agents.length} agents`}</button></div>` : ''}`;
  }

  // ---------- Liste des matchs, façon tracker ----------
  function matchList(recs, agents, maps) {
    const list = recs.filter((r) => (!mf.agent || r.agentId === mf.agent) && (!mf.map || r.mapId === mf.map));
    const a = aggregate(list);
    const top = groupBy(list, 'agentId').slice(0, 3);
    const strip = list.slice(0, 8);
    const page = list.slice(0, shown);

    const days = [];
    for (const r of page) {
      const day = new Date(r.startedAt).toDateString();
      if (days.at(-1)?.day !== day) days.push({ day, at: r.startedAt, recs: [] });
      days.at(-1).recs.push(r);
    }

    const row = (r) => {
      const ag = agentOf(r.agentId), mp = mapOf(r.mapId), t = tierOf(r.tier);
      const shots = r.head + r.body + r.leg;
      const dd = r.received != null ? (r.damage - r.received) / Math.max(1, r.rounds) : null;
      return `<div class="sm-row ${r.result}">
        <div class="sm-bar"></div>
        ${ag ? `<img class="sm-agent" src="${ag.icon}" alt="" title="${esc(ag.name)}">` : '<span class="sm-agent"></span>'}
        <div class="sm-info"><div class="sm-map">${esc(mp?.name || '?')}</div><div class="st-sub">${timeAgo(r.startedAt)}${f.queue === 'all' ? ` · ${esc(queueName(r.queue))}` : ''}</div></div>
        <div class="sm-place">${placeBadge(r)}</div>
        <div class="sm-tier">${t?.icon && r.tier ? `<img src="${t.icon}" alt="" title="${esc(t.name)}">` : ''}</div>
        <div class="sm-score"><div class="st-label">Score</div><b>${r.score ? `${r.score[0]} : ${r.score[1]}` : '—'}</b></div>
        <div class="sm-badges">${matchBadges(r)}</div>
        <div class="sm-stat"><div class="st-label">K/D</div><b class="${tone(r.kills / Math.max(1, r.deaths), 1)}">${f1(r.kills / Math.max(1, r.deaths))}</b></div>
        <div class="sm-stat kda"><div class="st-label">K / D / A</div><b>${r.kills} / ${r.deaths} / ${r.assists}</b></div>
        <div class="sm-stat col-dd" title="${DD_TITLE}"><div class="st-label">DDΔ</div><b class="${tone(dd, 0)}">${signed(dd)}</b></div>
        <div class="sm-stat col-hs"><div class="st-label">HS %</div><b>${shots ? f0((r.head / shots) * 100) : '—'}</b></div>
        <div class="sm-stat"><div class="st-label">ACS</div><b>${f0(r.combat / Math.max(1, r.rounds))}</b></div>
      </div>`;
    };

    const dayHead = (d) => {
      const s = aggregate(d.recs);
      return `<div class="sm-day">
        <b>${new Date(d.at).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</b>
        <span class="sm-count">${s.n}</span>
        <span><b class="pos">${s.wins} V</b> · <b class="neg">${s.losses} D</b></span>
        <span class="spacer"></span>
        <span>K/D <b class="${tone(s.kd, 1)}">${f2(s.kd)}</b></span>
        <span>KDA <b>${f2(s.kda)}</b></span>
        <span class="col-dd">DDΔ <b class="${tone(s.ddDelta, 0)}">${signed(s.ddDelta)}</b></span>
        <span class="col-hs">HS <b>${pct(s.hs)}</b></span>
        <span>ACS <b>${f0(s.acs)}</b></span>
      </div>`;
    };

    return `
      <h2>Derniers matchs <span class="timer">${list.length} dans cette sélection</span></h2>
      <div class="row sm-filters">
        <select id="sm-agent" class="pill-select"><option value="">Tous les agents</option>${agents.map((g) => `<option value="${g.key}" ${mf.agent === g.key ? 'selected' : ''}>${esc(agentOf(g.key)?.name || '?')} · ${g.n}</option>`).join('')}</select>
        <select id="sm-map" class="pill-select"><option value="">Toutes les cartes</option>${maps.map((g) => `<option value="${g.key}" ${mf.map === g.key ? 'selected' : ''}>${esc(mapOf(g.key)?.name || '?')} · ${g.n}</option>`).join('')}</select>
      </div>
      ${list.length ? `
        <div class="panel sm-summary">
          <div class="sm-total">
            <div><b class="pos">${a.wins} V</b> - <b class="neg">${a.losses} D</b> <span class="muted">(${f0(a.winRate)} %)</span></div>
            <div class="st-sub">${f2(a.kd)} K/D · ${f0(a.adr)} ADR</div>
          </div>
          ${top.map((g) => {
            const ag = agentOf(g.key);
            return `<div class="sm-top-agent">${ag ? `<img src="${ag.icon}" alt="">` : ''}<div><b>${g.wins} V - ${g.losses} D</b> <span class="muted">(${f0(g.winRate)} %)</span><div class="st-sub">K/D ${f2(g.kd)}</div></div></div>`;
          }).join('')}
        </div>
        <div class="sm-strip">
          ${strip.map((r) => `<div class="sm-chip ${r.result}"><div class="st-sub">${timeAgo(r.startedAt)}</div><b>${r.score ? `${r.score[0]} : ${r.score[1]}` : '—'}</b><div class="st-sub">K/D ${f1(r.kills / Math.max(1, r.deaths))}</div></div>`).join('')}
        </div>
        <div class="sm-list">${days.map((d) => dayHead(d) + d.recs.map(row).join('')).join('')}</div>
        ${list.length > shown ? `<div class="sm-more"><button class="btn ghost" data-more>Afficher ${Math.min(MATCH_PAGE, list.length - shown)} matchs de plus</button></div>` : ''}`
      : '<div class="panel sm-none">Aucun match ne correspond à ces filtres.</div>'}`;
  }

  function draw() {
    const all = data.records;
    const inActAnyQueue = all.filter(inAct);
    const recs = inActAnyQueue.filter(inQueue);
    const current = state.assets.currentAct?.uuid;
    const actRank = f.act === 'all' || f.act === current ? data.rank : data.actRanks[f.act];
    const rr = data.rr.filter((u) => u.tier > 0 && (f.act === 'all' || u.seasonId === f.act));

    // Actes proposés : l'acte en cours + ceux où tu as des matchs en mémoire.
    const counts = new Map();
    for (const r of all) if (inQueue(r)) counts.set(actOf(r), (counts.get(actOf(r)) || 0) + 1);
    const actOptions = acts.filter((a) => a.uuid === current || counts.has(a.uuid) || a.uuid === f.act);
    const oldest = all.length ? all[all.length - 1].startedAt : null;

    const head = `
      <div class="page-head">
        <h1>Statistiques</h1>
        <div class="sync-box"><span id="sync-line">${syncLine()}</span><button class="btn ghost" id="st-refresh">Actualiser</button></div>
      </div>
      <div class="row st-filters">
        <select id="st-act" class="act-select pill-select">
          ${actOptions.map((a) => `<option value="${a.uuid}" ${f.act === a.uuid ? 'selected' : ''}>${esc(a.name)}${a.uuid === current ? ' (en cours)' : ''} · ${counts.get(a.uuid) || 0} matchs</option>`).join('')}
          <option value="all" ${f.act === 'all' ? 'selected' : ''}>Toutes les saisons · ${[...counts.values()].reduce((s, v) => s + v, 0)} matchs</option>
        </select>
        <div class="chip-group">${QUEUE_F.map(([v, l]) => `<button data-q="${v}" class="${f.queue === v ? 'on' : ''}">${l}</button>`).join('')}</div>
      </div>`;

    if (!recs.length) {
      const st = sync || data.sync;
      const syncing = st?.running || !st?.lastSync; // première connexion : la synchro n'a encore jamais tourné
      const tooOld = f.act !== 'all' && oldest && (acts.find((a) => a.uuid === f.act)?.end || 0) < oldest;
      const rankCard = rankSide(actRank);
      content.innerHTML = `${head}
        ${rankCard ? `<div class="st-solo">${rankCard}</div>` : ''}
        <div class="empty">
          <h3>${syncing ? 'Synchronisation en cours…' : 'Aucun match'}</h3>
          <div>${syncing
            ? 'Synchronisation des matchs : cette page se complète automatiquement.'
            : tooOld
              ? 'Riot ne fournit que les derniers matchs : cet acte est trop ancien pour être récupéré.<br>Precise Gunplay garde désormais tous vos matchs, pour les actes à venir.'
              : `Aucun match en ${esc(QUEUE_F.find(([v]) => v === f.queue)?.[1] || '')} pour ${esc(actName(f.act))}.`}</div>
        </div>`;
      bind();
      return;
    }

    // Les filtres de la liste ne gardent que des valeurs encore présentes dans la sélection.
    const a = aggregate(recs);
    const agents = groupBy(recs, 'agentId');
    const maps = groupBy(recs, 'mapId');
    if (mf.agent && !agents.some((g) => g.key === mf.agent)) mf.agent = '';
    if (mf.map && !maps.some((g) => g.key === mf.map)) mf.map = '';

    content.innerHTML = `${head}
      <div class="st-layout">
        <aside class="st-side">
          ${rankSide(actRank)}
          ${accuracySide(a, recs)}
          ${rolesSide(recs)}
          ${weaponsSide(recs)}
          ${mapsSide(maps)}
        </aside>
        <div class="st-main">
          ${overview(a, recs, actRank)}

          ${rr.length >= 2 && (f.queue === 'competitive' || f.queue === 'all') ? `
            <h2>Évolution du RR <span class="timer">${rr.length} matchs classés</span></h2>
            <div class="panel"><div id="rr-chart" class="chart-box"></div></div>` : ''}

          <h2>ACS par match <span class="timer">${recs.length > 80 ? '80 derniers · ' : ''}du plus ancien au plus récent</span></h2>
          <div class="panel">
            <div class="legend">
              <span><i style="background:${CHART.pos}"></i>Victoire</span>
              <span><i style="background:${CHART.neg}"></i>Défaite</span>
              ${a.draws ? `<span><i style="background:${CHART.draw}"></i>Égalité</span>` : ''}
            </div>
            <div id="acs-chart" class="chart-box"></div>
          </div>

          ${agentsTable(agents)}
          ${matchList(recs, agents, maps)}
          ${f.act === 'all' && oldest ? `<p class="muted" style="font-size:12px;margin-top:18px">Matchs en mémoire depuis le ${new Date(oldest).toLocaleDateString('fr-FR')}. Riot ne fournit que les derniers matchs ; Precise Gunplay garde ensuite tout votre historique.</p>` : ''}
        </div>
      </div>`;

    const drawCharts = () => {
      const rrEl = $('#rr-chart'), acsEl = $('#acs-chart');
      if (rrEl) rrChart(rrEl, rr);
      if (acsEl) acsChart(acsEl, [...recs].reverse().slice(-80));
    };
    drawCharts();
    const ro = new ResizeObserver(() => (alive() && $('#acs-chart') ? drawCharts() : ro.disconnect()));
    ro.observe($('#acs-chart'));
    bind();
  }

  function bind() {
    $('#st-act').onchange = (e) => { f.act = e.target.value; shown = MATCH_PAGE; state.refreshing = true; draw(); };
    $('#st-refresh').onclick = async () => {
      sync = await call('stats-sync').catch(() => sync);
      $('#sync-line').innerHTML = syncLine();
    };
    const agentSel = $('#sm-agent'), mapSel = $('#sm-map');
    if (agentSel) agentSel.onchange = (e) => { mf.agent = e.target.value; shown = MATCH_PAGE; redrawKeepingScroll(); };
    if (mapSel) mapSel.onchange = (e) => { mf.map = e.target.value; shown = MATCH_PAGE; redrawKeepingScroll(); };
  }

  function redrawKeepingScroll() {
    const scroll = content.scrollTop;
    draw();
    content.scrollTop = scroll;
  }

  content.onclick = (e) => {
    const q = e.target.closest('[data-q]');
    if (q) { f.queue = q.dataset.q; shown = MATCH_PAGE; state.refreshing = true; draw(); }
    if (e.target.closest('[data-more]')) { shown += MATCH_PAGE; redrawKeepingScroll(); }
    if (e.target.closest('[data-all-agents]')) { allAgents = !allAgents; redrawKeepingScroll(); }
  };

  // Vérifie s'il y a de nouveaux matchs (1 à 2 requêtes si tout est déjà en mémoire), avant le premier affichage
  // pour que la page sache tout de suite qu'une synchro est en cours.
  sync = await call('stats-sync').catch(() => null);
  await refresh();
};

// ---------- Groupe ----------
PAGES.party = async () => {
  const alive = guard();
  let busy = false;
  let last = null;

  async function refresh() {
    if (busy) return;
    try {
      last = await call('party');
    } catch (e) {
      if (alive()) content.innerHTML = errorBox(e.message);
      return;
    }
    if (alive()) draw();
  }

  function draw() {
    const p = last;
    if (!p) {
      content.innerHTML = '<div class="page-head"><h1>Groupe</h1></div><div class="empty"><h3>Aucun groupe</h3><div>Lancez VALORANT pour voir votre groupe.</div></div>';
      return;
    }
    const searching = p.state === 'MATCHMAKING';
    const queues = [...new Set([p.queue, ...p.eligibleQueues].filter((q) => q !== undefined))];
    content.innerHTML = `
      <div class="page-head">
        <h1>Groupe <span class="muted" style="font-size:18px">${p.members.length}/5</span></h1>
      </div>
      ${actionsLocked() ? lockedNotice() : ''}
      ${lockZone(`<div class="panel" style="margin-bottom:18px">
        <div class="row" style="flex-wrap:wrap">
          <div>
            <div class="stat-label">Mode</div>
            <select id="pq" ${!p.isOwner || searching || actionsLocked() ? 'disabled' : ''}>${queues.map((q) => `<option value="${esc(q)}" ${q === p.queue ? 'selected' : ''}>${esc(queueName(q))}</option>`).join('')}</select>
          </div>
          <div style="margin-left:20px">
            <div class="stat-label">Groupe</div>
            <div class="row" style="margin-top:6px"><label class="switch"><input type="checkbox" id="popen" ${p.open ? 'checked' : ''} ${p.isOwner && !actionsLocked() ? '' : 'disabled'}><span></span></label><span>${p.open ? 'Ouvert' : 'Fermé'}</span></div>
          </div>
          <div class="spacer"></div>
          ${searching && p.queueEntryTime ? `<div class="muted">Recherche en cours…</div>` : ''}
          <button class="btn ${searching ? 'danger' : 'primary'} big" id="pmm" ${actionsLocked() ? 'disabled' : p.isOwner ? '' : 'disabled title="Seul le chef de groupe peut lancer la recherche"'}>${searching ? 'Annuler la recherche' : 'Lancer la recherche'}</button>
        </div>
      </div>`)}
      <div class="members">
        ${p.members.map((m) => `
          <div class="member">
            ${m.card ? `<img class="mcard" src="${m.card}" alt="">` : '<div class="mcard"></div>'}
            <div class="mname">${esc(m.name)}</div><div class="mtag">#${esc(m.tag)} · Niv. ${m.level ?? '?'}</div>
            ${m.owner ? '<div class="crown">★ Chef de groupe</div>' : ''}
            ${rankHtml(m.rank)}
            ${m.isMe ? '' : `<div style="margin-top:10px">${trackerBtn(m.name, m.tag)}</div>`}
          </div>`).join('')}
      </div>`;
  }

  const act = async (fn) => {
    busy = true;
    try { await fn(); } catch (e) { toast(e.message, 'error'); }
    busy = false;
    refresh();
  };
  content.onchange = (e) => {
    if (actionsLocked()) return;
    if (e.target.id === 'pq') act(() => call('party-queue', last.id, e.target.value));
    if (e.target.id === 'popen') act(() => call('party-access', last.id, e.target.checked));
  };
  content.onclick = (e) => {
    if (actionsLocked()) return;
    if (e.target.closest('#pmm')) act(() => call('party-matchmaking', last.id, last.state !== 'MATCHMAKING'));
  };

  await refresh();
  every(3000, refresh);
};

// ---------- Amis ----------
const PRODUCTS = { league_of_legends: 'League of Legends', bacon: 'Legends of Runeterra', lion: '2XKO', riot_client: 'Riot Client' };
const FOLD_KEY = 'pg-friends-offline-folded';
const ICON_CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

const isLive = (f) => f.valorant?.loop === 'INGAME' || f.valorant?.loop === 'PREGAME';
const seenAgo = (ts) => ((Date.now() - ts) / 86400000 > 60 ? `il y a ${Math.round((Date.now() - ts) / 2592000000)} mois` : timeAgo(ts));
const bannerStyle = (img) => (img ? ` style="--banner:url('${esc(img)}')"` : '');

// Avatar : petite image de la carte de joueur (connue seulement quand l'ami est sur VALORANT), sinon son initiale.
function friendAvatar(f, cls = '') {
  const lvl = f.valorant?.level;
  return `<div class="favatar ${cls}">${
    f.card?.small ? `<img src="${esc(f.card.small)}" alt="">` : `<span class="finit">${esc([...(f.name || '?')][0].toUpperCase())}</span>`
  }<span class="fdot ${f.online ? esc(f.status) : ''}"></span>${lvl ? `<span class="flvl">${esc(lvl)}</span>` : ''}</div>`;
}

function scoreChip(v) {
  if (!v?.score) return '';
  const [a, e] = v.score;
  return `<span class="fscore ${a > e ? 'ahead' : a < e ? 'behind' : ''}" title="Score de son équipe">${esc(a)}<i>-</i>${esc(e)}</span>`;
}

// short : sans « En partie » / « Sélection d'agent », déjà dits par la section et la pastille de la ligne.
function friendStatus(f, short = false) {
  if (!f.online) return f.lastOnline ? `Hors ligne · vu ${seenAgo(f.lastOnline)}` : 'Hors ligne';
  const v = f.valorant;
  if (!v) return f.status === 'mobile' ? 'En ligne sur mobile' : `En ligne${f.product ? ` · ${esc(PRODUCTS[f.product] || f.product)}` : ''}`;
  const map = v.map ? ` · ${esc(v.map.name)}` : '';
  if (v.loop === 'INGAME') return `${short ? '' : 'En partie · '}${esc(queueName(v.queue))}${map}`;
  if (v.loop === 'PREGAME') return `${short ? '' : "Sélection d'agent · "}${esc(queueName(v.queue))}${map}`;
  if (v.partyState === 'MATCHMAKING') return `Recherche une partie · ${esc(queueName(v.queue))}`;
  return `Dans les menus${v.partySize > 1 ? ` · groupe ${v.partySize}/${v.partyMax}` : ''}${v.idle ? ' · inactif' : ''}`;
}

PAGES.friends = async () => {
  const alive = guard();
  let query = '';
  let list = [];
  let openPid = null; // conversation ouverte
  let lastSig = '';
  let liveSig = null; // évite de redessiner l'aperçu (et ses animations) s'il n'a pas changé
  let offlineFolded = false;
  try { offlineFolded = localStorage.getItem(FOLD_KEY) === '1'; } catch { /* stockage indisponible */ }

  async function refresh() {
    try { list = await call('friends'); } catch (e) { if (alive()) content.innerHTML = errorBox(e.message); return; }
    if (!alive()) return;
    drawList();
    if (openPid) drawChatHead();
    else drawChatEmpty();
  }

  function drawCounts() {
    const live = list.filter(isLive).length;
    const online = list.filter((f) => f.online).length;
    $('#fcount').innerHTML = `
      <span class="fstat"><i class="live"></i><b>${live}</b> en partie</span>
      <span class="fstat"><i class="on"></i><b>${online}</b> en ligne</span>
      <span class="fstat"><b>${list.length}</b> ami${list.length > 1 ? 's' : ''}</span>`;
  }

  function friendRow(f) {
    const v = f.valorant;
    const t = v?.tier ? tierOf(v.tier) : null;
    const unread = state.unread[f.pid] || 0;
    const tag = v?.loop === 'INGAME'
      ? scoreChip(v) || '<span class="pill ingame">En partie</span>'
      : v?.loop === 'PREGAME' ? '<span class="pill pregame">Sélection</span>'
      : v?.partyState === 'MATCHMAKING' ? '<span class="pill queue">En file</span>' : '';
    // Fond : la carte jouée pendant une partie, sinon la bannière de sa carte de joueur.
    const banner = isLive(f) && v.map?.icon ? v.map.icon : f.card?.wide;
    return `
      <div class="friend ${f.online ? '' : 'offline'} ${isLive(f) ? 'live' : ''} ${f.pid === openPid ? 'open' : ''}" data-pid="${esc(f.pid)}" title="Discuter avec ${esc(f.name)}"${bannerStyle(banner)}>
        ${friendAvatar(f)}
        <div class="fname">
          <div>${esc(f.name)}<span class="muted">#${esc(f.tag)}</span>${f.note ? ` <span class="muted">(${esc(f.note)})</span>` : ''}${v?.withMe ? '<span class="fwith">Votre groupe</span>' : ''}</div>
          <div>${friendStatus(f, true)}</div>
        </div>
        ${unread ? `<span class="unread" title="${unread} message(s) non lu(s)">${unread}</span>` : ''}
        ${tag}
        ${t?.icon ? `<img class="frank" src="${t.icon}" alt="" title="${esc(t.name)}">` : ''}
        ${trackerBtn(f.name, f.tag)}
      </div>`;
  }

  const SECTIONS = [['live', 'En partie'], ['online', 'En ligne'], ['offline', 'Hors ligne']];
  const groupOf = (f) => (!f.online ? 'offline' : isLive(f) ? 'live' : 'online');

  function drawList() {
    const q = query.toLowerCase();
    const shown = list.filter((f) => !q || `${f.name}#${f.tag} ${f.note}`.toLowerCase().includes(q));
    drawCounts();
    $('#flist').innerHTML = SECTIONS.map(([key, label]) => {
      const rows = shown.filter((f) => groupOf(f) === key);
      if (!rows.length) return '';
      if (key !== 'offline') return `<div class="fsec"><span>${label}</span><b>${rows.length}</b></div>${rows.map(friendRow).join('')}`;
      // Hors ligne : repliable (souvent la plus longue), toujours dépliée pendant une recherche.
      const folded = offlineFolded && !q;
      const unread = rows.reduce((n, f) => n + (state.unread[f.pid] || 0), 0);
      return `<button class="fsec ${folded ? 'folded' : ''}" data-fold title="${folded ? 'Afficher' : 'Masquer'} les amis hors ligne"><span>${label}</span><b>${rows.length}</b>${
        folded && unread ? `<span class="unread" title="${unread} message(s) non lu(s)">${unread}</span>` : ''
      }${ICON_CHEVRON}</button>${folded ? '' : rows.map(friendRow).join('')}`;
    }).join('') || '<div class="empty">Aucun ami trouvé.</div>';
  }

  // ---- Conversation ----
  const friendOf = (pid) => list.find((f) => f.pid === pid);

  function dayLabel(ts) {
    const d = new Date(ts), now = new Date();
    const y = new Date(now); y.setDate(now.getDate() - 1);
    if (d.toDateString() === now.toDateString()) return "Aujourd'hui";
    if (d.toDateString() === y.toDateString()) return 'Hier';
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  const hhmm = (ts) => new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // En-tête façon profil : bannière (ou carte jouée), avatar, titre, rang.
  function drawChatHead() {
    const f = friendOf(openPid);
    const head = $('#chat-head');
    if (!head || !f) return;
    const v = f.valorant;
    const t = v?.tier ? tierOf(v.tier) : null;
    const banner = isLive(f) && v.map?.splash ? v.map.splash : f.card?.wide;
    head.style.setProperty('--banner', banner ? `url('${banner}')` : 'none');
    head.innerHTML = `
      ${friendAvatar(f, 'big')}
      <div class="fname">
        <div>${esc(f.name)}<span class="muted">#${esc(f.tag)}</span>${v?.withMe ? '<span class="fwith">Votre groupe</span>' : ''}</div>
        ${f.title ? `<div class="ftitle">${esc(f.title)}</div>` : ''}
        <div>${friendStatus(f)}</div>
      </div>
      ${v?.loop === 'INGAME' ? scoreChip(v) : ''}
      ${t?.icon ? `<img class="frank" src="${t.icon}" alt="" title="${esc(t.name)}">` : ''}
      ${trackerBtn(f.name, f.tag)}
      <button class="chat-close" data-close title="Fermer la conversation">${ICON_CLOSE}</button>`;
  }

  function liveCard(f) {
    const v = f.valorant;
    const sub = [v.map ? queueName(v.queue) : '', v.partySize > 1 ? `groupe de ${v.partySize}` : ''].filter(Boolean).join(' · ');
    return `
      <div class="flive-card" data-pid="${esc(f.pid)}" title="Discuter avec ${esc(f.name)}"${bannerStyle(v.map?.splash || f.card?.wide)}>
        <div class="flc-top"><span class="pill ${v.loop === 'INGAME' ? 'ingame' : 'pregame'}">${v.loop === 'INGAME' ? 'En partie' : 'Sélection'}</span>${scoreChip(v)}</div>
        <div class="flc-map">${esc(v.map?.name || queueName(v.queue))}${sub ? `<span>${esc(sub)}</span>` : ''}</div>
        <div class="flc-who">${friendAvatar(f, 'small')}<div>${esc(f.name)}<span class="muted">#${esc(f.tag)}</span></div></div>
      </div>`;
  }

  // Sans conversation ouverte : les amis en partie, puis l'invitation à discuter.
  function drawChatEmpty() {
    const live = list.filter(isLive);
    const sig = JSON.stringify(live.map((f) => [f.pid, f.valorant.loop, f.valorant.map?.name, f.valorant.score, f.valorant.partySize, f.card?.small, f.status]));
    if (sig === liveSig && $('#chat .chat-overview')) return;
    liveSig = sig;
    $('#chat').innerHTML = `
      <div class="chat-overview">
        ${live.length ? `
          <div class="flive-head"><span class="live-dot"></span>En partie maintenant<b>${live.length}</b></div>
          <div class="flive">${live.map(liveCard).join('')}</div>` : ''}
        <div class="chat-empty">
          <h3>Messagerie</h3>
          <p class="muted">${actionsLocked() ? 'Choisissez un ami pour lire vos derniers messages.<br>L\'envoi de messages est désactivé.' : 'Choisissez un ami pour discuter.<br>Les messages passent par le Riot Client, comme dans le jeu.'}</p>
        </div>
      </div>`;
  }

  function closeChat() {
    openPid = null;
    lastSig = '';
    liveSig = null;
    drawList();
    drawChatEmpty();
  }

  async function openChat(pid) {
    if (!friendOf(pid)) return;
    openPid = pid;
    lastSig = '';
    drawList();
    $('#chat').innerHTML = `
      <div class="chat-head" id="chat-head"></div>
      <div class="chat-log" id="chat-log">${loader()}</div>
      ${lockZone(`<form class="chat-form" id="chat-form">
        <input id="chat-input" type="text" maxlength="500" autocomplete="off" placeholder="${actionsLocked() ? 'Envoi de messages désactivé' : 'Votre message…'}" ${lockAttr()}>
        <button class="btn primary" type="submit" ${lockAttr()}>Envoyer</button>
      </form>`)}`;
    drawChatHead();
    const input = $('#chat-input');
    if (!actionsLocked()) input.focus();
    $('#chat-form').onsubmit = async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || input.disabled || actionsLocked()) return;
      input.disabled = true;
      try {
        await call('chat-send', pid, text);
        input.value = '';
        await loadMessages(true);
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        input.disabled = actionsLocked();
        if (!input.disabled) input.focus();
      }
    };
    await loadMessages(true);
  }

  async function loadMessages(forceBottom) {
    const pid = openPid;
    if (!pid) return;
    let msgs;
    try { msgs = await call('chat-messages', pid); } catch (e) { if (alive() && pid === openPid) $('#chat-log').innerHTML = errorBox(e.message); return; }
    if (!alive() || pid !== openPid) return;
    const sig = `${msgs.length}:${msgs[msgs.length - 1]?.id || ''}`;
    if (sig === lastSig && !forceBottom) return;
    lastSig = sig;
    const log = $('#chat-log');
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
    let day = '';
    log.innerHTML = msgs.length
      ? msgs.map((m) => {
          const d = dayLabel(m.time);
          const sep = d !== day ? `<div class="chat-day">${esc((day = d))}</div>` : '';
          return `${sep}<div class="msg ${m.mine ? 'mine' : ''}"><div class="bubble">${esc(m.body)}</div><span class="mtime">${hhmm(m.time)}</span></div>`;
        }).join('')
      : `<div class="chat-none muted">Aucun message récent avec ${esc(friendOf(pid)?.name || 'cet ami')}.</div>`;
    if (forceBottom || atBottom) log.scrollTop = log.scrollHeight;
    if (msgs.length && rawUnread[pid] && !actionsLocked()) call('chat-read', pid, msgs[msgs.length - 1].id).then(refreshUnread, () => {});
    markChatSeen(pid, msgs.map((m) => m.id));
  }

  content.innerHTML = `
    <div class="page-head"><h1>Amis</h1><div class="fstats" id="fcount"></div></div>
    <div class="friends-layout">
      <div class="friends-col">
        <input type="search" id="fsearch" placeholder="Rechercher un ami…" style="width:100%;margin-bottom:12px">
        <div id="flist">${loader()}</div>
      </div>
      <div class="chatbox" id="chat"></div>
    </div>`;
  drawChatEmpty();
  $('#fsearch').oninput = (e) => { query = e.target.value; drawList(); };
  $('#flist').addEventListener('click', (e) => {
    if (e.target.closest('[data-tracker]')) return;
    if (e.target.closest('[data-fold]')) {
      offlineFolded = !offlineFolded;
      try { localStorage.setItem(FOLD_KEY, offlineFolded ? '1' : '0'); } catch { /* facultatif */ }
      return drawList();
    }
    const row = e.target.closest('[data-pid]');
    if (row) openChat(row.dataset.pid);
  });
  $('#chat').addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return closeChat();
    const card = e.target.closest('.flive-card[data-pid]');
    if (card) openChat(card.dataset.pid);
  });
  state.onUnread = () => { if (alive()) drawList(); };
  await refresh();
  every(15000, refresh);
  every(2000, () => loadMessages(false));
};

// ---------- Collection ----------
PAGES.collection = async () => {
  const alive = guard();
  const skins = await call('collection');
  if (!alive()) return;
  let query = '';
  content.innerHTML = `
    <div class="page-head"><h1>Collection</h1><span class="muted">${skins.length} skins</span></div>
    <input type="search" id="csearch" placeholder="Rechercher un skin (ex : Vandal, Prime…)" style="width:360px;margin-bottom:16px">
    <div class="offers" id="cgrid"></div>`;
  const draw = () => {
    const q = query.toLowerCase();
    $('#cgrid').innerHTML = skins
      .filter((s) => !q || s.name.toLowerCase().includes(q))
      .map((s) => offerCard({ ...s, kind: 'Skin' }, { small: true }))
      .join('') || '<div class="muted">Aucun skin.</div>';
  };
  $('#csearch').oninput = (e) => { query = e.target.value; draw(); };
  draw();
};

// ---------- Paramètres ----------
// ================= Résolution étirée =================
const RATIOS = { '4:3': 4 / 3, '5:4': 5 / 4, '16:10': 16 / 10, '3:2': 3 / 2, '16:9': 16 / 9 };
function ratioLabel(w, h) {
  const hit = Object.entries(RATIOS).find(([, v]) => Math.abs(v - w / h) < 0.02);
  return hit ? hit[0] : `${(w / h).toFixed(2).replace('.', ',')}:1`;
}
const resLabel = (w, h) => `${w} × ${h}`;

// Résolutions proposées : plus petites que l'écran et d'un autre format que lui (sinon rien n'est étiré).
function stretchModes(d) {
  if (!d?.modes) return [];
  const native = d.w / d.h;
  const seen = new Set();
  return d.modes
    .filter(([w, h]) => w <= d.w && h <= d.h && Math.abs(w / h - native) > 0.02)
    .filter(([w, h]) => !seen.has(`${w}x${h}`) && seen.add(`${w}x${h}`))
    .sort((a, b) => b[0] * b[1] - a[0] * a[1]);
}

const STRETCH_DELAYS = [15000, 30000, 45000, 60000];

// Raccourcis : accélérateurs Electron (« Control+F8 ») affichés en touches.
const KEY_LABELS = { Control: 'Ctrl', Alt: 'Alt', Shift: 'Maj' };
const hotkeyHtml = (accel) => accel.split('+').map((k) => `<kbd>${esc(KEY_LABELS[k] || k.replace(/^num/, 'Pavé '))}</kbd>`).join('');
function accelFromEvent(e) {
  let key = null;
  if (/^F([1-9]|1\d|2[0-4])$/.test(e.code)) key = e.code;
  else if (/^Key[A-Z]$/.test(e.code)) key = e.code.slice(3);
  else if (/^Digit\d$/.test(e.code)) key = e.code.slice(5);
  else if (/^Numpad\d$/.test(e.code)) key = 'num' + e.code.slice(6);
  if (!key) return null;
  const mods = [e.ctrlKey && 'Control', e.altKey && 'Alt', e.shiftKey && 'Shift'].filter(Boolean);
  // Une lettre ou un chiffre seuls seraient captés dans toutes les applications, jeu compris.
  if (!mods.length && !key.startsWith('F')) return null;
  return [...mods, key].join('+');
}

let stretchDisplay = null; // écran relevé à l'ouverture de la page, tant que la résolution native n'est pas connue
let stretchAdvanced = false; // « Réglages avancés » ouvert

function stretchStatusHtml(s) {
  const n = s.native || stretchDisplay;
  const target = resLabel(s.width, s.height);
  const offline = !state.status.connected && ['game', 'armed'].includes(s.phase);
  const [title, detail, tone] = {
    off: ['Désactivée', n ? `Écran en ${resLabel(n.w, n.h)} à ${n.hz} Hz.` : '', ''],
    idle: ['En attente de VALORANT', `Passage en ${target} quand une partie commence.`, 'on'],
    launching: ['Lancement du jeu', s.screensOff ? 'Écran préparé pour la résolution étirée.' : '', 'on'],
    game: ['Au menu', offline ? 'Compte non connecté : la partie ne peut pas être détectée.' : `Résolution ${s.res === 'stretched' ? target : 'native'}.`, offline ? 'warn' : 'on'],
    armed: ['Partie trouvée', `Passage en ${target} dans <b data-ends="${s.switchAt}">${fmtDuration(s.switchAt - Date.now())}</b>.`, 'warn'],
    stretched: ['En partie', s.res === 'native' ? 'Résolution native, choisie au raccourci.' : `Résolution étirée ${target}.`, 'live'],
  }[s.phase] || ['', '', ''];
  return `<span class="st-dot ${tone}"></span><div><b>${title}</b><div class="muted">${detail}</div></div>`;
}

PAGES.stretch = async () => {
  const alive = guard();
  const info = await call('stretch-info');
  if (!alive()) return;
  state.stretch = info;

  const save = async (patch) => {
    state.settings = await call('settings-set', { stretch: patch });
    renderNav();
  };

  const d = info.display?.error ? null : info.display;
  stretchDisplay = d;
  // Les modes sont filtrés par rapport à la résolution native, même si l'écran est étiré en ce moment.
  const modes = stretchModes(d && info.native ? { ...d, w: info.native.w, h: info.native.h } : d);
  let c = state.settings.stretch;
  // Première visite : la plus grande résolution 4:3 disponible.
  if (!c.width && modes.length) {
    const pick = modes.find(([w, h]) => ratioLabel(w, h) === '4:3') || modes[0];
    await save({ width: pick[0], height: pick[1] });
    c = state.settings.stretch;
  }
  const listed = modes.some(([w, h]) => w === c.width && h === c.height);
  const options = (listed || !c.width ? modes : [[c.width, c.height], ...modes])
    .map(([w, h]) => `<option value="${w}x${h}" ${w === c.width && h === c.height ? 'selected' : ''}>${resLabel(w, h)} (${ratioLabel(w, h)})</option>`).join('');
  const hz = info.native?.hz || d?.hz;
  const HOTKEYS = [['toggle', 'Basculer étirée ou native'], ['native', 'Revenir en native']];

  content.innerHTML = `
    <div class="page-head">
      <h1>Résolution étirée</h1>
      <label class="switch" title="Activer / désactiver"><input type="checkbox" id="st-enabled" ${c.enabled ? 'checked' : ''} ${modes.length ? '' : 'disabled'}><span></span></label>
    </div>

    <div class="panel st-status">
      <div class="st-state" id="st-state">${stretchStatusHtml(info)}</div>
      <button class="btn" id="st-test" ${modes.length ? '' : 'disabled'}>Tester 3 s</button>
      <button class="btn ghost" id="st-restore">Tout restaurer</button>
    </div>

    ${d ? '' : `<div class="warn-box st-gap">${esc(info.display?.error || 'Écran introuvable.')}</div>`}

    <div class="panel st-gap">
      <div class="setting-row">
        <div class="label"><div>Résolution en partie</div><div>La fréquence reste à ${hz ? `${hz} Hz` : 'sa valeur actuelle'}.</div></div>
        <select id="st-res" ${modes.length ? '' : 'disabled'}>${options || '<option>Aucune résolution disponible</option>'}</select>
      </div>
      ${!info.monitorsReady || info.monitorsOutdated ? `
      <div class="setting-row">
        <div class="label"><div>Autorisation Windows</div><div>${info.monitorsReady ? 'À renouveler une fois après cette mise à jour de l\'app.' : 'Nécessaire une seule fois pour que la résolution étirée tienne en jeu.'}</div></div>
        <button class="btn primary" id="st-install">${info.monitorsReady ? 'Renouveler' : 'Autoriser'}</button>
      </div>` : ''}
    </div>

    <details class="panel st-gap st-advanced" id="st-advanced" ${stretchAdvanced ? 'open' : ''}>
      <summary>Réglages avancés</summary>
      <div class="setting-row">
        <div class="label"><div>Délai avant le passage</div><div>VALORANT signale la partie dès l'écran de chargement. Augmentez-le si la résolution change avant l'apparition.</div></div>
        <select id="st-delay">${STRETCH_DELAYS.map((ms) => `<option value="${ms}" ${c.delayMs === ms ? 'selected' : ''}>${ms / 1000} s</option>`).join('')}</select>
      </div>
      ${info.monitorsReady ? `
      <div class="setting-row">
        <div class="label"><div>Écran en mode générique pendant le jeu</div><div>Du lancement à la fermeture du jeu, Windows utilise son pilote d'écran standard. C'est ce qui permet à la résolution étirée de tenir. L'image ne change pas.</div></div>
        <label class="switch"><input type="checkbox" id="st-monitors" ${c.monitors ? 'checked' : ''}><span></span></label>
      </div>` : ''}
      <div class="setting-row">
        <div class="label"><div>Régler VALORANT automatiquement</div><div>Plein écran fenêtré et format Remplir, nécessaires à l'étirement. Le fichier de configuration passe en lecture seule pour que le jeu ne les change pas.</div></div>
        <label class="switch"><input type="checkbox" id="st-lock" ${info.configLocked ? 'checked' : ''} ${info.configLocked === null ? 'disabled title="Lancez VALORANT une fois"' : ''}><span></span></label>
      </div>
      ${HOTKEYS.map(([k, label]) => `
      <div class="setting-row">
        <div class="label"><div>${label}</div><div id="st-hk-${k}-note">${info.hotkeysFailed?.includes(k) ? 'Déjà utilisé par une autre application.' : 'Actif partout, jeu compris, quand la fonction est activée.'}</div></div>
        <button class="btn st-hotkey" data-hotkey="${k}" title="Modifier">${hotkeyHtml(info.hotkeys[k])}</button>
      </div>`).join('')}
    </details>

    <p class="muted st-note">Si l'image n'est pas étirée en jeu, réglez la mise à l'échelle de la carte graphique sur plein écran : Mise à l'échelle GPU chez AMD, Plein écran effectuée sur le GPU chez NVIDIA.</p>`;

  state.onStretch = (s) => {
    const el = $('#st-state');
    if (el) el.innerHTML = stretchStatusHtml(s);
  };

  $('#st-advanced').ontoggle = (e) => { stretchAdvanced = e.target.open; };
  $('#st-enabled').onchange = (e) => save({ enabled: e.target.checked });
  $('#st-res').onchange = (e) => {
    const [w, h] = e.target.value.split('x').map(Number);
    return save({ width: w, height: h });
  };
  $('#st-delay').onchange = (e) => save({ delayMs: Number(e.target.value) });
  if ($('#st-monitors')) $('#st-monitors').onchange = (e) => save({ monitors: e.target.checked });
  content.querySelectorAll('[data-hotkey]').forEach((btn) => {
    btn.onclick = () => {
      if (btn.dataset.capturing) return;
      btn.dataset.capturing = '1';
      const name = btn.dataset.hotkey;
      const current = () => state.settings.stretch.hotkeys;
      btn.textContent = 'Appuyez sur les touches';
      call('stretch-hotkeys-pause', true).catch(() => {}); // les raccourcis actuels n'agissent pas pendant la saisie
      const stop = () => {
        if (!btn.dataset.capturing) return;
        delete btn.dataset.capturing;
        document.removeEventListener('keydown', onKey, true);
        btn.removeEventListener('blur', stop);
        btn.innerHTML = hotkeyHtml(current()[name]);
        call('stretch-hotkeys-pause', false).catch(() => {});
      };
      const onKey = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'Escape') return stop();
        if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return; // on attend la touche principale
        const accel = accelFromEvent(e);
        const keys = current();
        if (!accel) return toast('Combinaison non prise en charge : ajoutez Ctrl, Alt ou Maj, ou choisissez une touche F.', 'error');
        if (Object.entries(keys).some(([k, v]) => k !== name && v === accel)) return toast('Déjà utilisé pour l\'autre raccourci.', 'error');
        stop();
        await save({ hotkeys: { ...keys, [name]: accel } });
        btn.innerHTML = hotkeyHtml(accel);
        const failed = state.stretch?.hotkeysFailed?.includes(name);
        $(`#st-hk-${name}-note`).textContent = failed ? 'Déjà utilisé par une autre application.' : 'Actif partout, jeu compris, quand la fonction est activée.';
      };
      document.addEventListener('keydown', onKey, true);
      btn.addEventListener('blur', stop);
    };
  });
  if ($('#st-install')) $('#st-install').onclick = async (e) => {
    e.target.disabled = true;
    try {
      await call('stretch-install');
      toast('Autorisation enregistrée.');
      navigate('stretch');
    } catch (err) {
      toast(err.message, 'error');
      e.target.disabled = false;
    }
  };
  $('#st-lock').onchange = async (e) => {
    try {
      await call('stretch-lock', e.target.checked);
      toast(e.target.checked ? 'Configuration du jeu verrouillée.' : 'Configuration du jeu déverrouillée.');
    } catch (err) {
      e.target.checked = !e.target.checked;
      toast(err.message, 'error');
    }
  };
  $('#st-test').onclick = async (e) => {
    e.target.disabled = true;
    try { await call('stretch-test'); } catch (err) { toast(err.message, 'error'); }
    e.target.disabled = false;
  };
  $('#st-restore').onclick = async (e) => {
    e.target.disabled = true;
    try {
      await call('stretch-restore');
      toast('Écrans et résolution native restaurés.');
    } catch (err) {
      toast(err.message, 'error');
    }
    e.target.disabled = false;
  };
};

PAGES.settings = async () => {
  const s = state.settings;
  const REGIONS = [['', 'Automatique'], ['eu', 'Europe (EU)'], ['na', 'Amérique du Nord (NA)'], ['latam', 'Amérique latine (LATAM)'], ['br', 'Brésil (BR)'], ['ap', 'Asie-Pacifique (AP)'], ['kr', 'Corée (KR)']];
  content.innerHTML = `
    <div class="page-head"><h1>Paramètres</h1></div>
    <div class="panel">
      <div class="setting-row">
        <div class="label"><div>Région</div><div>Détectée automatiquement. À forcer uniquement si la détection échoue.</div></div>
        <select id="s-region">${REGIONS.map(([v, l]) => `<option value="${v}" ${s.regionOverride === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      </div>
      <div class="setting-row">
        <div class="label"><div>Notifications Windows</div><div>Affiche une notification quand l'agent auto sélectionne ou verrouille un agent.</div></div>
        <label class="switch"><input type="checkbox" id="s-notif" ${s.notifications ? 'checked' : ''}><span></span></label>
      </div>
      <div class="setting-row">
        <div class="label"><div>Lancer au démarrage de Windows</div><div>Ouvre Precise Gunplay à l'ouverture de la session Windows.</div></div>
        <label class="switch"><input type="checkbox" id="s-login" ${s.openAtLogin ? 'checked' : ''}><span></span></label>
      </div>
      <div class="setting-row">
        <div class="label"><div>Données du jeu</div><div>Images et noms (agents, skins, cartes…) fournis par valorant-api.com. À recharger après une mise à jour du jeu.</div></div>
        <button class="btn" id="s-assets">Recharger</button>
      </div>
      <div class="setting-row">
        <div class="label"><div>Version ${esc(state.update?.current || '')}</div><div id="s-update-label">${esc(updateLabel(state.update))}</div></div>
        <button class="btn" id="s-update">Vérifier les mises à jour</button>
      </div>
      <div class="setting-row">
        <div class="label"><div>Connexion</div><div>${state.status.connected ? `Lié à ${esc(state.status.name)}#${esc(state.status.tag)} (${esc((state.status.region || '').toUpperCase())})` : esc(state.status.message || 'Non connecté')}</div></div>
        <button class="btn" id="s-reconnect">Reconnecter</button>
      </div>
    </div>

    <h2>À propos</h2>
    <div class="panel muted" style="line-height:1.6">
      <b style="color:var(--text)">Precise Gunplay</b> v${esc(state.update?.current || '')}, compagnon non officiel pour VALORANT. Code source : github.com/NOUSSS/precise-gunplay<br>
      Votre compte est lié via la session locale du Riot Client : l'app ne voit jamais votre mot de passe et ne stocke aucun jeton.<br>
      Precise Gunplay n'est ni approuvé ni affilié à Riot Games. VALORANT et Riot Games sont des marques de Riot Games, Inc.
    </div>`;
  $('#s-region').onchange = async (e) => {
    state.settings = await call('settings-set', { regionOverride: e.target.value });
    toast('Région enregistrée, reconnexion…');
  };
  $('#s-notif').onchange = async (e) => { state.settings = await call('settings-set', { notifications: e.target.checked }); };
  $('#s-login').onchange = async (e) => { state.settings = await call('settings-set', { openAtLogin: e.target.checked }); };
  $('#s-assets').onclick = async (e) => {
    e.target.disabled = true;
    try { state.assets = await call('assets-refresh'); state.owned = null; toast('Données du jeu rechargées.'); }
    catch (err) { toast(err.message, 'error'); }
    e.target.disabled = false;
  };
  $('#s-update').onclick = async () => {
    const s = await call('update-check').catch(() => null);
    if (s) onUpdate(s);
  };
  $('#s-reconnect').onclick = async () => { onStatus(await call('connect')); };
};

// ================= Démarrage =================
(async function boot() {
  content.innerHTML = loader();
  renderNav();
  renderAccount();
  try {
    [state.settings, state.assets, state.restrictions] = await Promise.all([call('settings-get'), call('assets'), call('restrictions')]);
  } catch (e) {
    content.innerHTML = errorBox(`Impossible de charger les données du jeu (connexion Internet ?) : ${e.message}`);
    return;
  }
  setInterval(refreshUnread, 8000);
  setInterval(refreshProfile, 5 * 60 * 1000);
  window.api.on('status', onStatus);
  window.api.on('update', onUpdate);
  onUpdate(await call('update-state'));
  window.api.on('autolock-event', (evt) => toast(evt.message, evt.type === 'error' ? 'error' : 'info'));
  window.api.on('stretch-event', (evt) => toast(evt.message, evt.type === 'error' ? 'error' : 'info'));
  window.api.on('stretch', (s) => {
    state.stretch = s;
    state.onStretch?.(s);
  });
  state.status = await call('status');
  renderNav();
  renderAccount();
  navigate('home');
})();
