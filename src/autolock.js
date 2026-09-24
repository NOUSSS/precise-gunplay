// Sélection automatique d'agent : surveille la phase de sélection et choisit / verrouille l'agent configuré.
const { EventEmitter } = require('events');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class AutoLock extends EventEmitter {
  constructor(client, settings, assets) {
    super();
    this.client = client;
    this.settings = settings;
    this.assets = assets;
    this.busy = false;
    this.done = new Set(); // parties déjà traitées
    this.attempts = new Map();
  }

  start() {
    this.timer = setInterval(() => this.tick(), 1000);
  }

  stop() {
    clearInterval(this.timer);
  }

  async tick() {
    const cfg = this.settings.get().autolock;
    if (this.busy || !cfg.enabled || !this.client.connected || !this.assets.data) return;
    this.busy = true;
    let matchId = null;
    try {
      const player = await this.client.getPregamePlayer();
      matchId = player?.MatchID;
      if (!matchId || this.done.has(matchId)) return;

      const match = await this.client.getPregameMatch(matchId);
      if (!match) return;
      const players = match.AllyTeam?.Players || [];
      const me = players.find((p) => p.Subject === this.client.puuid);
      if (!me) return;
      if (me.CharacterSelectionState === 'locked') {
        this.done.add(matchId);
        return;
      }

      const map = this.assets.map(match.MapID);
      const candidates = [...new Set([map && cfg.perMap?.[map.uuid], cfg.agentId, ...(cfg.fallbacks || [])].filter(Boolean))];
      const taken = new Set(
        players
          .filter((p) => p.Subject !== me.Subject && p.CharacterSelectionState === 'locked')
          .map((p) => String(p.CharacterID).toLowerCase())
      );
      const pick = candidates.find((a) => !taken.has(a.toLowerCase()));
      if (!pick) {
        this.done.add(matchId);
        this.emit('event', { type: 'unavailable', map: map?.name, message: 'Aucun de tes agents configurés n\'est disponible.' });
        return;
      }

      if (cfg.delayMs > 0) await sleep(cfg.delayMs);
      await this.client.selectAgent(matchId, pick);
      if (cfg.mode === 'lock') await this.client.lockAgent(matchId, pick);
      this.done.add(matchId);

      const agent = this.assets.agentById.get(pick.toLowerCase());
      this.emit('event', {
        type: cfg.mode === 'lock' ? 'locked' : 'selected',
        agent: agent?.name,
        map: map?.name,
        message: `${agent?.name || 'Agent'} ${cfg.mode === 'lock' ? 'verrouillé' : 'sélectionné'}${map ? ` sur ${map.name}` : ''}.`,
      });
    } catch (e) {
      // On retente quelques fois avant d'abandonner cette partie.
      if (!matchId) return; // pas en sélection d'agent : erreur réseau silencieuse
      const n = (this.attempts.get(matchId) || 0) + 1;
      this.attempts.set(matchId, n);
      if (n >= 3) this.done.add(matchId);
      this.emit('event', { type: 'error', message: `Sélection automatique : ${e.message}` });
    } finally {
      this.busy = false;
    }
  }
}

module.exports = { AutoLock };
