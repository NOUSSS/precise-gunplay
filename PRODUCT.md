# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

L'application elle-même est une app de bureau Electron pour Windows (x64) ; son interface est du HTML/CSS. La landing page est un site web statique.

## Stack

- Application : Electron 33, HTML/CSS/JS sans framework (`renderer/`), processus principal Node (`main.js`, `src/`).
- Landing page : HTML/CSS statique dans `site/`, servie depuis le VPS Coolify (derrière Cloudflare). Choix de l'utilisateur le 2026-10-29.

## Users

Joueurs et joueuses de VALORANT sur PC Windows, francophones, qui veulent voir leur boutique, suivre la partie en cours et leurs statistiques sans ouvrir le jeu ni un site tiers, et jouer en résolution étirée sans manipuler les réglages à chaque partie.

## Product Purpose

Precise Gunplay est un compagnon VALORANT pour Windows. Il lit les API locales du Riot Client pour afficher : accueil (profil, rang, agent favori, derniers matchs), boutique (offres du jour, marché nocturne, packs, accessoires), partie en direct (joueurs, rangs, stats, groupes repérés), historique, statistiques (K/D, ADR, HS %, KAST, évolution du RR, par mode, agent et carte), groupe, amis, collection, et la résolution étirée automatique.

Le succès : télécharger l'installeur, l'installer, et que l'app reste ouverte à côté du jeu.

## Positioning

- Une application de bureau, pas un site : elle lit le client local, sans connexion à un compte tiers.
- La résolution étirée est entièrement automatique : passage sur le pilote d'écran générique au lancement du jeu, résolution étirée à la fin de l'écran de chargement, retour à la résolution native à la fin de la partie. L'app ne touche jamais au processus du jeu.
- Gratuite, open source (licence MIT), mises à jour automatiques via l'installeur.

## Operating Context

- Windows uniquement. Téléchargement depuis les Releases GitHub (`Precise-Gunplay-Setup-x.y.z.exe`, recommandé, mises à jour automatiques ; `Precise-Gunplay-Portable-x.y.z.exe`, sans installation).
- L'app n'est pas signée : SmartScreen affiche « Windows a protégé votre ordinateur » au premier lancement (Informations complémentaires, puis Exécuter quand même).
- La résolution étirée demande une autorisation administrateur une seule fois (deux tâches planifiées).

## Capabilities and Constraints

- Fonctions désactivées car Riot peut les sanctionner : agent auto, sélection d'agent, esquive, gestion du groupe, envoi de messages. Elles sont grisées dans l'app ; ne jamais les présenter comme disponibles.
- Projet non officiel, ni approuvé ni affilié à Riot Games. Images et noms : valorant-api.com. Cette mention doit figurer sur toute surface publique.

## Brand Commitments

- Nom : Precise Gunplay. Logos : `renderer/logo-full.png`, `renderer/logo-mark.png`, `build/icon.png`.
- L'app et la landing page sont deux entités distinctes : chacune a sa propre direction artistique. Elles partagent le nom et le logo, pas les jetons ni les composants. Identité de l'app : `renderer/styles.css`. Identité du site : DESIGN.md, écrit à partir de `site/`.
- La première version de la landing page (2026-10-29), calquée sur l'interface de l'app, a été rejetée (2/10) : pas d'animation, police jugée laide, cartes à contour et fond de même teinte, aucune profondeur. Le site doit être une vraie page vitrine, animée, avec de la profondeur.
- Texte en français, vouvoiement.

## Evidence on Hand

- Vidéo de présentation : `.github/media/presentation.mp4` et `.webp` (style propre, différent de l'app).
- Aucune capture d'écran réelle, aucun témoignage, aucun chiffre d'utilisation. Ne pas en inventer ; les données de démonstration sont fictives et doivent le rester visiblement.

## Product Principles

1. Montrer l'interface au travail plutôt que la décrire.
2. Ne promettre que ce que l'app fait aujourd'hui ; les fonctions désactivées n'existent pas pour le visiteur.
3. Le téléchargement est la seule action qui compte.
4. Honnêteté sur l'installation (SmartScreen, autorisation administrateur) plutôt que surprise.
