/* Banc de démonstration : imite window.api (preload.js) pour faire tourner la vraie interface (renderer/app.js)
   hors d'Electron, sans Riot Client, avec des données fictives. Chaque canal renvoie la même forme que son
   handler dans main.js / src/*.js ({ ok, data } ou { ok: false, error, code }).

   Joueur : Nova #0721, Ascendant 1, 68 RR, niveau 214, en partie compétitive sur Ascent (8–5).
   Toutes les dates sont relatives à l'ouverture de la page. Données du jeu (images, noms) : data.js.

   Pilotage depuis un script (console, executeJavaScript, Playwright…) : window.__demo
     __demo.ready                      promesse : accueil affiché, images visibles chargées
     __demo.whenIdle()                 promesse : plus de chargement dans la page, images visibles chargées
     __demo.go(page)                   ouvre une page : home, store, wishlist, stretch, live, history, stats,
                                       party, friends, collection, settings
     __demo.emit(channel, data)        déclenche un événement window.api.on (status, assets, update,
                                       stats-sync, stretch, stretch-event)
     __demo.live(state, opts)          partie en direct : 'idle' | 'pregame' | 'ingame'
                                       opts : { score: [8, 5], endsIn: 60000 (sélection, ms) }
     __demo.score(allies, enemies)     score de la partie en cours (page et présence de Zephyr)
     __demo.pick(name, agent, state)   sélection d'agent : pick('Solen', 'Raze', 'locked' | 'selected')
                                       La page Partie en direct se relit toute seule toutes les 2,5 s.
     __demo.stretch(phase, opts)       résolution étirée : 'off' | 'idle' | 'launching' | 'game' | 'armed' | 'stretched'
                                       opts : { res: 'native' | 'stretched', in: 5000 (armed : compte à rebours
                                       puis passage en 'stretched') }
     __demo.stretchFlow(opts)          enchaîne lancement → menu (natif) → partie trouvée → étirée ;
                                       opts : { step: 1500, countdown: 5000 }, renvoie une promesse
     __demo.sync(opts)                 simule une synchronisation des matchs (événements stats-sync)
     __demo.update(state)              état des mises à jour, ex. { status: 'ready', latest: '1.21.0' }
     __demo.connected(bool)            compte lié ou Riot Client fermé (événement status)
     __demo.latency                    latence des appels en ms (0 par défaut) ; __demo.latencyFor = { store: 600 }
     __demo.calls                      journal des appels { channel, args, at }
     __demo.state                      copie de l'état simulé (statut, partie en direct, résolution étirée…)
     __demo.data                       scénario (joueurs, matchs…), en lecture

   Adresse : ?keep garde le localStorage de l'app (remis à zéro sinon), ?nocaption masque les boutons
   de fenêtre imités, ?latency=300 règle la latence. */
