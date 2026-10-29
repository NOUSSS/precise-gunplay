---
name: "Precise Gunplay, le site"
description: "La landing page du compagnon VALORANT pour Windows, posée comme le tableau blanc d’une équipe avant le match."
colors:
  marker-blue: "#2456d6"
  marker-red: "#e0393e"
  red-ink: "#c22a2f"
  tape: "rgba(242, 194, 48, 0.55)"
  note: "#fbe7a1"
  note-ink: "#4a3f1c"
  board: "#f1f3f2"
  board-deep: "#e1e4e2"
  paper: "#fffefa"
  ink: "#1c1f24"
  ink-2: "#4b5058"
  ink-3: "#6d727a"
  rule: "#e2e0d8"
  alu-hi: "#e3e6ea"
  alu: "#c3c7cd"
  alu-lo: "#9ea3aa"
  magnet-core: "#2a2e35"
  magnet-label: "#ffffff"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(38px, 4.6vw, 64px)"
    fontWeight: 850
    lineHeight: 1.02
    letterSpacing: "-0.025em"
    fontVariation: "\"wdth\" 118"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(30px, 3.4vw, 46px)"
    fontWeight: 850
    lineHeight: 1.05
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 115"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.2
    fontVariation: "\"wdth\" 112"
  figure:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    fontFeature: "\"tnum\" 1"
    fontVariation: "\"wdth\" 110"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  meta:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  small:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  button:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.1
  hand:
    fontFamily: "Caveat, Segoe Print, cursive"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1
rounded:
  paper: "2px"
  thumb: "3px"
  screen: "6px"
  magnet: "12px"
  pill: "999px"
  round: "50%"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "64px"
  s9: "96px"
  s10: "128px"
  frame: "12px"
  gutter: "clamp(20px, 4vw, 56px)"
components:
  button-magnet:
    backgroundColor: "{colors.marker-blue}"
    textColor: "{colors.magnet-label}"
    typography: "{typography.button}"
    rounded: "{rounded.magnet}"
    padding: "18px 26px 18px 20px"
  button-magnet-compact:
    backgroundColor: "{colors.marker-blue}"
    textColor: "{colors.magnet-label}"
    rounded: "{rounded.magnet}"
    padding: "15px 22px 15px 18px"
  link-text:
    textColor: "{colors.marker-blue}"
  nav-link:
    textColor: "{colors.ink-2}"
  nav-link-hover:
    textColor: "{colors.ink}"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    padding: "32px"
  sheet-card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.paper}"
    padding: "20px 22px 18px"
  sheet-note:
    backgroundColor: "{colors.note}"
    textColor: "{colors.note-ink}"
    rounded: "{rounded.paper}"
    padding: "32px 24px 24px"
  agent-magnet:
    backgroundColor: "{colors.magnet-core}"
    rounded: "{rounded.round}"
    size: "56px"
  agent-magnet-small:
    backgroundColor: "{colors.magnet-core}"
    rounded: "{rounded.round}"
    size: "34px"
  switch-track:
    backgroundColor: "{colors.rule}"
    rounded: "{rounded.pill}"
    width: "58px"
    height: "32px"
  switch-track-on:
    backgroundColor: "{colors.marker-blue}"
  screen:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.screen}"
---

# Design System: Precise Gunplay, le site

## Overview

**Creative North Star: "Le tableau blanc d’avant-match"**

Le site est le tableau blanc d’une équipe avant le match, vu de face. Un émail froid et légèrement bombé occupe tout l’écran, tenu par un cadre en aluminium fixé aux bords de la fenêtre. Dessus, on pose des choses : des feuilles de papier chaud scotchées ou punaisées de travers, des aimants ronds, une carte imprimée. Et on écrit au feutre : un bleu pour notre équipe et l’action, un rouge pour les adversaires et les annotations. Chaque élément de l’interface est un objet de ce tableau ; rien n’y flotte sans raison matérielle.

