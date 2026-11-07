# Design du site : Precise Gunplay

Ce fichier décrit le site public (`site/`) seulement. L’app de bureau est une autre entité : sa direction est dans `renderer/DESIGN.md` et ses jetons dans `renderer/styles.css`. Le site et l’app partagent le nom, le logo et l’environnement colorimétrique (sombre, rouge vif, touches de turquoise), pas les jetons.

Les jetons font foi en tête de `site/styles.css` ; ce document les reprend et dit où ils servent. Le reste de la feuille n’utilise que ces jetons.

## Direction

**Une encre presque noire, de la profondeur par couches, et la vraie vidéo de l’app au centre.**

- Le premier écran est centré : un gros titre sur deux lignes, « Votre VALORANT, vu de près. », dont la fin est en dégradé rouge, puis le bouton de téléchargement et une ligne de faits. Derrière : la carte Ascent en parallaxe, un voile, un halo rouge au centre et des diagonales reprises du logo.
- Sous le titre, la vidéo de l’app tourne dans un cadre incliné en 3D, qui se redresse au défilement. Cinq chapitres, calés sur `.github/media/video/scenario.js`, se remplissent pendant la lecture et permettent d’y sauter ; le son se charge à la demande.
- La profondeur vient de trois niveaux de surface : le fond de page, les tuiles en relief et les zones d’illustration en creux à l’intérieur des tuiles. Une tuile n’a jamais un contour et un fond de la même teinte.
- Les fonctions sont montrées par de petites maquettes en HTML (boutique, partie en direct, statistiques, message de PX-0, historique), toutes marquées « Données fictives » ou « Exemple ».
- La résolution étirée et la fenêtre SmartScreen sont expliquées par des animations qui rejouent ce qui se passe à l’écran.

## Couleurs

| Jeton | Valeur | Rôle |
| --- | --- | --- |
| `--ink-0` | `#07080b` | Fond de page, couleur du thème du navigateur |
| `--ink-1` | `#0b0d12` | Zones en creux, bande de la section résolution |
| `--ink-2` à `--ink-4` | `#11141b`, `#181c25`, `#222733` | Surfaces en relief (dégradé `--surface-raised`), cadre de la vidéo, survol des fichiers |
| `--text-1` | `#f3f4f7` | Titres et texte fort |
| `--text-2` | `#a9afbc` | Texte courant secondaire, navigation |
| `--text-3` | `#717887` | Légendes, libellés de colonnes, chapitres non lus |
| `--red` | `#ff2e4d` | L’action (boutons de téléchargement), numéros d’étapes, progression des étapes, fin du titre |
| `--red-deep` | `#e3163c` | Bas du dégradé des boutons de téléchargement |
| `--red-text` | `#ff8094` | Rouge lisible sur fond sombre : étiquette « Recommandé », adversaires, défaites, dégradé du titre |
| `--teal` | `#2fe0c5` | Les données : progression des chapitres, courbes, groupes repérés, victoires, focus |
| `--hair`, `--wash`, `--wash-2`, `--wash-3` | blanc à 7 %, 3,5 %, 7 %, 11 % | Filets, lignes de tableaux, boutons d’icône |

Le rouge sert à l’action, le turquoise aux données. Pas d’autre couleur vive, hors des images du jeu et de la reproduction de la fenêtre SmartScreen (ses bleus restent ceux de Windows).

## Typographie

- **Barlow Condensed** (600, 700) pour les titres : l’allure condensée et nette d’un écran de jeu.
- **Barlow** (400, 500, 600) pour le texte.
- Une police à chasse fixe du système (`ui-monospace`) pour les noms de fichiers seulement.
- Les polices sont servies par le site (`site/fonts/`, licence OFL dans `OFL-barlow.txt`).

| Rôle | Taille | Graisse, interligne |
| --- | --- | --- |
| Titre du premier écran (`.display`) | `--fs-hero`, `clamp(44px, 6.8vw, 96px)` | 700, 0.9 ; « Votre VALORANT, » tient sur une ligne dès 320 px |
| Titre de section (`.h2`) | `clamp(36px, 4.8vw, 64px)` | 700, 0.98 |
| Titre de tuile ou d’étape (`.h3`) | 24px | 600, 1.1 |
| Texte | 17px (16px sous 760 px) | 400, 1.55 |
| Petit texte | 15px | navigation, textes de tuiles, faits |
| Micro | 13px | légendes, étiquettes |

