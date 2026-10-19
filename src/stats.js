// Statistiques façon tracker. Les matchs sont synchronisés en arrière-plan (au lancement puis toutes les
// 5 minutes) et résumés dans un cache disque : la page Stats lit ce cache et s'affiche instantanément.
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// v2 : dégâts reçus (DDΔ), durée, place dans la partie, manches parfaites et clutchs. Les résumés v1 restent
// affichés ; ceux encore présents dans l'historique Riot sont retéléchargés pour être complétés.
const RECORD_VERSION = 2;
const MIN_RECORD_VERSION = 1;
const MAX_MATCHES = 2000;
const TRADE_WINDOW_MS = 5000;
const PAGE = 20; // l'historique Riot renvoie au plus 20 éléments par requête
const MAX_PAGES = 15;
const WORKERS = 3;

class Stats extends EventEmitter {
  constructor(client, assets, services, cacheDir) {
    super();
    this.client = client;
    this.assets = assets;
    this.services = services;
    this.file = path.join(cacheDir, 'match-stats-cache.json');
    this.cache = { matches: {}, rr: {}, complete: {} };
    try {
      const saved = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      // Ancien format (v1.1.0) : un objet plat { "puuid:matchId": record }.
      this.cache = saved.matches ? { rr: {}, complete: {}, ...saved } : { ...this.cache, matches: saved };
    } catch { /* premier lancement */ }
    this.syncing = null;
    this.state = { running: false, done: 0, total: 0, waitUntil: null, lastSync: null };
  }

  save() {
    const keys = Object.keys(this.cache.matches);
    if (keys.length > MAX_MATCHES) {
      keys
        .sort((a, b) => (this.cache.matches[a].startedAt || 0) - (this.cache.matches[b].startedAt || 0))
        .slice(0, keys.length - MAX_MATCHES)
        .forEach((k) => delete this.cache.matches[k]);
    }
    try {
      fs.writeFileSync(this.file, JSON.stringify(this.cache));
    } catch { /* cache facultatif */ }
  }

  setState(patch) {
    this.state = { ...this.state, ...patch };
    this.emit('state', this.state);
  }

  /** Résumé d'un match du point de vue d'un joueur. */
  record(d, puuid) {
    const me = d.players?.find((p) => p.subject === puuid);
    if (!me) return null;
    const rounds = d.roundResults || [];
    const teamOf = new Map(d.players.map((p) => [p.subject, p.teamId]));
    const myTeam = (d.teams || []).find((t) => t.teamId === me.teamId);
    const other = (d.teams || []).find((t) => t.teamId !== me.teamId);

    let damage = 0, received = 0, head = 0, body = 0, leg = 0;
    for (const r of rounds) {
      for (const ps of r.playerStats || []) {
        for (const hit of ps.damage || []) {
          if (ps.subject === puuid && hit.receiver !== puuid) {
            damage += hit.damage || 0;
            head += hit.headshots || 0;
            body += hit.bodyshots || 0;
            leg += hit.legshots || 0;
          } else if (ps.subject !== puuid && hit.receiver === puuid) {
            received += hit.damage || 0;
          }
        }
      }
    }
    const winnerOf = new Map(rounds.map((r, i) => [r.roundNum ?? i, r.winningTeam]));

    // Toutes les éliminations, regroupées par manche.
    const killsByRound = new Map();
    const allKills = d.kills?.length
      ? d.kills
      : rounds.flatMap((r, i) => (r.playerStats || []).flatMap((p) => (p.kills || []).map((k) => ({ ...k, round: r.roundNum ?? i }))));
    for (const k of allKills) {
      if (!killsByRound.has(k.round)) killsByRound.set(k.round, []);
      killsByRound.get(k.round).push(k);
    }