La densité est celle d’une planche de travail : une planche par fonction, une feuille principale et une ou deux pièces rapportées (fiche, note jaune, aimants), jamais une grille de cartes égales. La profondeur vient des matières : ombres à deux couches, feuilles qui suivent le pointeur selon leur hauteur au-dessus de l’émail, reflet qui glisse sur l’émail. Le mouvement est celui d’une main qui écrit : les tracés au feutre se dessinent quand une planche entre à l’écran, les aimants avancent le long des flèches.

Rejets confirmés : le site « HUD néon rouge » des jeux de tir, la page SaaS blanche à cartes égales, et la première version calquée sur l’app (cartes à contour et fond de même teinte, aucune profondeur, aucune animation).

Ce système décrit le site (`site/`) seulement. L’application Electron (`renderer/`) est une autre entité, avec sa propre identité dans `renderer/styles.css` : elle ne partage ni ces jetons ni ces composants, seulement le nom et le logo.

**Key Characteristics:**
- Émail froid, papier chaud, encre presque noire, deux feutres et un scotch jaune.
- Archivo élargi et très gras pour les titres et les chiffres, Archivo normal pour le texte, Caveat pour ce qui est écrit à la main.
- Feuilles posées de travers (entre -3° et 3,5°), ombres de contact et de portée.
- Tracés au feutre qui se dessinent, aimants qui se déplacent, parallaxe par hauteur.
- Un seul bouton, l’aimant bleu, pour une seule action : télécharger.

## Colors

Une palette de matières (émail, papier, aluminium) et d’encres, où chaque couleur vive est un feutre avec un rôle.

### Primary
- **Feutre bleu** (marker-blue) : notre équipe et l’action. Fond de l’aimant de téléchargement, liens, anneau de focus, interrupteur actif, bordure des aimants d’agents alliés, flèches et annotations sur nos joueurs, victoires dans l’historique, le quadrillage du graphique (à 8 % d’opacité).

### Secondary
- **Feutre rouge** (marker-red) : les adversaires et les annotations. Le trait qui souligne le titre, la bordure des aimants adverses, les punaises, le point « en direct », le capuchon du feutre dans le plumier. Réservé aux traits, aux pastilles et aux surfaces.
- **Encre rouge** (red-ink) : la version du rouge pour le texte. Annotations manuscrites rouges, score adverse, défaites, prix barré du marché nocturne, libellé « en direct ». Elle tient le contraste sur le papier là où le feutre rouge serait trop clair.

### Tertiary
- **Scotch jaune** (tape) : semi-transparent, posé en mode multiplication sur les coins des feuilles ; sert aussi de couleur de sélection du texte.
- **Note jaune** (note) : le papier du marché nocturne, seule feuille colorée de la page.
- **Encre de note** (note-ink) : le texte posé sur la note jaune, un brun qui reste dans la teinte du papier.

### Neutral
- **Émail** (board) : le fond de la page, en dégradé radial vers l’émail profond.
- **Émail profond** (board-deep) : bas du dégradé de l’émail, rail de la barre de défilement, tracés fantômes derrière les titres de planche.
- **Papier** (paper) : toutes les feuilles. Chaud, pour se détacher de l’émail froid.
- **Encre** (ink) : titres et texte principal, fond de l’écran de la planche « résolution étirée », capuchon noir du plumier.
- **Encre atténuée** (ink-2) : texte secondaire, métadonnées, liens de navigation au repos.
- **Encre pâle** (ink-3) : la mention « Données fictives » et l’état hors ligne des amis.
- **Filet** (rule) : séparateurs de tableaux et de listes, rail de l’interrupteur au repos.
- **Aluminium clair, aluminium, aluminium sombre** (alu-hi, alu, alu-lo) : le cadre fixe, le plumier du pied de page, le curseur de la barre de défilement.
- **Cœur d’aimant** (magnet-core) : le fond sombre sous le portrait d’un agent.

### Named Rules
**La règle d’une couleur par camp.** Le bleu est notre équipe et l’action, le rouge l’adversaire et l’annotation. Aucun feutre n’est décoratif : si un trait bleu ou rouge ne désigne rien, il disparaît.

**La règle du rouge lisible.** Le texte rouge s’écrit en encre rouge (red-ink), jamais en feutre rouge (marker-red) ; le feutre rouge reste aux traits, bordures et pastilles.

