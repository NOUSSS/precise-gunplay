// Lecture et écriture des fichiers JSON de l'app (réglages, caches).
const fs = require('fs');
const path = require('path');

/** Fichier temporaire puis renommage : un arrêt en cours d'écriture ne laisse pas de fichier tronqué. */
function writeJsonAtomic(file, value, indent) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(value, null, indent));
  fs.renameSync(`${file}.tmp`, file);
}

/**
 * Contenu du fichier, ou null s'il est absent. Illisible (tronqué, modifié à la main) : il est mis de côté
 * sous le nom « <fichier>.illisible » au lieu d'être écrasé par la prochaine sauvegarde, puis null.
 */
function readJsonOrSetAside(file) {
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    try { fs.renameSync(file, `${file}.illisible`); } catch { /* resté en place : la sauvegarde suivante l'écrasera */ }
    return null;
  }
}

module.exports = { writeJsonAtomic, readJsonOrSetAside };
