/* Precise Gunplay — vidéo de présentation.
 * Toute l'animation est une timeline GSAP en pause : window.seek(t) affiche l'image exacte à l'instant t,
 * ce qui permet un rendu image par image déterministe (render.mjs) et une prévisualisation dans le navigateur. */
'use strict';

// ================= Données =================
const M = 'https://media.valorant-api.com';
const AGENTS = {
  jett: 'add6443a-41bd-e414-f6ad-e58d267f4e95', raze: 'f94c3b30-42be-e959-889c-5aa313dba261',
  sova: '320b2a48-4d9b-a075-30f1-1f93a9b638fa', omen: '8e253930-4c05-31dd-1b6c-968525494517',
  reyna: 'a3bfb853-43b2-7238-a4f1-ad90e9e46bcc', killjoy: '1e58de9c-4950-5125-93e9-a0aee9f98746',
  sage: '569fdd95-4d10-43ab-ca70-79becc718b46', clove: '1dbf2edd-4729-0984-3115-daa5eed44993',
  viper: '707eab51-4836-f488-046a-cda6bf494859', phoenix: 'eb93336a-449b-9c1b-0a54-a891f7921d69',
};
const MAPS = {
  ascent: '7eaecc1b-4337-bbf6-6ab9-04b8f06b3319', split: 'd960549e-485c-e861-8d71-aa9d1aed12a2',
  bind: '2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba', lotus: '2fe4ed3a-450a-948b-6d6b-e89a78e680a9',
  sunset: '92584fbe-486a-b1b2-9faa-39b0f486b498', haven: '2bee0dc9-4ffe-519b-1cbd-7fbe763a6047',
};
const agentIcon = (a) => `${M}/agents/${AGENTS[a]}/displayicon.png`;
const agentPortrait = (a) => `${M}/agents/${AGENTS[a]}/fullportrait.png`;
const mapList = (m) => `${M}/maps/${MAPS[m]}/listviewicon.png`;
const mapSplash = (m) => `${M}/maps/${MAPS[m]}/splash.png`;
const rankIcon = (t) => `${M}/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${t}/largeicon.png`;
const skin = (id) => `${M}/weaponskins/${id}/displayicon.png`;
const CURRENCY = {
  vp: `${M}/currencies/85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741/displayicon.png`,
  rp: `${M}/currencies/e59aa87c-4cbf-517a-5983-6e81511be9b7/displayicon.png`,
  kc: `${M}/currencies/85ca954a-41f2-ce94-9b45-8ca3dd39a00d/displayicon.png`,
};
const CARD_WIDE = `${M}/playercards/e9c8d760-4d06-4037-4882-6bab3610d9ea/wideart.png`;
const RARITY = { exclusive: '#f5955b', premium: '#d1548d', ultra: '#fad663', deluxe: '#009587' };

// Icônes de la barre latérale (identiques à renderer/app.js)
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
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  file: '<path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
};
const icon = (n, sw = 1.8) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`;
const NAV = [['home', 'Accueil'], ['store', 'Boutique'], ['agent', 'Agent auto'], ['live', 'Partie en direct'], ['history', 'Historique'], ['stats', 'Statistiques'], 'sep', ['party', 'Groupe'], ['friends', 'Amis'], ['collection', 'Collection'], 'sep', ['settings', 'Paramètres']];
const trn = () => `<span class="trn">TRN${icon('ext', 2.2)}</span>`;

// ================= Utilitaires =================
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const stage = $('#stage');
const scenesEl = $('#scenes');
const fr = (n, d = 0) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

function scene(id, html) {
  const el = document.createElement('section');
  el.className = 'scene';
  el.id = id;
  el.innerHTML = html;
  scenesEl.appendChild(el);
  return el;
}
// Découpe un texte en lettres masquables
const letters = (txt, cls = '') => [...txt].map((c) => `<span class="${cls}" style="display:inline-block">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
const line = (html, cls = '') => `<span class="mask ${cls}"><span>${html}</span></span>`;

function featBlock(num, kicker, title, lead, chips = []) {
  return `<div class="feat">
    <div class="num">${num}</div>
    <div class="kicker">${kicker}</div>
    <div class="title">${title.map((t) => line(t)).join('')}</div>
    <div class="lead">${lead}</div>
    <div class="chips">${chips.map((c) => (Array.isArray(c) ? c : [c, ''])).map(([c, k]) => `<span class="chip ${k}">${c}</span>`).join('')}</div>
  </div>`;
}

// ================= Scènes =================
// Découpage (secondes) — calé sur un tempo de 120 BPM (un temps = 0,5 s)
const T = {
  intro: [0, 5.5], hook: [5.5, 10], link: [10, 16.5], app: [16.5, 22], home: [22, 28], store: [28, 34],
  agent: [34, 43.5], live: [43.5, 49.5], stats: [49.5, 56], history: [56, 61], party: [61, 66.5],
  collection: [66.5, 72], howto: [72, 81], outro: [81, 88],
};
const DURATION = 88;
const PAGE_LABEL = {
  intro: 'PRECISE GUNPLAY', hook: 'COMPAGNON VALORANT', link: '01 // LIAISON', app: '02 // INTERFACE', home: '03 // ACCUEIL',
  store: '04 // BOUTIQUE', agent: '05 // AGENT AUTO', live: '06 // PARTIE EN DIRECT', stats: '07 // STATISTIQUES',
  history: '08 // HISTORIQUE', party: '09 // GROUPE & AMIS', collection: '10 // COLLECTION', howto: 'UTILISATION', outro: 'PRECISE GUNPLAY',
};

// ---------- 1. Intro ----------
scene('intro', `
  <div class="center" id="in-cross" style="width:1920px;height:1080px">
    <i id="in-h" style="position:absolute;left:0;right:0;top:540px;height:2px;background:linear-gradient(90deg,transparent,#ff4655,transparent)"></i>
    <i id="in-v" style="position:absolute;top:0;bottom:0;left:960px;width:2px;background:linear-gradient(180deg,transparent,#ff4655,transparent)"></i>
  </div>
  <div class="shard" id="in-s1" style="left:-200px;top:180px;width:900px;height:120px"></div>
  <div class="shard" id="in-s2" style="left:1100px;top:760px;width:1000px;height:90px;background:#b3203a"></div>
  <div class="shard" id="in-s3" style="left:700px;top:0;width:60px;height:1080px;background:#ff2e46"></div>
  <div class="center" id="in-logo" style="top:390px"><img src="../renderer/logo-mark.png" style="width:260px;filter:drop-shadow(0 0 40px #ff465588)"></div>
  <div class="center" id="in-word" style="top:640px;text-align:center;white-space:nowrap">
    <div style="font-family:var(--display);font-size:170px;line-height:1;letter-spacing:.04em" id="in-w1">${letters('PRECISE', 'l1')}</div>
    <div style="font-family:var(--cond);font-weight:700;font-size:56px;color:var(--red);letter-spacing:.62em;margin-right:-.62em;margin-top:6px" id="in-w2">${letters('GUNPLAY', 'l2')}</div>
  </div>
  <div class="center" id="in-tag" style="top:880px;font-family:var(--mono);font-size:26px;letter-spacing:.28em;color:#c9d1d8;white-space:nowrap">
    LE COMPAGNON <b style="color:#fff">VALORANT</b> POUR WINDOWS
  </div>
`);

// ---------- 2. Accroche ----------
scene('hook', `
  <img id="hk-agent" src="${agentPortrait('jett')}" style="position:absolute;right:-120px;top:-60px;height:1300px;opacity:.9;filter:drop-shadow(0 0 60px #000)">
  <div style="position:absolute;right:0;top:0;bottom:0;width:1100px;background:linear-gradient(90deg,var(--bg) 0%,transparent 60%)"></div>
  <div id="hk-lines" style="position:absolute;left:150px;top:200px">
    <div class="big hk" id="hk1">TA BOUTIQUE.</div>
    <div class="big hk" id="hk2">TES STATS.</div>
    <div class="big hk" id="hk3">TA PARTIE.</div>
    <div class="big hk" id="hk4" style="color:var(--red);font-size:110px;margin-top:14px">EN UN COUP D'ŒIL.</div>
  </div>
`);

