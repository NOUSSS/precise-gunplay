---
name: "Precise Gunplay, le site"
description: "La landing page du compagnon VALORANT pour Windows : une pièce dans le noir, éclairée par l’écran qui passe la vidéo de l’app."
colors:
  glow: "#7688a8"
  glow-ink: "#abb6cb"
  room: "#07080a"
  edge: "#18191d"
  bezel: "#020203"
  ink: "#eceae6"
  ink-2: "#9a9893"
  ink-3: "#6b6965"
  on-ink: "#0b0b0c"
typography:
  display:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.55rem + 3.3vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.35rem + 1.3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  figure:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
    fontFeature: "\"tnum\" 1"
  body:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  body-small:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.55
  button:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
rounded:
  glass: "3px"
  screen: "12px"
  pill: "999px"
spacing:
  s1: "0.5rem"
  s2: "1rem"
  s3: "1.5rem"
  s4: "2rem"
  s5: "3rem"
  s6: "4rem"
  s7: "6rem"
  s8: "8rem"
  gutter: "clamp(16px, 4vw, 56px)"
  page: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "18px 28px 18px 22px"
  button-primary-install:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "18px 28px 18px 22px"
  button-ghost:
    backgroundColor: "rgb(255 255 255 / 0.06)"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 14px 0 12px"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "rgb(255 255 255 / 0.11)"
  nav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.body-small}"
  nav-link-hover:
    textColor: "{colors.ink}"
  chapter:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    padding: "8px 0"
  chapter-current:
    textColor: "{colors.ink}"
  monitor-bezel:
    backgroundColor: "{colors.bezel}"
    rounded: "{rounded.screen}"
    padding: "10px 10px 12px"
---

# Design System: Precise Gunplay, le site

Ce fichier décrit le site public (`site/`) seulement. L’app de bureau est une autre entité, avec sa propre direction dans `renderer/DESIGN.md` et ses jetons dans `renderer/styles.css`. Le site et l’app partagent le nom et le logo, pas les jetons.

## Overview

**Creative North Star : « L’écran dans le noir »**

La page est une pièce plongée dans le noir dont la seule lumière vient de l’écran, et cet écran passe la vraie vidéo de l’app. La couleur de cette lumière est prise sur la vidéo pendant la lecture : elle teinte la pièce, la fin du titre, le halo du bouton principal et le remplissage des chapitres. Il n’y a pas de couleur d’accent fixe ; quand l’app montre la boutique, la pièce prend la teinte de la boutique.

Le texte est posé à même la pénombre, sans cartes. À gauche, le titre et les fonctions ; à droite, un écran avec son cadre, son socle et une flaque de lumière sur le bureau, qui reste à l’écran pendant la visite. La fonction lue s’éclaire à l’encre claire, les autres restent en gris. Le mouvement suit la vidéo et rien d’autre : l’écran s’allume, puis la pièce s’éclaire, puis le titre monte en fondu court.

Rejets confirmés : le « HUD néon rouge » des sites de jeux de tir, et la page de logiciel à capture posée sous un halo violet fixe.

**Key Characteristics:**
- Une seule teinte vive, la lumière de l’écran, variable et prise sur la vidéo.
- Pénombre presque noire, encre chaude, deux gris.
- Une seule famille, Familjen Grotesk, servie par le site.
- Texte posé dans la pénombre, jamais dans une carte à contour et fond teinté.
- Formes : pilules pour les actions, écran aux coins légèrement arrondis.
- Mouvement lié à la vidéo ; aucune animation décorative à côté.

## Colors

Une pénombre neutre et une encre chaude, que seule la lumière de l’écran colore.