Libellés, boutons et liens restent en casse de phrase, sans capitales ni lettres espacées. Pas de sous-titre ni de phrase d’accroche sous un titre.

## Forme et profondeur

- Rayons : 6px (étiquettes, lignes), 8px (boutons, cartes de skins), 14px (zones en creux, étapes), 22px (tuiles, cadre de la vidéo).
- Boutons de téléchargement (`.btn-primary`) :
  - angles vifs, avec les coins supérieur gauche et inférieur droit coupés à 45° ;
  - `--cut` donne la longueur du côté coupé : 10px pour `.btn-sm`, 14px pour `.btn-lg` ;
  - dégradé vertical de `--red-hover` à `--red-deep`, et liseré clair de 1px en haut ; au survol, le bas du dégradé remonte à `--red` ;
  - la forme est portée par `::before`, qui est découpé : le bouton lui-même ne l’est pas, donc son contour de focus reste entier ;
  - pas d’ombre portée.
- Les autres boutons restent des plaques arrondies.
- Ombres :
  - `--shadow-btn` est courte et neutre, pour les boutons d’icône ;
  - `--shadow-raised` met une tuile en relief ;
  - `--shadow-sunken` creuse une zone ;
  - `--shadow-deep` sert à la vidéo, au moniteur et à SmartScreen.
- Pas de lueur autour des boutons, ni au repos ni au survol : le survol change la surface, pas l’ombre.

## Mouvement

- Courbes : `--ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`) pour ce qui entre, `--ease-in-out` (`cubic-bezier(0.77, 0, 0.175, 1)`) pour ce qui bouge à l’écran, linéaire pour les progressions.
- Durées : 140 ms pour l’appui (`scale(0.97)`), 220 ms pour les changements d’état, 800 ms pour les apparitions, 70 ms entre deux éléments d’une cascade.
- Premier écran : les deux lignes du titre montent depuis un masque (1 s, en cascade), puis le bouton et la vidéo apparaissent.
- On n’anime que `transform` et `opacity` (exceptions : le tracé de la courbe de RR, le dépliage de la FAQ).
- Ce qui sort de l’écran s’arrête : vidéo, enchaînement des étapes de résolution, boucle SmartScreen.
- Les survols sont limités à `(hover: hover) and (pointer: fine)`.
- Avec `prefers-reduced-motion`, il n’y a ni inclinaison, ni parallaxe, ni déplacement. La vidéo ne démarre pas seule et SmartScreen reste figé sur l’état utile.
- Sans JavaScript, tout reste visible : la classe `.js` est retirée si `main.js` ne s’est pas exécuté au bout de 4 s.

## Mise en page

- Largeur de contenu 1200 px, marge latérale `clamp(20px, 5vw, 48px)`, écart entre tuiles `clamp(16px, 2vw, 24px)`.
- Le même écart vertical sépare toutes les sections (`--section-y`, de 96 à 168 px). La section résolution en garde la moitié en bas pour effacer son fond, et la suivante reprend l’autre moitié.
- Les fonctions forment une grille de 12 colonnes (tuiles de 7 et 5 colonnes, en quinconce), qui passe à 6 + 6 sous 1040 px puis à une colonne sous 760 px.
- Sous 760 px, la navigation disparaît (le bouton Télécharger reste) et les chapitres n’affichent que le nom du chapitre en cours.

## Téléchargement

- Tous les boutons pointent d’abord vers `releases/latest`.
- `main.js` interroge l’API GitHub, puis remplace :
  - les liens par le fichier Setup ou Portable de la dernière version ;
  - les noms de fichiers (`data-name`) ;
  - les tailles (`data-size`).
- Les valeurs écrites dans le HTML (v1.20.0, 79 Mo) ne servent que si l’API ne répond pas.
- La CSP de `site/nginx.conf` autorise `api.github.com` et l’empreinte du seul script en ligne. Elle est à recalculer si ce script change.
