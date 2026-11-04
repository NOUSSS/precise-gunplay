---
name: Precise Gunplay (application)
description: Compagnon VALORANT pour Windows, lu comme un tableau de score d’avant-match.
colors:
  sunken: "oklch(0.14 0.012 250)"
  ground: "oklch(0.165 0.014 250)"
  raised: "oklch(0.2 0.016 250)"
  raised-2: "oklch(0.235 0.018 250)"
  raised-3: "oklch(0.275 0.02 250)"
  line: "oklch(0.275 0.018 250)"
  line-strong: "oklch(0.37 0.022 250)"
  shade: "oklch(0.12 0.012 250)"
  scrim: "oklch(0.12 0.012 250 / 0.86)"
  text: "oklch(0.95 0.008 250)"
  text-2: "oklch(0.84 0.012 250)"
  muted: "oklch(0.71 0.018 250)"
  faint: "oklch(0.57 0.02 250)"
  focus: "oklch(0.95 0.008 250 / 0.7)"
  red: "oklch(0.645 0.225 18)"
  red-fill: "oklch(0.575 0.215 20)"
  red-fill-hover: "oklch(0.615 0.22 19)"
  red-text: "oklch(0.73 0.165 15)"
  red-tint: "oklch(0.645 0.225 18 / 0.14)"
  green: "oklch(0.82 0.13 185)"
  green-ink: "oklch(0.27 0.045 185)"
  green-tint: "oklch(0.82 0.13 185 / 0.12)"
  gold: "oklch(0.86 0.15 85)"
  gold-ink: "oklch(0.25 0.04 85)"
  gold-tint: "oklch(0.86 0.15 85 / 0.1)"
  draw: "oklch(0.57 0.02 250)"
  silver: "oklch(0.88 0.02 250)"
  on-fill: "#ffffff"
typography:
  display:
    fontFamily: "Bahnschrift, 'DIN Next', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "'tnum' 1"
  headline:
    fontFamily: "Bahnschrift, 'DIN Next', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
    fontFeature: "'tnum' 1"
  figure:
    fontFamily: "Bahnschrift, 'DIN Next', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.1
    fontFeature: "'tnum' 1"
  title:
    fontFamily: "Bahnschrift, 'DIN Next', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.1
    fontFeature: "'tnum' 1"
  body:
    fontFamily: "Bahnschrift, 'DIN Next', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 300
    lineHeight: 1.45
  label:
    fontFamily: "Bahnschrift, 'DIN Next', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.35
  caption:
    fontFamily: "Bahnschrift, 'DIN Next', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 300
    lineHeight: 1.45
  tag:
    fontFamily: "Bahnschrift, 'DIN Next', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.45
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  pill: "999px"
spacing:
  s-1: "4px"
  s-2: "8px"
  s-3: "12px"
  s-4: "16px"
  s-5: "24px"
  s-6: "32px"
  s-7: "48px"
  block: "16px"
  strip: "2px"
components:
  button-primary:
    backgroundColor: "{colors.red-fill}"
    textColor: "{colors.on-fill}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.red-fill-hover}"
    textColor: "{colors.on-fill}"
  button-secondary:
    backgroundColor: "{colors.raised-2}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.raised-3}"
  button-ghost-hover:
    backgroundColor: "{colors.raised-2}"
    textColor: "{colors.text}"
  button-danger:
    backgroundColor: "{colors.red-tint}"
    textColor: "{colors.red-text}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  icon-button:
    backgroundColor: "{colors.raised-2}"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    size: "30px"
  chip-group:
    backgroundColor: "{colors.sunken}"
    rounded: "{rounded.sm}"
    padding: "3px"
  chip:
    textColor: "{colors.muted}"
    rounded: "{rounded.xs}"
    padding: "6px 12px"
  chip-on:
    backgroundColor: "{colors.raised-3}"
    textColor: "{colors.text}"
  input:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "7px 12px"
  nav-item:
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.raised-2}"
    textColor: "{colors.text}"
  panel:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.md}"
    padding: "16px"
  strip-row:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  strip-row-hover:
    backgroundColor: "{colors.raised-2}"
  pill:
    backgroundColor: "{colors.raised-3}"
    textColor: "{colors.text}"
    typography: "{typography.tag}"
    rounded: "{rounded.xs}"
    padding: "2px 7px"
  badge-mvp:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    typography: "{typography.tag}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
  toast:
    backgroundColor: "{colors.raised-3}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  modal:
    backgroundColor: "{colors.raised-2}"
    rounded: "{rounded.md}"
    padding: "24px"
    width: "440px"