// ---------- 3. Liaison du compte ----------
scene('link', `
  ${featBlock('01', 'LIAISON DU COMPTE', ['Zéro', '<em>identifiant.</em>'],
    'L\'app lit la session du <b>Riot Client déjà connecté</b>. Aucun mot de passe à saisir, jamais.',
    ['Connexion automatique', ['Région détectée', 'teal']])}
  <svg id="lk-wires" width="1920" height="1080" style="position:absolute;left:0;top:0">
    <path id="lk-p1" d="M1080 330 C1180 330 1180 540 1280 540" fill="none" stroke="#ff4655" stroke-width="3" stroke-dasharray="10 10"/>
    <path id="lk-p2" d="M1500 640 C1500 700 1400 720 1400 780" fill="none" stroke="#ff4655" stroke-width="3" stroke-dasharray="10 10"/>
  </svg>
  <div class="card-ui" id="lk-riot" style="left:860px;top:250px;width:230px;height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
    <div style="width:64px;height:64px;border-radius:14px;background:#eb0029;display:grid;place-items:center;font-family:var(--display);font-size:34px;color:#fff">R</div>
    <div style="font-family:var(--cond);font-weight:700;font-size:26px;letter-spacing:.06em">RIOT CLIENT</div>
    <div class="muted" style="font-size:16px;display:flex;align-items:center;gap:8px"><i style="width:10px;height:10px;border-radius:50%;background:var(--win);box-shadow:0 0 8px var(--win)"></i>Session ouverte</div>
  </div>
  <div class="card-ui" id="lk-file" style="left:1280px;top:450px;width:520px;height:190px;padding:24px 26px">
    <div style="display:flex;align-items:center;gap:12px;color:var(--red)"><span style="width:30px;height:30px;display:block">${icon('file')}</span><span style="font-family:var(--cond);font-weight:700;font-size:26px;letter-spacing:.1em;color:var(--text)">LOCKFILE</span></div>
    <div id="lk-path" style="font-family:var(--mono);font-size:15px;color:#aeb9c2;margin-top:18px;line-height:1.5;white-space:nowrap;overflow:hidden">%LOCALAPPDATA%\\Riot Games\\Riot Client\\Config\\lockfile</div>
    <div style="font-family:var(--mono);font-size:17px;color:var(--teal);margin-top:6px">→ port · jetons de session</div>
  </div>
  <div class="card-ui" id="lk-app" style="left:1150px;top:780px;width:560px;height:130px;display:flex;align-items:center;gap:22px;padding:0 28px;border-color:#ff465566">
    <img src="../renderer/logo-mark.png" style="width:70px">
    <div style="flex:1">
      <div style="font-family:var(--cond);font-weight:700;font-size:28px;letter-spacing:.06em">PRECISE GUNPLAY</div>
      <div id="lk-status" style="font-size:19px;color:var(--win);margin-top:4px;display:flex;align-items:center;gap:8px"><i style="width:10px;height:10px;border-radius:50%;background:var(--win);box-shadow:0 0 8px var(--win)"></i>Lié à Nova#0721 · EU</div>
    </div>
    <div id="lk-check" style="width:54px;height:54px;border-radius:50%;background:var(--win);color:#0b131b;display:grid;place-items:center"><span style="width:30px;height:30px;display:block">${icon('check', 3)}</span></div>
  </div>
  <i class="pkt" style="position:absolute;left:0;top:0;width:14px;height:14px;background:#fff;box-shadow:0 0 14px #ff4655,0 0 4px #fff;margin:-7px 0 0 -7px"></i>
  <i class="pkt" style="position:absolute;left:0;top:0;width:14px;height:14px;background:#fff;box-shadow:0 0 14px #ff4655,0 0 4px #fff;margin:-7px 0 0 -7px"></i>
`);

// ---------- 4. Interface ----------
scene('app', `
  <div style="position:absolute;left:150px;top:300px;width:620px">
    <div class="kicker">L'INTERFACE</div>
    <div class="title" style="margin-top:18px">${line('Tout ton')}${line('Valorant,')}${line('<em>hors du jeu.</em>')}</div>
    <div class="lead" style="margin-top:26px">Dix pages, une barre latérale, <b>zéro alt-tab inutile.</b></div>
  </div>
  <div id="ap-persp" style="position:absolute;left:820px;top:150px;width:1000px;height:780px;perspective:1800px">
    <div class="win" id="ap-win" style="left:0;top:0;width:1000px;height:780px">
      <div class="win-bar"><img src="../renderer/logo-full.png"><div class="dots"><i></i><i></i><i></i></div></div>
      <div style="display:flex;height:726px">
        <div style="width:300px;background:var(--bg-deep);padding:16px 12px;position:relative" id="ap-nav">
          <div id="ap-hl" style="position:absolute;left:12px;right:12px;top:16px;height:52px;background:var(--red-dim);border-radius:5px"><i style="position:absolute;left:0;top:10px;bottom:10px;width:4px;background:var(--red);border-radius:2px"></i></div>
          ${NAV.map((n) => (n === 'sep' ? '<div class="nav-sep ap-it"></div>' : `<div class="nav-item ap-it" data-p="${n[0]}" style="height:52px">${icon(n[0])}${n[1]}</div>`)).join('')}
        </div>
        <div style="flex:1;padding:26px;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:150px;gap:18px" id="ap-content">
          ${Array.from({ length: 8 }, (_, i) => `<div class="panel ap-sk" style="${i === 0 ? 'grid-column:span 2;' : ''}position:relative;overflow:hidden"><i class="ap-sh" style="position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,#ffffff0d 50%,transparent 70%)"></i><div style="position:absolute;left:22px;top:24px;width:${40 + ((i * 37) % 45)}%;height:14px;border-radius:7px;background:#ffffff14"></div><div style="position:absolute;left:22px;top:52px;width:${25 + ((i * 23) % 30)}%;height:30px;border-radius:6px;background:#ffffff0c"></div></div>`).join('')}
        </div>
      </div>
    </div>
  </div>
`);

// ---------- 5. Accueil ----------
scene('home', `
  ${featBlock('02', 'ACCUEIL', ['Ton profil,', '<em>en un regard.</em>'],
    'Pseudo, niveau, carte et titre. <b>Rang actuel et meilleur rang.</b> Portefeuille VP, Radianite et Kingdom Credits.',
    ['Rang & RR', 'Portefeuille', ['Meilleur rang', 'teal']])}
  <div class="card-ui" id="hm-banner" style="left:880px;top:190px;width:880px;height:250px;background:#0b131b url(${CARD_WIDE}) center/cover">
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,#0b131bf2 0%,#0b131b99 50%,transparent 100%)"></div>
    <div style="position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--red)"></div>
    <div style="position:absolute;left:44px;top:50px">
      <div style="font-family:var(--display);font-size:78px;line-height:1">NOVA <span style="color:var(--muted);font-family:var(--cond);font-size:42px">#0721</span></div>
      <div style="color:var(--gold);font-family:var(--cond);font-size:26px;letter-spacing:.1em;margin-top:8px">PRÉCISION CHIRURGICALE</div>
      <div style="display:inline-block;margin-top:18px;font-family:var(--cond);font-weight:700;font-size:22px;padding:6px 14px;border:1px solid #ffffff44;border-radius:4px;background:#0b131bcc">NIVEAU <span id="hm-lvl">0</span></div>
    </div>
  </div>
  <div class="card-ui" id="hm-rank" style="left:880px;top:470px;width:520px;height:270px;padding:30px 34px">
    <div class="lbl">Rang actuel</div>
    <div style="display:flex;align-items:center;gap:24px;margin-top:14px">
      <img id="hm-rimg" src="${rankIcon(22)}" style="width:120px;height:120px;filter:drop-shadow(0 0 20px #20d0b055)">
      <div>
        <div style="font-family:var(--display);font-size:52px;line-height:1">ASCENDANT 2</div>
        <div style="font-family:var(--cond);font-size:28px;color:var(--muted);margin-top:6px"><span id="hm-rr" style="color:var(--text);font-weight:700">0</span> RR</div>
      </div>
    </div>
    <div class="bar" style="margin-top:18px;height:10px"><i id="hm-rrbar" style="width:64%;background:linear-gradient(90deg,#20d0b0,#6ff5dc)"></i></div>
  </div>
  <div class="card-ui" id="hm-peak" style="left:1430px;top:470px;width:330px;height:270px;padding:30px 30px;text-align:center">
    <div class="lbl">Meilleur rang</div>
    <img src="${rankIcon(24)}" style="width:110px;height:110px;margin:18px auto 10px;filter:drop-shadow(0 0 20px #ff465566)">
    <div style="font-family:var(--display);font-size:38px">IMMORTEL 1</div>
  </div>
  ${[['vp', 'Valorant Points', 2450], ['rp', 'Radianite', 120], ['kc', 'Kingdom Credits', 8900]].map(([k, n, v], i) => `
    <div class="card-ui hm-wal" style="left:${880 + i * 300}px;top:770px;width:280px;height:120px;display:flex;align-items:center;gap:18px;padding:0 24px">
      <img src="${CURRENCY[k]}" style="width:46px;height:46px">
      <div><div class="lbl" style="font-size:15px">${n}</div><div class="val hm-cnt" data-to="${v}">0</div></div>
    </div>`).join('')}
`);

// ---------- 6. Boutique ----------
const STORE = [
  ['d8d5d7a1-4d81-8560-54bc-0692ab40f69b', 'Vandal Kuronami', 2175, 'exclusive'],
  ['36791b03-452d-8dad-0091-898cc28d2196', 'Phantom Oni', 1775, 'premium'],
  ['a491b943-43e3-4e98-64a6-fc87fca43605', 'Operator Glitchpop', 2175, 'exclusive'],
  ['142be691-42a0-c0a1-f6ed-57b3158def7e', 'Sheriff RGX 11z Pro', 2675, 'exclusive'],
];
scene('store', `
  ${featBlock('03', 'BOUTIQUE', ['Tes offres', '<em>du jour.</em>'],
    'Les 4 skins du jour avec <b>compte à rebours</b>, les packs en vedette, le marché nocturne et la boutique d\'accessoires.',
    ['Marché nocturne', 'Packs en vedette', ['Accessoires', 'teal']])}
  <div id="st-head" style="position:absolute;left:880px;top:170px;width:880px;display:flex;align-items:flex-end;justify-content:space-between">
    <div><div class="lbl">Offres du jour</div><div style="font-family:var(--display);font-size:60px;line-height:1.1">BOUTIQUE</div></div>
    <div class="panel" style="padding:12px 20px;display:flex;align-items:center;gap:14px"><span class="lbl" style="font-size:15px">Renouvellement</span><span id="st-timer" style="font-family:var(--mono);font-size:30px;color:var(--gold)">14h 32m 08s</span></div>
  </div>
  <div style="position:absolute;left:880px;top:290px;width:880px;display:grid;grid-template-columns:1fr 1fr;gap:24px;perspective:1600px">
    ${STORE.map(([id, n, p, r]) => `
      <div class="card-ui st-card" style="position:relative;height:300px;background:linear-gradient(160deg,${RARITY[r]}26 0%,var(--panel) 55%)">
        <div style="position:absolute;left:0;top:0;right:0;height:4px;background:${RARITY[r]}"></div>
        <img class="st-img" src="${skin(id)}" style="position:absolute;left:40px;right:40px;top:44px;height:150px;width:calc(100% - 80px);object-fit:contain;filter:drop-shadow(0 16px 20px #000a)">
        <div style="position:absolute;left:26px;bottom:24px;right:26px;display:flex;justify-content:space-between;align-items:flex-end">
          <div style="font-family:var(--cond);font-weight:700;font-size:30px;letter-spacing:.03em">${n}</div>
          <div style="display:flex;align-items:center;gap:8px;font-family:var(--cond);font-weight:700;font-size:28px"><img src="${CURRENCY.vp}" style="width:26px">${fr(p)}</div>
        </div>
      </div>`).join('')}
  </div>
`);

