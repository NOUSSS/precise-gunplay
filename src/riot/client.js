// Client des API VALORANT (serveurs PD / GLZ de Riot) authentifié via le Riot Client local.
const { readLockfile, readShooterLog, localRequest } = require('./local');
const { gameVersion } = require('../assets');

const CLIENT_PLATFORM =
  'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9';

const SHARD_BY_REGION = { na: 'na', latam: 'na', br: 'na', eu: 'eu', ap: 'ap', kr: 'kr', pbe: 'pbe' };

const REGION_BY_LOCALE_REGION = {
  NA: 'na', NA1: 'na', PBE: 'pbe', BR: 'br', BR1: 'br', LA1: 'latam', LA2: 'latam', LAN: 'latam', LAS: 'latam',
  EUW: 'eu', EUW1: 'eu', EUNE: 'eu', EUN1: 'eu', TR: 'eu', TR1: 'eu', RU: 'eu', RU1: 'eu', ME1: 'eu',
  KR: 'kr', KR1: 'kr', JP: 'ap', JP1: 'ap', OC1: 'ap', OCE: 'ap', SG2: 'ap', PH2: 'ap', TW2: 'ap', VN2: 'ap', TH2: 'ap',
};

const ENTITLEMENT_TYPES = {
  agent: '01bb38e1-da47-4e6a-9b3d-945fe4655707',
  skin: 'e7c63390-eda7-46e0-bb7a-a6abdacd2433',
};

/** Famille d'endpoint utilisée pour les limites de requêtes : '/match-details/v1/matches/x' → '/match-details'. */
function rateBucket(urlPath) {
  return '/' + String(urlPath).split('/')[1];
}

// Requêtes de fond (synchronisation des stats) : une à la fois par famille d'endpoint, espacées, jamais
// pendant qu'une page attend la même famille, et pas au-delà de BACKGROUND_PER_MINUTE requêtes de la famille
// (pages comprises) sur la dernière minute. Riot accepte ~65 détails de match par minute : une page garde
// toujours de la marge et ne patiente pas derrière une pause que le fond aurait provoquée.
const BACKGROUND_GAP_MS = 1200;
const BACKGROUND_PER_MINUTE = 40;
const REQUEST_TIMEOUT_MS = 20000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class RiotError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

class RiotClient {
  constructor() {
    // Gardés d'une connexion à l'autre : une coupure de l'app ne lève pas la pause que Riot a demandée.
    this.rateLimits = new Map(); // pause imposée par Riot, par famille d'endpoint (ex : /match-details)
    this.sent = new Map(); // heures d'envoi de la dernière minute, par famille
    this.reset();
  }

  reset() {
    this.lock = null;
    this.tokens = null;
    this.tokensAt = 0;
    this.puuid = null;
    this.region = null;
    this.shard = null;
    this.version = null;
    this.busy = new Map(); // requêtes des pages en cours, par famille
    this.lanes = new Map(); // requêtes de fond : { tail, next } par famille
  }

  get connected() {
    return !!this.tokens;
  }

  info() {
    return { connected: this.connected, puuid: this.puuid, region: this.region, shard: this.shard };
  }

  async connect({ regionOverride } = {}) {
    const lock = readLockfile();
    if (!lock) {
      this.reset();
      throw new RiotError('RIOT_CLIENT_CLOSED', 'Riot Client introuvable. Lancez VALORANT puis réessayez.');
    }
    this.lock = lock;
    await this.refreshTokens();
    // La région devient un morceau de nom d'hôte qui reçoit les jetons de session : jamais une valeur libre.
    if (regionOverride && !Object.hasOwn(SHARD_BY_REGION, regionOverride)) {
      throw new RiotError('NO_REGION', 'Région inconnue. Choisissez-la de nouveau dans les paramètres.');
    }
    this.region = regionOverride || (await this.detectRegion());
    if (!this.region || !/^[a-z0-9]+$/.test(this.region)) {
      this.region = null;
      throw new RiotError('NO_REGION', 'Région introuvable. Lancez VALORANT une fois ou choisissez votre région dans les paramètres.');
    }
    this.shard = SHARD_BY_REGION[this.region] || this.region;
    this.version = await this.detectVersion();
  }