**La règle du papier chaud sur émail froid.** Les feuilles sont toujours en papier (paper), le fond toujours en émail (board). Une seule exception colorée, la note jaune, et elle porte une information à part (le marché nocturne).

## Typography

**Display Font:** Archivo variable, axes largeur (62–125 %) et graisse (100–900) (avec system-ui, sans-serif)
**Body Font:** Archivo, largeur normale (avec system-ui, sans-serif)
**Label/Mono Font:** Caveat, 400 à 700 (avec Segoe Print, cursive), pour l’écriture au feutre

**Character:** Une grotesque élargie et lourde qui se lit comme des lettres de pochoir sur un tableau de stratégie, et une écriture manuscrite rapide qui annote par-dessus. Les deux ne se mélangent jamais dans un même rôle.

### Hierarchy
- **Display** (850, largeur 118 %, clamp(38px, 4,6vw, 64px), 1,02) : le titre de la page, seul, souligné par un trait de feutre rouge qui se trace.
- **Headline** (850, largeur 115 %, clamp(30px, 3,4vw, 46px), 1,05) : le titre de chaque planche, limité à 20 caractères de large.
- **Title** (800, largeur 112 %, 19px, 1,2) : titres des feuilles et des étapes, noms dans les listes ; descend à 17px dans les grilles serrées (offres, équipes).
- **Figure** (800, largeur 110 %, 24–26px, chiffres tabulaires) : les valeurs d’une fiche (K/D, RR, prix). Les scores montent à 40px (850, largeur 118 %).
- **Body** (400, 17px, 1,55 ; 16px sur téléphone) : texte courant, 15px dans les feuilles.
- **Meta** (400, 14px, 1,45, encre atténuée) : la ligne de contexte sous un titre de feuille, le pied de page.
- **Small** (13px) : la mention « Données fictives », les en-têtes de colonnes, les intitulés des chiffres.
- **Hand** (Caveat 700, 26px, 1) : les annotations au feutre posées sur le tableau, avec une seconde ligne en 500 à 22px. La note sous le bouton est en 400 à 27px, inclinée de -3°. Les chiffres des étapes d’installation montent à 64px.

### Named Rules
**La règle de la main.** Caveat n’écrit que ce qu’une main écrirait sur le tableau : annotations, note sous le bouton, chiffres des étapes. Jamais un titre, un paragraphe, un libellé de bouton ou un lien de navigation.

**La règle de la largeur.** L’axe de largeur (110 à 118 %) est réservé aux titres, aux noms de lieu et aux chiffres ; le texte courant reste en largeur normale. Plus le rôle est haut, plus il est large.

**La règle de la casse normale.** Aucun libellé en capitales ni espacé : la hiérarchie passe par la largeur et la graisse.

## Layout

Le cadre aluminium (12px, 6px sur téléphone) est fixe aux bords de la fenêtre et passe au-dessus de tout ; la page défile dessous. Le contenu tient dans une largeur de 1360px centrée, avec une gouttière fluide (de 20 à 56px).

L’ouverture est une grille à deux colonnes : le titre et l’aimant de téléchargement à gauche, la carte de la partie (600px de côté, mise à l’échelle) à droite, avec les fiches rapportées qui débordent autour. Écarts de 64px entre colonnes et de 48px entre rangées.

Chaque fonction est une planche : 128px au-dessus (96px sur téléphone), le titre de planche, 48px (32px sur téléphone), puis la planche elle-même, presque toujours une feuille principale et une pièce rapportée en deux colonnes inégales séparées de 64px. Les feuilles s’espacent sur l’échelle de 4 à 128px (4, 8, 12, 16, 24, 32, 48, 64, 96, 128) ; l’intérieur d’une feuille principale est de 32px.

Adaptation : sous 1180px, tout passe sur une colonne, la navigation et les fiches rapportées de l’ouverture disparaissent, la boutique passe à deux offres par ligne. Sous 640px, le cadre s’affine, le texte passe à 16px, les feuilles prennent 24px sur 16px de marge intérieure, les colonnes secondaires des tableaux sont retirées.