---

# Design System: Precise Gunplay (application)

Ce fichier décrit l’application Electron (`renderer/`). La landing page (`site/`) est une autre entité, avec sa propre direction, documentée par le `DESIGN.md` de la racine : aucun jeton ni composant ne passe de l’une à l’autre, seuls le nom et le logo sont communs. Les jetons font foi en tête de `renderer/styles.css` ; ce document les reprend et dit où ils servent.

## Overview

**Creative North Star: "Le tableau de score d’avant-match"**

L’app se lit comme l’écran que le jeu affiche avant une partie : un fond graphite acier, des noms et des chiffres en DIN condensée, des bandes serrées qu’on compare d’un coup d’œil, et une seule couleur forte qui dit où agir. Elle refuse le tableau de bord SaaS sombre : pas de cartes à contour, pas de police géométrique arrondie, pas de rouge en décor.

Le graphite est un acier : un gris bleuté froid (teinte 250, chroma 0,012 à 0,022) contre lequel le rouge du logo ressort. La profondeur vient de cinq paliers de clarté, jamais d’un contour. La densité est celle d’un outil : texte courant en 14 px léger, listes en bandes séparées de 2 px, valeurs alignées en chiffres tabulaires. La seule forme qui signe l’app est la coupe à 45° tirée des facettes du logo, posée sur les blocs vedettes et sur le bouton principal.

Le mouvement est sobre : une courbe, une durée, des fondus en opacité, une pression à 97,5 %. Les illustrations du jeu (agents, cartes, bannières) portent la couleur ; l’interface reste neutre autour d’elles.

**Key Characteristics:**
- Surfaces graphite acier en paliers de clarté, sans contour.
- Une seule famille, Bahnschrift, condensée à 75 % pour toute valeur et tout nom du jeu.
- Rangées de liste en bandes serrées, séparées de 2 px.
- Coupe à 45° sur les blocs vedettes et le bouton principal ; bouts biseautés sur les barres et les facettes de résultat.
- Couleurs qui portent un sens : rouge pour agir et perdre, vert pour gagner, or pour vous.

## Colors

Un graphite acier, gris bleuté froid, et trois couleurs de sens qui ne servent jamais d’ornement.

### Primary
- **Rouge du logo** (`red`) : la page active (icône du menu), le choix en cours (agent ou portée sélectionnés, interrupteur activé, champ qui a le focus, curseur), le direct (« En partie », point de présence, chargement), le score adverse et la légende des adversaires.
- **Rouge d’aplat** (`red-fill`, survol `red-fill-hover`) : le fond du bouton principal, des compteurs non lus, de la réduction du marché nocturne, de vos messages et de la facette de défaite. Il porte du texte blanc (`on-fill`).
- **Rouge lisible** (`red-text`) : les défaites, les écarts négatifs et l’équipe adverse en petit texte.
- **Voile rouge** (`red-tint`) : le fond des boîtes d’erreur, du bouton de danger et de la pastille « As ».

### Secondary
- **Vert turquoise** (`green`, encre `green-ink`, voile `green-tint`) : victoires, alliés, écarts positifs, joueur connecté, agent verrouillé, file d’attente, mise à jour disponible, courbe des graphiques.