  async refreshTokens() {
    let t;
    try {
      t = await localRequest(this.lock, 'GET', '/entitlements/v1/token');
    } catch (e) {
      this.tokens = null;
      // Pas de réponse HTTP = le Riot Client ne tourne pas (lockfile resté d'une ancienne session).
      if (!e.status) throw new RiotError('RIOT_CLIENT_CLOSED', 'Riot Client fermé. Lancez VALORANT puis réessayez.');
      throw new RiotError('NOT_LOGGED_IN', 'Connectez-vous à votre compte dans le Riot Client.');
    }
    if (!t || !t.accessToken || !t.token) {
      this.tokens = null;
      throw new RiotError('NOT_LOGGED_IN', 'Connectez-vous à votre compte dans le Riot Client.');
    }
    this.tokens = { access: t.accessToken, entitlement: t.token };
    this.puuid = t.subject;
    this.tokensAt = Date.now();
  }

  async detectRegion() {
    // 1) Arguments de lancement de VALORANT (fiable quand le jeu tourne)
    try {
      const sessions = await localRequest(this.lock, 'GET', '/product-session/v1/external-sessions');
      for (const s of Object.values(sessions || {})) {
        for (const arg of s?.launchConfiguration?.arguments || []) {
          const m = /^-ares-deployment=(.+)$/.exec(arg);
          if (m) return m[1].toLowerCase();
        }
      }
    } catch { /* ignoré */ }
    // 2) Logs du jeu
    const m = /https:\/\/glz-(.+?)-1\.(.+?)\.a\.pvp\.net/.exec(readShooterLog());
    if (m) return m[1];
    // 3) Région du compte Riot
    try {
      const rl = await localRequest(this.lock, 'GET', '/riotclient/region-locale');
      const r = REGION_BY_LOCALE_REGION[String(rl?.region || '').toUpperCase()];
      if (r) return r;
    } catch { /* ignoré */ }
    return null;
  }

  async detectVersion() {
    const v = await gameVersion();
    if (v?.riotClientVersion) return v.riotClientVersion;
    const m = /CI server version: (.+)/.exec(readShooterLog());
    if (m) return m[1].trim();
    return 'release-09.00-shipping-0-0';
  }

  headers() {
    return {
      Authorization: `Bearer ${this.tokens.access}`,
      'X-Riot-Entitlements-JWT': this.tokens.entitlement,
      'X-Riot-ClientPlatform': CLIENT_PLATFORM,
      'X-Riot-ClientVersion': this.version,
    };
  }

  /** `background` : requête de fond, servie après celles des pages (voir BACKGROUND_GAP_MS). */
  async request(base, method, urlPath, body, { background = false } = {}) {
    const bucket = rateBucket(urlPath);
    const busy = this.busy;
    if (background) await this.backgroundTurn(bucket);
    else busy.set(bucket, (busy.get(bucket) || 0) + 1);
    try {
      return await this.send(base, method, urlPath, body, bucket);
    } finally {
      if (!background) busy.set(bucket, busy.get(bucket) - 1);
    }
  }

  /** Tour d'une requête de fond : après la précédente de sa famille, espacée d'elle, quand aucune page n'attend. */
  backgroundTurn(bucket) {
    const busy = this.busy;
    let lane = this.lanes.get(bucket);
    if (!lane) this.lanes.set(bucket, (lane = { tail: Promise.resolve(), next: 0 }));
    lane.tail = lane.tail.then(async () => {
      for (;;) {
        const sent = this.sentLastMinute(bucket);
        const full = sent.length >= BACKGROUND_PER_MINUTE ? sent[sent.length - BACKGROUND_PER_MINUTE] + 60000 : 0;
        const wait = Math.max(this.rateLimits.get(bucket) || 0, lane.next, full) - Date.now();
        if (wait > 0) await sleep(wait);
        else if (busy.get(bucket)) await sleep(200);
        else break;
      }
      lane.next = Date.now() + BACKGROUND_GAP_MS;
    });
    return lane.tail;
  }