(() => {
  'use strict';

  const D = window.DEMO_DATA;
  const A = D.assets;
  const SK = D.skins;
  const params = new URLSearchParams(location.search);
  const NOW = Date.now();
  const SEC = 1000;
  const MIN = 60 * SEC;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const clone = (x) => (x === undefined ? undefined : structuredClone(x));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Démo reproductible : l'app repart sans pages vues, messages lus ni vue de tableau mémorisée.
  try {
    if (!params.has('keep')) for (const k of Object.keys(localStorage)) if (k.startsWith('pg-')) localStorage.removeItem(k);
  } catch { /* stockage indisponible */ }
  if (params.has('nocaption')) document.documentElement.classList.add('demo-nocaption');
  document.head.insertAdjacentHTML('beforeend', '<style>.demo-nocaption .demo-caption { display: none; }</style>');

  // ================= Hasard reproductible =================
  let seed = 721;
  function rand() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const int = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const real = (a, b) => a + rand() * (b - a);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const hex = (n) => Array.from({ length: n }, () => Math.floor(rand() * 16).toString(16)).join('');
  const uuid = () => `${hex(8)}-${hex(4)}-4${hex(3)}-${'89ab'[int(0, 3)]}${hex(3)}-${hex(12)}`;

  // ================= Données du jeu =================
  const agentId = (name) => {
    const a = A.agents.find((x) => x.name === name);
    if (!a) throw new Error(`Agent inconnu : ${name}`);
    return a.uuid.toLowerCase();
  };
  const mapByName = (name) => A.maps.find((m) => m.name === name);
  const weaponId = (name) => A.weapons.find((w) => w.name === name).uuid.toLowerCase();
  const CURRENT_ACT = A.currentAct.uuid;
  const PREV_ACT = A.acts[1]?.uuid;
  const OLDER_ACT = A.acts[2]?.uuid;

  // Prix d'un skin seul selon son édition (boutique du jour)
  const EDITION_PRICE = { Select: 875, Deluxe: 1275, Premium: 1775, Exclusive: 2175, Ultra: 2475 };
  const isMeleeSkin = (s) => A.weapons.find((w) => w.uuid === s.weapon)?.category === 'EEquippableCategory::Melee';
  const skinPrice = (s) => (isMeleeSkin(s) ? 2 * EDITION_PRICE[s.edition] : EDITION_PRICE[s.edition]);
  const skinItem = (s) => ({ kind: 'Skin', skinId: s.uuid, name: s.name, icon: s.icon, color: s.color, tierIcon: s.tierIcon });

  // ================= Joueurs =================
  const person = (name, tag, level) => ({ puuid: uuid(), name, tag, level });
  const ME = person('Nova', '0721', 214);
  const ZEPHYR = person('Zephyr', 'EUW', 187);
  const KAITO = person('Kaito', '777', 132);
  const MIRA = person('Mira', 'FR1', 256);
  const SOLEN = person('Solen', '4242', 61);
  const VEX = person('Vex', 'KR2', 341);
  const LYS = person('Lys', 'FR', 158);
  const ARDENT = person('Ardent', '000', 77);
  const MOKA = person('Moka', '31', 205);
  const TIDE = person('Tide', 'EU9', 119);

  // Joueurs croisés dans l'historique (pseudos inventés)
  const NAME_POOL = [
    ['Quill', '404'], ['Ember', 'EU2'], ['Halcyon', 'FR9'], ['Juniper', '118'], ['Pixel', 'GG'], ['Raven', 'FR'],
    ['Comet', 'EU1'], ['Drift', '999'], ['Onyx', 'KR1'], ['Cinder', '12'], ['Flint', '300'], ['Nyx', 'FR3'],
    ['Brisk', '55'], ['Sora', 'JP1'], ['Wren', 'FR7'], ['Atlas', 'EU2'], ['Blitz', '616'], ['Kairo', '42'],
    ['Mako', 'EUW'], ['Noir', 'FR4'], ['Pyre', '90'], ['Rook', '11'], ['Saffron', 'EU'], ['Tempo', '808'],
    ['Umbra', 'EUW'], ['Vale', '2K'], ['Wisp', 'FR'], ['Yuki', 'JP'], ['Zinc', '30'], ['Aster', 'EU7'],
    ['Basalt', '01'], ['Cobalt', 'FR5'], ['Dune', 'EU'], ['Glyph', 'EUW'], ['Hollow', '13'], ['Indigo', 'FR'],
    ['Jade', 'EU3'], ['Koda', '512'], ['Lark', 'FR2'], ['Mirage', 'EU'], ['Nimbus', '314'], ['Opal', 'FR'],
    ['Pulse', 'EUW'], ['Quasar', 'EU'], ['Ronin', 'FR6'], ['Slate', 'EU'], ['Volt', '220'], ['Yarrow', 'FR'],
  ].map(([name, tag]) => person(name, tag, int(24, 480)));

  const rank = (tier, rr, peak = tier, games = 40) => ({ tier, rr, peak, wins: Math.round(games * 0.54), games });
  const RANKS = new Map([
    [ME, { tier: 21, rr: 68, peak: 21, wins: 31, games: 52 }], // peak : meilleur rang de l'acte en cours
    [ZEPHYR, rank(20, 41, 21, 61)],
    [KAITO, rank(19, 77, 20, 38)],
    [MIRA, rank(21, 23, 21, 74)],
    [SOLEN, rank(16, 54, 17, 22)],
    [VEX, rank(24, 31, 25, 96)],
    [LYS, rank(22, 58, 22, 57)],
    [ARDENT, rank(16, 12, 18, 30)],
    [MOKA, rank(20, 85, 21, 49)],
    [TIDE, rank(19, 40, 19, 35)],
  ]);

  // ================= Matchs de Nova =================
  // h : il y a (heures) ; s : score [Nova, adversaires] ; k/d/a ; acs ; rr gagné ou perdu ; w : coéquipiers en groupe
  const z = 'zephyr';
  const MATCH_SPECS = [
    { h: 1.15, q: 'competitive', map: 'Haven', agent: 'Jett', s: [13, 9], k: 24, d: 16, a: 5, acs: 268, rr: 21, w: z, k4: 1 },
    { h: 2.1, q: 'competitive', map: 'Lotus', agent: 'Jett', s: [13, 11], k: 21, d: 17, a: 7, acs: 241, rr: 18, w: z },
    { h: 3.05, q: 'competitive', map: 'Split', agent: 'Raze', s: [10, 13], k: 18, d: 16, a: 6, acs: 228, rr: -16, w: z },
    { h: 4.2, q: 'unrated', map: 'Sunset', agent: 'Neon', s: [13, 8], k: 22, d: 14, a: 4, acs: 259 },
    { h: 23.5, q: 'competitive', map: 'Ascent', agent: 'Jett', s: [13, 7], k: 24, d: 12, a: 4, acs: 287, rr: 20, w: z },
    { h: 24.4, q: 'competitive', map: 'Bind', agent: 'Jett', s: [11, 13], k: 17, d: 17, a: 3, acs: 205, rr: -17, w: z },
    { h: 25.3, q: 'competitive', map: 'Sunset', agent: 'Jett', s: [13, 10], k: 23, d: 15, a: 6, acs: 262, rr: 20 },
    { h: 26.2, q: 'competitive', map: 'Icebox', agent: 'Neon', s: [13, 8], k: 19, d: 13, a: 9, acs: 239, rr: 22, w: z },
    { h: 27.1, q: 'swiftplay', map: 'Bind', agent: 'Jett', s: [5, 3], k: 11, d: 6, a: 2, acs: 271 },
    { h: 47.6, q: 'competitive', map: 'Haven', agent: 'Jett', s: [7, 13], k: 13, d: 17, a: 4, acs: 176, rr: -19 },
    { h: 48.5, q: 'competitive', map: 'Lotus', agent: 'Jett', s: [14, 12], k: 27, d: 18, a: 5, acs: 271, rr: 17, w: z, k5: 1 },
    { h: 49.6, q: 'competitive', map: 'Abyss', agent: 'Raze', s: [13, 11], k: 20, d: 16, a: 8, acs: 233, rr: 21, w: z },
    { h: 51.0, q: 'premier', map: 'Corrode', agent: 'Jett', s: [13, 10], k: 21, d: 15, a: 6, acs: 249, w: 'premier' },
    { h: 52.0, q: 'deathmatch', map: 'Ascent', agent: 'Jett', dm: { place: 1, top: 36 }, k: 40, d: 27, a: 0, acs: 296 },
    { h: 71.0, q: 'unrated', map: 'Pearl', agent: 'Chamber', s: [11, 13], k: 17, d: 15, a: 3, acs: 221, w: z },
    { h: 95.2, q: 'competitive', map: 'Ascent', agent: 'Jett', s: [9, 13], k: 16, d: 18, a: 5, acs: 214, rr: -16 },
    { h: 96.1, q: 'competitive', map: 'Split', agent: 'Jett', s: [13, 5], k: 20, d: 9, a: 6, acs: 296, rr: 19, w: z },
    { h: 97.0, q: 'competitive', map: 'Sunset', agent: 'Reyna', s: [12, 14], k: 22, d: 19, a: 2, acs: 248, rr: -15 },
    { h: 98.1, q: 'competitive', map: 'Bind', agent: 'Jett', s: [13, 6], k: 18, d: 10, a: 7, acs: 263, rr: 22, w: z },
    { h: 99.0, q: 'swiftplay', map: 'Haven', agent: 'Raze', s: [4, 5], k: 9, d: 8, a: 3, acs: 214 },
    { h: 120.0, q: 'unrated', map: 'Breeze', agent: 'Jett', s: [13, 6], k: 21, d: 11, a: 3, acs: 282 },
    { h: 122.5, q: 'premier', map: 'Bind', agent: 'Jett', s: [10, 13], k: 17, d: 17, a: 5, acs: 219, w: 'premier' },
    { h: 143.4, q: 'competitive', map: 'Icebox', agent: 'Jett', s: [13, 11], k: 21, d: 18, a: 4, acs: 232, rr: 19 },
    { h: 144.4, q: 'competitive', map: 'Pearl', agent: 'Jett', s: [8, 13], k: 14, d: 16, a: 3, acs: 189, rr: -18, w: z },
    { h: 145.5, q: 'competitive', map: 'Haven', agent: 'Omen', s: [13, 9], k: 15, d: 12, a: 11, acs: 198, rr: 20, w: z },
    { h: 146.5, q: 'deathmatch', map: 'Lotus', agent: 'Jett', dm: { place: 3, top: 40 }, k: 33, d: 29, a: 0, acs: 251 },
    { h: 168.0, q: 'unrated', map: 'Abyss', agent: 'Yoru', s: [13, 11], k: 19, d: 16, a: 5, acs: 237 },
    { h: 170.0, q: 'swiftplay', map: 'Lotus', agent: 'Jett', s: [5, 2], k: 10, d: 4, a: 1, acs: 302 },
    { h: 191.0, q: 'competitive', map: 'Corrode', agent: 'Jett', s: [10, 13], k: 17, d: 15, a: 5, acs: 221, rr: -17 },
    { h: 192.0, q: 'competitive', map: 'Lotus', agent: 'Jett', s: [13, 4], k: 21, d: 8, a: 4, acs: 301, rr: 19, w: z, k4: 1 },
    { h: 193.1, q: 'competitive', map: 'Abyss', agent: 'Jett', s: [11, 13], k: 18, d: 17, a: 6, acs: 230, rr: -16 },
  ];

  // Armes des éliminations, en % selon l'agent joué (« ability » : capacités, comme src/stats.js)
  const KILL_MIX = {
    Jett: [['Vandal', 56], ['Operator', 17], ['Sheriff', 8], ['Spectre', 5], ['Ghost', 4], ['ability', 10]],
    Raze: [['Vandal', 48], ['ability', 24], ['Spectre', 11], ['Sheriff', 9], ['Ghost', 8]],
    Neon: [['Vandal', 52], ['Phantom', 14], ['Spectre', 12], ['ability', 12], ['Sheriff', 10]],
    Reyna: [['Vandal', 58], ['Sheriff', 16], ['Spectre', 10], ['Ghost', 10], ['ability', 6]],
    Omen: [['Phantom', 56], ['Vandal', 14], ['Spectre', 12], ['Sheriff', 10], ['ability', 8]],
    Chamber: [['Operator', 38], ['Sheriff', 26], ['Vandal', 26], ['ability', 10]],
    Yoru: [['Vandal', 50], ['Spectre', 16], ['Sheriff', 12], ['Ghost', 10], ['ability', 12]],
    deathmatch: [['Vandal', 58], ['Phantom', 16], ['Sheriff', 16], ['Guardian', 10]],
  };
  function splitKills(kills, mix) {
    const weights = mix.map(([k, w]) => [k, w * real(0.75, 1.25)]);
    const total = weights.reduce((s, [, w]) => s + w, 0);
    const raw = weights.map(([k, w]) => [k, (kills * w) / total]);
    const out = Object.fromEntries(raw.map(([k, v]) => [k, Math.floor(v)]));
    let left = kills - Object.values(out).reduce((s, v) => s + v, 0);
    for (const [k] of [...raw].sort((x, y) => (y[1] % 1) - (x[1] % 1))) if (left-- > 0) out[k]++;
    const weapons = {};
    for (const [k, v] of Object.entries(out)) if (v) weapons[k === 'ability' ? 'ability' : weaponId(k)] = v;
    return weapons;
  }

  // Détail de Nova pour chaque match (même champs que Stats.record), avant ajustement aux moyennes visées
  const ALL_AGENTS = A.agents.map((a) => a.name);
  const DUELISTS = new Set(['Jett', 'Raze', 'Neon', 'Reyna', 'Yoru', 'Phoenix', 'Iso', 'Waylay', 'Hush']);
  const matches = MATCH_SPECS.map((spec) => {
    const dm = spec.q === 'deathmatch';
    const rounds = dm ? 30 : spec.s[0] + spec.s[1];
    const result = dm ? (spec.dm.place === 1 ? 'win' : 'loss') : spec.s[0] > spec.s[1] ? 'win' : spec.s[0] < spec.s[1] ? 'loss' : 'draw';
    const win = result === 'win';
    const damage = Math.round(rounds * (spec.acs * 0.655 + int(-6, 6)));
    const hits = Math.round(damage / 41);
    const head = Math.round(hits * real(0.22, 0.34));
    const leg = Math.round(hits * real(0.04, 0.09));
    const multi = dm ? 0 : spec.k >= 20 ? int(1, 3) : int(0, 2);
    return {
      spec,
      id: uuid(),
      startedAt: Math.round(NOW - spec.h * HOUR - int(0, 9) * MIN),
      lengthMs: dm ? (int(8, 9) * 60 + int(0, 59)) * SEC : (rounds * int(95, 106) + int(90, 150)) * SEC,
      map: mapByName(spec.map),
      rounds,
      result,
      me: {
        kills: spec.k, deaths: spec.d, assists: spec.a,
        combat: spec.acs * rounds,
        damage,
        dd: dm ? 0 : win ? int(8, 32) : int(-22, 6),
        head, leg, body: hits - head - leg,
        kast: dm ? Math.round(rounds * 0.5) : Math.round(rounds * (win ? real(0.72, 0.84) : real(0.62, 0.74))),
        fb: dm ? 0 : DUELISTS.has(spec.agent) ? int(1, 5) : int(0, 2),
        fd: dm ? 0 : int(1, 4),
        k3: multi,
        k4: spec.k4 || 0,
        k5: spec.k5 || 0,
        flawless: dm ? 0 : win ? int(1, 4) : int(0, 2),
        clutches: dm || !win ? [] : rand() < 0.45 ? [1] : rand() < 0.35 ? [1, 2] : [],
        weapons: splitKills(spec.k, KILL_MIX[dm ? 'deathmatch' : spec.agent] || KILL_MIX.Jett),
      },
    };
  });

  // Compétition : ADR, headshot et KAST ajustés pour tomber sur les moyennes du joueur (≈ 158, 28 %, 74 %)
  {
    const comp = matches.filter((m) => m.spec.q === 'competitive');
    const sum = (f) => comp.reduce((s, m) => s + f(m), 0);
    const rounds = sum((m) => m.rounds);
    const fDmg = (158 * rounds) / sum((m) => m.me.damage);
    const H = sum((m) => m.me.head), BL = sum((m) => m.me.body + m.me.leg);
    const fHead = (0.28 * BL) / (0.72 * H);
    for (const m of comp) {
      m.me.damage = Math.round(m.me.damage * fDmg);
      m.me.head = Math.round(m.me.head * fHead);
    }
    // KAST : manches ajoutées ou retirées une à une, à tour de rôle, jusqu'au total visé
    let gap = Math.round(0.74 * rounds) - sum((m) => m.me.kast);
    for (let i = 0; gap && i < 200; i++) {
      const m = comp[i % comp.length];
      const next = m.me.kast + Math.sign(gap);
      if (next > m.rounds - 1 || next < 8) continue;
      m.me.kast = next;
      gap -= Math.sign(gap);
    }
  }
  for (const m of matches) m.me.received = m.me.damage - m.rounds * m.me.dd;

  // RR : du plus ancien au plus récent, jusqu'à Ascendant 1, 68 RR aujourd'hui
  const comps = matches.filter((m) => m.spec.q === 'competitive').sort((a, b) => a.startedAt - b.startedAt);
  {
    let value = 21 * 100 + 68 - comps.reduce((s, m) => s + m.spec.rr, 0);
    for (const m of comps) {
      m.tierBefore = Math.floor(value / 100);
      value += m.spec.rr;
      m.tierAfter = Math.floor(value / 100);
      m.rrAfter = value % 100;
    }
  }
  // Rang affiché dans les autres modes : celui du moment
  for (const m of matches) {
    if (m.tierBefore) continue;
    const before = comps.filter((c) => c.startedAt < m.startedAt).at(-1);
    m.tierBefore = before ? before.tierAfter : comps[0].tierBefore;
  }

  // ---- Tableau des scores : les 9 autres joueurs ----
  const PREMIER_TEAM = [[ZEPHYR, 'Omen'], [KAITO, 'Sova'], [MIRA, 'Killjoy'], [SOLEN, 'Raze']];
  const ZEPHYR_AGENTS = ['Omen', 'Omen', 'Omen', 'Omen', 'Viper', 'Clove', 'Astra']; // Zephyr joue surtout Omen

  function labelParties(players, partyOf, teamOf) {
    // Même règle que src/services.js : groupes de 2 joueurs ou plus, le tien d'abord.
    const sizes = new Map();
    for (const p of players) if (partyOf(p)) sizes.set(partyOf(p), (sizes.get(partyOf(p)) || 0) + 1);
    const labels = new Map();
    const perTeam = new Map();
    for (const p of [...players].sort((x, y) => y.isMe - x.isMe)) {
      const id = partyOf(p);
      p.party = null;
      if (!id || sizes.get(id) < 2) continue;
      if (!labels.has(id)) {
        const n = (perTeam.get(teamOf(p)) || 0) + 1;
        perTeam.set(teamOf(p), n);
        labels.set(id, { n, idx: labels.size });
      }
      p.party = labels.get(id).n;
      p.partyIdx = labels.get(id).idx;
    }
  }

  function scoreboard(m) {
    const { spec, rounds } = m;
    const dm = spec.q === 'deathmatch';
    const pool = shuffle(NAME_POOL);
    const others = [];
    const used = new Set();
    const take = () => pool.find((p) => !used.has(p) && used.add(p));
    const myParty = `party-${ME.puuid}`;

    if (dm) {
      // Combat à mort : 14 joueurs, chacun pour soi
      const ranking = [spec.dm.top, ...Array.from({ length: 12 }, () => int(12, spec.dm.top - 1))].sort((a, b) => b - a);
      if (spec.dm.place === 1) ranking[0] = int(28, spec.k - 3);
      ranking.sort((a, b) => b - a);
      for (const kills of ranking) others.push({ who: take(), agent: pick(ALL_AGENTS), kills, team: null });
    } else {
      const allyAgents = new Set([spec.agent]);
      const enemyAgents = new Set();
      const agentFor = (set, prefer) => {
        const a = (prefer && !set.has(prefer) && prefer) || pick(ALL_AGENTS.filter((x) => !set.has(x)));
        set.add(a);
        return a;
      };
      const allies = spec.w === 'premier'
        ? PREMIER_TEAM.map(([who, agent]) => ({ who, agent: agentFor(allyAgents, agent), party: myParty }))
        : [
            ...(spec.w === z ? [{ who: ZEPHYR, agent: agentFor(allyAgents, pick(ZEPHYR_AGENTS)), party: myParty }] : []),
          ];
      while (allies.length < 4) allies.push({ who: take(), agent: agentFor(allyAgents) });
      const enemies = Array.from({ length: 5 }, () => ({ who: take(), agent: agentFor(enemyAgents) }));
      // Groupes des autres joueurs : un duo de temps en temps, un trio parfois
      const groupUp = (list, chance, size) => {
        const free = list.filter((p) => !p.party);
        if (free.length >= size && rand() < chance) {
          const id = `party-${uuid()}`;
          for (const p of free.slice(0, size)) p.party = id;
        }
      };
      groupUp(allies, 0.3, 2);
      groupUp(enemies, 0.25, 3);
      groupUp(enemies, 0.5, 2);
      const win = m.result === 'win';
      // Nova fait partie des meilleurs de sa partie, sans être toujours premier
      for (const p of allies) others.push({ ...p, team: 'ally', acs: win ? int(125, 255) : int(105, 230) });
      for (const p of enemies) others.push({ ...p, team: 'enemy', acs: win ? int(100, 230) : int(135, 270) });
    }

    const myTier = m.tierBefore;
    const near = () => Math.max(3, Math.min(27, myTier + pick([-2, -1, -1, 0, 0, 0, 1, 1, 2])));
    const players = others.map((o) => {
      const acs = dm ? Math.round(o.kills * 7.4 + int(-15, 15)) : o.acs;
      const kills = dm ? o.kills : Math.max(2, Math.round((acs * rounds) / 262) + int(-2, 2));
      const p = o.who;
      const fixedTier = RANKS.get(p)?.tier;
      return {
        puuid: p.puuid,
        name: p.name,
        tag: p.tag,
        agentId: agentId(o.agent),
        teamId: dm ? p.puuid : o.team === 'ally' ? 'Blue' : 'Red',
        team: dm ? 'enemy' : o.team,
        level: p.level,
        tier: spec.q === 'deathmatch' && rand() < 0.2 ? 0 : fixedTier || near(),
        partyId: o.party || `party-${p.puuid}`,
        kills,
        deaths: 0,
        assists: dm ? 0 : int(1, 10),
        acs: acs === m.spec.acs ? acs + 1 : acs,
        adr: Math.round(acs * real(0.6, 0.7)),
        hs: int(12, 36),
        fb: dm ? 0 : int(0, 4),
        kast: dm ? null : int(58, 86),
        isMe: false,
      };
    });

    const me = {
      puuid: ME.puuid, name: ME.name, tag: ME.tag, agentId: agentId(spec.agent),
      teamId: dm ? ME.puuid : 'Blue', team: 'ally', level: ME.level, tier: myTier, partyId: myParty,
      kills: m.me.kills, deaths: m.me.deaths, assists: m.me.assists,
      acs: spec.acs,
      adr: Math.round(m.me.damage / rounds),
      hs: Math.round((m.me.head / (m.me.head + m.me.body + m.me.leg)) * 100),
      fb: m.me.fb,
      kast: dm ? null : Math.round((m.me.kast / rounds) * 100),
      isMe: true,
    };

    // Morts : celles d'une équipe valent les éliminations de l'autre
    const spread = (list, total) => {
      const w = list.map(() => real(0.7, 1.3));
      const sw = w.reduce((s, v) => s + v, 0);
      list.forEach((p, i) => (p.deaths = Math.max(4, Math.min(rounds, Math.round((total * w[i]) / sw)))));
    };
    if (dm) {
      for (const p of players) p.deaths = int(18, 34);
    } else {
      const allies = players.filter((p) => p.team === 'ally');
      const enemies = players.filter((p) => p.team === 'enemy');
      const killsOf = (list) => list.reduce((s, p) => s + p.kills, 0);
      spread(allies, Math.max(16, killsOf(enemies) - me.deaths));
      spread(enemies, killsOf(allies) + me.kills);
    }

    const all = [me, ...players].sort((x, y) => y.acs - x.acs);
    labelParties(all, (p) => p.partyId, (p) => p.teamId);
    all[0].mvp = 'match';
    const otherBest = !dm && all.find((p) => p.teamId !== all[0].teamId);
    if (otherBest) otherBest.mvp = 'team';
    return all;
  }

  for (const m of matches) {
    m.players = scoreboard(m);
    const mine = m.players.find((p) => p.isMe);
    m.place = m.players.indexOf(mine) + 1;
    m.mvp = mine.mvp || null;
  }

  // ---- Formes servies à l'interface ----
  // Résumé de l'onglet Stats (Stats.record)
  const record = (m) => ({
    v: 2,
    id: m.id,
    queue: m.spec.q,
    seasonId: CURRENT_ACT,
    mapId: m.map.uuid,
    agentId: agentId(m.spec.agent),
    startedAt: m.startedAt,
    result: m.result,
    score: m.spec.q === 'deathmatch' ? [m.me.kills, m.spec.dm.place === 1 ? m.players[1].kills : m.spec.dm.top] : m.spec.s,
    rounds: m.rounds,
    kills: m.me.kills,
    deaths: m.me.deaths,
    assists: m.me.assists,
    combat: m.me.combat,
    lengthMs: m.lengthMs,
    damage: m.me.damage,
    received: m.me.received,
    head: m.me.head,
    body: m.me.body,
    leg: m.me.leg,
    fb: m.me.fb,
    fd: m.me.fd,
    kast: m.me.kast,
    k3: m.me.k3,
    k4: m.me.k4,
    k5: m.me.k5,
    flawless: m.me.flawless,
    clutches: m.me.clutches,
    place: m.place,
    players: m.players.length,
    mvp: m.mvp,
    weapons: m.me.weapons,
    tier: m.tierBefore,
  });

  // Résumé de l'historique (Services.summarizeMatch puis present)
  function summary(m) {
    const dm = m.spec.q === 'deathmatch';
    const rec = record(m);
    const players = m.players.map(({ partyId, ...p }) => ({ ...p, party: p.party ?? null }));
    const mine = players.find((p) => p.isMe);
    const [ally, enemy] = dm ? [] : [m.spec.s[0], m.spec.s[1]];
    return {
      id: m.id,
      mapId: m.map.uuid,
      queue: m.spec.q,
      startedAt: m.startedAt,
      lengthMs: m.lengthMs,
      agentId: mine.agentId,
      kills: mine.kills,
      deaths: mine.deaths,
      assists: mine.assists,
      acs: mine.acs,
      adr: mine.adr,
      hs: mine.hs,
      tier: mine.tier,
      mvp: mine.mvp || null,
      placement: m.place,
      playerCount: players.length,
      result: m.result,
      score: rec.score,
      teams: dm
        ? [{ teamId: 'all', side: 'all', won: m.result === 'win', rounds: null, players }]
        : [
            { teamId: 'Blue', side: 'ally', won: m.result === 'win', rounds: ally, players: players.filter((p) => p.teamId === 'Blue') },
            { teamId: 'Red', side: 'enemy', won: m.result === 'loss', rounds: enemy, players: players.filter((p) => p.teamId === 'Red') },
          ],
      map: m.map,
    };
  }

  const byDate = [...matches].sort((a, b) => b.startedAt - a.startedAt);
  const RECORDS = byDate.map(record);
  const RR_UPDATES = comps.map((m) => ({
    id: m.id, at: m.startedAt, seasonId: CURRENT_ACT, mapId: m.map.uuid,
    tierBefore: m.tierBefore, tier: m.tierAfter, rr: m.rrAfter, earned: m.spec.rr,
  }));
  const SUMMARIES = byDate.map(summary);
  const history = (queue) => SUMMARIES.filter((s) => !queue || s.queue === queue).slice(0, 15);

  // Moyennes de Nova en compétition sur l'acte (partie en direct)
  const myComp = RECORDS.filter((r) => r.queue === 'competitive');
  const sumOf = (list, k) => list.reduce((s, r) => s + r[k], 0);
  const MY_RECENT = {
    form: myComp.slice(0, 10).map((r) => r.result),
    n: myComp.length,
    total: myComp.length,
    loading: false,
    capped: false,
    noAct: false,
    kd: sumOf(myComp, 'kills') / Math.max(1, sumOf(myComp, 'deaths')),
    hs: (sumOf(myComp, 'head') / (sumOf(myComp, 'head') + sumOf(myComp, 'body') + sumOf(myComp, 'leg'))) * 100,
  };

  // ================= Partie en direct =================
  const form = (winRate) => Array.from({ length: 10 }, () => (rand() < winRate ? 'win' : 'loss'));
  const recent = (kd, hs, n, winRate) => ({ form: form(winRate), n, total: n, loading: false, capped: false, noAct: false, kd, hs });
  const LIVE_ALLIES = [
    { p: ME, agent: 'Jett', recent: MY_RECENT, party: true },
    { p: ZEPHYR, agent: 'Omen', recent: recent(1.08, 24.1, 31, 0.6), party: true },
    { p: KAITO, agent: 'Sova', recent: recent(1.12, 21.6, 18, 0.55) },
    { p: MIRA, agent: 'Killjoy', recent: recent(1.19, 26.4, 42, 0.5) },
    { p: SOLEN, agent: 'Raze', recent: recent(0.94, 17.8, 12, 0.45) },
  ];
  const LIVE_ENEMIES = [
    { p: VEX, agent: 'Reyna', recent: recent(1.46, 31.2, 57, 0.6), party: true },
    { p: LYS, agent: 'Viper', recent: recent(1.03, 22.7, 44, 0.6), party: true },
    { p: ARDENT, agent: 'Phoenix', recent: recent(0.87, 15.9, 21, 0.4) },
    { p: MOKA, agent: 'Clove', recent: recent(1.11, 23.5, 36, 0.5) },
    { p: TIDE, agent: 'Sage', recent: recent(0.78, 19.4, 27, 0.45) },
  ];
  const LIVE_MATCH_ID = uuid();
  const PREGAME = { // sélection d'agent : état de chaque coéquipier
    Nova: { agent: 'Jett', state: 'locked' },
    Zephyr: { agent: 'Omen', state: 'locked' },
    Kaito: { agent: 'Sova', state: 'selected' },
    Mira: { agent: 'Killjoy', state: 'locked' },
    Solen: { agent: null, state: '' },
  };

  const demo = {
    status: { connected: true, name: ME.name, tag: ME.tag, region: 'eu', puuid: ME.puuid },
    live: { state: 'ingame', score: [8, 5], endsAt: NOW + 62 * SEC },
    stretch: { phase: 'idle', res: 'native', switchAt: null, screensOff: 0 },
    update: { current: '1.20.0', status: 'none', portable: false },
    sync: { running: false, done: 0, total: 0, waitUntil: null, lastSync: NOW - 4 * MIN, error: null },
    settings: {
      regionOverride: '',
      px0: true,
      stretch: {
        enabled: true,
        width: 1440,
        height: 1080,
        monitors: true,
        gameConfig: true,
        hotkeys: { toggle: 'Control+F8', native: 'Control+F9' },
        native: { w: 1920, h: 1080, hz: 240, gdi: '\\\\.\\DISPLAY1' },
      },
      openAtLogin: true,
    },
  };

  function livePlayer(e, team, pregame) {
    const pg = PREGAME[e.p.name];
    const agent = pregame ? pg?.agent : e.agent;
    return {
      puuid: e.p.puuid,
      isMe: e.p === ME,
      name: e.p.name,
      tag: e.p.tag,
      hidden: false,
      level: e.p.level,
      agentId: agent ? agentId(agent) : null,
      state: pregame ? pg?.state || null : null,
      rank: clone(RANKS.get(e.p)),
      recent: e.recent,
      ...(e.party ? { party: 1, partyIdx: team === 'ally' ? 0 : 1, partyGuess: team !== 'ally' } : { party: null, partyGuess: false }),
    };
  }

  function live() {
    const l = demo.live;
    if (l.state === 'idle') return { state: 'idle' };
    const ascent = mapByName('Ascent');
    if (l.state === 'pregame') {
      return {
        state: 'pregame', matchId: LIVE_MATCH_ID, map: ascent, queue: 'competitive', endsAt: l.endsAt, side: 'defense',
        allies: LIVE_ALLIES.map((e) => livePlayer(e, 'ally', true)), enemies: [],
      };
    }
    // Côté joué : Blue défend en première mi-temps (12 manches), attaque ensuite (Services.sideAt)
    const round = l.score[0] + l.score[1];
    const side = Math.max(...l.score) > 12 || round >= 24 ? null : round < 12 ? 'defense' : 'attack';
    return {
      state: 'ingame', matchId: LIVE_MATCH_ID, map: ascent, queue: 'competitive', score: [...l.score], side,
      allies: LIVE_ALLIES.map((e) => livePlayer(e, 'ally', false)),
      enemies: LIVE_ENEMIES.map((e) => livePlayer(e, 'enemy', false)),
    };
  }

  // ================= Profil, boutique, collection =================
  const EQUIPPED = ['vandalReaver', 'phantomSingularity', 'operatorMagepunk', 'sheriffReaver', 'spectreReaver', 'ghostRecon',
    'classicNeptune', 'guardianReaver', 'odinReaver', 'banditReaver', 'marshalCobra', 'judgeSensation', 'bulldogMolten',
    'outlawMolten', 'stingerSakura', 'frenzyXeno', 'aresMagepunk', 'buckyOrigin', 'karambitReaver'];
  const wallet = { vp: 3250, rp: 165, kc: 8740 };

  function profile() {
    const skins = {};
    for (const k of EQUIPPED) skins[SK[k].weapon.toLowerCase()] = SK[k].icon;
    const card = D.cards.nova;
    return {
      puuid: ME.puuid,
      name: ME.name,
      tag: ME.tag,
      region: 'eu',
      level: ME.level,
      card: { wide: card.wide, small: card.small, name: card.name },
      title: D.titles.nova.name,
      rank: clone(RANKS.get(ME)),
      wallet: { ...wallet },
      skins,
    };
  }

  const NIGHT = [['spectreIon', 32], ['guardianKuronami', 21], ['ghostMagepunk', 38], ['marshal809', 45], ['bulldogPrelude', 17], ['frenzyOrion', 26]];
  const BUNDLE_SKINS = ['phantomAraxys', 'sheriffAraxys', 'guardianAraxys', 'outlawAraxys', 'meleeAraxys'];

  function store() {
    const offer = (key) => ({ ...skinItem(SK[key]), price: { currency: 'vp', amount: skinPrice(SK[key]) } });
    const bundleItems = [
      ...BUNDLE_SKINS.map((k) => ({ ...skinItem(SK[k]), amount: 1, price: { currency: 'vp', amount: Math.round(skinPrice(SK[k]) * (2 / 3) / 50) * 50 } })),
      { kind: 'Porte-bonheur', name: D.buddies.araxys.name, icon: D.buddies.araxys.icon, amount: 1, price: { currency: 'vp', amount: 0 } },
      { kind: 'Carte', name: D.cards.araxys.name, icon: D.cards.araxys.icon, amount: 1, price: { currency: 'vp', amount: 0 } },
      { kind: 'Tag', name: D.sprays.araxys.name, icon: D.sprays.araxys.icon, amount: 1, price: { currency: 'vp', amount: 0 } },
    ];
    const total = bundleItems.reduce((s, i) => s + i.price.amount, 0);
    const base = BUNDLE_SKINS.reduce((s, k) => s + skinPrice(SK[k]), 0);
    return {
      wallet: { ...wallet },
      daily: ['vandalKuronami', 'phantomOni', 'operatorGlitchpop', 'sheriffRgx'].map(offer),
      dailyEndsAt: NOW + 9 * HOUR + 42 * MIN + 17 * SEC,
      bundles: [{
        name: D.bundles.araxys.name,
        icon: D.bundles.araxys.icon,
        price: { currency: 'vp', amount: total },
        basePrice: { currency: 'vp', amount: base },
        endsAt: NOW + 9 * DAY + 4 * HOUR + 12 * MIN,
        items: bundleItems,
      }],
      night: {
        endsAt: NOW + 4 * DAY + 7 * HOUR + 31 * MIN,
        offers: NIGHT.map(([k, percent], i) => {
          const amount = skinPrice(SK[k]);
          return { ...skinItem(SK[k]), price: { currency: 'vp', amount }, discounted: { currency: 'vp', amount: Math.round(amount * (1 - percent / 100)) }, percent, seen: i < 4 };
        }),
      },
      accessories: {
        endsAt: NOW + 2 * DAY + 5 * HOUR + 8 * MIN,
        offers: [
          { kind: 'Carte', name: D.cards.seoul.name, icon: D.cards.seoul.icon, price: { currency: 'kc', amount: 2800 } },
          { kind: 'Tag', name: D.sprays.jettSpy.name, icon: D.sprays.jettSpy.icon, price: { currency: 'kc', amount: 2000 } },
          { kind: 'Porte-bonheur', name: D.buddies.jettWind.name, icon: D.buddies.jettWind.icon, price: { currency: 'kc', amount: 3500 } },
        ],
      },
    };
  }

  const OWNED = [...EQUIPPED, 'phantomRecon', 'spectreSingularity', 'vandalSakura', 'classicSakura', 'sheriffOverdrive',
    'guardianRuin', 'meleeOrigin'];
  const collection = () => OWNED.map((k) => SK[k])
    .map((s) => ({ name: s.name, icon: s.icon, color: s.color, tierIcon: s.tierIcon, tierRank: s.tierRank }))
    .sort((x, y) => y.tierRank - x.tierRank || x.name.localeCompare(y.name, 'fr'));

  const ownedIds = new Set(OWNED.map((k) => SK[k].uuid));
  const wishlistCatalog = () => Object.values(SK)
    .map((s) => ({ uuid: s.uuid, name: s.name, icon: s.icon, weapon: s.weapon, color: s.color, tierIcon: s.tierIcon, owned: ownedIds.has(s.uuid) }))
    .sort((x, y) => x.name.localeCompare(y.name, 'fr'));

  const wish = {
    skins: ['vandalKuronami', 'phantomRuine', 'sheriffProtocol', 'vandalPrelude', 'meleeKuronami'].map((k) => SK[k].uuid),
  };
  const wishlistBody = () => ({
    linked: true,
    status: 'ok',
    skins: [...wish.skins],
    max: 50,
    riotName: `${ME.name}#${ME.tag}`,
    discord: { name: 'nova.gg', avatar: 'https://cdn.discordapp.com/embed/avatars/2.png' },
  });

  // ================= Groupe, amis, messagerie =================
  function party() {
    const member = (p, card, owner) => ({
      puuid: p.puuid, name: p.name, tag: p.tag, owner, ready: true, level: p.level, card: card.small,
      rank: clone(RANKS.get(p)), isMe: p === ME,
    });
    return {
      id: 'b7d3a9e0-41c2-4f7e-9a51-5c0de0721e57',
      state: 'DEFAULT',
      open: false,
      queue: 'competitive',
      eligibleQueues: ['competitive', 'unrated', 'swiftplay', 'spikerush', 'deathmatch', 'ggteam', 'hurm', 'premier'],
      isOwner: true,
      queueEntryTime: '0001-01-01T00:00:00Z',
      members: [member(ME, D.cards.nova, true), member(ZEPHYR, D.cards.zephyr, false)],
    };
  }

  const pidOf = (p) => `${p.puuid}@eu1.pvp.net`;
  const mapRef = (name) => {
    const m = mapByName(name);
    return { name: m.name, icon: m.listIcon, splash: m.splash };
  };
  const LUMEN = person('Lumen', '4321', 302);
  const KESTREL = person('Kestrel', '1337', 96);
  const SABLE = person('Sable', 'FR2', 143);
  const ORBIT = person('Orbit', 'EU1', 228);
  const ECHO = person('Echo', 'EUW1', 175);
  const JUNO = person('Juno', '2002', 64);
  const VESPER = person('Vesper', '0001', 389);
  const TALON = person('Talon', '88', 117);

  function friendEntry(p, { status = 'offline', product = null, lastOnline = null, card = null, title = null, note = '', valorant = null }) {
    return {
      puuid: p.puuid,
      pid: pidOf(p),
      name: p.name,
      tag: p.tag,
      note,
      online: status !== 'offline',
      status,
      product,
      lastOnline,
      card: card ? { small: card.small, wide: card.wide } : null,
      title: title?.name || null,
      valorant: valorant && {
        loop: 'MENUS', queue: '', map: null, partySize: 1, partyMax: 5, partyState: 'DEFAULT', withMe: false,
        level: p.level, tier: 0, score: null, idle: false, ...valorant,
      },
    };
  }

  function friends() {
    const l = demo.live;
    const zephyr = l.state === 'ingame'
      ? { loop: 'INGAME', queue: 'competitive', map: mapRef('Ascent'), score: [...l.score] }
      : l.state === 'pregame' ? { loop: 'PREGAME', queue: 'competitive', map: mapRef('Ascent') } : { loop: 'MENUS', queue: 'competitive' };
    const list = [
      friendEntry(ZEPHYR, { status: l.state === 'idle' ? 'chat' : 'dnd', product: 'valorant', card: D.cards.zephyr, title: D.titles.zephyr,
        valorant: { ...zephyr, partySize: 2, withMe: true, tier: RANKS.get(ZEPHYR).tier } }),
      friendEntry(LUMEN, { status: 'dnd', product: 'valorant', card: D.cards.lumen, title: D.titles.lumen,
        valorant: { loop: 'INGAME', queue: 'unrated', map: mapRef('Lotus'), score: [4, 7], partySize: 3, tier: 22 } }),
      friendEntry(KESTREL, { status: 'dnd', product: 'valorant', card: D.cards.kestrel, title: D.titles.kestrel,
        valorant: { loop: 'PREGAME', queue: 'competitive', map: mapRef('Sunset'), partySize: 2, tier: 19 } }),
      friendEntry(SABLE, { status: 'chat', product: 'valorant', card: D.cards.sable, title: D.titles.sable,
        valorant: { loop: 'MENUS', queue: 'swiftplay', partyState: 'MATCHMAKING', tier: 16 } }),
      friendEntry(ORBIT, { status: 'chat', product: 'valorant', card: D.cards.orbit, title: D.titles.orbit, note: 'duo du mardi',
        valorant: { loop: 'MENUS', queue: 'competitive', partySize: 2, tier: 18 } }),
      friendEntry(ECHO, { status: 'away', product: 'valorant', card: D.cards.echo, title: D.titles.echo,
        valorant: { loop: 'MENUS', queue: 'unrated', idle: true, tier: 21 } }),
      friendEntry(JUNO, { status: 'chat', product: 'league_of_legends' }),
      friendEntry(VESPER, { lastOnline: NOW - 3 * HOUR - 12 * MIN }),
      friendEntry(TALON, { lastOnline: NOW - 4 * DAY - 2 * HOUR }),
    ];
    const weight = (f) => (!f.online ? 3 : f.valorant?.loop === 'INGAME' || f.valorant?.loop === 'PREGAME' ? 0 : f.valorant ? 1 : 2);
    return list.sort((a, b) => weight(a) - weight(b) || a.name.localeCompare(b.name, 'fr'));
  }

  const msg = (who, body, ago) => ({ id: `m-${uuid()}`, mine: who === ME, body, time: NOW - ago, name: who.name });
  const CHATS = new Map([
    [pidOf(ZEPHYR), [
      msg(ZEPHYR, 'gg la Haven, ton entrée en B était propre', 32 * MIN),
      msg(ME, 'merci, on en relance une ?', 31 * MIN),
      msg(ZEPHYR, 'go, je lance la file', 30 * MIN),
      msg(ZEPHYR, 'ils ont une Reyna Immortel en face, je smoke le haut de A', 22 * MIN),
    ]],
    [pidOf(KESTREL), [
      msg(ME, 'tu étais à combien de RR hier ?', 26 * HOUR),
      msg(KESTREL, '74, plus que quelques parties avant Diamant 3', 26 * HOUR - 4 * MIN),
      msg(KESTREL, 'tu joues ce soir ?', 19 * MIN),
      msg(KESTREL, 'on cherche un cinquième pour la Premier de jeudi', 18 * MIN),
    ]],
    [pidOf(ORBIT), [
      msg(ORBIT, 'mardi soir comme d’hab ?', 2 * DAY + 3 * HOUR),
      msg(ME, 'oui, 21 h', 2 * DAY + 2 * HOUR),
    ]],
  ]);
  const unread = { [pidOf(KESTREL)]: { count: 2, last: CHATS.get(pidOf(KESTREL)).at(-1).id } };

  // ================= Résolution étirée =================
  const DISPLAY = {
    gdi: '\\\\.\\DISPLAY1',
    id: 'MONITOR\\GBT2702\\{4d36e96e-e325-11ce-bfc1-08002be10318}\\0001',
    gpu: 'NVIDIA GeForce RTX 4070',
    primary: true,
    w: 1920,
    h: 1080,
    hz: 240,
    modes: [
      [1920, 1080, 240], [1920, 1080, 165], [1920, 1080, 144], [1920, 1080, 60], [1680, 1050, 240], [1600, 1024, 240],
      [1600, 900, 240], [1440, 1080, 240], [1440, 900, 240], [1366, 768, 240], [1280, 1024, 240], [1280, 960, 240],
      [1280, 800, 240], [1280, 720, 240], [1152, 864, 240], [1024, 768, 240], [800, 600, 240],
    ],
  };

  function stretchStatus() {
    const c = demo.settings.stretch;
    const s = demo.stretch;
    return {
      enabled: c.enabled,
      phase: c.enabled ? s.phase : 'off',
      switchAt: s.phase === 'armed' ? s.switchAt : null,
      fromLog: ['game', 'armed', 'stretched'].includes(s.phase),
      res: s.res,
      width: c.width,
      height: c.height,
      native: c.native,
      monitors: c.monitors,
      monitorsReady: true,
      monitorsOutdated: false,
      hotkeys: c.hotkeys,
      hotkeysFailed: [],
      screensOff: s.screensOff,
      screen: c.screen,
      gameScreen: ['game', 'armed', 'stretched'].includes(s.phase) ? DISPLAY.gdi : null,
      problems: [],
    };
  }

  // ================= Canaux =================
  const listeners = new Map(); // canal → Set(cb)
  const EVENTS = new Set(['status', 'assets', 'update', 'stats-sync', 'stretch', 'stretch-event']);
  function emit(channel, data) {
    if (channel === 'status') demo.status = clone(data);
    if (channel === 'update') demo.update = clone(data);
    for (const cb of listeners.get(channel) || []) {
      try { cb(clone(data)); } catch (e) { console.error(e); }
    }
  }

  const CLIENT_ACTIONS_MESSAGE =
    'Fonction désactivée : elle agit directement sur votre compte via le Riot Client, ce que Riot peut sanctionner (suspension de compte).';
  const locked = () => {
    throw Object.assign(new Error(CLIENT_ACTIONS_MESSAGE), { code: 'CLIENT_ACTIONS_DISABLED' });
  };
  const px0 = (fn) => (...args) => {
    if (!demo.settings.px0) throw new Error('Liste de souhaits PX-0 non liée.');
    return fn(...args);
  };
  const assets = () => ({ agents: A.agents, maps: A.maps, tiers: A.tiers, weapons: A.weapons, currentAct: A.currentAct, acts: A.acts });

  function setSettings(patch) {
    const before = demo.settings;
    const { openAtLogin, ...rest } = patch || {};
    demo.settings = { ...before, ...rest, stretch: { ...before.stretch, ...(rest.stretch || {}) } };
    if (typeof openAtLogin === 'boolean') demo.settings.openAtLogin = openAtLogin;
    if (rest.stretch) {
      // Stretch.configure : fonction activée → en attente du jeu, coupée → désactivée
      if ('enabled' in rest.stretch && rest.stretch.enabled !== before.stretch.enabled) {
        demo.stretch = { ...demo.stretch, phase: rest.stretch.enabled ? 'idle' : 'off', res: 'native', switchAt: null, screensOff: 0 };
      }
      emit('stretch', stretchStatus());
    }
    if ('regionOverride' in (patch || {}) && patch.regionOverride !== before.regionOverride) setTimeout(() => emit('status', demo.status), 600);
    return demo.settings;
  }

  const HANDLERS = {
    // Toujours disponibles (needsAuth: false dans main.js)
    status: { auth: false, fn: () => demo.status },
    connect: { auth: false, fn: () => demo.status },
    assets: { auth: false, fn: assets },
    'assets-refresh': { auth: false, fn: async () => { await sleep(700); return assets(); } },
    restrictions: { auth: false, fn: () => ({ clientActions: false, message: CLIENT_ACTIONS_MESSAGE }) },
    'settings-get': { auth: false, fn: () => demo.settings },
    'settings-set': { auth: false, fn: setSettings },
    'launch-riot': { auth: false, fn: () => true },
    'open-external': { auth: false, fn: () => undefined },
    'update-state': { auth: false, fn: () => demo.update },
    'update-check': {
      auth: false,
      fn: async () => {
        emit('update', { ...demo.update, status: 'checking' });
        await sleep(900);
        emit('update', { ...demo.update, status: 'none' });
        return demo.update;
      },
    },
    'update-install': { auth: false, fn: () => undefined },
    'live-leave': { auth: false, fn: () => undefined },
    'stretch-info': { auth: false, fn: () => ({ ...stretchStatus(), display: DISPLAY, screens: [{ gdi: DISPLAY.gdi, id: DISPLAY.id, primary: true, w: 1920, h: 1080, hz: 240, name: 'M27Q' }], configLocked: true }) },
    'stretch-install': { auth: false, fn: async () => { await sleep(800); emit('stretch', stretchStatus()); } },
    'stretch-lock': { auth: false, fn: (lock) => { demo.settings.stretch.gameConfig = !!lock; emit('stretch', stretchStatus()); return { restart: false }; } },
    'stretch-test': { auth: false, fn: () => sleep(3000) },
    'stretch-check': {
      auth: false,
      fn: (w, h) => {
        if (![w, h].every((v) => Number.isInteger(v) && v >= 640 && v <= 7680)) throw new Error('Résolution invalide.');
        if (w > 1920 || h > 1080) throw new Error('Choisissez une résolution jusqu’à 1920 × 1080.');
      },
    },
    'stretch-restore': { auth: false, fn: async () => { await sleep(400); demo.stretch.res = 'native'; emit('stretch', stretchStatus()); } },
    'stretch-hotkeys-pause': { auth: false, fn: () => undefined },

    // Compte lié nécessaire
    profile: { fn: profile },
    store: { fn: store },
    collection: { fn: collection },
    live: { fn: live },
    history: { fn: (queue) => history(queue) },
    'history-cached': { fn: (queue) => history(queue) },
    party: { fn: party },
    friends: { fn: friends },
    'chat-unread': { fn: () => unread },
    'chat-messages': {
      fn: (cid) => {
        if (!/^[\w-]+@[\w.-]+$/.test(cid || '')) throw new Error('Conversation invalide.');
        return CHATS.get(cid) || [];
      },
    },
    'chat-read': { fn: locked },
    'chat-send': { fn: locked },
    'party-queue': { fn: locked },
    'party-matchmaking': { fn: locked },
    'party-access': { fn: locked },
    wishlist: { fn: px0(wishlistBody) },
    'wishlist-add': {
      fn: px0((id) => {
        if (wish.skins.length >= 50) throw new Error('Votre liste est pleine (50 skins au maximum).');
        if (!wish.skins.includes(id)) wish.skins.push(id);
        return wishlistBody();
      }),
    },
    'wishlist-remove': { fn: px0((id) => { wish.skins = wish.skins.filter((x) => x !== id); return wishlistBody(); }) },
    'px0-link-start': { fn: px0(() => ({ id: '0721'.repeat(8), step: 'discord', discordUrl: 'https://discord.com/oauth2/authorize' })) },
    'px0-link': { fn: px0((id) => ({ id, step: 'discord', discordUrl: 'https://discord.com/oauth2/authorize' })) },
    'px0-link-qr': { fn: px0((id) => ({ id, step: 'riot', qr: null, error: 'riot_unavailable' })) },
    'wishlist-catalog': { fn: wishlistCatalog },
    'stats-data': {
      fn: () => ({
        records: RECORDS,
        rr: RR_UPDATES,
        actRanks: {
          [CURRENT_ACT]: { tier: 21, rr: 68, wins: 31, games: 52, peak: 21 },
          ...(PREV_ACT && { [PREV_ACT]: { tier: 21, rr: 40, wins: 48, games: 89, peak: 22 } }),
          ...(OLDER_ACT && { [OLDER_ACT]: { tier: 20, rr: 55, wins: 41, games: 80, peak: 20 } }),
        },
        rank: clone(RANKS.get(ME)),
        sync: demo.sync,
      }),
    },
    'stats-sync': { fn: () => demo.sync },
  };

  const calls = [];
  const control = {
    latency: Number(params.get('latency')) || 0,
    latencyFor: {},
  };

  window.api = {
    call: async (channel, ...args) => {
      calls.push({ channel, args: clone(args), at: Date.now() });
      if (calls.length > 500) calls.shift();
      const h = HANDLERS[channel];
      // Même erreur qu'ipcRenderer.invoke sans handler
      if (!h) throw new Error(`Error invoking remote method '${channel}': Error: No handler registered for '${channel}'`);
      const ms = control.latencyFor[channel] ?? control.latency;
      await (ms ? sleep(ms) : null);
      try {
        if (h.auth !== false && !demo.status.connected) throw new Error('Compte non connecté. Lancez VALORANT et connectez-vous.');
        return { ok: true, data: clone(await h.fn(...clone(args))) };
      } catch (e) {
        return { ok: false, error: e.message, code: e.code };
      }
    },
    on: (channel, cb) => {
      if (!EVENTS.has(channel)) return () => {};
      if (!listeners.has(channel)) listeners.set(channel, new Set());
      listeners.get(channel).add(cb);
      return () => listeners.get(channel)?.delete(cb);
    },
  };

  // ================= Pilotage =================
  // Page prête : plus de chargement, images visibles chargées (les images hors de l'écran ne comptent pas).
  async function whenIdle({ timeout = 15000 } = {}) {
    const until = Date.now() + timeout;
    const visible = (img) => {
      const r = img.getBoundingClientRect();
      return r.width && r.height && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    };
    while (Date.now() < until) {
      const busy = document.querySelector('#content > .loader, #content .loader, #content .mini-loader');
      const pending = [...document.images].filter((img) => visible(img) && !img.complete);
      if (!busy && !pending.length && document.querySelector('#content > :not(.loader)')) {
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        return true;
      }
      await sleep(50);
    }
    return false;
  }

  function stretch(phase, opts = {}) {
    clearTimeout(control.stretchTimer);
    const res = opts.res || (phase === 'stretched' ? 'stretched' : 'native');
    const s = { phase, res, switchAt: null, screensOff: ['launching', 'game', 'armed', 'stretched'].includes(phase) ? 1 : 0 };
    if (phase === 'armed' && opts.in) {
      s.switchAt = Date.now() + opts.in;
      control.stretchTimer = setTimeout(() => stretch('stretched'), opts.in);
    }
    demo.settings.stretch.enabled = phase !== 'off'; // 'off' : fonction coupée, comme l'interrupteur de la page
    demo.stretch = s;
    emit('stretch', stretchStatus());
    if (typeof renderNav === 'function') renderNav(); // point vert « Activé » du menu
    return stretchStatus();
  }

  async function stretchFlow({ step = 1500, countdown = 5000 } = {}) {
    stretch('launching');
    await sleep(step);
    stretch('game');
    await sleep(step);
    stretch('armed', { in: countdown });
    await sleep(countdown + 50);
    return stretchStatus();
  }

  async function sync({ total = 3, every = 900 } = {}) {
    const set = (patch) => { demo.sync = { ...demo.sync, ...patch }; emit('stats-sync', demo.sync); };
    set({ running: true, done: 0, total: 0, waitUntil: null, error: null });
    await sleep(every);
    set({ total });
    for (let i = 1; i <= total; i++) {
      await sleep(every);
      set({ done: i });
    }
    set({ running: false, waitUntil: null, lastSync: Date.now() });
    return demo.sync;
  }

  window.__demo = {
    get latency() { return control.latency; },
    set latency(ms) { control.latency = Math.max(0, Number(ms) || 0); },
    get latencyFor() { return control.latencyFor; },
    set latencyFor(map) { control.latencyFor = { ...(map || {}) }; },
    calls,
    emit(channel, data) {
      emit(channel, data);
    },
    go(page) {
      navigate(page); // fonction globale de renderer/app.js
      return whenIdle();
    },
    whenIdle,
    live(stateName, opts = {}) {
      if (!['idle', 'pregame', 'ingame'].includes(stateName)) throw new Error(`État inconnu : ${stateName}`);
      demo.live = {
        state: stateName,
        score: opts.score ? [...opts.score] : stateName === 'ingame' && demo.live.state !== 'ingame' ? [0, 0] : demo.live.score,
        endsAt: Date.now() + (opts.endsIn ?? 60 * SEC),
      };
      return live();
    },
    score(allies, enemies) {
      demo.live.score = [allies, enemies];
      return live();
    },
    pick(name, agent, stateName = 'locked') {
      if (!PREGAME[name]) throw new Error(`Coéquipier inconnu : ${name}`);
      PREGAME[name] = { agent, state: agent ? stateName : '' };
      const entry = LIVE_ALLIES.find((e) => e.p.name === name);
      if (agent) entry.agent = agent;
      return live();
    },
    stretch,
    stretchFlow,
    sync,
    update(next) {
      emit('update', { ...demo.update, ...next });
      return demo.update;
    },
    connected(on = true) {
      emit('status', on
        ? { connected: true, name: ME.name, tag: ME.tag, region: 'eu', puuid: ME.puuid }
        : { connected: false, message: 'Riot Client fermé. En attente…', code: 'RIOT_CLIENT_CLOSED' });
      return demo.status;
    },
    get state() { return clone(demo); },
    data: { me: ME, matches: SUMMARIES, records: RECORDS, rr: RR_UPDATES, recent: MY_RECENT },
  };

  // Accueil prêt. Les messages non lus sont relus tout de suite (l'app le fait toutes les 8 s) : le badge des Amis
  // est déjà là au début de la vidéo.
  window.__demo.ready = new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      if (typeof state !== 'undefined' && state.status?.connected && state.page === 'home' && document.querySelector('#content .dash')) {
        if (typeof refreshUnread === 'function') refreshUnread();
        whenIdle().then(resolve);
      } else if (Date.now() - start < 20000) setTimeout(tick, 50);
      else resolve(false);
    };
    tick();
  });
})();