// ---------- 7. Agent auto ----------
const PER_MAP = [['ascent', 'jett'], ['bind', 'raze'], ['haven', 'sova'], ['lotus', 'omen'], ['split', 'reyna'], ['sunset', 'killjoy']];
scene('agent', `
  <div id="ag-a">
    ${featBlock('04', 'AGENT AUTO', ['Partie trouvée ?', '<em>Agent choisi.</em>'],
      'Survol ou verrouillage automatique, <b>délai réglable</b>, agents de secours et <b>un agent différent par carte.</b>',
      ['Survoler / Verrouiller', 'Délai 2,5 s', ['Par carte', 'teal']])}
    <div class="card-ui" id="ag-panel" style="left:880px;top:170px;width:880px;height:740px;padding:34px 38px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="lbl">Sélection automatique</div><div style="font-family:var(--display);font-size:52px;line-height:1.1">AGENT AUTO</div></div>
        <div class="switch" id="ag-sw" style="transform:scale(1.25)"><b></b><i></i></div>
      </div>
      <div style="display:flex;gap:24px;margin-top:26px">
        <div class="panel" style="flex:1;padding:18px 22px">
          <div class="lbl" style="font-size:15px">Mode</div>
          <div style="display:flex;margin-top:12px;background:#0b131b;border-radius:5px;padding:4px;position:relative">
            <i id="ag-seg" style="position:absolute;top:4px;bottom:4px;left:4px;width:calc(50% - 4px);background:var(--red);border-radius:4px"></i>
            <div style="flex:1;text-align:center;padding:10px;font-family:var(--cond);font-weight:700;font-size:22px;letter-spacing:.08em;position:relative">SURVOLER</div>
            <div style="flex:1;text-align:center;padding:10px;font-family:var(--cond);font-weight:700;font-size:22px;letter-spacing:.08em;position:relative">VERROUILLER</div>
          </div>
        </div>
        <div class="panel" style="flex:1;padding:18px 22px">
          <div class="lbl" style="font-size:15px">Délai avant verrouillage</div>
          <div style="display:flex;align-items:center;gap:16px;margin-top:20px">
            <div style="flex:1;height:6px;border-radius:3px;background:#ffffff14;position:relative"><i id="ag-sl" style="position:absolute;left:0;top:0;bottom:0;width:50%;background:var(--red);border-radius:3px"></i><i id="ag-knob" style="position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:#fff"></i></div>
            <div style="font-family:var(--mono);font-size:24px;width:80px;text-align:right"><span id="ag-delay">2,5</span> s</div>
          </div>
        </div>
      </div>
      <div class="lbl" style="margin-top:28px;font-size:15px">Agent par carte</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:12px">
        ${PER_MAP.map(([m, a]) => `
          <div class="ag-map" style="position:relative;height:150px;border-radius:8px;overflow:hidden;background:#0b131b url(${mapList(m)}) center/cover;border:1px solid var(--line)">
            <div style="position:absolute;inset:0;background:linear-gradient(90deg,#0b131bee 20%,#0b131b44)"></div>
            <div style="position:absolute;left:20px;top:50%;transform:translateY(-50%);font-family:var(--display);font-size:38px;letter-spacing:.03em">${m.toUpperCase()}</div>
            <img class="ag-ic" src="${agentIcon(a)}" style="position:absolute;right:16px;top:50%;width:90px;height:90px;margin-top:-45px;border-radius:8px;border:2px solid var(--red);background:#0b131b">
          </div>`).join('')}
      </div>
    </div>
  </div>
  <div id="ag-b" style="position:absolute;inset:0;overflow:hidden">
    <div id="ag-splash" style="position:absolute;inset:-40px;background:url(${mapSplash('ascent')}) center/cover;filter:brightness(.32) saturate(.8)"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,#0b131bf5 0%,#0b131baa 45%,transparent 100%)"></div>
    <div id="ag-found" style="position:absolute;left:0;right:0;top:120px;height:120px;background:var(--red);display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:84px;letter-spacing:.12em;color:#fff;box-shadow:0 0 80px #ff465599">PARTIE TROUVÉE</div>
    <img id="ag-port" src="${agentPortrait('jett')}" style="position:absolute;right:40px;top:120px;height:1100px;filter:drop-shadow(0 0 50px #000)">
    <div style="position:absolute;left:150px;top:330px">
      <div class="kicker" id="ag-mapk">ASCENT · COMPÉTITION</div>
      <div id="ag-name" style="font-family:var(--display);font-size:250px;line-height:1;margin-top:10px">JETT</div>
      <div style="display:flex;align-items:center;gap:34px;margin-top:20px">
        <svg width="150" height="150" viewBox="0 0 150 150" id="ag-ring">
          <circle cx="75" cy="75" r="64" fill="none" stroke="#ffffff1a" stroke-width="10"/>
          <circle id="ag-ringc" cx="75" cy="75" r="64" fill="none" stroke="#ff4655" stroke-width="10" stroke-linecap="round" transform="rotate(-90 75 75)" stroke-dasharray="402.1" stroke-dashoffset="0"/>
          <text id="ag-count" x="75" y="88" text-anchor="middle" fill="#fff" style="font-family:var(--mono);font-size:38px">2,5</text>
        </svg>
        <div>
          <div class="lbl" id="ag-stl">Survol</div>
          <div id="ag-state" style="font-family:var(--cond);font-weight:700;font-size:46px;letter-spacing:.08em">JETT PRÉSÉLECTIONNÉE…</div>
        </div>
      </div>
    </div>
    <div id="ag-stamp" style="position:absolute;left:150px;top:830px;padding:14px 34px;border:5px solid var(--win);color:var(--win);font-family:var(--display);font-size:80px;letter-spacing:.14em;transform:rotate(-4deg);display:flex;align-items:center;gap:20px;background:#3ddc9712">
      <span style="width:66px;height:66px;display:block">${icon('lock', 2.4)}</span>VERROUILLÉ
    </div>
  </div>
`);

// ---------- 8. Partie en direct ----------
const PLAYERS = [
  ['jett', 'Nova', 22, '21,4 / 13,8 / 4,1', '1,55', 31],
  ['omen', 'Zephyr', 21, '15,2 / 14,6 / 8,9', '1,04', 22],
  ['sova', 'Kaito', 20, '14,8 / 13,1 / 10,3', '1,13', 19],
  ['killjoy', 'Mira', 22, '17,9 / 12,7 / 5,6', '1,41', 27],
  ['reyna', 'Solen', 23, '22,6 / 16,0 / 3,2', '1,41', 34],
];
scene('live', `
  ${featBlock('05', 'PARTIE EN DIRECT', ['Connais', '<em>ton lobby.</em>'],
    'Agent, niveau, rang, meilleur rang et <b>K/D/A moyen, K/D et HS % sur les 3 derniers matchs</b> de chaque joueur.',
    ['Choix manuel', 'Bouton d\'esquive', ['Profils TRN', 'teal']])}
  <div id="lv-head" style="position:absolute;left:880px;top:170px;width:880px;display:flex;align-items:flex-end;justify-content:space-between">
    <div><div class="lbl">Sélection d'agent · Ascent</div><div style="font-family:var(--display);font-size:60px;line-height:1.1">TON ÉQUIPE</div></div>
    <div style="display:flex;gap:12px"><span class="btn ghost" style="font-size:20px;padding:12px 22px">Esquiver</span><span class="btn" style="font-size:20px;padding:12px 22px">Verrouiller</span></div>
  </div>
  <div style="position:absolute;left:880px;top:300px;width:880px">
    <div style="display:grid;grid-template-columns:270px 150px 1fr 80px 110px;gap:0 12px;padding:0 20px 10px" class="lbl lv-cols">
      <div style="font-size:14px">Joueur</div><div style="font-size:14px">Rang</div><div style="font-size:14px">K/D/A moy.</div><div style="font-size:14px">K/D</div><div style="font-size:14px">HS %</div>
    </div>
    ${PLAYERS.map(([a, n, r, kda, kd, hs], i) => `
      <div class="panel lv-row" style="display:grid;grid-template-columns:270px 150px 1fr 80px 110px;gap:0 12px;align-items:center;height:104px;padding:0 20px;margin-bottom:12px;position:relative;${i === 0 ? 'border-color:#ff465588;background:linear-gradient(90deg,#ff465522,var(--panel))' : ''}">
        <div style="display:flex;align-items:center;gap:16px">
          <img src="${agentIcon(a)}" style="width:66px;height:66px;border-radius:6px;background:#0b131b">
          <div><div style="font-family:var(--cond);font-weight:700;font-size:28px;display:flex;align-items:center;gap:10px">${n} ${trn()}</div><div class="muted" style="font-size:16px">Niveau ${[214, 187, 96, 302, 155][i]}</div></div>
        </div>
        <div class="rank" style="font-size:20px"><img src="${rankIcon(r)}">${['ASC 2', 'ASC 1', 'DIA 3', 'ASC 2', 'ASC 3'][i]}</div>
        <div style="font-family:var(--mono);font-size:17px;white-space:nowrap">${kda}</div>
        <div style="font-family:var(--cond);font-weight:700;font-size:28px;color:${parseFloat(kd.replace(',', '.')) >= 1.3 ? 'var(--win)' : 'var(--text)'}">${kd}</div>
        <div><div style="font-family:var(--cond);font-weight:700;font-size:24px">${hs} %</div><div class="bar" style="margin-top:6px"><i class="lv-hs" style="width:${hs * 2.5}%"></i></div></div>
      </div>`).join('')}
  </div>
`);