### Tertiary
- **Or de l’atout** (`gold`, encre `gold-ink`, voile `gold-tint`) : vous (votre ligne au tableau, votre rangée en partie), le MVP, les titres de joueur, le chef de groupe, les états d’attente (sélection d’agent, limite de requêtes, absent), la liste de souhaits cochée.
- **Argent** (`silver`) : le MVP d’équipe, seulement.
- **Égalité** (`draw`) : la facette et la barre d’une partie nulle.

### Neutral
- **Creux** (`sunken`) : barre de titre, barre latérale, champs, fond d’un groupe de choix.
- **Sol** (`ground`) : le fond des pages.
- **Relief 1** (`raised`) : panneaux, bandes de liste, cartes.
- **Relief 2** (`raised-2`) : survol d’une bande, blocs posés dans un panneau, bouton secondaire, plaque de la page active, fenêtre de confirmation.
- **Relief 3** (`raised-3`) : choix actif d’un groupe, pastilles neutres, toasts, pistes des barres.
- **Filets** (`line`, `line-strong`) : séparateurs à l’intérieur d’un panneau, bord des champs, contour de survol des cartes illustrées.
- **Ombre des voiles** (`shade`) : la couleur de tous les voiles sombres posés sur les images ; chaque voile la reprend avec sa propre opacité (`oklch(from var(--shade) l c h / …)`), si bien qu’un changement de palette les emporte.
- **Voile** (`scrim`) : sous un texte posé sur une image.
- **Texte** (`text`, `text-2` sur image, `muted` secondaire, `faint` pour les axes et l’inactif) ; **focus** (`focus`) pour l’anneau clavier.

Les couleurs des groupes en partie (`PARTY_COLORS` dans `app.js`, violet, bleu, orange, rose, vert-jaune) sont des couleurs de données, choisies hors du rouge, du vert et de l’or ; elles ne servent qu’à repérer un groupe. Les graphiques lisent leurs couleurs dans ces jetons au démarrage (`CHART` dans `app.js`). La fenêtre Electron (`main.js`) recopie le sol, le creux et le texte en hexadécimal pour le fond et les boutons de la fenêtre : un changement de ces jetons doit y être reporté.

### Named Rules
**La règle du rouge compté.** Le rouge dit « agissez ici », « c’est en cours » ou « perdu ». Un seul bouton rouge par écran ; jamais de rouge pour décorer un titre, un fond de carte ou une icône de rubrique.

**La règle du sens unique.** Chaque couleur de sens garde le même sens partout : vert pour gagner et pour les alliés, rouge pour perdre et pour les adversaires, or pour vous et l’attente. Un état sans enjeu prend une pastille neutre (`raised-3`).

**La règle du toast neutre.** Les toasts ont tous le même fond neutre ; une erreur se reconnaît à son icône rouge, pas à un fond teinté.

## Typography

**Display Font:** Bahnschrift (la DIN installée avec Windows), avec 'DIN Next', puis Segoe UI
**Body Font:** la même famille, en largeur normale et graisse légère

**Character:** Une DIN de signalétique, condensée pour les chiffres et les noms du jeu, légère pour le texte courant : la lecture d’un panneau de score, pas d’une brochure.

### Hierarchy
- **Display** (700, 44 px, 1, condensée) : nom de l’agent favori, nom de la carte et compte à rebours en partie, score en direct.
- **Headline** (700, 34 px, 1, condensée) : le titre de page (`h1`), le nom du joueur à l’accueil, le rang, les chiffres clés des statistiques, le nom d’un pack.
- **Figure** (700, 26 px, 1,1, condensée) : chiffres des blocs vedettes, score d’une partie dans l’historique, titre de la vue d’ensemble.
- **Title** (700, 20 px, 1,1, condensée) : titres de section (`h2`), noms de carte et d’agent sur les cartes illustrées, valeurs de stat, monnaies.
- **Body** (300, 14 px, 1,45) : texte courant. Les paragraphes d’explication restent sous 640 px.
- **Label** (600, 13 px) : boutons, libellés forts ; la variante 400 sert aux choix d’un groupe et aux entrées du menu (14 px).
- **Caption** (300, 12 px) : sous-lignes en `muted`, libellés de stat, légendes.
- **Tag** (600, 11 px) : pastilles, badges, touches.