### Primary
- **Lumière de l’écran** (`glow`, défaut `rgb(118 136 168)`) : n’est pas une couleur fixe. `main.js` l’échantillonne sur la vidéo (les pixels vifs et saturés pèsent plus), garde la teinte, ramène la saturation entre 0,22 et 0,78 et la clarté à 0,6, puis l’écrit en continu dans `--glow` au format `r g b`. Elle sert à la lumière répandue dans la pièce (30 % puis 16 %), à la flaque sous le socle (28 %), au halo de la pilule principale (32 %, 42 % au survol), à la sélection de texte (35 %).
- **Encre éclairée** (`glow-ink`, `color-mix(in oklab, rgb(var(--glow)) 60%, #fff)`) : la lumière mêlée de blanc, pour ce qui doit se lire en couleur : la fin du titre (« à côté du jeu ») et le remplissage des barres de chapitre.

### Neutral
- **Pénombre** (`room`) : le fond de toute la page, la couleur du thème du navigateur, le fond de la piste de défilement.
- **Arête** (`edge`) : le seul filet de la page, au-dessus du pied de page.
- **Cadre** (`bezel`) : le cadre noir de l’écran.
- **Encre** (`ink`) : titres, texte de la fonction lue, liens soulignés, surface de la pilule principale, anneau de focus.
- **Gris** (`ink-2`) : texte secondaire, fonctions non lues, liens de navigation, libellés de chapitre. Éclairci depuis le premier contrat pour garder au moins 4,5:1 là où la lumière éclaircit la pièce (4,96:1 au pire).
- **Gris profond** (`ink-3`) : chiffres des étapes, décoratifs (3,66:1 sur la pénombre). Ne porte jamais un texte à lire.
- **Encre sur clair** (`on-ink`) : le texte de la pilule principale.

### Named Rules
**The One Light Rule.** La seule teinte vive de la page est la lumière de l’écran. Aucune couleur d’accent fixe hors du logo ; une nouvelle couleur vive se prend sur `--glow`, jamais sur un hexadécimal.

**The Out-of-Sight Rule.** Là où l’écran est hors de vue (l’installation), rien n’est éclairé : la pilule y est neutre, encre pleine et ombre noire.

**The Palette-Everywhere Rule.** Même le chrome du navigateur suit la palette : `::selection` en lumière à 35 % sur encre, `scrollbar-color` en gris profond mêlé à la pénombre sur la pénombre, `theme-color` et `color-scheme: dark`.

## Typography

**Display Font:** Familjen Grotesk (avec system-ui, sans-serif)
**Body Font:** Familjen Grotesk (avec system-ui, sans-serif)

**Character :** une grotesque serrée et un peu ronde, compacte en 700 dans les titres, calme en 400 dans le texte. Une seule famille, servie en woff2 (graisses 400 à 700) et préchargée.

### Hierarchy
- **Display** (700, `clamp(2.5rem, 1.55rem + 3.3vw, 4.25rem)`, 1, -0.03em) : le titre de la page seulement, équilibré (`text-wrap: balance`).
- **Headline** (700, `clamp(1.75rem, 1.35rem + 1.3vw, 2.5rem)`, 1.08, -0.02em) : titre de chaque fonction et de l’installation, équilibré.
- **Title** (700, 1.125rem, 1.3) : titres des blocs « Et aussi » et des étapes d’installation.
- **Figure** (700, 1.5rem, 1.1, chiffres tabulaires) : chiffre des étapes numérotées, en gris profond.
- **Body** (400, 1.0625rem, 1.55) : texte courant ; les fonctions tiennent dans 34rem, les blocs « Et aussi » dans 30rem.
- **Body small** (400, 0.9375rem) : liens de navigation, ligne sous la pilule.
- **Label** (500, 0.875rem) : libellés de chapitre, boutons fantômes, note sous l’écran, texte du pied de page (400).
- **Button** (700, 1.125rem) : la pilule principale ; 0.9375rem dans sa version flottante.
- Les valeurs chiffrées dans le texte (compte à rebours) passent en 600 à chiffres tabulaires, sans retour à la ligne.

### Named Rules
**The Plain Label Rule.** Libellés, boutons et liens restent en casse de phrase, sans capitales ni espacement de lettres.

**The No Kicker Rule.** Un titre n’a ni surtitre au-dessus, ni sous-titre ou phrase d’accroche dessous : il est suivi directement du texte ou de l’action.

## Layout

