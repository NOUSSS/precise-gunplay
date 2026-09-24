// Statistiques façon tracker : un résumé compact est calculé par match puis mis en cache sur disque,
// pour ne jamais retélécharger un match déjà analysé.
const fs = require('fs');
const path = require('path');

const RECORD_VERSION = 1;
const MAX_CACHE = 1000;
const TRADE_WINDOW_MS = 5000;
const PAGE = 20; // l'historique Riot renvoie au plus 20 matchs par requête

class Stats {
  constructor(client, assets, services, cacheDir) {
    this.client = client;
    this.assets = assets;
    this.services = services;
    this.file = path.join(cacheDir, 'match-stats-cache.json');
    try {
      this.cache = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } catch {
      this.cache = {};
    }
  }

  save() {
    const keys = Object.keys(this.cache);
    if (keys.length > MAX_CACHE) {
      keys
        .sort((a, b) => (this.cache[a].startedAt || 0) - (this.cache[b].startedAt || 0))
        .slice(0, keys.length - MAX_CACHE)
        .forEach((k) => delete this.cache[k]);
    }
    try {
      fs.writeFileSync(this.file, JSON.stringify(this.cache));
    } catch { /* cache facultatif */ }
  }

  /** Résumé d'un match du point de vue d'un joueur. */
  record(d, puuid) {
    const me = d.players?.find((p) => p.subject === puuid);
    if (!me) return null;
    const rounds = d.roundResults || [];
    const teamOf = new Map(d.players.map((p) => [p.subject, p.teamId]));
    const myTeam = teams(d).find((t) => t.teamId === me.teamId);
    const other = teams(d).find((t) => t.teamId !== me.teamId);

    let damage = 0, head = 0, body = 0, leg = 0;
    for (const r of rounds) {
      const ps = r.playerStats?.find((p) => p.subject === puuid);
      for (const hit of ps?.damage || []) {
        if (hit.receiver === puuid) continue;
        damage += hit.damage || 0;
        head += hit.headshots || 0;
        body += hit.bodyshots || 0;
        leg += hit.legshots || 0;
      }
    }

    // Toutes les éliminations, regroupées par manche.
    const killsByRound = new Map();
    const allKills = d.kills?.length
      ? d.kills
      : rounds.flatMap((r, i) => (r.playerStats || []).flatMap((p) => (p.kills || []).map((k) => ({ ...k, round: r.roundNum ?? i }))));
    for (const k of allKills) {
      if (!killsByRound.has(k.round)) killsByRound.set(k.round, []);
      killsByRound.get(k.round).push(k);
    }

    let fb = 0, fd = 0, kast = 0, k3 = 0, k4 = 0, k5 = 0;
    const weapons = {};
    for (const [, list] of killsByRound) {
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
    }
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
      damage, head, body, leg,
      fb, fd, kast, k3, k4, k5,
      weapons,
      tier: me.competitiveTier || 0,
    };
  }

  async matchIds(queue, count) {
    const ids = [];
    for (let start = 0; start < count; start += PAGE) {
      const h = await this.client.getMatchHistory(start, Math.min(start + PAGE, count), queue);
      const list = h?.History || [];
      ids.push(...list.map((m) => m.MatchID));
      if (list.length < PAGE || (h?.Total != null && start + PAGE >= h.Total)) break;
    }
    return ids;
  }

  async compute(queue, count, onProgress = () => {}) {
    const puuid = this.client.puuid;
    const ids = await this.matchIds(queue, count);
    const records = [];
    const todo = [];
    for (const id of ids) {
      const hit = this.cache[`${puuid}:${id}`];
      if (hit && hit.v === RECORD_VERSION) records.push(hit);
      else todo.push(id);
    }

    let done = records.length;
    const progress = () =>
      onProgress({ done, total: ids.length, waitUntil: this.client.rateLimitedUntil > Date.now() ? this.client.rateLimitedUntil : null });
    progress();
    this.client.onRateLimit = progress;
    let unsaved = 0;
    // 3 téléchargements en parallèle pour rester sous la limite de requêtes Riot.
    const queueIds = [...todo];
    const worker = async () => {
      while (queueIds.length) {
        const id = queueIds.shift();
        try {
          const d = await this.services.matchDetails(id);
          const r = d && this.record(d, puuid);
          if (r) {
            this.cache[`${puuid}:${id}`] = r;
            records.push(r);
            // Sauvegarde régulière : rien n'est perdu si l'analyse est interrompue.
            if (++unsaved >= 10) {
              this.save();
              unsaved = 0;
            }
          }
        } catch { /* match ignoré */ }
        done++;
        progress();
      }
    };
    try {
      await Promise.all([worker(), worker(), worker()]);
    } finally {
      this.client.onRateLimit = null;
      if (unsaved) this.save();
    }

    records.sort((a, b) => b.startedAt - a.startedAt);

    let rr = [];
    if (!queue || queue === 'competitive') {
      const updates = await this.client.getCompetitiveUpdates(0, 20).catch(() => null);
      rr = (updates?.Matches || [])
        .filter((m) => m.TierAfterUpdate > 0)
        .map((m) => ({
          id: m.MatchID,
          at: m.MatchStartTime,
          mapId: this.assets.map(m.MapID)?.uuid || null,
          tierBefore: m.TierBeforeUpdate,
          tier: m.TierAfterUpdate,
          rr: m.RankedRatingAfterUpdate,
          earned: m.RankedRatingEarned,
        }))
        .reverse();
    }

    const rank = await this.services.rank(puuid).catch(() => null);
    return { records, rr, rank };
  }
}

function teams(d) {
  return d.teams || [];
}

module.exports = { Stats };