**La règle de la planche.** Une fonction égale une planche : une feuille qui montre l’app au travail, une pièce rapportée au plus, des annotations au feutre qui pointent les valeurs. Jamais une rangée de cartes identiques.

## Elevation & Depth

Le système est en relief. Tout ce qui est posé sur l’émail porte une ombre à deux couches, une de contact courte et une de portée large, teintée de l’encre et jamais noire pure. La hauteur dit la nature de l’objet : un aimant colle à l’émail, une feuille en est un peu détachée. La profondeur bouge aussi : chaque feuille suit le pointeur d’un déplacement proportionnel à sa hauteur (de 4 à 16px), et un reflet glisse sur l’émail. Le cadre et l’émail sont rendus par dégradés (radial pour l’émail, vertical pour l’aluminium), comme les punaises et les capuchons de feutre : le dégradé n’existe ici que pour rendre une matière.

### Shadow Vocabulary
- **Proche** (`box-shadow: 0 1px 2px rgba(28,31,36,.20), 0 8px 16px rgba(28,31,36,.12)`) : aimants, punaises, bouton au repos, curseur de l’interrupteur, plumier.
- **Loin** (`box-shadow: 0 2px 4px rgba(28,31,36,.10), 0 22px 40px rgba(28,31,36,.15)`) : toutes les feuilles de papier.
- **Soulevé** (`box-shadow: 0 3px 6px rgba(28,31,36,.12), 0 30px 54px rgba(28,31,36,.18)`) : l’aimant de téléchargement au survol, quand il se décolle de 3px.
- **Détourage** (`filter: drop-shadow(0 8px 8px rgba(28,31,36,.18))`) : les armes et objets sans fond posés sur une feuille.

### Named Rules
**La règle des deux couches.** Toute ombre a un contact et une portée. Une ombre à une seule couche, ou décalée sans flou, n’appartient pas à ce tableau.

**La règle de la hauteur.** Les aimants sont proches, les feuilles loin, et seul ce qu’on peut prendre se soulève au survol.

## Shapes

Le papier est à peine arrondi (2px), comme une feuille coupée. Les miniatures de carte gardent 3px, l’écran de la planche « résolution étirée » 6px, l’aimant de téléchargement 12px : un aimant de tableau, rectangulaire aux coins doux. Tout ce qui est rond l’est franchement (aimants d’agents, punaises, pastilles d’état, curseur), et le rail de l’interrupteur est une gélule. Les feuilles sont inclinées d’un angle propre à chacune, entre -3° et 3,5° ; les bandes de scotch (86 × 26px) aussi. Les séparations internes sont des filets de 1px, jamais des contours de feuille.

**La règle de la feuille posée.** Une feuille n’a pas de contour : son bord vient de son ombre et de son inclinaison.

## Components

### Buttons
L’aimant bleu : épais, qu’on a envie de détacher du tableau.
- **Shape:** coins doux d’aimant (12px).
- **Primary:** feutre bleu, libellé blanc en Archivo 700 19px, icône de téléchargement tracée de 22px à gauche, marge intérieure asymétrique (18px 26px 18px 20px) qui équilibre l’icône. Un liseré clair en haut (`inset 0 1px 0 rgba(255,255,255,.25)`) et l’ombre proche.
- **Hover / Focus:** au survol, l’aimant se décolle de 3px et prend l’ombre soulevée, en 200ms sur la courbe de sortie ; à l’appui, il revient au contact. Le focus est un anneau bleu de 3px décalé de 3px.
- **Compact:** même aimant à 17px (15px 22px 15px 18px) dans les étapes d’installation et sur téléphone ; à 16px avec le seul libellé « Télécharger » pour l’aimant flottant, qui apparaît en bas à droite une fois l’ouverture passée.
- **Secondary:** aucun bouton secondaire. L’alternative (version portable) est un lien.