Une scène à deux colonnes dans une page de 1440px au plus, avec une marge latérale de `clamp(16px, 4vw, 56px)`. Sur grand écran, le texte occupe 0.78 part et l’écran 1.22 part (environ 55 % de la largeur), avec un écart de `clamp(40px, 5vw, 80px)`. L’écran est collant, centré dans la hauteur sous l’en-tête (76px) ; la position est calculée par le script (`--stick`).

Le premier bloc remplit la hauteur de la fenêtre sous l’en-tête ; chaque fonction prend 80 % de la hauteur (64 % sur téléphone), centrée verticalement, pour que l’écran joue son chapitre pendant qu’on la lit. Sous la scène, les blocs « Et aussi » et l’installation reprennent la largeur entière en trois colonnes.

Rythme vertical sur une échelle de 0.5rem à 8rem (`s1` à `s8`) : `s2` entre paragraphes, `s3` sous un titre de section et entre étapes, `s5` entre colonnes et avant l’action, `s7` au-dessus des grandes sections.

Sous 1024px : une seule colonne, l’en-tête passe à 64px et perd sa navigation ; le titre vient d’abord, puis l’écran se colle en haut, sur un fond de pénombre à 84 % flouté (10px), au-dessus des fonctions. Quand l’écran collé prendrait plus de 55 % de la hauteur (paysage, fenêtre basse), il défile avec la page au lieu de rester en haut. Le socle et la flaque disparaissent, les libellés de chapitre sont masqués à l’œil mais gardés pour les lecteurs d’écran ; les grilles à trois colonnes passent à une. Sous 600px, les boutons fantômes ne gardent que leur icône (36px de côté) et la pilule réduit son rembourrage.

## Elevation & Depth

La profondeur vient de la lumière, pas de surfaces empilées. Les blocs n’ont pas d’ombre ; seuls l’écran et les pilules en portent, parce que ce sont les objets physiques de la pièce. La lumière elle-même est un dégradé radial fixe, placé par le script au centre de l’écran et dimensionné sur lui (1,7 fois sa largeur, 2,1 fois sa hauteur).

### Shadow Vocabulary
- **Écran** (`box-shadow: inset 0 0 0 1px #1c1d21, 0 40px 80px rgb(0 0 0 / 0.6)`) : le cadre et son ombre portée dans la pièce.
- **Pilule éclairée** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.5), 0 16px 44px rgb(var(--glow) / 0.32), 0 10px 22px rgb(0 0 0 / 0.45)`) : un reflet en haut, un halo flou décalé de la couleur de l’écran, une ombre noire. Au survol : `0 20px 52px` à 42 % et `0 12px 26px` à 50 %, avec une montée de 1px.
- **Pilule hors lumière** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.5), 0 14px 32px rgb(0 0 0 / 0.55)`) : la même pilule à l’installation, sans halo.

### Named Rules
**The Lit Object Rule.** Le halo coloré de la pilule principale est voulu : c’est la lumière de l’écran posée sur un objet clair. Un détecteur peut le signaler en `dark-glow` ; il reste, tant qu’il prend sa couleur sur `--glow` et que l’écran est en vue.

**The No Card Rule.** Pas de cartes à contour et fond teinté : les blocs sont du texte posé dans la pénombre.

## Shapes

Trois rayons. La pilule (999px) pour toute action : bouton principal, boutons fantômes. L’écran (12px, 10px sur téléphone) pour le cadre et la fenêtre de la vidéo en grand ; la vitre (3px) pour l’image dans le cadre. Le socle est un trapèze dessiné en SVG. Les barres de chapitre sont des traits de 3px. Le seul filet est celui du pied de page (1px, arête). Les icônes sont des traits SVG arrondis (1.8 à 2.2), en couleur du texte.

## Components

