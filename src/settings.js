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

// Régions proposées par l'interface ('' : automatique). Mêmes clés que SHARD_BY_REGION (src/riot/client.js).
const REGIONS = ['', 'na', 'latam', 'br', 'eu', 'ap', 'kr', 'pbe'];

const isObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const isBool = (v) => typeof v === 'boolean';
const isSize = (v) => Number.isInteger(v) && v >= 320 && v <= 16384;
// Chaîne sans espace ni saut de ligne : elle part telle quelle dans une ligne de commande de l'assistant d'affichage.
const isToken = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max && !/\s/.test(v);
const isOptionalToken = (v, max) => v == null || v === '' || isToken(v, max);
const onlyKeys = (v, rules) => isObject(v) && Object.entries(v).every(([k, x]) => Object.hasOwn(rules, k) && rules[k](x));

const SCREEN_RULES = {
  id: (v) => isOptionalToken(v, 300),
  gdi: (v) => isOptionalToken(v, 64),
  name: (v) => v == null || (typeof v === 'string' && v.length <= 200),
};
// Clés de « stretch » que l'interface peut modifier. « native » et « gameConfig » appartiennent au processus principal.
const STRETCH_RULES = {
  enabled: isBool,
  monitors: isBool,
  width: isSize,
  height: isSize,
  hotkeys: (v) => isObject(v) && Object.keys(v).sort().join() === 'native,toggle' && isToken(v.toggle, 40) && isToken(v.native, 40),
  screen: (v) => v === null || onlyKeys(v, SCREEN_RULES),
};
const PATCH_RULES = {
  regionOverride: (v) => REGIONS.includes(v),
  px0: isBool,
  openAtLogin: isBool,
  stretch: (v) => onlyKeys(v, STRETCH_RULES),
};

/** Patch venu de l'interface : seules les clés connues, avec le bon type. Tout le reste est refusé. */
function sanitizePatch(patch) {
  if (!onlyKeys(patch, PATCH_RULES)) throw Object.assign(new Error('Réglage invalide.'), { code: 'INVALID_SETTING' });
  return patch;
}

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

module.exports = { Settings, sanitizePatch };
