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
  onefa: 'Réplication', snowball: 'Bataille de boules de neige', newmap: 'Nouvelle carte', '': 'Personnalisée', custom: 'Personnalisée',
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
  collection: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 15l5-5 4 4 3-3 6 6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

const NAV = [
  ['home', 'Accueil'],
  ['store', 'Boutique'],
  ['agent', 'Agent auto'],
  ['live', 'Partie en direct'],
  ['history', 'Historique'],
  'sep',
  ['party', 'Groupe'],
  ['friends', 'Amis'],
  ['collection', 'Collection'],
  'sep',
  ['settings', 'Paramètres'],
];

function renderNav() {
  const autolockOn = state.settings?.autolock?.enabled;
  $('#nav').innerHTML = NAV.map((n) =>
    n === 'sep'
      ? '<div class="nav-sep"></div>'
      : `<button class="nav-item ${state.page === n[0] ? 'active' : ''}" data-page="${n[0]}">${icon(n[0])}${n[1]}${
          n[0] === 'agent' && autolockOn ? '<span class="nav-badge">ON</span>' : ''
        }</button>`
  ).join('');
}

$('#nav').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-page]');
  if (btn) navigate(btn.dataset.page);
});

function renderAccount() {
  const s = state.status;
  $('#account').innerHTML = s.connected
    ? `<div><span class="dot on"></span><span class="who">${esc(s.name || 'Connecté')}</span><span class="muted">#${esc(s.tag || '')}</span></div>
       <div class="sub">Compte lié · ${esc((s.region || '').toUpperCase())}</div>`
    : `<div><span class="dot off"></span><span class="who">Non connecté</span></div><div class="sub">${esc(s.message || '')}</div>`;
}

function navigate(page) {
  state.timers.forEach(clearInterval);
  state.timers = [];
  state.page = page;
  state.renderId++;
  content.onclick = content.onchange = null;
  renderNav();
  content.scrollTop = 0;
  const needsAuth = page !== 'settings';
  if (needsAuth && !state.status.connected) return renderConnect();
  content.innerHTML = loader();
  PAGES[page]().catch((e) => {
    content.innerHTML = errorBox(e.message);
  });
}

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
      ${u.status === 'ready' ? "Elle s'installera au prochain lancement." : 'Télécharge la nouvelle version sur GitHub.'}
      <button class="btn primary" id="update-btn">${u.status === 'ready' ? 'Redémarrer maintenant' : 'Télécharger'}</button></div>`;
    $('#update-btn').onclick = () => call('update-install');
  }
}

function updateLabel(u) {
  if (!u) return '';
  return {
    dev: 'Mode développement : mises à jour désactivées.',
    idle: 'Pas encore vérifié.',
    checking: 'Recherche de mises à jour…',
    none: 'Tu as la dernière version.',
    downloading: `Téléchargement de la v${u.latest}… ${u.progress || 0}%`,
    ready: `v${u.latest} prête : elle s'installera au redémarrage.`,
    available: `v${u.latest} disponible sur GitHub (version portable : mise à jour manuelle).`,
    error: `Erreur : ${u.error || 'inconnue'}`,
  }[u.status] || '';
}

// ================= Connexion =================
function renderConnect() {
  content.innerHTML = `
    <div class="connect">
      <div class="logo"></div>
      <h1><small>Lier ton compte</small>Precise Gunplay</h1>
      <p class="muted">L'application se lie automatiquement à ton compte via le Riot Client ouvert sur ce PC.<br>Aucun mot de passe n'est demandé ni stocké.</p>
      <div class="steps">
        <div class="step"><b>1</b><div>Lance le <strong>Riot Client</strong> ou directement <strong>VALORANT</strong>.</div></div>
        <div class="step"><b>2</b><div>Connecte-toi à ton compte Riot (coche « Rester connecté » pour plus de confort).</div></div>
        <div class="step"><b>3</b><div>Precise Gunplay détecte ta session et lie ton compte tout seul.</div></div>
      </div>
      <div class="warn-box" style="text-align:left;margin-bottom:22px">État : ${esc(state.status.message || 'En attente…')}</div>
      <button class="btn primary big" id="retry">Réessayer maintenant</button>
    </div>`;
  $('#retry').onclick = async () => {
    $('#retry').disabled = true;
    const s = await call('connect').catch(() => null);
    if (s) onStatus(s);
    const btn = $('#retry');
    if (btn) btn.disabled = false;
  };
}

