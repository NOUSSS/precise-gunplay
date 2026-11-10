const path = require('path');
const { writeJsonAtomic, readJsonOrSetAside } = require('./json-file');

const DEFAULTS = {
  regionOverride: '',
  px0: false, // liste de souhaits liée à PX-0 (le jeton du Riot Client lui est alors transmis)
  stretch: {
    enabled: false,
    width: 0, // résolution étirée (0 = pas encore choisie)
    height: 0,
    monitors: true, // désactiver les écrans dans le Gestionnaire de périphériques pendant le jeu
    gameConfig: true, // régler VALORANT (plein écran fenêtré, Remplir) et verrouiller ses fichiers
    hotkeys: { toggle: 'Control+F8', native: 'Control+F9' },
    native: null, // { w, h, hz } relevée automatiquement
  },
};

class Settings {
  constructor(dir) {
    this.file = path.join(dir, 'settings.json');
    this.value = structuredClone(DEFAULTS);
    const saved = readJsonOrSetAside(this.file);
    if (saved && typeof saved === 'object') {
      // Réglages de l'agent auto, retiré : on les oublie au prochain enregistrement.
      delete saved.autolock;
      delete saved.notifications;
      this.value = {
        ...this.value,
        ...saved,
        stretch: { ...DEFAULTS.stretch, ...(saved.stretch || {}) },
      };
    }
  }

  get() {
    return this.value;
  }

  update(patch) {
    this.value = {
      ...this.value,
      ...patch,
      stretch: { ...this.value.stretch, ...(patch.stretch || {}) },
    };
    writeJsonAtomic(this.file, this.value, 2);
    return this.value;
  }
}

module.exports = { Settings };