### Buttons
- **Shape :** pilule (999px).
- **Primary (« Télécharger pour Windows ») :** pilule claire éclairée. Dégradé à 100° de l’encre vers l’encre mêlée à 28 % de la lumière, texte encre sur clair, 700, rembourrage 18px 28px 18px 22px, icône de téléchargement 20px à gauche. Ombre « pilule éclairée ».
- **Primary à l’installation :** même pilule, fond encre plein, ombre « pilule hors lumière » (The Out-of-Sight Rule).
- **Flottante :** la même pilule, plus petite (0.9375rem, 12px 20px 12px 16px), fixée en bas à droite ; elle apparaît en fondu montant (0,3s) quand aucune autre pilule n’est visible.
- **Hover / Focus :** montée de 1px et halo élargi, 0,2s sur la courbe de la page. Focus : contour encre 2px, décalé de 4px.
- **Ghost :** pilule de 36px de haut, blanc à 6 % (11 % au survol), libellé 500 en encre, icône 18px. Sous 600px, icône seule.

### Chapitres de la vidéo
Une grille de cinq barres sous l’écran, une par chapitre. Chaque barre (3px, blanc à 12 %) se remplit en encre éclairée au fil de la lecture ; un clic saute au chapitre. Libellé en gris, encre au survol et pour le chapitre en cours ; sur tablette et téléphone, masqué à l’œil seulement, il reste le nom du bouton.

### Écran (signature)
Cadre noir (rembourrage 10px 10px 12px), vitre 16:9 qui lit la boucle muette, socle SVG et flaque de lumière radiale sur le bureau. À l’allumage, la vitre clignote (luminosité 0, 1,5, 0,35, puis normale en 1,4s) avant que la lumière ne se répande dans la pièce (fondu 1,4s).

### Fonctions
Une section par fonction, texte gris ; la fonction lue passe à l’encre en 0,5s et fait jouer l’écran sur son chapitre.

### Étapes numérotées
Un seul composant sert pour toutes les étapes (résolution étirée, installation) : le chiffre en gris profond à gauche (colonne de 2rem), le titre en encre et 600 ou 700, puis le texte en gris. En colonne dans une fonction, en trois colonnes à l’installation.

### Navigation
Liens en gris, small, espacés de `s4`, à droite de la marque ; encre au survol (0,2s). Masquée sous 1024px. Le pied de page reprend les mêmes liens, espacés de `s3`.

### Vidéo avec le son
Une boîte de dialogue native, 16:9, rayon de l’écran, sur un fond noir à 86 % ; bouton de fermeture rond de 40px, noir à 60 %.

## Do's and Don'ts

### Do:
- **Do** prendre toute couleur vive sur `--glow` (`rgb(var(--glow) / a)` ou `--glow-ink`), jamais sur une valeur fixe.
- **Do** garder le texte secondaire en `ink-2` et réserver `ink-3` aux chiffres décoratifs.
- **Do** écrire les durées et unités avec une espace insécable (« 5 h 43 min 24 s », « 79 Mo », « 1440 × 1080 »).
- **Do** vouvoyer, mettre une espace insécable avant « : ; ? ! » et à l’intérieur des guillemets, écrire « … » plutôt que « ... » et l’apostrophe typographique.
- **Do** utiliser la courbe `cubic-bezier(0.2, 0.7, 0.2, 1)` pour tout mouvement, 0,2s pour les changements d’état, et couper les animations sous `prefers-reduced-motion`.
- **Do** passer par le composant d’étapes numérotées pour toute suite d’étapes.

### Don't:
- **Don't** ajouter une couleur d’accent fixe, un néon rouge façon HUD ou un halo violet fixe.
- **Don't** poser un bloc dans une carte à contour et fond teinté.
- **Don't** mettre un surtitre au-dessus d’un titre, ni un sous-titre ou une phrase d’accroche dessous.
- **Don't** écrire libellés et boutons en capitales ou en lettres espacées.
- **Don't** prendre un ton marketing, ni écrire de tiret cadratin ou de point d’exclamation.
- **Don't** ajouter « → » au texte d’un bouton.
- **Don't** poser une icône sur un carré teinté de sa couleur.
- **Don't** reprendre les jetons de l’app de bureau (`renderer/`) : seuls le nom et le logo sont communs.
