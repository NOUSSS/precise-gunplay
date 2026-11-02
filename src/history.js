// Historique : résumés des derniers matchs affichés, gardés sur disque. Un match terminé ne change plus : au
// lancement suivant, la page s'affiche tout de suite et seules les nouvelles parties sont téléchargées.
const fs = require('fs');
const path = require('path');

const VERSION = 1; // à incrémenter quand la forme d'un résumé change

class HistoryStore {
  constructor(dir) {
    this.file = path.join(dir, 'history-cache.json');
    this.data = { v: VERSION, matches: {}, lists: {} };
    try {
      const saved = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      if (saved?.v === VERSION) this.data = saved;
    } catch { /* premier lancement */ }
  }

  get(puuid, id) {
    return this.data.matches[`${puuid}:${id}`] || null;
  }

  /** Dernière liste affichée pour ce mode ('' : tous), null si elle n'a jamais été chargée. */
  list(puuid, queue) {
    const list = this.data.lists[puuid]?.[queue || '']?.map((id) => this.get(puuid, id));
    return list?.every(Boolean) ? list : null;
  }

  /** Retient la liste d'un mode. Seuls les résumés d'une liste du compte restent sur disque. */
  put(puuid, queue, summaries) {
    const lists = (this.data.lists[puuid] ||= {});
    const ids = summaries.map((s) => s.id);
    let changed = String(lists[queue || '']) !== String(ids);
    lists[queue || ''] = ids;
    for (const s of summaries) {
      const k = `${puuid}:${s.id}`;
      if (JSON.stringify(this.data.matches[k]) === JSON.stringify(s)) continue;
      this.data.matches[k] = s;
      changed = true;
    }
    const kept = new Set(Object.values(lists).flat().map((id) => `${puuid}:${id}`));
    for (const k of Object.keys(this.data.matches)) {
      if (!k.startsWith(`${puuid}:`) || kept.has(k)) continue;
      delete this.data.matches[k];
      changed = true;
    }
    if (changed) this.save();
  }

  save() {
    // Fichier temporaire puis renommage : un arrêt en cours d'écriture ne laisse pas de cache tronqué.
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      fs.writeFileSync(`${this.file}.tmp`, JSON.stringify(this.data));
      fs.renameSync(`${this.file}.tmp`, this.file);
    } catch { /* cache facultatif */ }
  }
}

module.exports = { HistoryStore };
