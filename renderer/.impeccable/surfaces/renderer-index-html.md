---
version: 1
slug: "renderer-index-html"
primary_target: "renderer/index.html"
related_targets: ["renderer/styles.css","renderer/app.js"]
---

# App Precise Gunplay (renderer)

Mode : Operate. Joueur Valorant sur PC, entre deux parties ou pendant la sélection d'agent, écran secondaire ou alt-tab, pièce sombre. Il vient lire un chiffre (RR, K/D, prix, score) et agir (verrouiller, acheter, lier un compte).

Contraintes : Electron 33, HTML/CSS/JS sans framework, CSP sans police externe, fenêtre min 1040×680. Identité du site : DESIGN.md à la racine, entité distincte.

## Direction contract

THESIS : l'app se lit comme un tableau de score d'avant-match, pas comme un tableau de bord SaaS sombre ; elle refuse les cartes à contour, la police géométrique arrondie et le rouge en décor.

OWN-WORLD : graphite acier, gris bleuté froid (teinte 250, chroma 0,012 à 0,022), en paliers de clarté (sunken, ground, raised 1 à 3), sans contour ; rangées en bandes séparées par 2 px ; Bahnschrift, condensé 75 % et chiffres tabulaires pour toute valeur et tout nom du jeu ; coupe à 45° tirée des facettes du logo sur les blocs-titres et le bouton principal ; rouge réservé à l'action principale, à la page active et aux défaites, vert turquoise aux victoires, or à l'atout.

STORY : le joueur repère sa donnée d'un coup d'œil, compare sans lire, agit avec un seul bouton rouge par écran.

FIRST VIEWPORT : Accueil, menu latéral à gauche (plaque active graphite, icône rouge), à droite nom du joueur en condensé 34 px, monnaies en pastilles graphite, puis le bloc de l'agent favori coupé en haut à droite avec ses chiffres en condensé 26 px, puis la rangée d'agents.

FORM : refonte au propre de la direction en place (sombre, rouge), choix explicite de l'utilisateur ; aucun tirage concept-seed lancé, puisque le monde visuel est gardé et non remplacé ; seed: none (not rolled, incumbent world kept by the user)

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