// ---------- 9. Statistiques ----------
const RR = [22, 38, 31, 49, 64, 58, 76, 71, 90, 84, 97, 112, 106, 124];
scene('stats', `
  ${featBlock('06', 'STATISTIQUES', ['Façon', '<em>tracker.</em>'],
    'Par acte et par mode : K/D, ACS, ADR, HS %, KAST, first bloods, 3K/4K/ACE, <b>évolution du RR</b> et stats par agent, carte et arme.',
    ['Synchro en arrière-plan', ['Ouverture instantanée', 'teal']])}
  <div style="position:absolute;left:880px;top:170px;width:880px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
    ${[['K/D', 1.34, 2, 'var(--win)'], ['ACS', 247, 0, 'var(--text)'], ['HS %', 28.4, 1, 'var(--gold)'], ['ADR', 158, 0, 'var(--text)'], ['KAST', 74, 0, 'var(--teal)'], ['First bloods', 63, 0, 'var(--red)']].map(([l, v, d, c]) => `
      <div class="card-ui st-tile" style="position:relative;height:150px;padding:22px 26px">
        <div class="lbl" style="font-size:16px">${l}</div>
        <div class="val st-cnt" data-to="${v}" data-d="${d}" style="font-size:66px;color:${c};line-height:1.15">0</div>
      </div>`).join('')}
  </div>
  <div class="card-ui" id="sa-chart" style="left:880px;top:530px;width:880px;height:380px;padding:24px 28px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div class="lbl" style="font-size:16px">Évolution du RR · Compétition</div><div style="font-family:var(--display);font-size:36px">ACTE EN COURS</div></div>
      <div style="font-family:var(--cond);font-weight:700;font-size:34px;color:var(--win)" id="sa-delta">+0 RR</div>
    </div>
    <svg width="824" height="250" viewBox="0 0 824 250" style="margin-top:10px;overflow:visible">
      <defs><linearGradient id="sa-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4655" stop-opacity=".35"/><stop offset="1" stop-color="#ff4655" stop-opacity="0"/></linearGradient></defs>
      ${[0, 1, 2, 3].map((i) => `<line x1="0" x2="824" y1="${20 + i * 70}" y2="${20 + i * 70}" stroke="#ffffff10"/>`).join('')}
      ${(() => {
        const pts = RR.map((v, i) => [i * (824 / (RR.length - 1)), 230 - v * 1.6]);
        const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
        return `<path id="sa-area" d="${d} L824 250 L0 250 Z" fill="url(#sa-fill)"/>
          <path id="sa-line" d="${d}" fill="none" stroke="#ff4655" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" style="filter:drop-shadow(0 0 8px #ff4655)"/>
          ${pts.map((p) => `<circle class="sa-pt" cx="${p[0]}" cy="${p[1]}" r="6" fill="#0f1923" stroke="#ff4655" stroke-width="3"/>`).join('')}`;
      })()}
    </svg>
  </div>
`);

// ---------- 10. Historique ----------
const MATCHES = [
  ['win', 'ascent', 'jett', '13 - 9', '24 / 15 / 6', 298, 'Compétition'],
  ['loss', 'bind', 'raze', '10 - 13', '17 / 16 / 4', 231, 'Compétition'],
  ['win', 'lotus', 'jett', '13 - 5', '21 / 9 / 7', 312, 'Compétition'],
  ['win', 'haven', 'sova', '13 - 11', '16 / 14 / 12', 219, 'Non classé'],
  ['loss', 'split', 'reyna', '8 - 13', '19 / 17 / 2', 254, 'Vélocité'],
];
scene('history', `
  ${featBlock('07', 'HISTORIQUE', ['Tes 15', '<em>derniers matchs.</em>'],
    'Filtrables par mode, avec score, K/D/A, ACS, stats globales et <b>tableau des scores dépliable.</b>',
    ['Filtre par mode', ['Tableau des scores', 'teal']])}
  <div id="hi-filters" style="position:absolute;left:880px;top:180px;display:flex;gap:30px;font-family:var(--cond);font-weight:700;font-size:24px;letter-spacing:.1em">
    <span class="hi-f">TOUS</span><span class="hi-f">COMPÉTITION</span><span class="hi-f">NON CLASSÉ</span><span class="hi-f">VÉLOCITÉ</span>
    <i id="hi-ul" style="position:absolute;left:0;bottom:-10px;height:3px;background:var(--red);width:60px"></i>
  </div>
  <div style="position:absolute;left:880px;top:250px;width:880px">
    ${MATCHES.map(([res, m, a, sc, kda, acs, q]) => `
      <div class="hi-row" style="position:relative;height:118px;margin-bottom:14px;border-radius:8px;overflow:hidden;background:#0b131b url(${mapList(m)}) center/cover;border:1px solid var(--line)">
        <div style="position:absolute;inset:0;background:linear-gradient(90deg,${res === 'win' ? '#0f2a24f2' : '#2a1016f2'} 0%,#0b131be6 50%,#0b131bb3 100%)"></div>
        <div style="position:absolute;left:0;top:0;bottom:0;width:6px;background:${res === 'win' ? 'var(--win)' : 'var(--loss)'}"></div>
        <div style="position:absolute;inset:0;display:grid;grid-template-columns:110px 220px 180px 1fr 110px;align-items:center;padding:0 26px 0 28px">
          <img src="${agentIcon(a)}" style="width:76px;height:76px;border-radius:6px">
          <div><div style="font-family:var(--cond);font-weight:700;font-size:28px;color:${res === 'win' ? 'var(--win)' : 'var(--loss)'}">${res === 'win' ? 'VICTOIRE' : 'DÉFAITE'}</div><div class="muted" style="font-size:17px">${m[0].toUpperCase() + m.slice(1)} · ${q}</div></div>
          <div style="font-family:var(--display);font-size:44px">${sc}</div>
          <div><div class="lbl" style="font-size:14px">K / D / A</div><div style="font-family:var(--cond);font-weight:700;font-size:28px">${kda}</div></div>
          <div style="text-align:right"><div class="lbl" style="font-size:14px">ACS</div><div style="font-family:var(--cond);font-weight:700;font-size:28px">${acs}</div></div>
        </div>
      </div>`).join('')}
  </div>
`);

// ---------- 11. Groupe & amis ----------
const FRIENDS = [
  ['reyna', 'Solen', 'En partie · Ascent · 7 - 5', 'var(--red)'],
  ['sage', 'Lune', 'En sélection d\'agent', 'var(--gold)'],
  ['viper', 'Orka', 'Dans les menus', 'var(--win)'],
  ['phoenix', 'Blaze', 'En partie · Lotus · 3 - 9', 'var(--red)'],
];
scene('party', `
  ${featBlock('08', 'GROUPE & AMIS', ['Ton squad,', '<em>à portée.</em>'],
    'Change de mode, <b>lance ou annule la recherche</b>, ouvre ou ferme le groupe. Vois où en sont tes amis en ligne.',
    ['Recherche', 'Groupe ouvert / fermé', ['Amis en ligne', 'teal']])}
  <div class="card-ui" id="pa-group" style="left:880px;top:170px;width:430px;height:740px;padding:30px">
    <div class="lbl">Groupe</div>
    <div style="font-family:var(--display);font-size:48px;line-height:1.1">3 / 5 JOUEURS</div>
    ${[['jett', 'Nova', 'Chef'], ['omen', 'Zephyr', ''], ['killjoy', 'Mira', '']].map(([a, n, c]) => `
      <div class="panel pa-mem" style="display:flex;align-items:center;gap:16px;padding:14px 16px;margin-top:16px;background:var(--panel-2)">
        <img src="${agentIcon(a)}" style="width:64px;height:64px;border-radius:6px">
        <div style="flex:1"><div style="font-family:var(--cond);font-weight:700;font-size:28px">${n}</div><div class="muted" style="font-size:16px">${c || 'Membre'}</div></div>
        ${trn()}
      </div>`).join('')}
    <div class="panel" style="margin-top:22px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;background:#0b131b">
      <span class="lbl" style="font-size:15px">Mode</span><span style="font-family:var(--cond);font-weight:700;font-size:24px">COMPÉTITION ▾</span>
    </div>
    <div id="pa-btn" class="btn" style="display:flex;margin-top:26px;width:100%;height:78px;position:relative;overflow:hidden">
      <span id="pa-btn1">Lancer la recherche</span>
      <span id="pa-btn2" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:14px;background:#0b131b;color:var(--text);border:2px solid var(--red);border-radius:4px">
        <i id="pa-spin" style="width:26px;height:26px;border:3px solid #ff465544;border-top-color:var(--red);border-radius:50%;display:block"></i>RECHERCHE… <span id="pa-q" style="font-family:var(--mono)">0:00</span>
      </span>
    </div>
  </div>
  <div class="card-ui" id="pa-friends" style="left:1340px;top:170px;width:420px;height:740px;padding:30px">
    <div class="lbl">Amis en ligne</div>
    <div style="font-family:var(--display);font-size:48px;line-height:1.1">4 EN LIGNE</div>
    ${FRIENDS.map(([a, n, s, c]) => `
      <div class="pa-fr" style="display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid var(--line)">
        <div style="position:relative"><img src="${agentIcon(a)}" style="width:62px;height:62px;border-radius:6px"><i style="position:absolute;right:-4px;top:-4px;width:16px;height:16px;border-radius:50%;background:${c};border:3px solid var(--panel);box-shadow:0 0 8px ${c}"></i></div>
        <div style="flex:1;min-width:0"><div style="font-family:var(--cond);font-weight:700;font-size:26px">${n}</div><div style="font-size:17px;color:${c === 'var(--win)' ? 'var(--muted)' : c}">${s}</div></div>
      </div>`).join('')}
  </div>
`);

// ---------- 12. Collection ----------
const COLL = [
  ['d8d5d7a1-4d81-8560-54bc-0692ab40f69b', 'Vandal Kuronami', 'exclusive', 1],
  ['9877d50b-43b1-837a-802a-bf8a3b98e2dd', 'Phantom Protocole 781-A', 'ultra', 0],
  ['3f6410af-4fd7-74fb-c0f4-6ab61d30022c', 'Phantom Kuronami', 'exclusive', 1],
  ['e5490f71-455b-74ad-f762-f5a876d4dff9', 'Vandal RGX 11z Pro', 'exclusive', 0],
  ['0eec6f2b-4d64-9c16-7846-b8865030f61c', 'Sheriff Kuronami', 'exclusive', 1],
  ['74789f33-4632-8052-96d7-258538721a32', 'Vandal Glitchpop', 'exclusive', 0],
  ['a709ad22-45d5-0b51-5de2-85ad5c5ca405', 'Operator Kuronami', 'exclusive', 1],
  ['596ce51d-40e3-dc21-b02d-b08d070a7883', 'Vandal Ion', 'premium', 0],
  ['36791b03-452d-8dad-0091-898cc28d2196', 'Phantom Oni', 'premium', 0],
];
scene('collection', `
  ${featBlock('09', 'COLLECTION', ['Tous', '<em>tes skins.</em>'],
    'Toute ta collection, <b>triée par rareté</b>, avec une recherche instantanée.',
    ['Tri par rareté', ['Recherche', 'teal']])}
  <div class="panel" id="co-search" style="position:absolute;left:880px;top:170px;width:880px;height:74px;display:flex;align-items:center;gap:16px;padding:0 24px;background:#0b131b">
    <span style="width:30px;height:30px;display:block;color:var(--muted)">${icon('search')}</span>
    <span id="co-q" style="font-size:28px;font-weight:500"></span><i id="co-caret" style="width:2px;height:32px;background:var(--red)"></i>
    <span class="muted" style="margin-left:auto;font-family:var(--mono);font-size:20px"><span id="co-n">142</span> skins</span>
  </div>
  <div style="position:absolute;left:880px;top:270px;width:880px;height:640px">
    ${COLL.map(([id, n, r, k], i) => `
      <div class="card-ui co-it" data-k="${k}" style="left:${(i % 3) * 296}px;top:${Math.floor(i / 3) * 214}px;width:280px;height:198px;background:linear-gradient(160deg,${RARITY[r]}22,var(--panel) 60%)">
        <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${RARITY[r]}"></div>
        <img src="${skin(id)}" style="position:absolute;left:24px;right:24px;top:26px;width:calc(100% - 48px);height:100px;object-fit:contain;filter:drop-shadow(0 10px 14px #000a)">
        <div style="position:absolute;left:22px;bottom:18px;font-family:var(--cond);font-weight:700;font-size:22px">${n}</div>
      </div>`).join('')}
  </div>
`);

// ---------- 13. Utilisation ----------
const STEPS = [
  ['download', 'Télécharge', 'Prends l\'installeur sur <b>GitHub Releases</b>.'],
  ['play', 'Lance Valorant', 'Connecte-toi au <b>Riot Client</b>, comme d\'habitude.'],
  ['bolt', 'Ouvre l\'app', 'Ton compte est <b>lié automatiquement</b>. C\'est tout.'],
];
scene('howto', `
  <div style="position:absolute;left:0;right:0;top:150px;text-align:center">
    <div class="kicker" style="justify-content:center">UTILISATION</div>
    <div class="title" style="margin-top:16px">${line('Prêt en <em>3 étapes.</em>')}</div>
  </div>
  <svg width="1920" height="1080" style="position:absolute;left:0;top:0"><path id="ht-line" d="M390 560 H1530" stroke="#ff4655" stroke-width="3" stroke-dasharray="8 10" fill="none"/></svg>
  ${STEPS.map(([ic, t, d], i) => `
    <div class="ht-step" style="position:absolute;left:${170 + i * 570}px;top:440px;width:440px;text-align:center">
      <div class="ht-badge" style="width:240px;height:240px;margin:0 auto;position:relative">
        <div style="position:absolute;inset:0;background:var(--panel);border:2px solid #ff465588;transform:rotate(45deg);border-radius:18px;box-shadow:0 0 50px #ff465533"></div>
        <div style="position:absolute;inset:0;display:grid;place-items:center;color:var(--red)"><span style="width:90px;height:90px;display:block">${icon(ic, 2)}</span></div>
        <div style="position:absolute;right:-6px;top:-6px;width:64px;height:64px;border-radius:50%;background:var(--red);display:grid;place-items:center;font-family:var(--display);font-size:36px;color:#fff;box-shadow:0 0 20px #ff4655aa">${i + 1}</div>
      </div>
      <div style="font-family:var(--display);font-size:62px;text-transform:uppercase;margin-top:56px">${t}</div>
      <div class="lead" style="font-size:27px;margin-top:10px">${d}</div>
    </div>`).join('')}
  <div id="ht-strip" style="position:absolute;left:0;right:0;top:940px;display:flex;justify-content:center;gap:18px">
    <span class="chip">Mises à jour automatiques</span><span class="chip">Lancement au démarrage</span><span class="chip">Notifications Windows</span><span class="chip teal">Version portable</span>
  </div>
`);

// ---------- 14. Outro ----------
scene('outro', `
  <div class="center" id="ou-logo" style="top:330px"><img src="../renderer/logo-full.png" style="width:1000px;filter:drop-shadow(0 0 40px #ff465555)"></div>
  <div class="center" id="ou-free" style="top:560px;font-family:var(--display);font-size:78px;text-transform:uppercase;white-space:nowrap">Gratuit <span style="color:var(--red)">&amp;</span> open source</div>
  <div class="center" id="ou-url" style="top:690px;white-space:nowrap;display:flex;align-items:center;gap:18px;padding:22px 36px;border:1px solid #ff465588;background:#ff465514;font-family:var(--mono);font-size:36px">
    <span style="width:36px;height:36px;display:block;color:var(--red)">${icon('download', 2.2)}</span>github.com/NOUSSS/precise-gunplay
  </div>
  <div class="center" id="ou-disc" style="top:880px;font-size:20px;color:#6f7e8b;white-space:nowrap;letter-spacing:.04em">Projet non officiel, ni approuvé ni affilié à Riot Games. Images : valorant-api.com</div>
  <div id="ou-black" style="position:absolute;inset:0;background:#000;opacity:0"></div>
`);

// Fond : éclats rouges qui dérivent
$('#bg-shards').innerHTML = [
  [1500, 120, 260, 18, .5], [1640, 170, 120, 8, .35], [120, 920, 300, 14, .35], [260, 960, 90, 8, .5], [1700, 880, 200, 30, .18], [60, 160, 140, 6, .3],
].map(([x, y, w, h, o], i) => `<div class="shard bgs" data-i="${i}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;opacity:${o}"></div>`).join('');

// ================= Timeline =================
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', duration: 0.6 } });
const CUES = []; // repères pour la bande-son : { t, kind }
const cue = (t, kind) => CUES.push({ t: +t.toFixed(3), kind });

function showScene(id) {
  const [a, b] = T[id];
  tl.set(`#${id}`, { autoAlpha: 1 }, a);
  tl.set(`#${id}`, { autoAlpha: 0 }, b);
}

// Transition par volet diagonal : l'écran est entièrement couvert à l'instant t
function wipe(t) {
  tl.fromTo('#wipe .w1', { x: -3400 }, { x: -440, duration: 0.3, ease: 'power2.in', immediateRender: false }, t - 0.32);
  tl.fromTo('#wipe .w2', { x: -3400 }, { x: -440, duration: 0.3, ease: 'power2.in', immediateRender: false }, t - 0.28);
  tl.to('#wipe .w2', { x: 2500, duration: 0.34, ease: 'power2.out' }, t + 0.02);
  tl.to('#wipe .w1', { x: 2500, duration: 0.36, ease: 'power2.out' }, t + 0.08);
  tl.fromTo('#wipe .w3', { x: -800 }, { x: 2600, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, t - 0.3);
  cue(t - 0.32, 'whoosh');
}
gsap.set('#wipe .w', { x: -3400 });
gsap.set('#wipe .w1, #wipe .w2', { width: 2800 });

// Entrée standard d'un bloc titre de fonctionnalité
function featIn(root, t) {
  const r = $(`#${root}`);
  tl.fromTo(r.querySelector('.feat .num'), { x: -80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.2 }, t);
  tl.fromTo(r.querySelector('.feat .kicker'), { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1 }, t + 0.1);
  tl.fromTo(r.querySelectorAll('.feat .title .mask > span'), { yPercent: 110 }, { yPercent: 0, stagger: 0.1, duration: 0.7, ease: 'power4.out' }, t + 0.15);
  tl.fromTo(r.querySelector('.feat .lead'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, t + 0.45);
  tl.fromTo(r.querySelectorAll('.feat .chip'), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.4 }, t + 0.7);
}
// Sortie légère avant la transition
function sceneOut(id, t) {
  tl.to(`#${id} > *:not(.pkt)`, { x: -40, duration: 0.4, ease: 'power2.in', stagger: 0.02 }, t - 0.45);
}
// Compteur
function count(el, to, t, dur = 1.2, dec = 0, suffix = '') {
  const o = { v: 0 };
  tl.fromTo(o, { v: 0 }, {
    v: to, duration: dur, ease: 'power2.out', immediateRender: false,
    onUpdate: () => { el.textContent = fr(o.v, dec) + suffix; },
  }, t);
  el.textContent = fr(0, dec) + suffix;
}
// Curseur : positions mesurées sur la mise en page (avant toute transformation)
const P = {};
function measure(key, sel) {
  const el = typeof sel === 'string' ? $(sel) : sel;
  const r = el.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  P[key] = { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
}
function cursorPath(points) {
  // points : [t, x, y, click?]
  const [t0, x0, y0] = points[0];
  tl.set('#cursor', { x: x0, y: y0 }, t0);
  tl.fromTo('#cursor', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: false }, t0);
  for (let i = 1; i < points.length; i++) {
    const [t, x, y, click] = points[i];
    const tp = points[i - 1][0];
    tl.to('#cursor', { x, y, duration: t - tp - 0.05, ease: 'power2.inOut' }, tp + 0.05);
    if (click) {
      tl.to('#cursor', { scale: 0.8, duration: 0.08, yoyo: true, repeat: 1, ease: 'none' }, t);
      tl.fromTo('#cursor-ring', { x, y, scale: 0.3, autoAlpha: 1 }, { scale: 1.6, autoAlpha: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, t);
      cue(t, 'click');
    }
  }
}
// Remplace un texte à l'instant t (réversible quand on revient en arrière)
function textAt(el, t, before, after) {
  const o = { v: 0 };
  el.textContent = before;
  tl.fromTo(o, { v: 0 }, { v: 1, duration: 0.001, immediateRender: false, onUpdate: () => { el.textContent = o.v > 0.5 ? after : before; } }, t);
}
const cursorHide = (t) => tl.to('#cursor', { autoAlpha: 0, duration: 0.2 }, t);

function build() {
  gsap.set('.center', { xPercent: -50, yPercent: -50 });
  gsap.set('#cursor', { xPercent: -8, yPercent: -8, transformOrigin: '10% 10%' });
  gsap.set('#cursor-ring', { autoAlpha: 0 });

  // Mesures avant animations
  measure('agSw', '#ag-sw');
  const seg = $('#ag-seg').parentElement;
  const sr = seg.getBoundingClientRect(), st = stage.getBoundingClientRect();
  P.agSeg2 = { x: sr.left - st.left + sr.width * 0.75, y: sr.top - st.top + sr.height / 2 };
  measure('paBtn', '#pa-btn');
  measure('coSearch', '#co-search');

  // ----- Fond permanent -----
  tl.fromTo('#bg-grid', { y: 0, x: 0 }, { y: 80, x: -80, duration: DURATION, ease: 'none' }, 0);
  $$('.bgs').forEach((el, i) => {
    tl.fromTo(el, { x: 0 }, { x: (i % 2 ? 1 : -1) * (160 + i * 40), duration: DURATION, ease: 'none' }, 0);
  });
  tl.fromTo('#bg-grid, #bg-glow, #bg-dots, #bg-shards', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: 'power1.out' }, 0.2);
  tl.fromTo('#hud', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 3.6);
  tl.fromTo('#hud-bar i', { scaleX: 0 }, { scaleX: 1, duration: DURATION - 3.6, ease: 'none' }, 3.6);
  tl.to('#hud', { autoAlpha: 0, duration: 0.6 }, T.outro[0] + 0.2);

  // ----- 1. Intro -----
  showScene('intro');
  tl.fromTo('#in-h', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'expo.out' }, 0.1);
  tl.fromTo('#in-v', { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: 'expo.out' }, 0.2);
  tl.fromTo('#in-s1', { x: -1400 }, { x: 0, duration: 0.5, ease: 'expo.out' }, 0.35);
  tl.fromTo('#in-s2', { x: 1400 }, { x: 0, duration: 0.5, ease: 'expo.out' }, 0.45);
  tl.fromTo('#in-s3', { y: -1200 }, { y: 0, duration: 0.45, ease: 'expo.out' }, 0.5);
  cue(0.35, 'riser');
  tl.fromTo('#in-logo', { scale: 3.2, autoAlpha: 0, filter: 'blur(20px)' }, { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 0.45, ease: 'expo.in' }, 0.55);
  tl.fromTo('#flash', { opacity: 0.9 }, { opacity: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, 1.0);
  tl.to('#in-logo', { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.out' }, 1.0);
  cue(1.0, 'impact');
  tl.to('#in-s1', { x: -300, autoAlpha: 0.25, scaleY: 0.2, duration: 1, ease: 'power3.inOut' }, 1.0);
  tl.to('#in-s2', { x: 300, autoAlpha: 0.25, scaleY: 0.2, duration: 1, ease: 'power3.inOut' }, 1.0);
  tl.to('#in-s3', { autoAlpha: 0, scaleX: 0, duration: 0.5 }, 1.0);
  tl.to('#in-h, #in-v', { autoAlpha: 0.25, duration: 1 }, 1.2);
  tl.fromTo('#in-w1 .l1', { yPercent: 120, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.05, duration: 0.6, ease: 'back.out(2)' }, 1.3);
  tl.fromTo('#in-w2 .l2', { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, stagger: 0.05, duration: 0.4 }, 1.7);
  tl.fromTo('#in-w2', { letterSpacing: '0.2em' }, { letterSpacing: '0.62em', duration: 1.4, ease: 'power3.out' }, 1.7);
  tl.fromTo('#in-tag', { autoAlpha: 0, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power2.inOut' }, 2.4);
  tl.to('#in-logo', { y: -20, duration: 2.5, ease: 'sine.inOut' }, 2.2);
  tl.to('#in-word, #in-tag, #in-logo', { scale: 1.08, autoAlpha: 0, duration: 0.45, ease: 'power2.in', stagger: 0.04 }, 4.85);
  wipe(T.intro[1]);

  // ----- 2. Accroche -----
  showScene('hook');
  const h0 = T.hook[0];
  tl.fromTo('#hk-agent', { x: 300, autoAlpha: 0 }, { x: 0, autoAlpha: 0.9, duration: 4, ease: 'power2.out' }, h0);
  ['#hk1', '#hk2', '#hk3'].forEach((s, i) => {
    const t = h0 + 0.2 + i * 1.0;
    tl.fromTo(s, { scale: 1.6, autoAlpha: 0, filter: 'blur(14px)', x: -40 }, { scale: 1, autoAlpha: 1, filter: 'blur(0px)', x: 0, duration: 0.35, ease: 'power4.out' }, t);
    tl.to('#scenes', { x: 8, duration: 0.04, yoyo: true, repeat: 3, ease: 'none' }, t + 0.1);
    cue(t, 'hit');
  });
  tl.set('#hk1, #hk2, #hk3, #hk4', { transformOrigin: '0% 50%' }, 0);
  tl.fromTo('#hk4', { autoAlpha: 0, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power3.inOut' }, h0 + 3.2);
  cue(h0 + 3.2, 'impact');
  tl.to('#hk-lines', { x: -30, duration: 4.5, ease: 'none' }, h0);
  wipe(T.hook[1]);

  // ----- 3. Liaison -----
  showScene('link');
  const l0 = T.link[0];
  featIn('link', l0 + 0.1);
  tl.fromTo('#lk-riot', { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.8)' }, l0 + 0.6);
  const p1 = $('#lk-p1'), p2 = $('#lk-p2');
  const L1 = p1.getTotalLength(), L2 = p2.getTotalLength();
  tl.fromTo(p1, { strokeDasharray: `${L1} ${L1}`, strokeDashoffset: L1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, l0 + 1.1);
  tl.fromTo('#lk-file', { x: 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5 }, l0 + 1.6);
  tl.fromTo('#lk-path', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'steps(28)' }, l0 + 1.9);
  tl.fromTo(p2, { strokeDasharray: `${L2} ${L2}`, strokeDashoffset: L2 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, l0 + 3.0);
  tl.fromTo('#lk-app', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, l0 + 3.3);
  tl.fromTo('#lk-status', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, l0 + 3.9);
  tl.fromTo('#lk-check', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2.5)' }, l0 + 3.9);
  cue(l0 + 3.9, 'ding');
  // Paquets de données le long des câbles
  const pk = $$('#link .pkt');
  const along = (el, path, len, t, dur) => {
    const o = { p: 0 };
    tl.fromTo(o, { p: 0 }, {
      p: 1, duration: dur, ease: 'power1.inOut', immediateRender: false,
      onUpdate: () => { const pt = path.getPointAtLength(o.p * len); gsap.set(el, { x: pt.x, y: pt.y }); },
    }, t);
    tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, immediateRender: false }, t);
    tl.to(el, { autoAlpha: 0, duration: 0.1 }, t + dur - 0.1);
  };
  gsap.set(pk, { autoAlpha: 0 });
  along(pk[0], p1, L1, l0 + 1.9, 0.8); along(pk[0], p1, L1, l0 + 4.4, 0.8);
  along(pk[1], p2, L2, l0 + 3.2, 0.6); along(pk[1], p2, L2, l0 + 5.1, 0.6);
  sceneOut('link', T.link[1]);
  wipe(T.link[1]);

  // ----- 4. Interface -----
  showScene('app');
  const a0 = T.app[0];
  tl.fromTo('#app .kicker', { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1 }, a0 + 0.2);
  tl.fromTo('#app .title .mask > span', { yPercent: 110 }, { yPercent: 0, stagger: 0.1, duration: 0.7, ease: 'power4.out' }, a0 + 0.25);
  tl.fromTo('#app .lead', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, a0 + 0.7);
  tl.fromTo('#ap-win', { rotationY: -40, rotationX: 18, z: -500, x: 400, autoAlpha: 0 }, { rotationY: -12, rotationX: 4, z: 0, x: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out' }, a0 + 0.1);
  tl.to('#ap-win', { rotationY: -6, rotationX: 2, duration: 4, ease: 'sine.inOut' }, a0 + 1.3);
  tl.fromTo('#ap-nav .ap-it', { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.05, duration: 0.4 }, a0 + 0.6);
  tl.fromTo('#ap-content .ap-sk', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.5 }, a0 + 0.8);
  tl.fromTo('#ap-content .ap-sh', { xPercent: -100 }, { xPercent: 100, duration: 1.4, ease: 'none', stagger: 0.08 }, a0 + 1.2);
  tl.fromTo('#ap-hl', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, a0 + 1.2);
  // La surbrillance parcourt les pages
  const items = $$('#ap-nav .nav-item');
  const itemTop = (el) => el.offsetTop;
  items.forEach((el, i) => {
    const t = a0 + 1.4 + i * 0.3;
    tl.to('#ap-hl', { y: itemTop(el) - itemTop(items[0]), duration: 0.22, ease: 'power2.out' }, t);
    tl.to(el, { color: '#ece8e1', duration: 0.1 }, t);
    if (i < items.length - 1) tl.to(el, { color: '#8a99a6', duration: 0.2 }, t + 0.3);
    if (i % 2 === 0) cue(t, 'tick');
  });
  sceneOut('app', T.app[1]);
  wipe(T.app[1]);

  // ----- 5. Accueil -----
  showScene('home');
  const hm = T.home[0];
  featIn('home', hm + 0.1);
  tl.fromTo('#hm-banner', { x: 120, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out' }, hm + 0.3);
  tl.fromTo('#hm-banner', { backgroundPosition: '40% 50%' }, { backgroundPosition: '60% 50%', duration: 5.5, ease: 'none' }, hm + 0.3);
  count($('#hm-lvl'), 214, hm + 0.6, 1.2);
  tl.fromTo('#hm-rank', { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, hm + 0.7);
  tl.fromTo('#hm-rimg', { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' }, hm + 0.9);
  count($('#hm-rr'), 64, hm + 1.0, 1.4);
  tl.fromTo('#hm-rrbar', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.out' }, hm + 1.0);
  tl.fromTo('#hm-peak', { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, hm + 0.85);
  tl.fromTo('.hm-wal', { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.5 }, hm + 1.3);
  $$('.hm-cnt').forEach((el, i) => count(el, +el.dataset.to, hm + 1.5 + i * 0.1, 1.4));
  cue(hm + 0.9, 'pop');
  sceneOut('home', T.home[1]);
  wipe(T.home[1]);

  // ----- 6. Boutique -----
  showScene('store');
  const s0 = T.store[0];
  featIn('store', s0 + 0.1);
  tl.fromTo('#st-head', { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, s0 + 0.3);
  $$('.st-card').forEach((c, i) => {
    const t = s0 + 0.5 + i * 0.14;
    tl.fromTo(c, { rotationY: -90, autoAlpha: 0, transformOrigin: '0% 50%' }, { rotationY: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out' }, t);
    tl.fromTo(c.querySelector('.st-img'), { x: 80, scale: 0.8 }, { x: 0, scale: 1, duration: 0.9, ease: 'expo.out' }, t + 0.1);
    tl.to(c.querySelector('.st-img'), { y: -8, rotation: -2, duration: 4, ease: 'sine.inOut' }, t + 1);
    cue(t, 'tick');
  });
  // Compte à rebours qui défile
  const timer = $('#st-timer');
  const base = 14 * 3600 + 32 * 60 + 8;
  const ot = { v: 0 };
  tl.fromTo(ot, { v: 0 }, {
    v: 6, duration: 6, ease: 'none', immediateRender: false,
    onUpdate: () => { const s = base - Math.floor(ot.v); timer.textContent = `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m ${String(s % 60).padStart(2, '0')}s`; },
  }, s0);
  sceneOut('store', T.store[1]);
  wipe(T.store[1]);

  // ----- 7. Agent auto -----
  showScene('agent');
  const g0 = T.agent[0];
  featIn('agent', g0 + 0.1);
  gsap.set('#ag-b', { autoAlpha: 0 });
  tl.fromTo('#ag-panel', { x: 120, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out' }, g0 + 0.3);
  tl.fromTo('.ag-map', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.45 }, g0 + 0.6);
  tl.set('.ag-ic', { scale: 0 }, 0);
  cursorPath([
    [g0 + 0.9, 1500, 1000],
    [g0 + 1.5, P.agSw.x, P.agSw.y, true],
    [g0 + 2.2, P.agSeg2.x, P.agSeg2.y, true],
    [g0 + 2.9, 1740, 700],
  ]);
  tl.to('#ag-sw i', { x: 30, duration: 0.25 }, g0 + 1.5);
  tl.to('#ag-sw b', { opacity: 1, duration: 0.25 }, g0 + 1.5);
  tl.to('#ag-seg', { xPercent: 100, duration: 0.3, ease: 'power3.inOut' }, g0 + 2.2);
  tl.fromTo('.ag-ic', { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, stagger: 0.12, duration: 0.4, ease: 'back.out(2.2)', immediateRender: false }, g0 + 2.5);
  $$('.ag-ic').forEach((_, i) => i % 2 === 0 && cue(g0 + 2.5 + i * 0.12, 'pop'));
  cursorHide(g0 + 3.4);
  // Phase B : partie trouvée
  const b0 = g0 + 4.5;
  tl.to('#ag-a', { autoAlpha: 0, scale: 0.96, duration: 0.25, ease: 'power2.in' }, b0 - 0.25);
  tl.set('#ag-b', { autoAlpha: 1 }, b0);
  tl.fromTo('#flash', { opacity: 1 }, { opacity: 0, duration: 0.5, immediateRender: false }, b0);
  cue(b0, 'alarm');
  tl.fromTo('#ag-found', { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'expo.out' }, b0);
  tl.to('#ag-found', { y: -260, duration: 0.4, ease: 'power3.in' }, b0 + 1.0);
  tl.fromTo('#ag-splash', { scale: 1.2 }, { scale: 1, duration: 5, ease: 'power1.out' }, b0);
  tl.fromTo('#ag-port', { x: 500, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out' }, b0 + 0.5);
  tl.to('#ag-port', { x: -30, duration: 4, ease: 'none' }, b0 + 1.3);
  tl.fromTo('#ag-mapk', { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1 }, b0 + 0.7);
  tl.fromTo('#ag-name', { x: -60, autoAlpha: 0, letterSpacing: '0.3em' }, { x: 0, autoAlpha: 1, letterSpacing: '0.02em', duration: 0.8, ease: 'expo.out' }, b0 + 0.8);
  tl.fromTo('#ag-ring, #ag-stl, #ag-state', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.08 }, b0 + 1.0);
  const oc = { v: 2.5 };
  const cnt = $('#ag-count');
  tl.fromTo(oc, { v: 2.5 }, {
    v: 0, duration: 2.5, ease: 'none', immediateRender: false,
    onUpdate: () => { cnt.textContent = fr(Math.max(0, oc.v), 1); },
  }, b0 + 1.2);
  tl.fromTo('#ag-ringc', { strokeDashoffset: 0 }, { strokeDashoffset: 402.1, duration: 2.5, ease: 'none' }, b0 + 1.2);
  [0, 1, 2].forEach((i) => cue(b0 + 1.2 + i * 1, 'tick'));
  const lockT = b0 + 3.7;
  tl.set('#ag-state', { color: '#3ddc97' }, lockT);
  textAt($('#ag-stl'), lockT, 'Survol', 'Verrouillage');
  textAt($('#ag-state'), lockT, 'JETT PRÉSÉLECTIONNÉE…', 'JETT VERROUILLÉE');
  tl.set('#ag-ringc', { stroke: '#3ddc97' }, lockT);
  tl.fromTo('#ag-stamp', { scale: 2.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'power4.in' }, lockT - 0.3);
  tl.fromTo('#flash', { opacity: 0.8 }, { opacity: 0, duration: 0.5, immediateRender: false }, lockT);
  tl.to('#scenes', { x: 10, duration: 0.04, yoyo: true, repeat: 5, ease: 'none' }, lockT);
  cue(lockT, 'impact');
  wipe(T.agent[1]);

  // ----- 8. Partie en direct -----
  showScene('live');
  const v0 = T.live[0];
  featIn('live', v0 + 0.1);
  tl.fromTo('#lv-head', { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, v0 + 0.3);
  tl.fromTo('#live .lv-cols', { autoAlpha: 0 }, { autoAlpha: 1 }, v0 + 0.4);
  tl.fromTo('.lv-row', { x: 200, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.1, duration: 0.6, ease: 'expo.out' }, v0 + 0.5);
  tl.fromTo('.lv-hs', { scaleX: 0 }, { scaleX: 1, stagger: 0.1, duration: 0.8 }, v0 + 1.0);
  $$('.lv-row').forEach((_, i) => i % 2 === 0 && cue(v0 + 0.5 + i * 0.1, 'tick'));
  tl.fromTo($$('.lv-row')[0], { boxShadow: '0 0 0 0 #ff465500' }, { boxShadow: '0 0 40px 0 #ff465555', duration: 0.6, yoyo: true, repeat: 3, ease: 'sine.inOut' }, v0 + 2);
  sceneOut('live', T.live[1]);
  wipe(T.live[1]);

  // ----- 9. Statistiques -----
  showScene('stats');
  const k0 = T.stats[0];
  featIn('stats', k0 + 0.1);
  tl.fromTo('.st-tile', { y: 40, autoAlpha: 0, scale: 0.9 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.07, duration: 0.5, ease: 'back.out(1.6)' }, k0 + 0.3);
  $$('.st-cnt').forEach((el, i) => count(el, +el.dataset.to, k0 + 0.5 + i * 0.07, 1.5, +el.dataset.d));
  tl.fromTo('#sa-chart', { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, k0 + 0.7);
  const ln = $('#sa-line'), LL = ln.getTotalLength();
  tl.fromTo(ln, { strokeDasharray: `${LL} ${LL}`, strokeDashoffset: LL }, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }, k0 + 1.0);
  tl.fromTo('#sa-area', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, k0 + 2.0);
  tl.fromTo('.sa-pt', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, stagger: 2 / RR.length, duration: 0.3, ease: 'back.out(3)' }, k0 + 1.0);
  const od = { v: 0 }, dl = $('#sa-delta');
  tl.fromTo(od, { v: 0 }, { v: RR[RR.length - 1] - RR[0], duration: 2, ease: 'power2.inOut', immediateRender: false, onUpdate: () => { dl.textContent = `+${Math.round(od.v)} RR`; } }, k0 + 1.0);
  sceneOut('stats', T.stats[1]);
  wipe(T.stats[1]);

  // ----- 10. Historique -----
  showScene('history');
  const y0 = T.history[0];
  featIn('history', y0 + 0.1);
  tl.fromTo('#hi-filters', { y: -20, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, y0 + 0.3);
  const fl = $$('.hi-f');
  const fx = fl.map((f) => [f.offsetLeft, f.offsetWidth]);
  tl.set('#hi-ul', { x: fx[0][0], width: fx[0][1] }, 0);
  tl.fromTo('.hi-row', { x: 160, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.08, duration: 0.55, ease: 'expo.out' }, y0 + 0.4);
  tl.to('#hi-ul', { x: fx[1][0], width: fx[1][1], duration: 0.35, ease: 'power3.inOut' }, y0 + 2.3);
  cue(y0 + 2.3, 'click');
  tl.to('.hi-row:nth-child(4), .hi-row:nth-child(5)', { autoAlpha: 0.15, x: 30, duration: 0.3 }, y0 + 2.35);
  tl.to('#hi-ul', { x: fx[0][0], width: fx[0][1], duration: 0.35, ease: 'power3.inOut' }, y0 + 3.5);
  tl.to('.hi-row:nth-child(4), .hi-row:nth-child(5)', { autoAlpha: 1, x: 0, duration: 0.3 }, y0 + 3.55);
  sceneOut('history', T.history[1]);
  wipe(T.history[1]);

  // ----- 11. Groupe & amis -----
  showScene('party');
  const q0 = T.party[0];
  featIn('party', q0 + 0.1);
  tl.fromTo('#pa-group', { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out' }, q0 + 0.3);
  tl.fromTo('#pa-friends', { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out' }, q0 + 0.45);
  tl.fromTo('.pa-mem', { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.08, duration: 0.4 }, q0 + 0.7);
  tl.fromTo('.pa-fr', { x: 30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.08, duration: 0.4 }, q0 + 0.85);
  gsap.set('#pa-btn2', { autoAlpha: 0 });
  cursorPath([[q0 + 1.4, 1500, 1040], [q0 + 2.3, P.paBtn.x + 40, P.paBtn.y + 10, true], [q0 + 3.0, P.paBtn.x + 220, P.paBtn.y + 120]]);
  tl.to('#pa-btn', { scale: 0.96, duration: 0.08, yoyo: true, repeat: 1 }, q0 + 2.3);
  tl.set('#pa-btn2', { autoAlpha: 1 }, q0 + 2.4);
  tl.fromTo('#pa-spin', { rotation: 0 }, { rotation: 1440, duration: 3, ease: 'none' }, q0 + 2.4);
  const oq = { v: 0 }, qq = $('#pa-q');
  tl.fromTo(oq, { v: 0 }, { v: 3, duration: 3, ease: 'none', immediateRender: false, onUpdate: () => { qq.textContent = `0:0${Math.floor(oq.v)}`; } }, q0 + 2.4);
  cursorHide(q0 + 3.3);
  sceneOut('party', T.party[1]);
  wipe(T.party[1]);

  // ----- 12. Collection -----
  showScene('collection');
  const c0 = T.collection[0];
  featIn('collection', c0 + 0.1);
  tl.fromTo('#co-search', { y: -30, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, c0 + 0.3);
  tl.fromTo('.co-it', { y: 50, autoAlpha: 0, scale: 0.9 }, { y: 0, autoAlpha: 1, scale: 1, stagger: { each: 0.05, grid: [3, 3], from: 'start' }, duration: 0.5, ease: 'back.out(1.5)' }, c0 + 0.4);
  const q = 'Kuronami', qEl = $('#co-q');
  const oty = { v: 0 };
  tl.fromTo(oty, { v: 0 }, { v: q.length, duration: 0.9, ease: 'none', immediateRender: false, onUpdate: () => { qEl.textContent = q.slice(0, Math.round(oty.v)); } }, c0 + 1.8);
  tl.fromTo('#co-caret', { opacity: 1 }, { opacity: 0, duration: 0.25, repeat: 9, yoyo: true, ease: 'steps(1)' }, c0 + 0.4);
  const matches = $$('.co-it[data-k="1"]'), others = $$('.co-it[data-k="0"]');
  tl.to(others, { autoAlpha: 0, scale: 0.85, duration: 0.3, stagger: 0.03 }, c0 + 2.8);
  matches.forEach((el, i) => tl.to(el, { left: (i % 2) * 444, top: Math.floor(i / 2) * 320, width: 430, height: 300, duration: 0.6, ease: 'power3.inOut' }, c0 + 3.0));
  matches.forEach((el) => tl.to(el.querySelector('img'), { height: 170, top: 40, duration: 0.6, ease: 'power3.inOut' }, c0 + 3.0));
  const on = { v: 142 }, nEl = $('#co-n');
  tl.fromTo(on, { v: 142 }, { v: 4, duration: 0.5, ease: 'power2.out', immediateRender: false, onUpdate: () => { nEl.textContent = Math.round(on.v); } }, c0 + 2.8);
  cue(c0 + 3.0, 'whoosh-small');
  sceneOut('collection', T.collection[1]);
  wipe(T.collection[1]);

  // ----- 13. Utilisation -----
  showScene('howto');
  const u0 = T.howto[0];
  tl.fromTo('#howto .kicker', { y: -20, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, u0 + 0.2);
  tl.fromTo('#howto .title .mask > span', { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'power4.out' }, u0 + 0.3);
  const hl = $('#ht-line'), HL = hl.getTotalLength();
  tl.fromTo(hl, { strokeDashoffset: HL, strokeDasharray: `${HL} ${HL}` }, { strokeDashoffset: 0, duration: 4, ease: 'none' }, u0 + 1.0);
  $$('.ht-step').forEach((el, i) => {
    const t = u0 + 1.0 + i * 1.8;
    tl.fromTo(el.querySelector('.ht-badge'), { scale: 0, rotation: -45 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.8)' }, t);
    tl.fromTo(el.querySelectorAll(':scope > div:not(.ht-badge)'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.5 }, t + 0.25);
    tl.to(el.querySelector('.ht-badge'), { y: -10, duration: 1.2, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t + 0.8);
    cue(t, 'pop');
  });
  tl.fromTo('#ht-strip .chip', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.5 }, u0 + 6.4);
  tl.to('#howto > *', { autoAlpha: 0, y: -30, duration: 0.4, stagger: 0.03, ease: 'power2.in' }, T.howto[1] - 0.6);
  wipe(T.howto[1]);

  // ----- 14. Outro -----
  showScene('outro');
  const o0 = T.outro[0];
  tl.fromTo('#ou-logo', { scale: 1.8, autoAlpha: 0, filter: 'blur(16px)' }, { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out' }, o0 + 0.2);
  cue(o0 + 0.2, 'impact');
  tl.fromTo('#ou-free', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, o0 + 0.9);
  tl.fromTo('#ou-url', { autoAlpha: 0, clipPath: 'inset(0 50% 0 50%)' }, { autoAlpha: 1, clipPath: 'inset(0 0% 0 0%)', duration: 0.7, ease: 'power3.inOut' }, o0 + 1.4);
  tl.fromTo('#ou-disc', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, o0 + 2.2);
  tl.to('#ou-logo', { scale: 1.04, duration: 5, ease: 'none' }, o0 + 0.8);
  tl.to('#ou-black', { opacity: 1, duration: 1.2, ease: 'power1.in' }, DURATION - 1.3);

  // Durée exacte
  tl.set({}, {}, DURATION);
  CUES.sort((a, b) => a.t - b.t);
}

// ================= HUD & lecture =================
const hudTime = $('#hud-time'), hudPage = $('#hud-page');
function hud(t) {
  const f = Math.floor((t % 1) * 60);
  hudTime.textContent = `PG // ${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  const cur = Object.keys(T).find((k) => t >= T[k][0] && t < T[k][1]) || 'outro';
  hudPage.textContent = PAGE_LABEL[cur];
}
function seek(t) {
  tl.seek(t, false);
  hud(t);
}

async function ready() {
  await document.fonts.ready;
  await Promise.all($$('img').map((i) => (i.complete && i.naturalWidth ? null : i.decode().catch(() => console.warn('image', i.src)))));
  // Les images de fond CSS (cartes, carte du joueur)
  const bgs = new Set();
  $$('[style*="url("]').forEach((el) => { const m = el.getAttribute('style').match(/url\(([^)]+)\)/); if (m && m[1].startsWith('http')) bgs.add(m[1]); });
  await Promise.all([...bgs].map((u) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = u; })));
  build();
  seek(0);
  window.DURATION = DURATION;
  window.CUES = CUES;
  window.seek = seek;
  window.READY = true;
}

// Prévisualisation dans le navigateur (hors rendu)
const isRender = new URLSearchParams(location.search).has('render');
if (isRender) document.body.classList.add('render');
function fit() {
  if (isRender) return;
  const s = Math.min(innerWidth / 1920, (innerHeight - 50) / 1080);
  stage.style.transform = `scale(${s})`;
}
addEventListener('resize', fit);

ready().then(() => {
  if (isRender) return;
  fit();
  const scrub = $('#scrub'), clock = $('#clock'), play = $('#play');
  let playing = false, t = +(new URLSearchParams(location.search).get('t') || 0), last = 0;
  seek(t);
  const show = () => { scrub.value = (t / DURATION) * 1000; clock.textContent = `${t.toFixed(2)} s`; };
  show();
  play.onclick = () => { playing = !playing; play.textContent = playing ? 'Pause' : 'Lecture'; last = performance.now(); };
  scrub.oninput = () => { t = (scrub.value / 1000) * DURATION; seek(t); show(); };
  gsap.ticker.add(() => {
    if (!playing) return;
    const now = performance.now();
    t = Math.min(DURATION, t + (now - last) / 1000);
    last = now;
    seek(t); show();
    if (t >= DURATION) { playing = false; play.textContent = 'Lecture'; }
  });
});
