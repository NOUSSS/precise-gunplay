// Données visuelles (agents, skins, cartes, rangs...) depuis valorant-api.com, mises en cache sur disque.
const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { nativeImage } = require('electron');

const BASE = 'https://valorant-api.com/v1';
const LANG = 'fr-FR';
const SCHEMA = 4; // à incrémenter quand la forme du cache change
// Compétences dans l'ordre des touches du jeu (C, Q, E, X) ; le passif n'a pas d'icône.
const ABILITY_SLOTS = ['Grenade', 'Ability1', 'Ability2', 'Ultimate'];
// Icônes d'agent fournies en 1024 × 1024 (400 Ko) et affichées à 110 px au plus, souvent par centaines
// (tableaux des scores) : une copie réduite sur disque pèse 16 fois moins une fois décodée.
const AGENT_ICON_SIZE = 256;

const ITEM_TYPES = {
  skin: 'e7c63390-eda7-46e0-bb7a-a6abdacd2433',
  buddy: 'dd3bf334-87f3-40bd-b043-682a57a8dc3a',
  card: '3f296c07-64c3-494c-923b-fe692a4fa1bd',
  spray: 'd5f120f8-ff8c-4aac-92ea-f2b5acbe9475',
  title: 'de7caa6b-adf7-4588-bbd1-143831e786c6',
  agent: '01bb38e1-da47-4e6a-9b3d-945fe4655707',
  flex: '03a572de-4234-31ed-d344-ababa488f981',
  currency: 'ea6fcd2e-8373-4137-b1c0-b458947aa86d',
};

const CURRENCIES = {
  '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741': 'vp',
  'e59aa87c-4cbf-517a-5983-6e81511be9b7': 'rp',
  '85ca954a-41f2-ce94-9b45-8ca3dd39a00d': 'kc',
};