    let fb = 0, fd = 0, kast = 0, k3 = 0, k4 = 0, k5 = 0, flawless = 0;
    const clutches = []; // une entrée par clutch gagné : nombre d'adversaires en vie quand tu es resté seul
    const weapons = {};
    const roster = d.players.filter((p) => !p.isObserver);
    const teamMode = (d.teams || []).length === 2; // pas de manches parfaites ni de clutchs en combat à mort
    for (const [round, list] of killsByRound) {
      list.sort((a, b) => (a.roundTime ?? a.timeSinceRoundStartMillis ?? 0) - (b.roundTime ?? b.timeSinceRoundStartMillis ?? 0));
      const t = (k) => k.roundTime ?? k.timeSinceRoundStartMillis ?? 0;
      if (list[0]?.killer === puuid) fb++;
      if (list[0]?.victim === puuid) fd++;

      const mine = list.filter((k) => k.killer === puuid);
      if (mine.length === 3) k3++;
      else if (mine.length === 4) k4++;
      else if (mine.length >= 5) k5++;
      for (const k of mine) {
        const fd2 = k.finishingDamage || {};
        const key = fd2.damageType === 'Weapon' && fd2.damageItem ? String(fd2.damageItem).toLowerCase() : fd2.damageType === 'Ability' ? 'ability' : 'other';
        weapons[key] = (weapons[key] || 0) + 1;
      }

      // KAST : kill, assist, survie ou mort échangée par un coéquipier dans les 5 s.
      const death = list.find((k) => k.victim === puuid);
      const assisted = list.some((k) => (k.assistants || []).includes(puuid));
      let traded = false;
      if (death) {
        traded = list.some(
          (k) => k.victim === death.killer && teamOf.get(k.killer) === me.teamId && t(k) >= t(death) && t(k) - t(death) <= TRADE_WINDOW_MS
        );
      }
      if (mine.length || assisted || !death || traded) kast++;

      // Manche parfaite : gagnée sans perdre un seul coéquipier.
      const won = teamMode && winnerOf.get(round) === me.teamId;
      if (won && !list.some((k) => teamOf.get(k.victim) === me.teamId)) flawless++;

      // Clutch : dernier en vie de ton équipe face à au moins un adversaire, manche gagnée et toi encore debout.
      if (won && !death) {
        const alive = new Set(roster.map((p) => p.subject));
        for (const k of list) {
          alive.delete(k.victim);
          const allies = roster.filter((p) => p.teamId === me.teamId && alive.has(p.subject));
          const enemies = roster.filter((p) => p.teamId !== me.teamId && alive.has(p.subject)).length;
          if (allies.length === 1 && allies[0].subject === puuid && enemies > 0) {
            clutches.push(enemies);
            break;
          }
        }
      }
    }
    // Place dans la partie au score de combat, comme le tableau des scores du jeu.
    const ranking = [...roster].sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0));
    const place = ranking.findIndex((p) => p.subject === puuid) + 1;
    const teamBest = ranking.find((p) => p.teamId === me.teamId);
    const mvp = place === 1 ? 'match' : teamMode && teamBest?.subject === puuid ? 'team' : null;
    // Manches sans aucune élimination (rare) : comptées comme survie.
    const roundsPlayed = me.stats?.roundsPlayed || rounds.length || 1;
    kast += Math.max(0, roundsPlayed - killsByRound.size);

    let result = 'loss';
    if (myTeam?.won) result = 'win';
    else if (myTeam && other && !other.won && myTeam.roundsWon === other.roundsWon) result = 'draw';

    return {
      v: RECORD_VERSION,
      id: d.matchInfo?.matchId,
      queue: d.matchInfo?.queueID || d.matchInfo?.queueId || '',
      seasonId: d.matchInfo?.seasonId || null,
      mapId: this.assets.map(d.matchInfo?.mapId)?.uuid || null,
      agentId: String(me.characterId || '').toLowerCase(),
      startedAt: d.matchInfo?.gameStartMillis || 0,
      result,
      score: myTeam && other ? [myTeam.roundsWon, other.roundsWon] : null,
      rounds: roundsPlayed,
      kills: me.stats?.kills || 0,
      deaths: me.stats?.deaths || 0,
      assists: me.stats?.assists || 0,
      combat: me.stats?.score || 0,
      lengthMs: d.matchInfo?.gameLengthMillis || 0,
      damage, received, head, body, leg,
      fb, fd, kast, k3, k4, k5, flawless, clutches,
      place, players: roster.length, mvp,
      weapons,
      tier: me.competitiveTier || 0,
    };
  }

  hasMatch(puuid, id) {
    const r = this.cache.matches[`${puuid}:${id}`];
    return !!r && r.v === RECORD_VERSION;
  }

  /** Lance une synchronisation (une seule à la fois). */
  sync() {
    if (!this.client.connected) return Promise.resolve(this.state);
    if (!this.syncing) {
      this.syncing = this._sync()
        .catch((e) => this.setState({ error: e.message }))
        .finally(() => {
          this.syncing = null;
          this.setState({ running: false, waitUntil: null, lastSync: Date.now() });
        });
    }
    return this.syncing;
  }

  async _sync() {
    const puuid = this.client.puuid;
    const complete = !!this.cache.complete[puuid];
    this.setState({ running: true, done: 0, total: 0, waitUntil: null, error: null });

    // 1) Identifiants des matchs. Une fois l'historique complet en cache, on s'arrête à la première page déjà connue.
    const todo = [];
    let reachedEnd = false;
    for (let page = 0; page < MAX_PAGES; page++) {
      const h = await this.client.getMatchHistory(page * PAGE, (page + 1) * PAGE);
      const list = (h?.History || []).map((m) => m.MatchID);
      const fresh = list.filter((id) => !this.hasMatch(puuid, id));
      todo.push(...fresh);
      if (list.length < PAGE) { reachedEnd = true; break; }
      if (complete && !fresh.length) break;
    }

    // 2) Historique RR (léger : quelques requêtes), fusionné avec ce qui est déjà connu.
    await this.syncRR(puuid);

    // 3) Téléchargement des matchs manquants, sauvegardés au fur et à mesure.
    let done = 0;
    this.setState({ total: todo.length });
    this.client.onRateLimit = (bucket, until) => {
      if (bucket === '/match-details') this.setState({ waitUntil: until });
    };
    let unsaved = 0;
    const queue = [...todo];
    const worker = async () => {
      while (queue.length && this.client.puuid === puuid) {
        const id = queue.shift();
        try {
          const d = await this.services.matchDetails(id);
          const r = d && this.record(d, puuid);
          if (r) {
            this.cache.matches[`${puuid}:${id}`] = r;
            if (++unsaved >= 10) { this.save(); unsaved = 0; }
          }
        } catch { /* match ignoré, retenté à la prochaine synchro */ }
        this.setState({ done: ++done, waitUntil: this.client.rateLimitedUntil('/match-details') });
      }
    };
    try {
      await Promise.all(Array.from({ length: WORKERS }, worker));
    } finally {
      this.client.onRateLimit = null;
    }
    if (this.client.puuid === puuid && (reachedEnd || complete) && todo.every((id) => this.hasMatch(puuid, id))) {
      this.cache.complete[puuid] = true;
    }
    this.save();
  }

  async syncRR(puuid) {
    const known = new Map((this.cache.rr[puuid] || []).map((u) => [u.id, u]));
    for (let page = 0; page < MAX_PAGES; page++) {
      const res = await this.client.getCompetitiveUpdates(page * PAGE, (page + 1) * PAGE).catch(() => null);
      const list = res?.Matches || [];
      let fresh = 0;
      for (const m of list) {
        if (!known.has(m.MatchID)) fresh++;
        known.set(m.MatchID, {
          id: m.MatchID,
          at: m.MatchStartTime,
          seasonId: m.SeasonID,
          mapId: this.assets.map(m.MapID)?.uuid || null,
          tierBefore: m.TierBeforeUpdate,
          tier: m.TierAfterUpdate,
          rr: m.RankedRatingAfterUpdate,
          earned: m.RankedRatingEarned,
        });
      }
      if (list.length < PAGE || !fresh) break;
    }
    this.cache.rr[puuid] = [...known.values()].sort((a, b) => a.at - b.at);
  }

  /** Rang par acte, à partir du MMR (un seul appel). */
  async actRanks(puuid) {
    if (this.ranksCache?.puuid === puuid && Date.now() - this.ranksCache.at < 60000) return this.ranksCache.value;
    const mmr = await this.client.getMMR(puuid).catch(() => null);
    const out = {};
    for (const [id, s] of Object.entries(mmr?.QueueSkills?.competitive?.SeasonalInfoBySeasonID || {})) {
      let peak = s.CompetitiveTier || 0;
      for (const t of Object.keys(s.WinsByTier || {})) peak = Math.max(peak, Number(t));
      out[id] = { tier: s.CompetitiveTier || 0, rr: s.RankedRating || 0, wins: s.NumberOfWins || 0, games: s.NumberOfGames || 0, peak };
    }
    if (mmr) this.ranksCache = { puuid, at: Date.now(), value: out };
    return out;
  }

  /** Tout ce que la page Stats affiche, lu depuis le cache (instantané). */
  async data() {
    const puuid = this.client.puuid;
    const prefix = `${puuid}:`;
    const records = Object.entries(this.cache.matches)
      .filter(([k, r]) => k.startsWith(prefix) && r.v >= MIN_RECORD_VERSION)
      .map(([, r]) => r)
      .sort((a, b) => b.startedAt - a.startedAt);
    const [actRanks, rank] = await Promise.all([this.actRanks(puuid), this.services.rank(puuid).catch(() => null)]);
    return { records, rr: this.cache.rr[puuid] || [], actRanks, rank, sync: this.state };
  }
}

module.exports = { Stats };