### Liens
- **Lien de texte:** feutre bleu, souligné de 2px décalé de 3px, soulignement à 35 % d’opacité qui devient plein au survol. Dans la note manuscrite, même traitement, décalé de 4px.
- **Navigation:** liens en encre atténuée à 15px, sans soulignement, qui passent à l’encre au survol ; masquée sous 1180px. Le pied de page reprend le même traitement à 14px.

### Cards / Containers
La feuille de papier.
- **Corner Style:** 2px.
- **Background:** papier ; la note jaune pour la seule pièce à part.
- **Shadow Strategy:** ombre loin (voir Elevation & Depth).
- **Border:** aucune. Inclinaison propre, scotch ou punaise pour la tenir.
- **Internal Padding:** 32px pour une feuille principale, 20px 22px 18px pour une fiche rapportée, 24px sur 16px sur téléphone.
- **En-tête:** titre à gauche, mention « Données fictives » (13px, encre pâle) à droite sur toute feuille qui recompose des données de l’app.

### Inputs / Fields
- **Interrupteur:** seul contrôle de la page. Rail en gélule de 58 × 32px, filet au repos avec une ombre intérieure, feutre bleu une fois activé ; curseur en papier de 26px avec l’ombre proche, qui glisse en 300ms. Focus : anneau bleu sur le rail.

### Signature : les aimants d’agents
Ronds de 56px (34px dans les listes), portrait de l’agent sur le cœur d’aimant, bordure de 4px (3px en petit) à la couleur du camp : feutre bleu pour nous, feutre rouge pour l’adversaire. Sur la carte d’ouverture, ils avancent le long des flèches au feutre.

### Signature : les tracés et annotations au feutre
Traits à bouts ronds, de 3 à 7px, qui se dessinent à l’entrée de leur planche (de 700 à 1800ms, courbe du tracé), suivis des annotations manuscrites qui apparaissent en fondu. Chaque annotation est détourée d’un halo de papier pour rester lisible sur la carte. Une flèche ou un cercle pointe toujours la valeur qu’il désigne (le +102 RR entouré, les groupes repérés reliés d’un crochet). Avec la réduction des animations, tout est affiché d’emblée à l’état final.

### Signature : le cadre et le plumier
Le cadre aluminium fixe borde la fenêtre ; en pied de page, le rebord du tableau porte trois feutres (bleu, rouge, encre) et une brosse, purement décoratifs et masqués aux lecteurs d’écran.

## Do's and Don'ts

### Do:
- **Do** poser chaque contenu sur une feuille en papier (paper, 2px, ombre loin) inclinée de son propre angle, entre -3° et 3,5°.
- **Do** réserver le feutre bleu (marker-blue) à notre équipe et à l’action, le rouge à l’adversaire et à l’annotation, et écrire le texte rouge en encre rouge (red-ink).
- **Do** pointer les valeurs importantes d’un trait de feutre qui se dessine, et les annoter en Caveat 700.
- **Do** donner à toute ombre ses deux couches, contact et portée, teintées de l’encre (rgba(28,31,36,…)).
- **Do** écrire titres et chiffres en Archivo élargi (largeur 110 à 118 %, graisse 800 à 850), chiffres tabulaires.
- **Do** marquer « Données fictives » sur toute feuille qui recompose des données de l’app.
- **Do** afficher l’état final de chaque tracé et de chaque annotation quand l’utilisateur réduit les animations.

### Don't:
- **Don't** reprendre les jetons, les composants ou l’aspect de l’app Electron (`renderer/styles.css`) : le site est une autre entité.
- **Don't** faire de carte à contour et fond de même teinte, ni de grille de cartes identiques.
- **Don't** glisser vers le « HUD néon rouge » des jeux de tir ou vers la page SaaS blanche.
- **Don't** écrire en Caveat un titre, un paragraphe, un bouton ou un lien de navigation.
- **Don't** mettre de libellé en capitales ou espacé.
- **Don't** utiliser un dégradé, une lueur ou un reflet qui ne rende pas une matière du tableau (émail, aluminium, punaise, feutre).
- **Don't** ajouter un second bouton plein : l’aimant bleu est la seule action, l’alternative est un lien.
- **Don't** utiliser une ombre à une seule couche ou décalée sans flou.