async function get(endpoint, options) {
  const sep = endpoint.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}${endpoint}${sep}language=${LANG}`, options);
  if (!res.ok) throw new Error(`valorant-api.com ${res.status} (${endpoint})`);
  return (await res.json()).data;
}

// Version du jeu : demandée au démarrage par le cache des données et par la connexion (en-tête
// X-Riot-ClientVersion), une seule requête pour les deux. Un échec n'est pas gardé.
let versionReq = null;
let versionAt = 0;
function gameVersion() {
  if (!versionReq || Date.now() - versionAt > 60 * 1000) {
    versionAt = Date.now();
    versionReq = get('/version', { signal: AbortSignal.timeout(8000) }).catch(() => {
      versionReq = null;
      return null;
    });
  }
  return versionReq;
}

class Assets extends EventEmitter {
  constructor(cacheDir) {
    super();
    this.cacheFile = path.join(cacheDir, 'assets-cache.json');
    this.iconDir = path.join(cacheDir, 'agent-icons');
    this.ready = null;
    this.data = null;
  }

  load(force = false) {
    if (!this.ready || force) {
      this.ready = this._load(force).catch((e) => {
        this.ready = null;
        throw e;
      });
    }
    return this.ready;
  }

  async _load(force) {
    if (!force) {
      let cached = null;
      try {
        cached = JSON.parse(await fs.promises.readFile(this.cacheFile, 'utf8'));
      } catch { /* pas de cache */ }
      if (cached?.schema === SCHEMA) {
        // Le cache sert tout de suite, sans attendre le réseau ; s'il date d'une version précédente du
        // jeu, les nouvelles données le remplacent dès qu'elles sont prêtes. Vérification une fois la
        // fenêtre ouverte : le premier fetch bloque ~40 ms le temps de charger son moteur (undici).
        this.index(cached);
        setTimeout(() => this.renew(cached.version), 2000);
        return;
      }
    }
    await this.download((await gameVersion())?.version || null);
  }

  renew(cachedVersion) {
    gameVersion()
      .then((v) => {
        if (v?.version && v.version !== cachedVersion) return this.download(v.version).then(() => this.emit('updated'));
      })
      .catch(() => { /* hors ligne ou valorant-api.com en panne : le cache reste */ });
  }

  async download(version) {
    const [agents, skins, contentTiers, maps, compTiers, bundles, cards, sprays, buddies, titles, seasons, flex, weapons] =
      await Promise.all([
        get('/agents?isPlayableCharacter=true'),
        get('/weapons/skins'),
        get('/contenttiers'),
        get('/maps'),
        get('/competitivetiers'),
        get('/bundles'),
        get('/playercards'),
        get('/sprays'),
        get('/buddies'),
        get('/playertitles'),
        get('/seasons'),
        get('/flex').catch(() => []),
        get('/weapons'),
      ]);

    // Arme de chaque skin : /weapons/skins ne la donne pas, /weapons range les skins sous leur arme.
    const weaponOfSkin = new Map(weapons.flatMap((w) => (w.skins || []).map((s) => [s.uuid, w.uuid])));

    const raw = {
      schema: SCHEMA,
      version,
      agents: agents
        .map((a) => ({
          uuid: a.uuid,
          name: a.displayName,
          role: a.role?.displayName || '',
          roleIcon: a.role?.displayIcon || null,
          icon: a.displayIconSmall || a.displayIcon,
          portrait: a.fullPortrait || a.bustPortrait,
          colors: a.backgroundGradientColors || [],
          abilities: (a.abilities || [])
            .filter((x) => x.displayIcon && ABILITY_SLOTS.includes(x.slot))
            .sort((x, y) => ABILITY_SLOTS.indexOf(x.slot) - ABILITY_SLOTS.indexOf(y.slot))
            .map((x) => ({ name: x.displayName || '', icon: x.displayIcon })),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
      skins: skins.map((s) => ({
        uuid: s.uuid,
        name: s.displayName,
        icon: s.levels?.[0]?.displayIcon || s.displayIcon || s.chromas?.[0]?.fullRender,
        tier: s.contentTierUuid,
        weapon: weaponOfSkin.get(s.uuid) || null,
        levels: (s.levels || []).map((l) => l.uuid),
      })),
      contentTiers: contentTiers.map((t) => ({ uuid: t.uuid, name: t.devName, color: `#${(t.highlightColor || 'ffffffff').slice(0, 6)}`, icon: t.displayIcon, rank: t.rank })),
      maps: maps
        .filter((m) => m.mapUrl)
        .map((m) => ({ uuid: m.uuid, name: m.displayName, mapUrl: m.mapUrl, splash: m.splash, listIcon: m.listViewIcon, tactical: !!m.tacticalDescription })),
      tiers: (compTiers[compTiers.length - 1]?.tiers || []).map((t) => ({
        tier: t.tier,
        name: t.tierName,
        icon: t.smallIcon || t.largeIcon,
        color: `#${(t.color || 'ffffffff').slice(0, 6)}`,
      })),
      bundles: bundles.map((b) => ({ uuid: b.uuid, name: b.displayName, icon: b.displayIcon2 || b.displayIcon, art: b.verticalPromoImage })),
      cards: cards.map((c) => ({ uuid: c.uuid, name: c.displayName, icon: c.displayIcon, wide: c.wideArt, small: c.smallArt })),
      sprays: sprays.map((s) => ({ uuid: s.uuid, name: s.displayName, icon: s.fullTransparentIcon || s.displayIcon, levels: (s.levels || []).map((l) => l.uuid) })),
      buddies: buddies.map((b) => ({ uuid: b.uuid, name: b.displayName, icon: b.displayIcon, levels: (b.levels || []).map((l) => l.uuid) })),
      titles: titles.map((t) => ({ uuid: t.uuid, name: t.titleText || t.displayName })),
      flex: (flex || []).map((f) => ({ uuid: f.uuid, name: f.displayName, icon: f.displayIcon })),
      weapons: weapons.map((w) => ({ uuid: w.uuid, name: w.displayName, icon: w.killStreamIcon || w.displayIcon, art: w.displayIcon, category: w.category })),
      seasons: seasons.map((s) => ({ uuid: s.uuid, name: s.displayName, type: s.type, start: s.startTime, end: s.endTime, parent: s.parentUuid })),
    };

    try {
      fs.mkdirSync(path.dirname(this.cacheFile), { recursive: true });
      fs.writeFileSync(this.cacheFile, JSON.stringify(raw));
    } catch { /* cache facultatif */ }
    this.index(raw);
  }

  index(raw) {
    this.data = raw;
    const byId = (list) => new Map(list.map((x) => [x.uuid.toLowerCase(), x]));
    this.agentById = byId(raw.agents);
    this.mapById = byId(raw.maps);
    this.mapByUrl = new Map(raw.maps.map((m) => [m.mapUrl.toLowerCase(), m]));
    this.tierByUuid = byId(raw.contentTiers);
    this.bundleById = byId(raw.bundles);
    this.cardById = byId(raw.cards);
    this.titleById = byId(raw.titles);
    this.flexById = byId(raw.flex);
    this.skinById = byId(raw.skins);
    this.skinByLevel = new Map();
    for (const s of raw.skins) for (const l of s.levels) this.skinByLevel.set(l.toLowerCase(), s);
    this.sprayById = byId(raw.sprays);
    for (const s of raw.sprays) for (const l of s.levels) this.sprayById.set(l.toLowerCase(), s);
    this.buddyById = byId(raw.buddies);
    for (const b of raw.buddies) for (const l of b.levels) this.buddyById.set(l.toLowerCase(), b);
    this.localAgentIcons(raw.agents);
  }

  // Icônes déjà réduites : utilisées tout de suite. Les autres sont préparées en arrière-plan pour le
  // prochain lancement (l'icône d'origine sert en attendant).
  localAgentIcons(agents) {
    const missing = [];
    for (const a of agents) {
      const file = path.join(this.iconDir, `${a.uuid}.png`);
      if (fs.existsSync(file)) a.icon = pathToFileURL(file).href;
      else if (a.icon) missing.push({ url: a.icon, file });
    }
    if (missing.length) this.shrinkAgentIcons(missing).catch(() => {});
  }

  async shrinkAgentIcons(list) {
    fs.mkdirSync(this.iconDir, { recursive: true });
    for (const { url, file } of list) {
      const res = await fetch(url).catch(() => null);
      if (!res?.ok) continue;
      const img = nativeImage.createFromBuffer(Buffer.from(await res.arrayBuffer()));
      if (img.isEmpty()) continue;
      const small = img.getSize().width > AGENT_ICON_SIZE ? img.resize({ width: AGENT_ICON_SIZE, quality: 'best' }) : img;
      // Fichier temporaire puis renommage : un arrêt en cours d'écriture ne laisse pas d'icône tronquée.
      fs.writeFileSync(`${file}.tmp`, small.toPNG());
      fs.renameSync(`${file}.tmp`, file);
    }
  }

  /** Données légères envoyées à l'interface. */
  summary() {
    const d = this.data;
    return { agents: d.agents, maps: d.maps, tiers: d.tiers, weapons: d.weapons, currentAct: this.currentAct(), acts: this.acts() };
  }

  currentAct() {
    const now = Date.now();
    const act = this.data.seasons.find(
      (s) => s.parent && s.type === 'EAresSeasonType::Act' && Date.parse(s.start) <= now && now <= Date.parse(s.end)
    );
    return act ? { uuid: act.uuid, name: act.name, start: Date.parse(act.start) } : null;
  }

  /** Actes déjà commencés, du plus récent au plus ancien, avec le nom de leur épisode. */
  acts() {
    const now = Date.now();
    const byId = new Map(this.data.seasons.map((s) => [s.uuid, s]));
    return this.data.seasons
      .filter((s) => s.parent && s.type === 'EAresSeasonType::Act' && Date.parse(s.start) <= now)
      .map((s) => ({ uuid: s.uuid, name: `${byId.get(s.parent)?.name || ''} · ${s.name}`.replace(/^ · /, ''), start: Date.parse(s.start), end: Date.parse(s.end) }))
      .sort((a, b) => b.start - a.start);
  }

  map(mapUrl) {
    return mapUrl ? this.mapByUrl.get(String(mapUrl).toLowerCase()) || null : null;
  }

  /** Transforme une récompense (type + id) en objet affichable. */
  item(typeId, itemId) {
    const id = String(itemId || '').toLowerCase();
    switch (String(typeId || '').toLowerCase()) {
      case ITEM_TYPES.skin: {
        const s = this.skinByLevel.get(id) || this.skinById.get(id);
        const tier = s && this.tierByUuid.get(String(s.tier).toLowerCase());
        return { kind: 'Skin', skinId: s?.uuid || null, name: s?.name || 'Skin inconnu', icon: s?.icon, color: tier?.color, tierIcon: tier?.icon };
      }
      case ITEM_TYPES.buddy: {
        const b = this.buddyById.get(id);
        return { kind: 'Porte-bonheur', name: b?.name || 'Porte-bonheur', icon: b?.icon };
      }
      case ITEM_TYPES.card: {
        const c = this.cardById.get(id);
        return { kind: 'Carte', name: c?.name || 'Carte', icon: c?.icon };
      }
      case ITEM_TYPES.spray: {
        const s = this.sprayById.get(id);
        return { kind: 'Tag', name: s?.name || 'Tag', icon: s?.icon };
      }
      case ITEM_TYPES.title: {
        const t = this.titleById.get(id);
        return { kind: 'Titre', name: t?.name || 'Titre', icon: null };
      }
      case ITEM_TYPES.flex: {
        const f = this.flexById.get(id);
        return { kind: 'Accessoire', name: f?.name || 'Accessoire', icon: f?.icon };
      }
      case ITEM_TYPES.agent: {
        const a = this.agentById.get(id);
        return { kind: 'Agent', name: a?.name || 'Agent', icon: a?.icon };
      }
      default:
        return { kind: 'Objet', name: 'Objet', icon: null };
    }
  }
}

module.exports = { Assets, ITEM_TYPES, CURRENCIES, gameVersion };