function onUpdate(u) {
  const prev = state.update?.status;
  state.update = u;
  renderUpdate();
  const label = $('#s-update-label');
  if (label) label.textContent = updateLabel(u);
  if (u.status === 'ready' && prev !== 'ready') toast(`Mise à jour v${u.latest} téléchargée : redémarre l'app pour l'installer.`);
}

function onStatus(s) {
  const was = state.status.connected;
  state.status = s;
  renderAccount();
  if (s.connected !== was) {
    if (s.connected) {
      state.owned = null;
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
PAGES.home = async () => {
  const alive = guard();
  const p = await call('profile');
  if (!alive()) return;
  const t = tierOf(p.rank?.tier);
  const al = state.settings.autolock;
  const alAgent = agentOf(al.agentId);
  content.innerHTML = `
    <div class="hero" style="${p.card?.wide ? `background-image:url('${p.card.wide}')` : ''}">
      <div class="hero-body">
        <div>
          ${p.title ? `<div class="title">${esc(p.title)}</div>` : ''}
          <div class="name">${esc(p.name)}<span>#${esc(p.tag)}</span></div>
          <div class="level">NIVEAU ${esc(p.level ?? '?')}</div>
        </div>
        <div class="rank-block">
          ${t?.icon ? `<img src="${t.icon}" alt="">` : ''}
          <div>
            <div class="muted" style="font-size:11px;letter-spacing:.15em">RANG ACTUEL${state.assets.currentAct ? ` · ${esc(state.assets.currentAct.name)}` : ''}</div>
            <div class="rname">${p.rank?.tier ? esc(t?.name) : 'Non classé'}</div>
            <div class="muted">${p.rank?.tier ? `${p.rank.rr} RR · ` : ''}Meilleur : ${esc(tierOf(p.rank?.peak)?.name || '—')}</div>
          </div>
        </div>
      </div>
    </div>

    <h2>Portefeuille</h2>
    <div class="wallet">
      <div class="coin"><img src="${CURRENCY_ICON.vp}" alt="">${fmtNum(p.wallet.vp)} <span class="muted">VP</span></div>
      <div class="coin"><img src="${CURRENCY_ICON.rp}" alt="">${fmtNum(p.wallet.rp)} <span class="muted">Radianite</span></div>
      <div class="coin"><img src="${CURRENCY_ICON.kc}" alt="">${fmtNum(p.wallet.kc)} <span class="muted">Kingdom Credits</span></div>
    </div>

    <h2>Accès rapide</h2>
    <div class="tiles">
      <div class="tile" data-go="store">${icon('store')}<h3>Boutique du jour</h3><p>Tes 4 skins du jour, les packs, le marché nocturne et les accessoires.</p></div>
      <div class="tile" data-go="agent">${icon('agent')}<h3>Agent auto · ${al.enabled ? '<span style="color:var(--win)">activé</span>' : '<span class="muted">désactivé</span>'}</h3>
        <p>${alAgent ? `Agent principal : <b>${esc(alAgent.name)}</b> (${al.mode === 'lock' ? 'verrouillage' : 'survol'})` : 'Choisis l\'agent à sélectionner automatiquement.'}</p>
        ${alAgent ? `<img class="tile-agent" src="${alAgent.icon}" alt="">` : ''}</div>
      <div class="tile" data-go="live">${icon('live')}<h3>Partie en direct</h3><p>Rangs, niveaux et agents de tous les joueurs de ta partie.</p></div>
      <div class="tile" data-go="history">${icon('history')}<h3>Historique</h3><p>Tes derniers matchs avec KDA, ACS et tableau des scores.</p></div>
      <div class="tile" data-go="party">${icon('party')}<h3>Groupe</h3><p>Change de mode, lance la recherche et ouvre ton groupe.</p></div>
      <div class="tile" data-go="friends">${icon('friends')}<h3>Amis</h3><p>Qui est en ligne, en partie, sur quelle carte et avec quel score.</p></div>
    </div>`;
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
      <h1><small>Ta boutique</small>Boutique</h1>
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
PAGES.agent = async () => {
  const alive = guard();
  const owned = await ownedAgents();
  if (!alive()) return;
  let roleFilter = '';
  const roles = [...new Set(state.assets.agents.map((a) => a.role))].sort();
  const maps = state.assets.maps.filter((m) => m.tactical);

  const save = async (patch) => {
    state.settings = await call('settings-set', { autolock: patch });
    renderNav();
    draw();
  };

  const agentGrid = (selectedId, fallbacks, action) => state.assets.agents
    .filter((a) => !roleFilter || a.role === roleFilter)
    .map((a) => {
      const has = owned.has(a.uuid.toLowerCase());
      const order = fallbacks ? fallbacks.indexOf(a.uuid) : -1;
      return `<button class="agent ${selectedId === a.uuid || order >= 0 ? 'on' : ''}" data-${action}="${a.uuid}" ${has ? '' : 'disabled title="Agent non débloqué"'}>
        ${order >= 0 ? `<span class="order">${order + 1}</span>` : ''}
        <img src="${a.icon}" alt=""><span class="aname">${esc(a.name)}</span></button>`;
    }).join('');

  function draw() {
    const al = state.settings.autolock;
    const main = agentOf(al.agentId);
    content.innerHTML = `
      <div class="page-head">
        <h1><small>Sélection d'agent</small>Agent auto</h1>
        <label class="switch" title="Activer / désactiver"><input type="checkbox" id="al-enabled" ${al.enabled ? 'checked' : ''}><span></span></label>
      </div>

      <div class="warn-box">
        Quand une partie est trouvée, Precise Gunplay choisit automatiquement ton agent pendant la phase de sélection.
        L'app utilise les mêmes API que le client officiel, mais l'automatisation n'est pas approuvée par Riot :
        le mode <b>Verrouiller</b> est le plus risqué vis-à-vis des conditions d'utilisation. Utilise-le à tes risques ; le mode <b>Survoler</b> te laisse confirmer toi-même.
      </div>

      <div class="panel" style="margin-top:16px">
        <div class="setting-row">
          <div class="label"><div>Mode</div><div>Survoler : l'agent est présélectionné, tu cliques sur « Verrouiller ». Verrouiller : l'agent est validé directement.</div></div>
          <div class="chip-group" id="al-mode">
            <button data-mode="select" class="${al.mode === 'select' ? 'on' : ''}">Survoler</button>
            <button data-mode="lock" class="${al.mode === 'lock' ? 'on' : ''}">Verrouiller</button>
          </div>
        </div>
        <div class="setting-row">
          <div class="label"><div>Délai avant sélection</div><div>Laisse le temps à tes coéquipiers de choisir avant toi.</div></div>
          <input type="range" id="al-delay" min="0" max="8000" step="250" value="${al.delayMs}">
          <b id="al-delay-val" style="width:52px;text-align:right">${(al.delayMs / 1000).toFixed(2).replace(/\.?0+$/, '') || 0}s</b>
        </div>
      </div>

      <h2>Agent principal ${main ? `<span class="muted" style="letter-spacing:.05em;text-transform:none">— ${esc(main.name)}</span>` : ''}</h2>
      <div class="chip-group role-filter" id="role-filter">
        <button data-role="" class="${!roleFilter ? 'on' : ''}">Tous</button>
        ${roles.map((r) => `<button data-role="${esc(r)}" class="${roleFilter === r ? 'on' : ''}">${esc(r)}</button>`).join('')}
      </div>
      <div class="agents">${agentGrid(al.agentId, null, 'main')}</div>

      <h2>Agents de secours <span class="muted" style="letter-spacing:.05em;text-transform:none;font-size:13px">— si ton agent est déjà pris (3 max, dans l'ordre)</span></h2>
      <div class="agents">${agentGrid(null, al.fallbacks, 'fallback')}</div>

      <h2>Agent par carte</h2>
      <div class="maps">
        ${maps.map((m) => `
          <div class="map-row">
            <img src="${m.listIcon || m.splash}" alt="" loading="lazy">
            <div class="mname">${esc(m.name)}</div>
            <select data-map="${m.uuid}">
              <option value="">Par défaut</option>
              ${state.assets.agents.filter((a) => owned.has(a.uuid.toLowerCase())).map((a) => `<option value="${a.uuid}" ${al.perMap?.[m.uuid] === a.uuid ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}
            </select>
          </div>`).join('')}
      </div>`;

    $('#al-enabled').onchange = (e) => {
      if (e.target.checked && !state.settings.autolock.agentId) {
        e.target.checked = false;
        return toast('Choisis d\'abord un agent principal.', 'error');
      }
      save({ enabled: e.target.checked });
    };
    $('#al-delay').oninput = (e) => ($('#al-delay-val').textContent = `${Number(e.target.value) / 1000}s`);
    $('#al-delay').onchange = (e) => save({ delayMs: Number(e.target.value) });
  }

  content.onclick = (e) => {
    const al = state.settings.autolock;
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    if (t.dataset.mode) return save({ mode: t.dataset.mode });
    if (t.dataset.role !== undefined) { roleFilter = t.dataset.role; return draw(); }
    if (t.dataset.main) return save({ agentId: t.dataset.main });
    if (t.dataset.fallback) {
      const id = t.dataset.fallback;
      let list = [...(al.fallbacks || [])];
      if (list.includes(id)) list = list.filter((x) => x !== id);
      else if (list.length < 3) list.push(id);
      else return toast('3 agents de secours maximum.', 'error');
      return save({ fallbacks: list });
    }
  };
  content.onchange = (e) => {
    const sel = e.target.closest('select[data-map]');
    if (!sel) return;
    const perMap = { ...(state.settings.autolock.perMap || {}) };
    if (sel.value) perMap[sel.dataset.map] = sel.value;
    else delete perMap[sel.dataset.map];
    call('settings-set', { autolock: { perMap } }).then((s) => (state.settings = s));
  };
  draw();
};

// ---------- Partie en direct ----------
function playerRow(p, { pregame = false } = {}) {
  const a = agentOf(p.agentId);
  return `
    <div class="player ${p.isMe ? 'me' : ''}">
      ${a ? `<img class="pagent" src="${a.icon}" alt="">` : '<div class="pagent empty-agent">?</div>'}
      <div class="pname">
        <div>${esc(p.name)}${p.tag ? `<span class="muted">#${esc(p.tag)}</span>` : ''}</div>
        <div>${a ? esc(a.name) : 'En sélection…'}${p.level != null ? ` · Niv. ${p.level}` : ''}${p.hidden ? ' · nom masqué' : ''}</div>
      </div>
      ${pregame && p.state ? `<span class="pstate ${p.state}">${p.state === 'locked' ? 'Verrouillé' : 'Survol'}</span>` : ''}
      ${rankHtml(p.rank)}
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
        <div class="page-head"><h1><small>En direct</small>Partie en direct</h1></div>
        <div class="empty">${icon('live').replace('<svg', '<svg style="width:48px;height:48px;color:var(--muted)"')}
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
            <div class="mapname">${esc(d.map?.name || 'Carte inconnue')}</div>
          </div>
          ${d.state === 'pregame' ? `<div class="countdown" data-ends="${d.endsAt}">${fmtDuration(d.endsAt - Date.now())}</div>` : ''}
        </div>
      </div>

      ${d.state === 'pregame' && !myLocked ? `
        <div class="panel" style="margin-bottom:16px">
          <div class="row" style="margin-bottom:12px">
            <b style="letter-spacing:.1em;text-transform:uppercase">Choisir mon agent</b>
            <div class="spacer"></div>
            <button class="btn primary" id="lock-btn" ${pick ? '' : 'disabled'}>Verrouiller ${pick ? esc(agentOf(pick)?.name) : ''}</button>
            <button class="btn danger" id="dodge-btn" title="Quitter la sélection (pénalité possible)">Esquiver</button>
          </div>
          <div class="agents">${state.assets.agents.map((a) => {
            const ok = owned.has(a.uuid.toLowerCase()) && !takenByOthers.has(a.uuid.toLowerCase());
            return `<button class="agent ${pick === a.uuid ? 'on' : ''}" data-pick="${a.uuid}" ${ok ? '' : 'disabled'}><img src="${a.icon}" alt=""><span class="aname">${esc(a.name)}</span></button>`;
          }).join('')}</div>
        </div>` : ''}

      <div class="${d.enemies.length ? 'cols-2' : ''}">
        <div class="team ally"><h3>Ton équipe</h3>${d.allies.map((p) => playerRow(p, { pregame: d.state === 'pregame' })).join('')}</div>
        ${d.enemies.length ? `<div class="team enemy"><h3>Adversaires</h3>${d.enemies.map((p) => playerRow(p)).join('')}</div>` : ''}
      </div>`;
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
        toast(`${agentOf(pick)?.name} verrouillé !`);
        refresh();
      } catch (err) { toast(err.message, 'error'); }
    }
    if (t.id === 'dodge-btn') {
      if (!confirm('Quitter la sélection d\'agent ? Tu risques une pénalité (RR / temps d\'attente).')) return;
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
PAGES.history = async () => {
  const alive = guard();
  let filter = '';
  const FILTERS = [['', 'Tous'], ['competitive', 'Compétition'], ['unrated', 'Non classé'], ['swiftplay', 'Vélocité'], ['deathmatch', 'Combat à mort'], ['premier', 'Premier']];

  async function load() {
    content.innerHTML = head() + loader();
    let list;
    try {
      list = await call('history', filter || undefined);
    } catch (e) {
      if (alive()) content.innerHTML = head() + errorBox(e.message);
      return;
    }
    if (!alive()) return;
    const wins = list.filter((m) => m.result === 'win').length;
    const k = list.reduce((s, m) => s + m.kills, 0), dth = list.reduce((s, m) => s + m.deaths, 0);
    content.innerHTML = head() + (list.length ? `
      <div class="wallet" style="margin-bottom:16px">
        <div class="coin">${list.length} <span class="muted">matchs</span></div>
        <div class="coin" style="color:var(--win)">${Math.round((wins / list.length) * 100)}% <span class="muted">victoires</span></div>
        <div class="coin">${(k / Math.max(1, dth)).toFixed(2)} <span class="muted">K/D</span></div>
        <div class="coin">${Math.round(list.reduce((s, m) => s + m.acs, 0) / list.length)} <span class="muted">ACS moyen</span></div>
      </div>
      ${list.map(matchHtml).join('')}` : '<div class="empty"><h3>Aucun match</h3><div>Joue une partie dans ce mode pour la voir ici.</div></div>');
  }

  const head = () => `
    <div class="page-head"><h1><small>Tes performances</small>Historique</h1></div>
    <div class="chip-group" id="hfilter" style="margin-bottom:16px">${FILTERS.map(([v, l]) => `<button data-filter="${v}" class="${filter === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;

  function matchHtml(m) {
    const a = agentOf(m.agentId);
    const t = tierOf(m.tier);
    const label = { win: 'Victoire', loss: 'Défaite', draw: 'Égalité' }[m.result];
    return `
      <div class="match ${m.result}">
        <div class="match-row" data-toggle>
          <div class="bar"></div>
          ${m.map?.listIcon ? `<img class="mimg" src="${m.map.listIcon}" alt="" loading="lazy">` : '<div></div>'}
          ${a ? `<img class="magent" src="${a.icon}" alt="">` : '<div></div>'}
          <div><div class="mmap">${esc(m.map?.name || '?')}</div><div class="mmeta">${esc(queueName(m.queue))} · ${m.startedAt ? timeAgo(m.startedAt) : ''} · ${Math.round((m.lengthMs || 0) / 60000)} min</div></div>
          <div><div class="stat-label">${label}</div><div class="mscore">${m.score ? `${m.score[0]} - ${m.score[1]}` : '—'}</div></div>
          <div><div class="stat-label">K / D / A</div><div class="stat-val">${m.kills} / ${m.deaths} / ${m.assists}</div></div>
          <div><div class="stat-label">ACS</div><div class="stat-val">${m.acs}</div></div>
          <div>${t?.icon && m.tier ? `<img src="${t.icon}" alt="" title="${esc(t.name)}" style="width:36px;height:36px">` : ''}</div>
        </div>
        <div class="scoreboard">
          <table class="sb">
            <tr><th>Joueur</th><th>Agent</th><th>ACS</th><th>K</th><th>D</th><th>A</th><th>Rang</th></tr>
            ${m.scoreboard.map((p) => {
              const pa = agentOf(p.agentId), pt = tierOf(p.tier);
              return `<tr class="${p.team} ${p.isMe ? 'me' : ''}">
                <td>${esc(p.name)}<span class="muted">#${esc(p.tag)}</span></td>
                <td>${pa ? `<img src="${pa.icon}" alt="" title="${esc(pa.name)}">` : ''}</td>
                <td><b>${p.acs}</b></td><td>${p.kills}</td><td>${p.deaths}</td><td>${p.assists}</td>
                <td>${pt?.icon && p.tier ? `<img src="${pt.icon}" alt="" title="${esc(pt.name)}">` : '<span class="muted">—</span>'}</td></tr>`;
            }).join('')}
          </table>
        </div>
      </div>`;
  }

  content.onclick = (e) => {
    const f = e.target.closest('[data-filter]');
    if (f) { filter = f.dataset.filter; return load(); }
    const row = e.target.closest('[data-toggle]');
    if (row) row.parentElement.classList.toggle('open');
  };
  await load();
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
      content.innerHTML = '<div class="page-head"><h1><small>Social</small>Groupe</h1></div><div class="empty"><h3>Aucun groupe</h3><div>Lance VALORANT pour voir ton groupe.</div></div>';
      return;
    }
    const searching = p.state === 'MATCHMAKING';
    const queues = [...new Set([p.queue, ...p.eligibleQueues].filter((q) => q !== undefined))];
    content.innerHTML = `
      <div class="page-head">
        <h1><small>Social</small>Groupe <span class="muted" style="font-size:18px">${p.members.length}/5</span></h1>
      </div>
      <div class="panel" style="margin-bottom:18px">
        <div class="row" style="flex-wrap:wrap">
          <div>
            <div class="stat-label">Mode</div>
            <select id="pq" ${!p.isOwner || searching ? 'disabled' : ''}>${queues.map((q) => `<option value="${esc(q)}" ${q === p.queue ? 'selected' : ''}>${esc(queueName(q))}</option>`).join('')}</select>
          </div>
          <div style="margin-left:20px">
            <div class="stat-label">Groupe</div>
            <div class="row" style="margin-top:6px"><label class="switch"><input type="checkbox" id="popen" ${p.open ? 'checked' : ''} ${p.isOwner ? '' : 'disabled'}><span></span></label><span>${p.open ? 'Ouvert' : 'Fermé'}</span></div>
          </div>
          <div class="spacer"></div>
          ${searching && p.queueEntryTime ? `<div class="muted">Recherche en cours…</div>` : ''}
          <button class="btn ${searching ? 'danger' : 'primary'} big" id="pmm" ${p.isOwner ? '' : 'disabled title="Seul le chef de groupe peut lancer la recherche"'}>${searching ? 'Annuler la recherche' : 'Lancer la recherche'}</button>
        </div>
      </div>
      <div class="members">
        ${p.members.map((m) => `
          <div class="member">
            ${m.card ? `<img class="mcard" src="${m.card}" alt="">` : '<div class="mcard"></div>'}
            <div class="mname">${esc(m.name)}</div><div class="mtag">#${esc(m.tag)} · Niv. ${m.level ?? '?'}</div>
            ${m.owner ? '<div class="crown">★ Chef de groupe</div>' : ''}
            ${rankHtml(m.rank)}
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
    if (e.target.id === 'pq') act(() => call('party-queue', last.id, e.target.value));
    if (e.target.id === 'popen') act(() => call('party-access', last.id, e.target.checked));
  };
  content.onclick = (e) => {
    if (e.target.closest('#pmm')) act(() => call('party-matchmaking', last.id, last.state !== 'MATCHMAKING'));
  };

  await refresh();
  every(3000, refresh);
};

// ---------- Amis ----------
PAGES.friends = async () => {
  const alive = guard();
  let query = '';
  let list = [];

  async function refresh() {
    try { list = await call('friends'); } catch (e) { if (alive()) content.innerHTML = errorBox(e.message); return; }
    if (alive()) drawList();
  }

  function statusLine(f) {
    if (!f.online) return 'Hors ligne';
    const v = f.valorant;
    if (!v) return f.product ? `En ligne · ${esc(f.product)}` : 'En ligne';
    if (v.loop === 'INGAME') return `En partie · ${esc(queueName(v.queue))}${v.map ? ` · ${esc(v.map)}` : ''}${v.score ? ` · ${v.score[0]} - ${v.score[1]}` : ''}`;
    if (v.loop === 'PREGAME') return `Sélection d'agent · ${esc(queueName(v.queue))}${v.map ? ` · ${esc(v.map)}` : ''}`;
    return `Dans les menus${v.partySize > 1 ? ` · groupe de ${v.partySize}` : ''}${v.idle ? ' · inactif' : ''}`;
  }

  function drawList() {
    const q = query.toLowerCase();
    const shown = list.filter((f) => !q || `${f.name}#${f.tag} ${f.note}`.toLowerCase().includes(q));
    const online = list.filter((f) => f.online).length;
    $('#fcount').textContent = `${online} en ligne · ${list.length} amis`;
    $('#flist').innerHTML = shown.map((f) => {
      const v = f.valorant;
      const t = v?.tier ? tierOf(v.tier) : null;
      const pill = v?.loop === 'INGAME' ? '<span class="pill ingame">En partie</span>' : v?.loop === 'PREGAME' ? '<span class="pill pregame">Sélection</span>' : '';
      return `
        <div class="friend ${f.online ? '' : 'offline'}">
          <span class="fdot ${f.online ? esc(f.status) : ''}"></span>
          <div class="fname"><div>${esc(f.name)}<span class="muted">#${esc(f.tag)}</span>${f.note ? ` <span class="muted">(${esc(f.note)})</span>` : ''}</div><div>${statusLine(f)}</div></div>
          ${pill}
          ${v?.level ? `<span class="pill">Niv. ${v.level}</span>` : ''}
          ${t?.icon ? `<img src="${t.icon}" alt="" title="${esc(t.name)}" style="width:28px;height:28px">` : ''}
        </div>`;
    }).join('') || '<div class="empty">Aucun ami trouvé.</div>';
  }

  content.innerHTML = `
    <div class="page-head"><h1><small>Social</small>Amis</h1><span class="muted" id="fcount"></span></div>
    <input type="search" id="fsearch" placeholder="Rechercher un ami…" style="width:320px;margin-bottom:16px">
    <div id="flist">${loader()}</div>`;
  $('#fsearch').oninput = (e) => { query = e.target.value; drawList(); };
  await refresh();
  every(15000, refresh);
};

// ---------- Collection ----------
PAGES.collection = async () => {
  const alive = guard();
  const skins = await call('collection');
  if (!alive()) return;
  let query = '';
  content.innerHTML = `
    <div class="page-head"><h1><small>Ton inventaire</small>Collection</h1><span class="muted">${skins.length} skins</span></div>
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
PAGES.settings = async () => {
  const s = state.settings;
  const REGIONS = [['', 'Automatique'], ['eu', 'Europe (EU)'], ['na', 'Amérique du Nord (NA)'], ['latam', 'Amérique latine (LATAM)'], ['br', 'Brésil (BR)'], ['ap', 'Asie-Pacifique (AP)'], ['kr', 'Corée (KR)']];
  content.innerHTML = `
    <div class="page-head"><h1><small>Configuration</small>Paramètres</h1></div>
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
      <b style="color:var(--text)">Precise Gunplay</b> v${esc(state.update?.current || '')} — compagnon non officiel pour VALORANT. Code source : github.com/NOUSSS/precise-gunplay<br>
      Ton compte est lié via la session locale du Riot Client : l'app ne voit jamais ton mot de passe et ne stocke aucun jeton.<br>
      Precise Gunplay n'est ni approuvé ni affilié à Riot Games. VALORANT et Riot Games sont des marques de Riot Games, Inc.
    </div>`;
  $('#s-region').onchange = async (e) => {
    state.settings = await call('settings-set', { regionOverride: e.target.value });
    toast('Région enregistrée, reconnexion…');
  };
  $('#s-notif').onchange = async (e) => { state.settings = await call('settings-set', { notifications: e.target.checked }); };
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
    [state.settings, state.assets] = await Promise.all([call('settings-get'), call('assets')]);
  } catch (e) {
    content.innerHTML = errorBox(`Impossible de charger les données du jeu (connexion Internet ?) : ${e.message}`);
    return;
  }
  window.api.on('status', onStatus);
  window.api.on('update', onUpdate);
  onUpdate(await call('update-state'));
  window.api.on('autolock-event', (evt) => toast(evt.message, evt.type === 'error' ? 'error' : 'info'));
  state.status = await call('status');
  renderNav();
  renderAccount();
  navigate('home');
})();