La largeur condensée (`--cond`, 75 %) et les chiffres tabulaires s’appliquent par une liste de sélecteurs en tête de `styles.css` ; les noms du jeu (cartes, agents, armes, packs, pseudos) y prennent en plus la graisse 700. Aucune capitale forcée, aucun espacement de lettres : seule la première lettre d’un titre de date ou de période est mise en capitale.

### Named Rules
**La règle de la largeur du jeu.** Toute valeur (score, stat, prix, compteur, niveau) et tout nom du jeu passe en condensée 75 % avec chiffres tabulaires. Le texte qui explique reste en largeur normale.

**La règle du texte léger.** Le texte courant est en 300, les libellés en 400, l’emphase en 600, les chiffres et noms du jeu en 700. Aucune autre graisse.

## Layout

Une fenêtre de bureau (1320 × 840 par défaut, 1040 × 680 au minimum) : barre de titre de 40 px en creux, qui reprend la couleur des boutons de fenêtre ; barre latérale de 232 px en creux ; contenu sur le sol avec une marge de 32 px en haut, 36 px sur les côtés et 48 px en bas.

Le rythme suit un pas de 4 (`s-1` à `s-7`). Les blocs empilés d’une page sont séparés de 16 px (`block`), les cartes d’une grille de 12 px, les bandes d’une liste de 2 px (`strip`). Un titre de section prend 32 px au-dessus et 12 px en dessous ; l’en-tête de page 24 px en dessous.

L’accueil, la liste de souhaits et les statistiques posent une colonne principale fluide et une colonne de 300 px à droite, écartées de 24 px (20 px pour les statistiques). Sous 1220 à 1280 px de large, la colonne de droite passe sous la principale, en deux colonnes. Les tableaux à colonnes fixes (joueurs en direct, historique, derniers matchs) gardent la même grille pour toutes leurs lignes et retirent des colonnes secondaires sous 1500, 1300 ou 1250 px plutôt que de les écraser.

### Named Rules
**La règle des deux pixels.** Les rangées d’une même liste se touchent presque : 2 px entre deux bandes, jamais une carte espacée par rangée.

## Elevation & Depth

Le système est plat et tonal. Une surface monte d’un palier de clarté au-dessus de son fond (`ground` puis `raised`, `raised-2`, `raised-3`) ; le survol monte d’un palier, le creux (`sunken`) sert aux champs et aux gouttières. Les filets n’apparaissent qu’à l’intérieur d’un panneau, entre ses lignes.

### Shadow Vocabulary
- **Couche flottante** (`box-shadow: 0 8px 24px oklch(0 0 0 / 0.5)`) : toasts et infobulle des graphiques, seulement.
- **Contour de survol** (`box-shadow: inset 0 0 0 1px var(--line-strong)`) : seul effet de survol des cartes illustrées (agents, cartes, amis en partie) ; la carte de la liste de souhaits prend la teinte de sa rareté.
- **Trait de donnée** (`inset 4px 0 0` à la couleur du groupe ; `inset 0 -3px 0` à la couleur du résultat) : repère un groupe de joueurs ou le résultat d’une journée. C’est une donnée, pas un ornement.

### Named Rules
**La règle du palier.** Un niveau de plus, c’est un palier de clarté de plus, jamais un contour ni une ombre. L’ombre est réservée à ce qui flotte au-dessus de la page.

## Shapes

