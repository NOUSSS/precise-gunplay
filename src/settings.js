const fs = require('fs');
const path = require('path');

const DEFAULTS = {
  regionOverride: '',
  notifications: true,
  autolock: {
    enabled: false,
    mode: 'select', // 'select' (survol uniquement) ou 'lock' (verrouillage)
    agentId: null,
    fallbacks: [],
    perMap: {}, // { [mapUuid]: agentUuid }
    delayMs: 2500, // attente avant de survoler l'agent
    lockDelayMs: 250, // mode 'lock' : attente entre le survol et le verrouillage
  },
};

class Settings {
  constructor(dir) {
    this.file = path.join(dir, 'settings.json');
    this.value = structuredClone(DEFAULTS);
    try {
      const saved = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      // Anciens réglages (avant lockDelayMs) : le délai valait 0 par défaut, on passe au nouveau défaut anti-ban.
      if (saved.autolock && saved.autolock.lockDelayMs == null && !saved.autolock.delayMs) delete saved.autolock.delayMs;
      this.value = { ...this.value, ...saved, autolock: { ...DEFAULTS.autolock, ...(saved.autolock || {}) } };
    } catch { /* premier lancement */ }
  }

  get() {
    return this.value;
  }

  update(patch) {
    this.value = {
      ...this.value,
      ...patch,
      autolock: { ...this.value.autolock, ...(patch.autolock || {}) },
    };
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.value, null, 2));
    return this.value;
  }
}

module.exports = { Settings };