  /** Heures d'envoi des requêtes de la famille sur la dernière minute (pages et fond). */
  sentLastMinute(bucket) {
    let sent = this.sent.get(bucket);
    if (!sent) this.sent.set(bucket, (sent = []));
    while (sent.length && sent[0] <= Date.now() - 60000) sent.shift();
    return sent;
  }

  async send(base, method, urlPath, body, bucket, retry = true, attempt = 0) {
    if (!this.connected) throw new RiotError('NOT_CONNECTED', 'Compte non connecté.');
    // Si Riot a demandé d'attendre pour cette famille d'endpoint, toutes ses requêtes patientent ensemble.
    const wait = (this.rateLimits.get(bucket) || 0) - Date.now();
    if (wait > 0) await sleep(wait);
    if (Date.now() - this.tokensAt > 4 * 60 * 1000) {
      await this.refreshTokens().catch(() => {});
    }
    if (!this.connected) throw new RiotError('NOT_CONNECTED', 'Compte non connecté.');
    this.sentLastMinute(bucket).push(Date.now());
    // Sans délai, une connexion bloquée laisserait la page sur son chargement.
    let res, text;
    try {
      res = await fetch(base + urlPath, {
        method,
        headers: { ...this.headers(), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      text = await res.text();
    } catch (e) {
      if (e.name === 'TimeoutError') throw new RiotError('TIMEOUT', 'Riot ne répond pas : réessayez dans un instant.');
      throw e;
    }
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    const authError = res.status === 401 || (res.status === 400 && /BAD_CLAIMS|TOKEN|AUTH/i.test(data?.errorCode || ''));
    if (authError && retry) {
      await this.refreshTokens();
      return this.send(base, method, urlPath, body, bucket, false);
    }
    if (res.status === 429 && attempt < 5) {
      // Limite de requêtes Riot : on respecte le délai demandé (souvent jusqu'à 60 s) puis on réessaie.
      const delay = Math.min(Number(res.headers.get('retry-after')) * 1000 || 5000 * (attempt + 1), 120000);
      const until = Math.max(this.rateLimits.get(bucket) || 0, Date.now() + delay + 500);
      this.rateLimits.set(bucket, until);
      this.onRateLimit?.(bucket, until);
      return this.send(base, method, urlPath, body, bucket, retry, attempt + 1);
    }
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new RiotError(`HTTP_${res.status}`, data?.message || `Erreur Riot ${res.status} (${urlPath})`);
    }
    return data;
  }

  pd(method, p, body, opts) {
    return this.request(`https://pd.${this.shard}.a.pvp.net`, method, p, body, opts);
  }

  glz(method, p, body) {
    return this.request(`https://glz-${this.region}-1.${this.shard}.a.pvp.net`, method, p, body);
  }

  local(method, p, body) {
    return localRequest(this.lock, method, p, body);
  }

  // ---- Joueur ----
  getNames(puuids) {
    return this.pd('PUT', '/name-service/v2/players', puuids);
  }
  getAccountXP() {
    return this.pd('GET', `/account-xp/v1/players/${this.puuid}`);
  }
  async getLoadout() {
    // Riot a retiré la v2 (404) ; on la garde en secours au cas où.
    return (await this.pd('GET', `/personalization/v3/players/${this.puuid}/playerloadout`))
      || this.pd('GET', `/personalization/v2/players/${this.puuid}/playerloadout`);
  }
  getMMR(puuid = this.puuid, opts) {
    return this.pd('GET', `/mmr/v1/players/${puuid}`, undefined, opts);
  }

  // ---- Boutique ----
  getWallet() {
    return this.pd('GET', `/store/v1/wallet/${this.puuid}`);
  }
  async getStorefront() {
    try {
      const v3 = await this.pd('POST', `/store/v3/storefront/${this.puuid}`, {});
      if (v3) return v3;
    } catch { /* on tente la v2 */ }
    return this.pd('GET', `/store/v2/storefront/${this.puuid}`);
  }
  getEntitlements(type) {
    return this.pd('GET', `/store/v1/entitlements/${this.puuid}/${ENTITLEMENT_TYPES[type] || type}`);
  }

  // ---- Historique ----
  getMatchHistory(start = 0, end = 10, queue, puuid = this.puuid, opts) {
    const q = queue ? `&queue=${encodeURIComponent(queue)}` : '';
    return this.pd('GET', `/match-history/v1/history/${puuid}?startIndex=${start}&endIndex=${end}${q}`, undefined, opts);
  }
  rateLimitedUntil(bucket) {
    const until = this.rateLimits.get(bucket) || 0;
    return until > Date.now() ? until : null;
  }
  getCompetitiveUpdates(start = 0, end = 20, puuid = this.puuid, opts) {
    return this.pd('GET', `/mmr/v1/players/${puuid}/competitiveupdates?startIndex=${start}&endIndex=${end}&queue=competitive`, undefined, opts);
  }
  getMatchDetails(matchId, opts) {
    return this.pd('GET', `/match-details/v1/matches/${matchId}`, undefined, opts);
  }

  // ---- Sélection d'agent ----
  getPregamePlayer() {
    return this.glz('GET', `/pregame/v1/players/${this.puuid}`);
  }
  getPregameMatch(matchId) {
    return this.glz('GET', `/pregame/v1/matches/${matchId}`);
  }

  // ---- Partie en cours ----
  getCoregamePlayer() {
    return this.glz('GET', `/core-game/v1/players/${this.puuid}`);
  }
  getCoregameMatch(matchId) {
    return this.glz('GET', `/core-game/v1/matches/${matchId}`);
  }

  // ---- Groupe ----
  getPartyPlayer() {
    return this.glz('GET', `/parties/v1/players/${this.puuid}`);
  }
  getParty(partyId) {
    return this.glz('GET', `/parties/v1/parties/${partyId}`);
  }
  setPartyQueue(partyId, queueId) {
    return this.glz('POST', `/parties/v1/parties/${partyId}/queue`, { queueID: queueId });
  }
  joinMatchmaking(partyId) {
    return this.glz('POST', `/parties/v1/parties/${partyId}/matchmaking/join`);
  }
  leaveMatchmaking(partyId) {
    return this.glz('POST', `/parties/v1/parties/${partyId}/matchmaking/leave`);
  }
  setPartyAccessibility(partyId, open) {
    return this.glz('POST', `/parties/v1/parties/${partyId}/accessibility`, { accessibility: open ? 'OPEN' : 'CLOSED' });
  }

  // ---- Amis (API locale) ----
  getChatSession() {
    return this.local('GET', '/chat/v1/session');
  }
  getFriends() {
    return this.local('GET', '/chat/v4/friends');
  }
  getPresences() {
    return this.local('GET', '/chat/v4/presences');
  }

  // ---- Messagerie (API locale ; une conversation privée a pour cid le pid de l'ami) ----
  getConversations() {
    return this.local('GET', '/chat/v6/conversations');
  }
  getMessages(cid) {
    return this.local('GET', `/chat/v6/messages?cid=${encodeURIComponent(cid)}`);
  }
  markRead(cid, id) {
    return this.local('POST', '/chat/v7/conversations/read', { cid, id });
  }
  sendMessage(cid, message) {
    return this.local('POST', '/chat/v6/messages', { cid, message, type: 'chat' });
  }
}

module.exports = { RiotClient, RiotError, ENTITLEMENT_TYPES };
