// Tire de la vidéo maîtresse (.cache/master.mp4, faite par record.js) les fichiers diffusés :
//   site/media/demo-av1.mp4    boucle muette du site, AV1 (navigateurs récents)
//   site/media/demo.mp4        boucle muette du site, H.264 (les autres)
//   site/media/demo-son.mp4    la même avec la musique, pour le plein écran
//   site/media/poster.webp     première image, affichée avant la lecture
//   .github/media/presentation.mp4 et .webp   vidéo et aperçu animé du README
// Usage, depuis la racine du dépôt : node .github/media/video/encode.js   (ffmpeg dans le PATH)
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const MASTER = path.join(__dirname, '.cache', 'master.mp4');
const MUSIC = path.join(__dirname, 'music.m4a');
const SITE = path.join(ROOT, 'site', 'media');
const README = path.join(ROOT, '.github', 'media');

if (!fs.existsSync(MASTER)) throw new Error('Vidéo maîtresse absente : lancer record.js d’abord');
fs.mkdirSync(SITE, { recursive: true });

const ffmpeg = (args) => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
  if (r.status) throw new Error(`ffmpeg a échoué : ${args.join(' ')}`);
};
const duration = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', MASTER]).stdout.toString());
const out = (dir, name) => path.join(dir, name);
// Chaque fichier diffusé porte son origine dans une fiche voisine (<fichier>.json), comme les images du site
const ORIGIN = 'Origine : tournage de la vraie interface de l’app avec des données fictives (.github/media/video/record.js, scénario scenario.js), '
  + 'encodé par encode.js. Aucune génération d’image.';
const report = (file) => {
  console.log(`${path.relative(ROOT, file)} : ${(fs.statSync(file).size / 1e6).toFixed(2)} Mo`);
  if (file.startsWith(SITE)) fs.writeFileSync(`${file}.json`, `${JSON.stringify({ prompt: ORIGIN, createdAt: new Date().toISOString() }, null, 2)}\n`);
};

// Images clés toutes les 2 s : un saut d'un chapitre à l'autre démarre vite
const GOP = ['-g', '120', '-keyint_min', '120'];

// La boucle muette se charge en tête de page : réglages légers, l'interface filmée reste nette (outils de contenu d'écran d'AV1)
ffmpeg(['-i', MASTER, '-an', '-c:v', 'libsvtav1', '-preset', '4', '-crf', '44', ...GOP, '-pix_fmt', 'yuv420p',
  '-svtav1-params', 'tune=0:scm=1', '-movflags', '+faststart', out(SITE, 'demo-av1.mp4')]);
report(out(SITE, 'demo-av1.mp4'));

const h264 = (crf, file) => ffmpeg(['-i', MASTER, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high',
  '-level', '4.2', ...GOP, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file]);
h264(28, out(SITE, 'demo.mp4'));
report(out(SITE, 'demo.mp4'));

// Version avec le son, chargée seulement quand on la demande et vue en plein écran : qualité haute.
// Musique : la piste de la première vidéo de présentation, coupée à la durée de la démo avec un fondu de sortie
const film = path.join(__dirname, '.cache', 'film.mp4');
h264(22, film);
const fade = `afade=t=in:d=0.3,afade=t=out:st=${(duration - 1.6).toFixed(2)}:d=1.6`;
ffmpeg(['-i', film, '-i', MUSIC, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', fade,
  '-c:a', 'aac', '-b:a', '160k', '-t', duration.toFixed(3), '-movflags', '+faststart', out(SITE, 'demo-son.mp4')]);
report(out(SITE, 'demo-son.mp4'));

ffmpeg(['-i', MASTER, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '82', out(SITE, 'poster.webp')]);
report(out(SITE, 'poster.webp'));

fs.copyFileSync(out(SITE, 'demo-son.mp4'), out(README, 'presentation.mp4'));
report(out(README, 'presentation.mp4'));
ffmpeg(['-i', MASTER, '-vf', 'fps=12,scale=960:-1:flags=lanczos', '-c:v', 'libwebp_anim', '-loop', '0',
  '-quality', '58', '-compression_level', '6', '-an', out(README, 'presentation.webp')]);
report(out(README, 'presentation.webp'));
