# Design du site : Precise Gunplay

Ce fichier décrit le site public (`site/`) seulement. L’app de bureau est une autre entité : sa direction est dans `renderer/DESIGN.md` et ses jetons dans `renderer/styles.css`. Le site et l’app partagent le nom, le logo et l’environnement colorimétrique (sombre, rouge vif, touches de turquoise), pas les jetons.

Les jetons font foi en tête de `site/styles.css` ; ce document les reprend et dit où ils servent. Le reste de la feuille n’utilise que ces jetons, hors des couleurs reprises de Windows et des dessins.

## Direction

**La vraie vidéo de l’app d’abord, puis la première soirée avec elle, racontée le long d’une ligne.**

- Le premier écran est la vidéo de l’app en plein cadre, assombrie par un voile. Le titre « Votre VALORANT, vu de près. » est en bas à gauche, avec sa fin en rouge, puis le bouton de téléchargement et une ligne de faits.
- Au défilement, la vidéo recule jusqu’à son cadre entier, entre la barre du haut et ses contrôles, pendant que le titre s’efface.
- Les contrôles sont une pilule centrée sous la vidéo : lecture, chapitre précédent, nom du chapitre en cours, chapitre suivant, son. Un trait rouge sous la pilule suit le chapitre. Les cinq chapitres sont calés sur `.github/media/video/scenario.js` ; le son se charge à la demande.
- Le parcours raconte cinq étapes, de l’installation à la fin de la première partie. Une ligne verticale se remplit en rouge au défilement, et chaque étape a son illustration à droite, faite de vraies fenêtres qu’un curseur manipule : Chrome ouvert sur ce site, qui télécharge l’installeur ; la fenêtre SmartScreen ; le Riot Client, puis l’app qui le détecte ; l’écran de jeu qui passe en résolution étirée, piloté par la page de l’app ; l’historique, puis les statistiques de l’app.
- Le fond de page porte une grille de repères, comme un relevé tactique : des traits très discrets et une petite croix à chaque intersection. Elle se voit autour de la vidéo une fois reculée, puis sous tout le parcours.
- Le pied de page suit directement le parcours : rien d’autre, tout reste sur fond sombre, sans aplat de couleur.
- La vidéo porte la mention « Vraie interface, données fictives ». Les illustrations du parcours n’ont pas de légende.

## Couleurs

| Jeton | Valeur | Rôle |
| --- | --- | --- |
| `--bg` | `#050608` | Fond de page, couleur du thème du navigateur |
| `--surface-2` | `#13161c` | Pilule des contrôles de la vidéo |
| `--surface-3` | `#1b1f27` | Touches de clavier |
| `--text` | `#f4f5f7` | Titres et texte fort, bouton de lecture |
| `--text-2` | blanc à 68 % | Texte courant, liens du pied de page |
| `--text-3` | blanc à 50 % | Légendes, étiquettes, « 1 sur 5 » |
| `--hair`, `--hair-2` | blanc à 12 %, 20 % | Filets, ligne du parcours, contour des points |
| `--red` | `#ff3048` | L’action : boutons de téléchargement, fin du titre, ligne et points du parcours, progression du chapitre |
| `--red-hover` | `#ff4a5f` | Survol des boutons de téléchargement |

Le rouge sert à l’action. Pas d’autre couleur vive dans les jetons du site. Les illustrations reproduisent de vraies fenêtres avec leurs propres couleurs et polices : SmartScreen (bleus de Windows, Segoe UI), Chrome en thème sombre, le Riot Client, et l’app avec les jetons de `renderer/styles.css`, préfixés `--p-` sous `.pg` (Bahnschrift sous Windows, comme l’app, Archivo ailleurs). Le turquoise des victoires vient de là.

## Typographie

- **Archivo**, police variable (largeur de 62 à 125, graisse de 100 à 900), pour tout le site. Les titres sont plus larges et plus gras que le texte.
- Elle est servie par le site (`site/fonts/archivo.woff2`, jeu latin, licence OFL dans `OFL-archivo.txt`).

| Rôle | Taille | Graisse, largeur, interligne |
| --- | --- | --- |
| Titre du premier écran (`.title`) | `clamp(44px, 7.2vw, 96px)`, 40px sous 380 px | 820, 112 (100 sous 380 px), 0.92 |
| Titre de section (`.h2`) | `clamp(36px, 5vw, 68px)` | 780, 108, 0.98 |
| Titre d’étape (`.h3`) | `clamp(26px, 2.6vw, 36px)` | 720, 106, 1.05 |
| Texte | 17px | 400, 100, 1.55 |
| Petit texte | 15px | faits, liens secondaires, pied de page |
| Micro | 13px | légendes, étiquettes, touches |

Libellés, boutons et liens restent en casse de phrase, sans capitales ni lettres espacées. Pas de sous-titre ni de phrase d’accroche sous un titre.

## Forme et profondeur

- Boutons de téléchargement (`.btn`) : rectangles à angles vifs, rouge plein, sans ombre ; 56px de haut (52px sous 640 px), 40px pour celui de la barre (`.btn-sm`). Au survol, le rouge s’éclaircit.
- Contrôles de la vidéo : pilule `--surface-2`, boutons ronds de 40px (36px sous 380 px), lecture en blanc plein.
- Illustrations : des fenêtres de Windows 11 (rayon de 8px, filet blanc à 7 %, ombre profonde), superposées en décalé. Un curseur de Windows passe au-dessus. Seule SmartScreen garde son rayon de 8px et `--shadow-card`, sans barre de titre.
- L’écran de jeu a un rayon de 4px, un cadre sombre de 7px et un pied.
- La vidéo garde un rayon de 14px et une ombre profonde dans son cadre.
- Grille du fond (`.grid`, motif dans `site/img/grid.svg`) : maille de 96px centrée, traits de 1px en `--text` à 3 %, croix de 13px à 16 %. Elle est posée sous tout le contenu, `body` reste transparent et `html` porte `--bg`. Les cartes, la vidéo et la barre du haut, une fois pleine, la masquent.