Des coins à peine adoucis : 2 px pour les pastilles et les touches (`xs`), 4 px pour les contrôles, les bandes et les vignettes (`sm`), 6 px pour les panneaux et les cartes (`md`). Le rond complet (`pill`) ne sert qu’aux compteurs, aux interrupteurs et aux points d’état.

La coupe à 45° du logo taille le coin supérieur droit : 12 px sur les blocs vedettes (agent favori, carte de rang, en-tête de partie, vue d’ensemble des statistiques, fenêtre de confirmation), 7 px sur le bouton principal, dessinée là par un dégradé de fond pour que l’anneau de focus reste entier. Le même biseau finit les barres de progression (4 px) et incline les facettes de résultat (victoire, défaite, égalité).

### Named Rules
**La règle de la coupe.** La coupe à 45° marque ce qui compte le plus sur un écran : un bloc vedette ou l’action principale. Une carte ordinaire, une bande ou un bouton secondaire gardent leurs quatre coins.

## Components

### Buttons
Des plaques sobres, d’un palier plus claires que leur fond.
- **Shape:** coins de 4 px ; texte 13 px en 600, icône de 14 px quand elle dit l’action.
- **Primary:** aplat `red-fill`, texte blanc, coin supérieur droit coupé à 7 px ; survol `red-fill-hover`.
- **Secondary:** plaque `raised-2`, survol `raised-3`.
- **Ghost / Danger:** transparent qui prend `raised-2` au survol ; voile rouge et texte `red-text` pour une action destructrice.
- **Hover / Focus:** un seul changement de fond au survol, pression à 97,5 %, anneau `focus` de 2 px décalé de 2 px au clavier ; désactivé à 45 % d’opacité.
- **Variantes:** grand (12 px × 20 px, 14 px) ; bouton-icône carré de 30 px en `muted`.

### Chips
- **Style:** groupe de choix posé dans un creux (`sunken`, marge interne de 3 px) ; choix en texte `muted` 400.
- **State:** le choix actif est une plaque `raised-3` qui glisse d’un choix à l’autre, texte `text` en 600. Le survol d’un choix inactif prend `raised`. Un menu déroulant posé à côté prend la même typographie.

### Cards / Containers
- **Corner Style:** 6 px pour les panneaux et les cartes, 4 px pour les bandes.
- **Background:** `raised` pour un panneau ; une carte de boutique ou de rang se teinte de sa rareté ou de son rang (12 à 16 % mêlés à `raised`) ; les cartes illustrées posent l’image et un voile sombre en bas pour le texte.
- **Shadow Strategy:** aucune (voir Elevation & Depth).
- **Border:** aucun.
- **Internal Padding:** 16 px pour un panneau, 12 à 14 px pour une carte compacte.

### Inputs / Fields
- **Style:** creux `sunken`, filet `line` de 1 px, coins de 4 px, 7 px × 12 px ; flèche des menus dessinée en `muted`.
- **Focus:** le filet passe au rouge, sans anneau. Survol : filet `line-strong`.
- **Error / Disabled:** zone verrouillée à 40 % d’opacité et en niveaux de gris, avec un message au clic ; erreur en boîte `red-tint`.

### Navigation
- **Style:** barre latérale en creux de 232 px ; une entrée par page, icône de 19 px et libellé 14 px en 400 `muted`. Une icône par ligne est voulue : c’est l’identité de l’app, une exception confirmée par l’utilisateur.
- **States:** survol `raised` ; page active marquée par une plaque `raised-2` qui glisse d’une entrée à l’autre, texte en 600 et icône rouge. Pastille rouge pour un compte, point vert ou rouge pour une nouveauté.
- **Carte du compte:** en pied de barre, la bannière du joueur sous un voile, avatar de 42 px, niveau en tag, titre en or.

