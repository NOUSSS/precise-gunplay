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
    delayMs: 0,
  },
};

class Settings {
  constructor(dir) {
    this.file = path.join(dir, 'settings.json');
    this.value = structuredClone(DEFAULTS);
    try {
      const saved = JSON.parse(fs.readFileSync(this.file, 'utf8'));
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