## Mouvement

- Courbes : `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`) pour ce qui entre, `--ease-in-out` (`cubic-bezier(0.77, 0, 0.175, 1)`) pour ce qui bouge à l’écran.
- Durées : 140 ms pour l’appui (`scale(0.97)`), 160 à 220 ms pour les survols et changements d’état, 300 ms pour le nom du chapitre, 700 à 900 ms pour les apparitions, 70 ms entre deux éléments d’une cascade.
- Premier écran : les deux lignes du titre montent depuis un masque (1 s, en cascade), puis le bouton et les contrôles apparaissent.
- Le recul de la vidéo est lié au défilement : le premier écran mesure `100svh + 110vh` (`100svh + 60vh` sous 640 px), la vidéo atteint son cadre à 85 % de ce trajet et le titre s’efface sur les premiers 32 %.
- La ligne du parcours se remplit jusqu’à 60 % de la hauteur de l’écran ; chaque point s’allume quand la ligne l’atteint. Près du bas de page, ce repère descend pour que le dernier point s’allume même sur un écran très haut.
- Chaque illustration se joue quand elle est visible à 45 %. Celles qui bouclent (SmartScreen, résolution étirée) s’arrêtent quand elles sortent de l’écran ; la vidéo aussi. Sans attribut `data-s`, une scène montre son état final ; `main.js` pose l’état de départ dès le chargement.
  - Le curseur glisse en 700 ms `--ease-in-out` et clique (pression à 0,82 en 160 ms, depuis la pointe de la flèche) ; la fenêtre répond au relâchement.
  - Téléchargement : clic sur le bouton de la page, la bulle de Chrome s’ouvre, l’anneau se remplit en 2,6 s, puis le curseur ouvre le fichier.
  - Riot Client : sa fenêtre s’ouvre, l’app cherche le client, puis montre l’accueil (cascade de 50 ms) et le toast « Compte lié ».
  - Résolution étirée : le curseur active l’interrupteur, l’app passe par ses vrais états, l’écran passe au noir 260 ms à chaque changement de mode, Ctrl F9 rend la résolution native. Les cinq états sont empilés : le panneau ne change pas de hauteur.
  - Après la partie : la nouvelle partie arrive en haut de l’historique, puis le curseur ouvre les statistiques, où sa facette V apparaît.
- On n’anime que `transform` et `opacity`.
- Les survols sont limités à `(hover: hover) and (pointer: fine)`.
- La grille du fond monte à 55 % de la vitesse de la page, ce qui donne de la profondeur au défilement.
- Avec `prefers-reduced-motion`, la grille reste fixe, la vidéo ne recule pas et ne démarre pas seule, rien n’apparaît en glissant, SmartScreen s’ouvre sur ses détails, les autres illustrations montrent directement leur état final. Le bouton qui passe à « lancé » devient un fondu de 150 ms.
- Sans JavaScript, tout reste visible : la classe `.js` est retirée si `main.js` ne s’est pas exécuté au bout de 4 s, et les illustrations montrent leur état final.

## Mise en page

- Largeur de contenu 1328 px, marge latérale `clamp(20px, 4vw, 56px)`.
- Le même écart vertical sépare les sections (`--section-y`, de 112 à 200 px).
- Une étape du parcours : le point (24px), le texte (5 parts) et l’illustration (6 parts). Sous 900 px, l’illustration passe sous le texte.
- Les illustrations suivent la largeur de leur colonne (requêtes de conteneur) : sous 520 px, les fenêtres se resserrent et les touches du clavier disparaissent ; une fenêtre de l’app de moins de 430 px perd sa barre latérale.
- La barre du haut n’a que le logo et, quand aucun autre n’est visible, le bouton Télécharger.
- Sous 900 px, la mention « Vraie interface, données fictives » passe sous les contrôles.

## Téléchargement

- Un seul bouton Télécharger à l’écran : celui de la barre ne se montre que lorsqu’aucun autre bouton marqué `data-cta` n’est visible.
- Au clic, quand le lien mène déjà au fichier, le bouton montre une coche et « Téléchargement lancé » pendant 4 s (« Lancé » dans la barre et sous 380 px), sans changer de largeur. Les lecteurs d’écran l’entendent par une zone `role="status"`.
  - Le libellé sortant monte de 6 px en 150 ms `ease-out`, le nouveau arrive d’en dessous en 200 ms `--ease-out`.
  - L’icône Windows et la coche se croisent depuis `scale(0.6)`.
- Tous les liens pointent d’abord vers `releases/latest`.
- `main.js` interroge l’API GitHub, puis remplace :
  - les liens par le fichier Setup ou Portable de la dernière version ;
  - les noms de fichiers (`data-name`) ;
  - les tailles (`data-size`) et la version (`data-version`).
- Les valeurs écrites dans le HTML (v1.22.0, 111 Mo) ne servent que si l’API ne répond pas.
- La CSP de `site/nginx.conf` autorise `api.github.com` et l’empreinte du seul script en ligne. Elle est à recalculer si ce script change.

## Images

- Les images du jeu (Jett, Reyna, rang Ascendant 1, cartes Haven, Lotus, Sunset et Ascent) viennent de valorant-api.com, converties en WebP et servies par le site (`site/img`, une fiche `.json` par image, comme pour toutes les images du site). Le pied de page le mentionne.
- La CSP n’accepte que les images du site : aucune image n’est chargée d’ailleurs.
