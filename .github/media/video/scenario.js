// Scénario du tournage : ce que fait la souris et où regarde la caméra, en secondes.
// move : le curseur va vers un élément (sélecteur dans l'app) ou un point {x, y} en pixels de l'app (1440 × 810).
// cam : la caméra cadre un élément ({sel, pad, zmax}) ou un point ({x, y, z}) ; z = 1 montre toute la fenêtre.
// click : clic gauche là où est le curseur. scroll : défilement de la zone de contenu. run : action sur la démo.
// Les chapitres servent au site (repères sous la vidéo) et à découper les extraits par fonction.
const nav = (page) => ({ sel: `#nav [data-page="${page}"]`, ax: 0.3 });
const FULL = { x: 720, y: 405, z: 1 };
const REST = { x: 864, y: 454 }; // position du curseur à la première et à la dernière image (boucle)
// Cadre de la zone de contenu seule : la barre latérale (232 px) sort du champ, sans être coupée en deux.
const content = (dy = 0) => ({ sel: '.content', fit: 'width', pad: 0, top: true, dy });

window.CHAPTERS = [
  { id: 'accueil', label: 'Accueil', at: 0 },
  { id: 'boutique', label: 'Boutique du jour', at: 3.2 },
  { id: 'etiree', label: 'Résolution étirée', at: 11.0 },
  { id: 'partie', label: 'Partie en direct', at: 20.0 },
  { id: 'stats', label: 'Statistiques', at: 27.6 },
  { id: 'fin', label: 'Accueil', at: 35.2 },
];

window.SCENARIO_DEF = [
  // Accueil : le profil, puis la navigation
  { at: 0, cursor: 'show' },
  { at: 0.3, dur: 1.4, move: { x: 760, y: 300 } },
  { at: 0.4, dur: 1.6, cam: { x: 632, y: 330, z: 1.14 } },
  { at: 2.0, dur: 1.0, move: nav('store') },
  { at: 2.2, dur: 1.0, cam: FULL },
  { at: 3.2, click: true },

  // Boutique du jour, puis le marché nocturne
  { at: 3.8, dur: 1.4, cam: { x: 640, y: 290, z: 1.8 } }, // titre de la page entier en haut du cadre
  { at: 4.0, dur: 1.2, move: { sel: '.offers .offer', ax: 0.5, ay: 0.4 } },
  { at: 5.5, dur: 0.9, move: { sel: '.offers .offer:nth-child(2)', ax: 0.5, ay: 0.4 } },
  { at: 6.8, dur: 1.6, scroll: { sel: '.offers ~ h2', offset: 24 } },
  { at: 6.8, dur: 1.6, cam: content() },
  { at: 7.2, dur: 1.2, move: { x: 900, y: 420 } },
  { at: 9.5, dur: 1.0, cam: FULL },
  { at: 9.7, dur: 1.2, move: nav('stretch') },
  { at: 11.0, click: true },

  // Résolution étirée : le jeu se lance, la résolution s'applique toute seule
  { at: 11.6, dur: 1.4, cam: content() },
  { at: 11.8, dur: 1.2, move: { x: 760, y: 260 } },
  { at: 12.2, run: (w) => { w.__demo.stretchFlow({ step: 1200, countdown: 2500 }); } },
  { at: 18.6, dur: 1.0, cam: FULL },
  { at: 18.8, dur: 1.1, move: nav('live') },
  { at: 20.0, click: true },

  // Partie en direct : votre équipe, puis les adversaires
  // haut du cadre juste sous l'image de la carte (qui finit à 192 px), la note explicative comprise
  { at: 20.6, dur: 1.4, cam: { sel: '.live-note', fit: 'width', pad: 10, top: true, zmax: 1.3 } },
  { at: 20.8, dur: 1.3, move: { sel: '.team .player:nth-child(3)', ax: 0.25 } },
  { at: 23.0, dur: 1.6, scroll: { sel: '.team ~ .team', offset: 40 } },
  { at: 23.0, dur: 1.6, cam: content() },
  { at: 23.4, dur: 1.4, move: { x: 520, y: 330 } },
  { at: 26.0, dur: 1.0, cam: FULL },
  { at: 26.2, dur: 1.2, move: nav('stats') },
  { at: 27.6, click: true },

  // Statistiques : les chiffres de l'acte, puis l'évolution du RR
  { at: 28.2, dur: 1.4, cam: { sel: '.st-main', fit: 'width', pad: 20, top: true, zmax: 1.8 } },
  { at: 28.4, dur: 1.3, move: { x: 900, y: 360 } },
  { at: 30.6, dur: 1.8, scroll: { sel: '#rr-chart', offset: 110 } },
  { at: 30.6, dur: 1.8, cam: content() },
  { at: 31.0, dur: 1.8, move: { x: 1180, y: 430 } },
  { at: 33.6, dur: 1.0, cam: FULL },
  { at: 33.8, dur: 1.1, move: nav('home') },
  { at: 35.2, click: true },

  // Retour à l'accueil, au même cadre que la première image : la vidéo boucle sans saut
  { at: 35.6, dur: 1.2, move: REST },
  { at: 37.2, dur: 0, cam: FULL },
];
