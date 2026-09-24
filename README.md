# Precise Gunplay

Compagnon VALORANT pour Windows (Electron) : boutique, sélection d'agent automatique, partie en direct, historique, groupe et amis.

## Télécharger

Va sur la page [**Releases**](https://github.com/NOUSSS/precise-gunplay/releases/latest) et prends :
- `Precise-Gunplay-Setup-x.y.z.exe` : **installeur recommandé**, qui se met à jour automatiquement ;
- `Precise-Gunplay-Portable-x.y.z.exe` : version sans installation (elle te prévient des nouvelles versions, mais la mise à jour est manuelle).

> L'app n'est pas signée numériquement : au premier lancement, Windows SmartScreen peut afficher « Windows a protégé votre ordinateur ».
> Clique sur **Informations complémentaires** puis **Exécuter quand même**.

## Fonctionnalités

| Page | Ce qu'elle fait |
|---|---|
| **Accueil** | Profil (pseudo, niveau, carte, titre), rang actuel + meilleur rang, portefeuille VP / Radianite / Kingdom Credits |
| **Boutique** | Les 4 offres du jour avec compte à rebours, packs en vedette, marché nocturne, boutique d'accessoires |
| **Agent auto** | Sélection automatique de l'agent quand une partie est trouvée : mode survol ou verrouillage, délai, agents de secours, agent différent par carte |
| **Partie en direct** | Sélection d'agent et partie en cours : agent, niveau, rang, meilleur rang et **K/D/A moyen, K/D et HS % sur les 3 derniers matchs** de chaque joueur. Choix/verrouillage manuel et bouton d'esquive |
| **Statistiques** | Façon tracker, **par acte** et par mode : K/D, KDA, ACS, ADR, headshot %, KAST, first bloods, 3K/4K/ACE, rang de l'acte, évolution du RR, ACS par match, stats par agent, carte et arme. Les matchs sont synchronisés en arrière-plan et gardés sur le PC : la page s'ouvre instantanément |
| **Historique** | 15 derniers matchs (filtrables par mode) avec score, K/D/A, ACS, stats globales et tableau des scores dépliable |
| **Groupe** | Membres du groupe, changement de mode, lancer/annuler la recherche, ouvrir/fermer le groupe |
| **Amis** | Amis en ligne : dans les menus, en sélection ou en partie (mode, carte, score) |
| **Profils Tracker** | Bouton « TRN » sur les joueurs (partie en direct, historique, groupe, amis) qui ouvre leur profil tracker.gg — jamais pour un joueur en mode anonyme |
| **Collection** | Tous tes skins, triés par rareté, avec recherche |

## Liaison du compte

Aucun identifiant n'est demandé : l'app lit le `lockfile` du Riot Client (`%LOCALAPPDATA%\Riot Games\Riot Client\Config\lockfile`)
et récupère les jetons de la session déjà connectée. Il suffit donc d'avoir le Riot Client / VALORANT ouvert et connecté.
La région est détectée automatiquement (forçable dans les Paramètres).

## Lancer / compiler

```bash
npm install
npm start          # lancer en développement
npm run dist       # génère l'installeur et la version portable dans dist/
```

## Publier une mise à jour

1. Change `"version"` dans `package.json` (ex : `1.0.1`) et commit.
2. Crée et pousse le tag correspondant :
   ```bash
   git tag v1.0.1
   git push origin main --tags
   ```
3. GitHub Actions compile l'app et publie la Release. Les versions installées téléchargent la mise à jour en arrière-plan
   et l'installent au prochain redémarrage.

## Avertissement

Projet non officiel, ni approuvé ni affilié à Riot Games. Il utilise les API non documentées du client.
L'automatisation de la sélection d'agent (surtout le mode « Verrouiller ») n'est pas autorisée par Riot : utilise-la à tes risques.
Les images et noms viennent de [valorant-api.com](https://valorant-api.com).
