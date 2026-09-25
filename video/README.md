# Vidéo de présentation (motion design)

Vidéo de ~1 min 30 (1920 × 1080, 60 i/s) qui présente Precise Gunplay : liaison du compte, interface,
Accueil, Boutique, Agent auto, Partie en direct, Statistiques, Historique, Groupe & amis, Collection,
puis l'utilisation en 3 étapes.

La vidéo est une page HTML animée avec [GSAP](https://gsap.com) : la timeline est en pause et `window.seek(t)`
affiche l'image exacte à l'instant `t`. `render.mjs` capture chaque image avec Chromium (Playwright),
les encode en H.264 avec ffmpeg, puis ajoute une bande-son générée par `soundtrack.py`
(musique électro 120 BPM + bruitages calés sur les repères de la timeline).

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html`, `style.css` | La scène 1920 × 1080 (fond, HUD, volets de transition, curseur) |
| `scenes.js` | Contenu des 14 scènes et toute la timeline (découpage dans l'objet `T`) |
| `render.mjs` | Rendu image par image → `out/precise-gunplay.mp4` |
| `soundtrack.py` | Bande-son synthétisée (numpy) à partir de `out/cues.json` |

## Prévisualiser

```bash
cd video
npm install
npm run preview   # puis ouvrir http://localhost:8080/video/ (ajoute ?t=34 pour démarrer à 34 s)
```

Le serveur part de la racine du dépôt, car la page réutilise les logos de `renderer/`.
La page a un bouton Lecture et un curseur de position.

## Rendre la vidéo

Prérequis : Node 18+, Python 3 avec `numpy`, et ffmpeg (sinon `pip install imageio-ffmpeg`, détecté automatiquement).

```bash
cd video
npm install
npm run render                      # → out/precise-gunplay.mp4
node render.mjs --fps 30            # plus rapide
node render.mjs --stills 14,37,41.5 # quelques images PNG pour vérifier une scène
```

Les images et polices distantes (valorant-api.com, Google Fonts) sont téléchargées une fois par Node et gardées dans `.cache/`.
Derrière un proxy HTTPS, lance le rendu avec `NODE_USE_ENV_PROXY=1` (Node 22.21+).