### Strips
La rangée de liste de l’app : partie de l’historique, derniers matchs, joueurs en direct, amis, cartes jouées, armes.
- Fond `raised` (ou `raised-2` dans un panneau), coins de 4 px, 2 px entre deux bandes, grille de colonnes identique pour toutes les lignes.
- Survol : un palier de plus. Une bande ouverte (détail d’une partie) prend `raised-2` et s’écarte de 12 px.
- L’image de la carte ou la bannière du joueur peut passer en fond, à 20 à 25 % d’opacité, fondue vers la gauche.
- Le résultat se lit à la couleur du score (vert ou `red-text`), votre ligne à un voile d’or, un groupe à un trait de 4 px à sa couleur.

### Hero Blocks
Agent favori, carte de rang, en-tête de partie en direct, vue d’ensemble des statistiques, fenêtre de confirmation : coupés à 45° (12 px), chiffres en condensée 26 à 44 px. L’agent favori prend la teinte de l’agent et son portrait dépasse du cadre de 60 px vers le haut ; la carte de rang se teinte de la couleur du rang ; l’en-tête de partie pose la carte jouée sous un voile qui part de la gauche.

### Pills and Badges
Tag 11 px en 600, coins de 2 px. Neutre (`raised-3`) pour un état sans enjeu ; or pour l’attente (sélection d’agent) et le MVP, vert pour la file, argent pour le MVP d’équipe, rouge pour une réduction. Un badge ne reste que s’il porte une information qui change.

### Toasts
En bas à droite, `raised-3`, coins de 4 px, ombre flottante, 260 à 380 px, 13 px ; disparaissent après 5 s. Une erreur ajoute une icône rouge de 16 px.

### Charts
Courbe en vert, barres en vert, rouge et `draw` selon le résultat, grille en `line`, axes en `faint` 11 px tabulaires, infobulle `raised-3` flottante. Les couleurs viennent des jetons, jamais de valeurs écrites dans le script.

### Motion
Une courbe (`cubic-bezier(.16, 1, .3, 1)`) et une durée (0,15 s) pour tout : changement de fond, plaques qui glissent, chevrons qui tournent. Les pages apparaissent par un fondu d’opacité seule ; le détail d’une partie s’ouvre en 0,2 s par la hauteur de la grille. Le mouvement réduit de Windows coupe tout.

## Do's and Don'ts

### Do:
- **Do** monter d’un palier de clarté (`raised`, `raised-2`, `raised-3`) pour poser une surface sur une autre.
- **Do** passer toute valeur et tout nom du jeu en condensée 75 % avec chiffres tabulaires.
- **Do** séparer les rangées d’une liste de 2 px (`strip`) et garder la même grille de colonnes pour toutes.
- **Do** réserver la coupe à 45° aux blocs vedettes (12 px) et au bouton principal (7 px).
- **Do** garder un seul bouton rouge par écran.
- **Do** dire l’état d’une ligne par la couleur de son score ou de son texte, pas par un cadre.
- **Do** lire les couleurs des graphiques dans les jetons CSS.

### Don't:
- **Don't** poser un contour sur une carte ou un panneau : la profondeur vient du palier de clarté.
- **Don't** employer le rouge en décor (titre, icône de rubrique, fond de carte sans sélection).
- **Don't** teinter le fond d’un toast selon son état.
- **Don't** ajouter une police : Bahnschrift seule, de 300 à 700.
- **Don't** forcer les capitales ni espacer les lettres d’un libellé ou d’un bouton.
- **Don't** marquer un choix par un fond et un contour à la fois : la plaque glisse pour un groupe de choix, le contour rouge sert aux vignettes d’agent et de portée.
- **Don't** empiler les effets au survol : un palier de fond, ou le contour de 1 px sur une carte illustrée.
- **Don't** poser un trait coloré sur le bord d’un bloc pour l’orner : le seul trait de bord admis encode un groupe de joueurs ou un résultat.
- **Don't** reprendre les jetons ou les composants de la landing page (`site/`).
