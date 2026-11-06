/* Données du jeu figées pour la démo : extraits de valorant-api.com (fr-FR, jeu 13.09.00.5804228),
   relevés le 6 novembre 2026. Même forme que src/assets.js (assets.summary() pour `assets`) ;
   seuls les agents, cartes, rangs, armes, skins, cartes de joueur et titres affichés par la démo sont gardés. */
window.DEMO_DATA = {
 "source": {
  "site": "valorant-api.com",
  "language": "fr-FR",
  "gameVersion": "13.09.00.5804228",
  "frozenAt": "2026-11-06"
 },
 "assets": {
  "agents": [
   {
    "uuid": "41fb69c1-4189-7b37-f117-bcaf1e96f1bf",
    "name": "Astra",
    "role": "Contrôleur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/4ee40330-ecdd-4f2f-98a8-eb1243428373/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/fullportrait.png",
    "colors": [
     "26146cff",
     "0f1923ff",
     "5210c6ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Puits de gravité",
      "icon": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/abilities/grenade/displayicon.png"
     },
     {
      "name": "Impulsion nova",
      "icon": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/abilities/ability1/displayicon.png"
     },
     {
      "name": "Nébuleuse",
      "icon": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/abilities/ability2/displayicon.png"
     },
     {
      "name": "Division cosmique",
      "icon": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "5f8d3a7f-467b-97f3-062c-13acf203c006",
    "name": "Breach",
    "role": "Initiateur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/1b47567f-8f7b-444b-aae3-b0c634622d10/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/fullportrait.png",
    "colors": [
     "81331aff",
     "0f1923ff",
     "523a23ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Réplique",
      "icon": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/abilities/grenade/displayicon.png"
     },
     {
      "name": "Point d'ignition",
      "icon": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/abilities/ability1/displayicon.png"
     },
     {
      "name": "Ligne de fracture",
      "icon": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/abilities/ability2/displayicon.png"
     },
     {
      "name": "Onde sismique",
      "icon": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "9f0d8ba9-4140-b941-57d3-a7ad57c6b417",
    "name": "Brimstone",
    "role": "Contrôleur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/4ee40330-ecdd-4f2f-98a8-eb1243428373/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/fullportrait.png",
    "colors": [
     "363c4fff",
     "0f1923ff",
     "211d21ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Balise stimulante",
      "icon": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/abilities/grenade/displayicon.png"
     },
     {
      "name": "Bombe incendiaire",
      "icon": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/abilities/ability1/displayicon.png"
     },
     {
      "name": "Frappe fumigène",
      "icon": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/abilities/ability2/displayicon.png"
     },
     {
      "name": "Rayon orbital",
      "icon": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
    "name": "Chamber",
    "role": "Sentinelle",
    "roleIcon": "https://media.valorant-api.com/agents/roles/5fc02f99-4091-4486-a531-98459a3e95e9/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/fullportrait.png",
    "colors": [
     "20435bff",
     "0f1923ff",
     "372d2bff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Guet-apens",
      "icon": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/abilities/grenade/displayicon.png"
     },
     {
      "name": "Chasseur de têtes",
      "icon": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/abilities/ability1/displayicon.png"
     },
     {
      "name": "Rendez-vous",
      "icon": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/abilities/ability2/displayicon.png"
     },
     {
      "name": "Tour de force",
      "icon": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "1dbf2edd-4729-0984-3115-daa5eed44993",
    "name": "Clove",
    "role": "Contrôleur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/4ee40330-ecdd-4f2f-98a8-eb1243428373/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/fullportrait.png",
    "colors": [
     "4b1d80ff",
     "0f1923ff",
     "c347c7ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Coup de boost",
      "icon": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/abilities/grenade/displayicon.png"
     },
     {
      "name": "Trouble-fête",
      "icon": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/abilities/ability1/displayicon.png"
     },
     {
      "name": "Ruse",
      "icon": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/abilities/ability2/displayicon.png"
     },
     {
      "name": "Toujours debout",
      "icon": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
    "name": "Cypher",
    "role": "Sentinelle",
    "roleIcon": "https://media.valorant-api.com/agents/roles/5fc02f99-4091-4486-a531-98459a3e95e9/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/fullportrait.png",
    "colors": [
     "2f5078ff",
     "0f1923ff",
     "3f3f6cff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Fil de détente",
      "icon": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/abilities/grenade/displayicon.png"
     },
     {
      "name": "Cybercage",
      "icon": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/abilities/ability1/displayicon.png"
     },
     {
      "name": "Caméra espionne",
      "icon": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/abilities/ability2/displayicon.png"
     },
     {
      "name": "Vol neural",
      "icon": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235",
    "name": "Deadlock",
    "role": "Sentinelle",
    "roleIcon": "https://media.valorant-api.com/agents/roles/5fc02f99-4091-4486-a531-98459a3e95e9/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/fullportrait.png",
    "colors": [
     "425495ff",
     "0f1923ff",
     "221c3dff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Disque barrière",
      "icon": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/abilities/grenade/displayicon.png"
     },
     {
      "name": "Radar ultrason",
      "icon": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/abilities/ability1/displayicon.png"
     },
     {
      "name": "GravNet",
      "icon": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/abilities/ability2/displayicon.png"
     },
     {
      "name": "Annihilation",
      "icon": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "dade69b4-4f5a-8528-247b-219e5a1facd6",
    "name": "Fade",
    "role": "Initiateur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/1b47567f-8f7b-444b-aae3-b0c634622d10/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/fullportrait.png",
    "colors": [
     "1d2846ff",
     "0f1923ff",
     "18344cff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Rôdeur",
      "icon": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/abilities/grenade/displayicon.png"
     },
     {
      "name": "Capture",
      "icon": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/abilities/ability1/displayicon.png"
     },
     {
      "name": "Hanteur",
      "icon": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/abilities/ability2/displayicon.png"
     },
     {
      "name": "Nuit tombante",
      "icon": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "e370fa57-4757-3604-3648-499e1f642d3f",
    "name": "Gekko",
    "role": "Initiateur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/1b47567f-8f7b-444b-aae3-b0c634622d10/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/fullportrait.png",
    "colors": [
     "371c5cff",
     "0f1923ff",
     "3a2656ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Pogo",
      "icon": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/abilities/grenade/displayicon.png"
     },
     {
      "name": "Altego",
      "icon": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/abilities/ability1/displayicon.png"
     },
     {
      "name": "Verti",
      "icon": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/abilities/ability2/displayicon.png"
     },
     {
      "name": "Mordicus",
      "icon": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "95b78ed7-4637-86d9-7e41-71ba8c293152",
    "name": "Harbor",
    "role": "Contrôleur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/4ee40330-ecdd-4f2f-98a8-eb1243428373/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/fullportrait.png",
    "colors": [
     "275146ff",
     "0f1923ff",
     "11434eff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Tempête déferlante",
      "icon": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/abilities/grenade/displayicon.png"
     },
     {
      "name": "Marée haute",
      "icon": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/abilities/ability1/displayicon.png"
     },
     {
      "name": "Dôme aqueux",
      "icon": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/abilities/ability2/displayicon.png"
     },
     {
      "name": "Raz-de-marée",
      "icon": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "ddd5a15c-4fbe-42fa-3789-11a55ca5ee04",
    "name": "Hush",
    "role": "Duelliste",
    "roleIcon": "https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/ddd5a15c-4fbe-42fa-3789-11a55ca5ee04/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/ddd5a15c-4fbe-42fa-3789-11a55ca5ee04/fullportrait.png",
    "colors": [
     "3d2c44ff",
     "0f1923ff",
     "f47ac7ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Flux",
      "icon": "https://media.valorant-api.com/agents/ddd5a15c-4fbe-42fa-3789-11a55ca5ee04/abilities/grenade/displayicon.png"
     },
     {
      "name": "Ampoule aveuglante",
      "icon": "https://media.valorant-api.com/agents/ddd5a15c-4fbe-42fa-3789-11a55ca5ee04/abilities/ability1/displayicon.png"
     },
     {
      "name": "Déplacement",
      "icon": "https://media.valorant-api.com/agents/ddd5a15c-4fbe-42fa-3789-11a55ca5ee04/abilities/ability2/displayicon.png"
     },
     {
      "name": "Suspension",
      "icon": "https://media.valorant-api.com/agents/ddd5a15c-4fbe-42fa-3789-11a55ca5ee04/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "0e38b510-41a8-5780-5e8f-568b2a4f2d6c",
    "name": "Iso",
    "role": "Duelliste",
    "roleIcon": "https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/fullportrait.png",
    "colors": [
     "30336eff",
     "0f1923ff",
     "20155dff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Contingence",
      "icon": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/abilities/grenade/displayicon.png"
     },
     {
      "name": "Sape",
      "icon": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/abilities/ability1/displayicon.png"
     },
     {
      "name": "Tir couplé",
      "icon": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/abilities/ability2/displayicon.png"
     },
     {
      "name": "Duel à huis clos",
      "icon": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "add6443a-41bd-e414-f6ad-e58d267f4e95",
    "name": "Jett",
    "role": "Duelliste",
    "roleIcon": "https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/fullportrait.png",
    "colors": [
     "25607aff",
     "0f1923ff",
     "0f1923ff",
     "25607aff"
    ],
    "abilities": [
     {
      "name": "Averse",
      "icon": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/abilities/grenade/displayicon.png"
     },
     {
      "name": "Courant ascendant",
      "icon": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/abilities/ability1/displayicon.png"
     },
     {
      "name": "Vent arrière",
      "icon": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/abilities/ability2/displayicon.png"
     },
     {
      "name": "Tempête de lames",
      "icon": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "601dbbe7-43ce-be57-2a40-4abd24953621",
    "name": "KAY/O",
    "role": "Initiateur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/1b47567f-8f7b-444b-aae3-b0c634622d10/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/fullportrait.png",
    "colors": [
     "1c2a69ff",
     "0f1923ff",
     "1a1e4bff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "FRAG/ment",
      "icon": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/abilities/grenade/displayicon.png"
     },
     {
      "name": "MÉMOIRE/flash",
      "icon": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/abilities/ability1/displayicon.png"
     },
     {
      "name": "POINT/zéro",
      "icon": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/abilities/ability2/displayicon.png"
     },
     {
      "name": "CMD/null",
      "icon": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "1e58de9c-4950-5125-93e9-a0aee9f98746",
    "name": "Killjoy",
    "role": "Sentinelle",
    "roleIcon": "https://media.valorant-api.com/agents/roles/5fc02f99-4091-4486-a531-98459a3e95e9/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/fullportrait.png",
    "colors": [
     "522162ff",
     "0f1923ff",
     "413950ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Essaim de nanites",
      "icon": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/abilities/grenade/displayicon.png"
     },
     {
      "name": "Bot-alarme",
      "icon": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/abilities/ability1/displayicon.png"
     },
     {
      "name": "Tourelle",
      "icon": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/abilities/ability2/displayicon.png"
     },
     {
      "name": "Confinement",
      "icon": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "7c8a4701-4de6-9355-b254-e09bc2a34b72",
    "name": "Miks",
    "role": "Contrôleur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/4ee40330-ecdd-4f2f-98a8-eb1243428373/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/fullportrait.png",
    "colors": [
     "462b75ff",
     "0f1923ff",
     "344673ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "M-pulsion",
      "icon": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/abilities/grenade/displayicon.png"
     },
     {
      "name": "Harmonisation",
      "icon": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/abilities/ability1/displayicon.png"
     },
     {
      "name": "Forme d'onde",
      "icon": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/abilities/ability2/displayicon.png"
     },
     {
      "name": "Basse sismique",
      "icon": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "bb2a4828-46eb-8cd1-e765-15848195d751",
    "name": "Neon",
    "role": "Duelliste",
    "roleIcon": "https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/fullportrait.png",
    "colors": [
     "413476ff",
     "0f1923ff",
     "38328eff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Voie rapide",
      "icon": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/abilities/grenade/displayicon.png"
     },
     {
      "name": "Éclair relais",
      "icon": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/abilities/ability1/displayicon.png"
     },
     {
      "name": "Vitesse supérieure",
      "icon": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/abilities/ability2/displayicon.png"
     },
     {
      "name": "Ultra-vitesse",
      "icon": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "8e253930-4c05-31dd-1b6c-968525494517",
    "name": "Omen",
    "role": "Contrôleur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/4ee40330-ecdd-4f2f-98a8-eb1243428373/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/fullportrait.png",
    "colors": [
     "433178ff",
     "0f1923ff",
     "344673ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Voie des ombres",
      "icon": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/abilities/grenade/displayicon.png"
     },
     {
      "name": "Paranoïa",
      "icon": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/abilities/ability1/displayicon.png"
     },
     {
      "name": "Voile sombre",
      "icon": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/abilities/ability2/displayicon.png"
     },
     {
      "name": "Depuis les ombres",
      "icon": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "eb93336a-449b-9c1b-0a54-a891f7921d69",
    "name": "Phoenix",
    "role": "Duelliste",
    "roleIcon": "https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/fullportrait.png",
    "colors": [
     "74321cff",
     "0f1923ff",
     "262423ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Brasier",
      "icon": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/abilities/grenade/displayicon.png"
     },
     {
      "name": "Mains brûlantes",
      "icon": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/abilities/ability1/displayicon.png"
     },
     {
      "name": "Balle courbe",
      "icon": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/abilities/ability2/displayicon.png"
     },
     {
      "name": "Revanche",
      "icon": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "f94c3b30-42be-e959-889c-5aa313dba261",
    "name": "Raze",
    "role": "Duelliste",
    "roleIcon": "https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/fullportrait.png",
    "colors": [
     "742e1eff",
     "0f1923ff",
     "2c5942ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Boum Bot",
      "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/grenade/displayicon.png"
     },
     {
      "name": "Pack explosif",
      "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/ability1/displayicon.png"
     },
     {
      "name": "Grenade gigogne",
      "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/ability2/displayicon.png"
     },
     {
      "name": "Bouquet final",
      "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
    "name": "Reyna",
    "role": "Duelliste",
    "roleIcon": "https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/fullportrait.png",
    "colors": [
     "662d62ff",
     "0f1923ff",
     "2f2664ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Œillade",
      "icon": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/abilities/grenade/displayicon.png"
     },
     {
      "name": "Dévoration",
      "icon": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/abilities/ability1/displayicon.png"
     },
     {
      "name": "Rebuffade",
      "icon": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/abilities/ability2/displayicon.png"
     },
     {
      "name": "Impératrice",
      "icon": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "569fdd95-4d10-43ab-ca70-79becc718b46",
    "name": "Sage",
    "role": "Sentinelle",
    "roleIcon": "https://media.valorant-api.com/agents/roles/5fc02f99-4091-4486-a531-98459a3e95e9/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/fullportrait.png",
    "colors": [
     "1f5148ff",
     "0f1923ff",
     "102d23ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Orbe barrière",
      "icon": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/abilities/grenade/displayicon.png"
     },
     {
      "name": "Orbe de lenteur",
      "icon": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/abilities/ability1/displayicon.png"
     },
     {
      "name": "Orbe de soin",
      "icon": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/abilities/ability2/displayicon.png"
     },
     {
      "name": "Résurrection",
      "icon": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "6f2a04ca-43e0-be17-7f36-b3908627744d",
    "name": "Skye",
    "role": "Initiateur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/1b47567f-8f7b-444b-aae3-b0c634622d10/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/fullportrait.png",
    "colors": [
     "436a51ff",
     "0f1923ff",
     "4f1413ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Revitalisation",
      "icon": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/abilities/grenade/displayicon.png"
     },
     {
      "name": "Éclaireur",
      "icon": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/abilities/ability1/displayicon.png"
     },
     {
      "name": "Guide éclatant",
      "icon": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/abilities/ability2/displayicon.png"
     },
     {
      "name": "Traqueurs",
      "icon": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
    "name": "Sova",
    "role": "Initiateur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/1b47567f-8f7b-444b-aae3-b0c634622d10/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/fullportrait.png",
    "colors": [
     "355285ff",
     "0f1923ff",
     "101c47ff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Drone rapace",
      "icon": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/grenade/displayicon.png"
     },
     {
      "name": "Électroflèche",
      "icon": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/ability1/displayicon.png"
     },
     {
      "name": "Flèche de reconnaissance",
      "icon": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/ability2/displayicon.png"
     },
     {
      "name": "Fureur du chasseur",
      "icon": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "b444168c-4e35-8076-db47-ef9bf368f384",
    "name": "Tejo",
    "role": "Initiateur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/1b47567f-8f7b-444b-aae3-b0c634622d10/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/fullportrait.png",
    "colors": [
     "80451bff",
     "0f1923ff",
     "ffffffff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Drone furtif",
      "icon": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/abilities/grenade/displayicon.png"
     },
     {
      "name": "Livraison spéciale",
      "icon": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/abilities/ability1/displayicon.png"
     },
     {
      "name": "Salve autoguidée",
      "icon": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/abilities/ability2/displayicon.png"
     },
     {
      "name": "Apocalypse",
      "icon": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "92eeef5d-43b5-1d4a-8d03-b3927a09034b",
    "name": "Veto",
    "role": "Sentinelle",
    "roleIcon": "https://media.valorant-api.com/agents/roles/5fc02f99-4091-4486-a531-98459a3e95e9/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/fullportrait.png",
    "colors": [
     "1a5d65ff",
     "0f1923ff",
     "0f1923ff",
     "1a5d65ff"
    ],
    "abilities": [
     {
      "name": "Vortex",
      "icon": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/abilities/grenade/displayicon.png"
     },
     {
      "name": "Étranglement",
      "icon": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/abilities/ability1/displayicon.png"
     },
     {
      "name": "Intercepteur",
      "icon": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/abilities/ability2/displayicon.png"
     },
     {
      "name": "Évolution",
      "icon": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "707eab51-4836-f488-046a-cda6bf494859",
    "name": "Viper",
    "role": "Contrôleur",
    "roleIcon": "https://media.valorant-api.com/agents/roles/4ee40330-ecdd-4f2f-98a8-eb1243428373/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/fullportrait.png",
    "colors": [
     "1a5f46ff",
     "0f1923ff",
     "2c4f5eff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Morsure du serpent",
      "icon": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/abilities/grenade/displayicon.png"
     },
     {
      "name": "Nuage de poison",
      "icon": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/abilities/ability1/displayicon.png"
     },
     {
      "name": "Écran toxique",
      "icon": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/abilities/ability2/displayicon.png"
     },
     {
      "name": "Nid de vipères",
      "icon": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "efba5359-4016-a1e5-7626-b1ae76895940",
    "name": "Vyse",
    "role": "Sentinelle",
    "roleIcon": "https://media.valorant-api.com/agents/roles/5fc02f99-4091-4486-a531-98459a3e95e9/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/fullportrait.png",
    "colors": [
     "492280ff",
     "0f1923ff",
     "ffffffff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Ronces barbelées",
      "icon": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/abilities/grenade/displayicon.png"
     },
     {
      "name": "Cisaille",
      "icon": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/abilities/ability1/displayicon.png"
     },
     {
      "name": "Rose métallique",
      "icon": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/abilities/ability2/displayicon.png"
     },
     {
      "name": "Jardin d'acier",
      "icon": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "df1cb487-4902-002e-5c17-d28e83e78588",
    "name": "Waylay",
    "role": "Duelliste",
    "roleIcon": "https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/fullportrait.png",
    "colors": [
     "482e61ff",
     "0f1923ff",
     "0f1923ff",
     "482e61ff"
    ],
    "abilities": [
     {
      "name": "Saturation",
      "icon": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/abilities/grenade/displayicon.png"
     },
     {
      "name": "Vitesse lumière",
      "icon": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/abilities/ability1/displayicon.png"
     },
     {
      "name": "Réfraction",
      "icon": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/abilities/ability2/displayicon.png"
     },
     {
      "name": "Croisée des chemins",
      "icon": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/abilities/ultimate/displayicon.png"
     }
    ]
   },
   {
    "uuid": "7f94d92c-4234-0a36-9646-3a87eb8b5c89",
    "name": "Yoru",
    "role": "Duelliste",
    "roleIcon": "https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png",
    "icon": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/fullportrait.png",
    "colors": [
     "222b67ff",
     "0f1923ff",
     "261e4fff",
     "0f192300"
    ],
    "abilities": [
     {
      "name": "Feinte",
      "icon": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/abilities/grenade/displayicon.png"
     },
     {
      "name": "Angle mort",
      "icon": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/abilities/ability1/displayicon.png"
     },
     {
      "name": "Visite surprise",
      "icon": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/abilities/ability2/displayicon.png"
     },
     {
      "name": "Transfert dimensionnel",
      "icon": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/abilities/ultimate/displayicon.png"
     }
    ]
   }
  ],
  "maps": [
   {
    "uuid": "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
    "name": "Ascent",
    "mapUrl": "/Game/Maps/Ascent/Ascent",
    "splash": "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/listviewicon.png",
    "tactical": true
   },
   {
    "uuid": "d960549e-485c-e861-8d71-aa9d1aed12a2",
    "name": "Split",
    "mapUrl": "/Game/Maps/Bonsai/Bonsai",
    "splash": "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/listviewicon.png",
    "tactical": true
   },
   {
    "uuid": "b529448b-4d60-346e-e89e-00a4c527a405",
    "name": "Fracture",
    "mapUrl": "/Game/Maps/Canyon/Canyon",
    "splash": "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/listviewicon.png",
    "tactical": true
   },
   {
    "uuid": "2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba",
    "name": "Bind",
    "mapUrl": "/Game/Maps/Duality/Duality",
    "splash": "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/listviewicon.png",
    "tactical": true
   },
   {
    "uuid": "2fb9a4fd-47b8-4e7d-a969-74b4046ebd53",
    "name": "Breeze",
    "mapUrl": "/Game/Maps/Foxtrot/Foxtrot",
    "splash": "https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/listviewicon.png",
    "tactical": true
   },
   {
    "uuid": "224b0a95-48b9-f703-1bd8-67aca101a61f",
    "name": "Abyss",
    "mapUrl": "/Game/Maps/Infinity/Infinity",
    "splash": "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/listviewicon.png",
    "tactical": true
   },
   {
    "uuid": "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
    "name": "Lotus",
    "mapUrl": "/Game/Maps/Jam/Jam",
    "splash": "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/listviewicon.png",
    "tactical": true
   },
   {
    "uuid": "92584fbe-486a-b1b2-9faa-39b0f486b498",
    "name": "Sunset",
    "mapUrl": "/Game/Maps/Juliett/Juliett",
    "splash": "https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/listviewicon.png",
    "tactical": true
   },
   {
    "uuid": "fd267378-4d1d-484f-ff52-77821ed10dc2",
    "name": "Pearl",
    "mapUrl": "/Game/Maps/Pitt/Pitt",
    "splash": "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/listviewicon.png",
    "tactical": true
   },
   {
    "uuid": "756da597-416b-c0f2-f47b-afbdf28670bc",
    "name": "Summit",
    "mapUrl": "/Game/Maps/Plummet/Plummet",
    "splash": "https://media.valorant-api.com/maps/756da597-416b-c0f2-f47b-afbdf28670bc/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/756da597-416b-c0f2-f47b-afbdf28670bc/listviewicon.png",
    "tactical": true
   },
   {
    "uuid": "e2ad5c54-4114-a870-9641-8ea21279579a",
    "name": "Icebox",
    "mapUrl": "/Game/Maps/Port/Port",
    "splash": "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/listviewicon.png",
    "tactical": true
   },
   {
    "uuid": "1c18ab1f-420d-0d8b-71d0-77ad3c439115",
    "name": "Corrode",
    "mapUrl": "/Game/Maps/Rook/Rook",
    "splash": "https://media.valorant-api.com/maps/1c18ab1f-420d-0d8b-71d0-77ad3c439115/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/1c18ab1f-420d-0d8b-71d0-77ad3c439115/listviewicon.png",
    "tactical": true
   },
   {
    "uuid": "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
    "name": "Haven",
    "mapUrl": "/Game/Maps/Triad/Triad",
    "splash": "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png",
    "listIcon": "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/listviewicon.png",
    "tactical": true
   }
  ],
  "tiers": [
   {
    "tier": 0,
    "name": "NON CLASSÉ",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/0/smallicon.png",
    "color": "#ffffff"
   },
   {
    "tier": 1,
    "name": "Inutilisé1",
    "icon": null,
    "color": "#ffffff"
   },
   {
    "tier": 2,
    "name": "Inutilisé2",
    "icon": null,
    "color": "#ffffff"
   },
   {
    "tier": 3,
    "name": "FER 1",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/3/smallicon.png",
    "color": "#868986"
   },
   {
    "tier": 4,
    "name": "FER 2",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/4/smallicon.png",
    "color": "#868986"
   },
   {
    "tier": 5,
    "name": "FER 3",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/5/smallicon.png",
    "color": "#868986"
   },
   {
    "tier": 6,
    "name": "BRONZE 1",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/6/smallicon.png",
    "color": "#a5855d"
   },
   {
    "tier": 7,
    "name": "BRONZE 2",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/7/smallicon.png",
    "color": "#a5855d"
   },
   {
    "tier": 8,
    "name": "BRONZE 3",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/8/smallicon.png",
    "color": "#a5855d"
   },
   {
    "tier": 9,
    "name": "ARGENT 1",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/9/smallicon.png",
    "color": "#bbc2c2"
   },
   {
    "tier": 10,
    "name": "ARGENT 2",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/10/smallicon.png",
    "color": "#bbc2c2"
   },
   {
    "tier": 11,
    "name": "ARGENT 3",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/11/smallicon.png",
    "color": "#bbc2c2"
   },
   {
    "tier": 12,
    "name": "OR 1",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/12/smallicon.png",
    "color": "#eccf56"
   },
   {
    "tier": 13,
    "name": "OR 2",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/13/smallicon.png",
    "color": "#eccf56"
   },
   {
    "tier": 14,
    "name": "OR 3",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/14/smallicon.png",
    "color": "#eccf56"
   },
   {
    "tier": 15,
    "name": "PLATINE 1",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/15/smallicon.png",
    "color": "#59a9b6"
   },
   {
    "tier": 16,
    "name": "PLATINE 2",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/16/smallicon.png",
    "color": "#59a9b6"
   },
   {
    "tier": 17,
    "name": "PLATINE 3",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/17/smallicon.png",
    "color": "#59a9b6"
   },
   {
    "tier": 18,
    "name": "DIAMANT 1",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/18/smallicon.png",
    "color": "#b489c4"
   },
   {
    "tier": 19,
    "name": "DIAMANT 2",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/19/smallicon.png",
    "color": "#b489c4"
   },
   {
    "tier": 20,
    "name": "DIAMANT 3",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/20/smallicon.png",
    "color": "#b489c4"
   },
   {
    "tier": 21,
    "name": "ASCENDANT 1",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/21/smallicon.png",
    "color": "#6ae2af"
   },
   {
    "tier": 22,
    "name": "ASCENDANT 2",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/22/smallicon.png",
    "color": "#6ae2af"
   },
   {
    "tier": 23,
    "name": "ASCENDANT 3",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/23/smallicon.png",
    "color": "#6ae2af"
   },
   {
    "tier": 24,
    "name": "IMMORTEL 1",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/24/smallicon.png",
    "color": "#bb3d65"
   },
   {
    "tier": 25,
    "name": "IMMORTEL 2",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/25/smallicon.png",
    "color": "#bb3d65"
   },
   {
    "tier": 26,
    "name": "IMMORTEL 3",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/26/smallicon.png",
    "color": "#bb3d65"
   },
   {
    "tier": 27,
    "name": "RADIANT",
    "icon": "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/smallicon.png",
    "color": "#ffffaa"
   }
  ],
  "weapons": [
   {
    "uuid": "63e6c2b6-4a8e-869c-3d4c-e38355226584",
    "name": "Odin",
    "icon": "https://media.valorant-api.com/weapons/63e6c2b6-4a8e-869c-3d4c-e38355226584/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/63e6c2b6-4a8e-869c-3d4c-e38355226584/displayicon.png",
    "category": "EEquippableCategory::Heavy"
   },
   {
    "uuid": "55d8a0f4-4274-ca67-fe2c-06ab45efdf58",
    "name": "Ares",
    "icon": "https://media.valorant-api.com/weapons/55d8a0f4-4274-ca67-fe2c-06ab45efdf58/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/55d8a0f4-4274-ca67-fe2c-06ab45efdf58/displayicon.png",
    "category": "EEquippableCategory::Heavy"
   },
   {
    "uuid": "9c82e19d-4575-0200-1a81-3eacf00cf872",
    "name": "Vandal",
    "icon": "https://media.valorant-api.com/weapons/9c82e19d-4575-0200-1a81-3eacf00cf872/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/9c82e19d-4575-0200-1a81-3eacf00cf872/displayicon.png",
    "category": "EEquippableCategory::Rifle"
   },
   {
    "uuid": "8db0a1bf-4a50-832a-4566-faaaa6d250ca",
    "name": "Warden",
    "icon": "https://media.valorant-api.com/weapons/8db0a1bf-4a50-832a-4566-faaaa6d250ca/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/8db0a1bf-4a50-832a-4566-faaaa6d250ca/displayicon.png",
    "category": "EEquippableCategory::Rifle"
   },
   {
    "uuid": "ae3de142-4d85-2547-dd26-4e90bed35cf7",
    "name": "Bulldog",
    "icon": "https://media.valorant-api.com/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7/displayicon.png",
    "category": "EEquippableCategory::Rifle"
   },
   {
    "uuid": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
    "name": "Phantom",
    "icon": "https://media.valorant-api.com/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a/displayicon.png",
    "category": "EEquippableCategory::Rifle"
   },
   {
    "uuid": "ec845bf4-4f79-ddda-a3da-0db3774b2794",
    "name": "Judge",
    "icon": "https://media.valorant-api.com/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794/displayicon.png",
    "category": "EEquippableCategory::Shotgun"
   },
   {
    "uuid": "910be174-449b-c412-ab22-d0873436b21b",
    "name": "Bucky",
    "icon": "https://media.valorant-api.com/weapons/910be174-449b-c412-ab22-d0873436b21b/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/910be174-449b-c412-ab22-d0873436b21b/displayicon.png",
    "category": "EEquippableCategory::Shotgun"
   },
   {
    "uuid": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
    "name": "Frenzy",
    "icon": "https://media.valorant-api.com/weapons/44d4e95c-4157-0037-81b2-17841bf2e8e3/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/44d4e95c-4157-0037-81b2-17841bf2e8e3/displayicon.png",
    "category": "EEquippableCategory::Sidearm"
   },
   {
    "uuid": "29a0cfab-485b-f5d5-779a-b59f85e204a8",
    "name": "Classic",
    "icon": "https://media.valorant-api.com/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8/displayicon.png",
    "category": "EEquippableCategory::Sidearm"
   },
   {
    "uuid": "410b2e0b-4ceb-1321-1727-20858f7f3477",
    "name": "Bandit",
    "icon": "https://media.valorant-api.com/weapons/410b2e0b-4ceb-1321-1727-20858f7f3477/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/410b2e0b-4ceb-1321-1727-20858f7f3477/displayicon.png",
    "category": "EEquippableCategory::Sidearm"
   },
   {
    "uuid": "1baa85b4-4c70-1284-64bb-6481dfc3bb4e",
    "name": "Ghost",
    "icon": "https://media.valorant-api.com/weapons/1baa85b4-4c70-1284-64bb-6481dfc3bb4e/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/1baa85b4-4c70-1284-64bb-6481dfc3bb4e/displayicon.png",
    "category": "EEquippableCategory::Sidearm"
   },
   {
    "uuid": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
    "name": "Sheriff",
    "icon": "https://media.valorant-api.com/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702/displayicon.png",
    "category": "EEquippableCategory::Sidearm"
   },
   {
    "uuid": "42da8ccc-40d5-affc-beec-15aa47b42eda",
    "name": "Shorty",
    "icon": "https://media.valorant-api.com/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda/displayicon.png",
    "category": "EEquippableCategory::Sidearm"
   },
   {
    "uuid": "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
    "name": "Operator",
    "icon": "https://media.valorant-api.com/weapons/a03b24d3-4319-996d-0f8c-94bbfba1dfc7/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/a03b24d3-4319-996d-0f8c-94bbfba1dfc7/displayicon.png",
    "category": "EEquippableCategory::Sniper"
   },
   {
    "uuid": "4ade7faa-4cf1-8376-95ef-39884480959b",
    "name": "Guardian",
    "icon": "https://media.valorant-api.com/weapons/4ade7faa-4cf1-8376-95ef-39884480959b/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/4ade7faa-4cf1-8376-95ef-39884480959b/displayicon.png",
    "category": "EEquippableCategory::Rifle"
   },
   {
    "uuid": "5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c",
    "name": "Outlaw",
    "icon": "https://media.valorant-api.com/weapons/5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c/displayicon.png",
    "category": "EEquippableCategory::Sniper"
   },
   {
    "uuid": "c4883e50-4494-202c-3ec3-6b8a9284f00b",
    "name": "Marshal",
    "icon": "https://media.valorant-api.com/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b/displayicon.png",
    "category": "EEquippableCategory::Sniper"
   },
   {
    "uuid": "462080d1-4035-2937-7c09-27aa2a5c27a7",
    "name": "Spectre",
    "icon": "https://media.valorant-api.com/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7/displayicon.png",
    "category": "EEquippableCategory::SMG"
   },
   {
    "uuid": "f7e1b454-4ad4-1063-ec0a-159e56b58941",
    "name": "Stinger",
    "icon": "https://media.valorant-api.com/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941/displayicon.png",
    "category": "EEquippableCategory::SMG"
   },
   {
    "uuid": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
    "name": "Mêlée",
    "icon": "https://media.valorant-api.com/weapons/2f59173c-4bed-b6c3-2191-dea9b58be9c7/killstreamicon.png",
    "art": "https://media.valorant-api.com/weapons/2f59173c-4bed-b6c3-2191-dea9b58be9c7/displayicon.png",
    "category": "EEquippableCategory::Melee"
   }
  ],
  "currentAct": {
   "uuid": "d816f426-48ea-f052-117f-9697a155b319",
   "name": "ACTE VI",
   "start": 1791936000000
  },
  "acts": [
   {
    "uuid": "d816f426-48ea-f052-117f-9697a155b319",
    "name": "V26 · ACTE VI",
    "start": 1791936000000,
    "end": 1799193600000
   },
   {
    "uuid": "8102cd81-43a0-d0d7-bd59-47b8fe9bed1b",
    "name": "V26 · ACTE V",
    "start": 1787097600000,
    "end": 1791936000000
   },
   {
    "uuid": "4f0864e2-40af-28a4-de2c-0e9e64e75f23",
    "name": "V26 · ACTE IV",
    "start": 1782259200000,
    "end": 1787097600000
   },
   {
    "uuid": "ce2783e8-44fc-dd48-3da3-33b5ba6c4a22",
    "name": "V26 · ACTE III",
    "start": 1777420800000,
    "end": 1782259200000
   },
   {
    "uuid": "9d85c932-4820-c060-09c3-668636d4df1b",
    "name": "V26 · ACTE II",
    "start": 1773792000000,
    "end": 1777420800000
   },
   {
    "uuid": "3ea2b318-423b-cf86-25da-7cbb0eefbe2d",
    "name": "V26 · ACTE I",
    "start": 1767744000000,
    "end": 1773792000000
   }
  ]
 },
 "contentTiers": {
  "Deluxe": {
   "uuid": "0cebb8be-46d7-c12a-d306-e9907bfc5a25",
   "color": "#009587",
   "icon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "rank": 1
  },
  "Exclusive": {
   "uuid": "e046854e-406c-37f4-6607-19a9ba8426fc",
   "color": "#f5955b",
   "icon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "rank": 3
  },
  "Premium": {
   "uuid": "60bca009-4182-7998-dee7-b8a2558dc369",
   "color": "#d1548d",
   "icon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "rank": 2
  },
  "Select": {
   "uuid": "12683d76-48d7-84a3-4e09-6985794f0445",
   "color": "#5a9fe2",
   "icon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "rank": 0
  },
  "Ultra": {
   "uuid": "411e4a55-4e59-7757-41f0-86a53f101bb5",
   "color": "#fad663",
   "icon": "https://media.valorant-api.com/contenttiers/411e4a55-4e59-7757-41f0-86a53f101bb5/displayicon.png",
   "rank": 4
  }
 },
 "skins": {
  "vandalKuronami": {
   "uuid": "d8d5d7a1-4d81-8560-54bc-0692ab40f69b",
   "name": "Vandal (Kuronami)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/636c1f83-44f7-6bc4-0b24-88a1beb66c2d/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "phantomOni": {
   "uuid": "36791b03-452d-8dad-0091-898cc28d2196",
   "name": "Phantom (Oni)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/c00e786e-4e6f-0ef7-0ce3-32ba9918ba41/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "operatorGlitchpop": {
   "uuid": "a491b943-43e3-4e98-64a6-fc87fca43605",
   "name": "Operator (Glitchpop)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/d92a6ee6-4073-8b7f-e944-f1a55606a28a/displayicon.png",
   "weapon": "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "sheriffRgx": {
   "uuid": "142be691-42a0-c0a1-f6ed-57b3158def7e",
   "name": "Sheriff (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/31ae0595-4ee7-57c8-f61c-2e808a6b77ed/displayicon.png",
   "weapon": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "spectreIon": {
   "uuid": "eacea54e-4e53-2715-cd4a-5d860aa68449",
   "name": "Spectre (Ion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/8af83962-4e2f-f58e-588e-ef85e4882b79/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "guardianKuronami": {
   "uuid": "cf3ccc67-4570-9a21-1902-4ea07a0070af",
   "name": "Guardian (Kuronami)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/34d29b9d-4672-ebe9-0795-508b66ba6551/displayicon.png",
   "weapon": "4ade7faa-4cf1-8376-95ef-39884480959b",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "ghostMagepunk": {
   "uuid": "33824a13-453b-0636-4ec4-e19708aa934e",
   "name": "Ghost (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/003e0991-4370-8837-f8fc-6ab3acec2dbf/displayicon.png",
   "weapon": "1baa85b4-4c70-1284-64bb-6481dfc3bb4e",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "marshal809": {
   "uuid": "774dee9a-4809-0e4d-4153-a883e908d4b2",
   "name": "Marshal (Force opérationnelle 809)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/8c19bbbd-46aa-6037-b0fd-edafd6227de6/displayicon.png",
   "weapon": "c4883e50-4494-202c-3ec3-6b8a9284f00b",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "bulldogPrelude": {
   "uuid": "c5676fb6-4268-d5bd-f2f7-f3a1334ca8b8",
   "name": "Bulldog (Prélude au chaos)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/af913ea1-476e-467a-86e5-f797b1c323a5/displayicon.png",
   "weapon": "ae3de142-4d85-2547-dd26-4e90bed35cf7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "frenzyOrion": {
   "uuid": "d02d21e4-4b57-945e-c504-e8af1bdd488c",
   "name": "Frenzy (Orion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/c58a2e59-4b5a-87a9-c8c4-2e92640bae4d/displayicon.png",
   "weapon": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "phantomAraxys": {
   "uuid": "1cb0bdf7-46e1-92d5-b400-988c99f25d81",
   "name": "Phantom (Araxys)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/60fc4e39-4af2-328b-2a1f-59834681dd57/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "sheriffAraxys": {
   "uuid": "317574ca-4a9d-9e5a-f9c4-a79aa378f75b",
   "name": "Sheriff (Araxys)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/d58e1881-4126-9c75-347d-67bab6b98fb2/displayicon.png",
   "weapon": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "guardianAraxys": {
   "uuid": "851c1abc-4a84-7bab-7e44-16a5aadf5afc",
   "name": "Guardian (Araxys)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/f96252d0-4b00-5c90-e71b-9d81ecfeff81/displayicon.png",
   "weapon": "4ade7faa-4cf1-8376-95ef-39884480959b",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "outlawAraxys": {
   "uuid": "6d73609b-4256-7bf7-46aa-9887c6918992",
   "name": "Outlaw (Araxys)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/81ad1b09-4385-7702-36a9-538b65b2a3d8/displayicon.png",
   "weapon": "5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "meleeAraxys": {
   "uuid": "3cc0aac5-45ff-e648-80f2-b9932ddf8bed",
   "name": "Bio-atomiseurs (Araxys)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/a922bb74-4729-f6c8-a125-a4af49e7871a/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "phantomRuine": {
   "uuid": "5b43d27b-419c-f2bc-53fe-d7829dad46b3",
   "name": "Phantom (Ruine)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/279e0a89-4dd6-b135-cef9-8ebb1df6f2ac/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "sheriffProtocol": {
   "uuid": "84589da8-4e2b-11bf-ca52-b88e6b7e1dbd",
   "name": "Sheriff (Protocole 781-A)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/12831559-44ee-c708-b97c-29a43938e3cd/displayicon.png",
   "weapon": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
   "color": "#fad663",
   "tierIcon": "https://media.valorant-api.com/contenttiers/411e4a55-4e59-7757-41f0-86a53f101bb5/displayicon.png",
   "tierRank": 4,
   "edition": "Ultra"
  },
  "vandalPrelude": {
   "uuid": "522a264e-4ca7-adb0-6cf1-28b2ef938727",
   "name": "Vandal (Prélude au chaos)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/1010fb40-4344-6ec8-2a8a-33bf076339b6/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "meleeKuronami": {
   "uuid": "e37229ed-4ddf-5e7e-e744-8fba60fa2c37",
   "name": "Kuronami no Yaiba",
   "icon": "https://media.valorant-api.com/weaponskinlevels/99b0edce-48db-b898-1d6f-0fa89795226d/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "vandalReaver": {
   "uuid": "30388628-42f0-606c-82c0-73ad43de997f",
   "name": "Vandal (Pilleur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/ba42fe63-457a-78ce-4499-47950a698129/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "phantomSingularity": {
   "uuid": "5eec4ce6-443d-e9b5-4c5b-2b967d426bd3",
   "name": "Phantom (Singularité)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/0ff7ff25-42cf-769a-4e6d-bd833121302d/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "operatorMagepunk": {
   "uuid": "7e831918-4580-5e2a-089a-84ad58fe1aae",
   "name": "Operator (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/369c9f89-49fa-94bc-f3f8-b9b94b6395af/displayicon.png",
   "weapon": "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "sheriffReaver": {
   "uuid": "a40a6ce2-462c-c864-5d30-7b9408b98d3d",
   "name": "Sheriff (Pilleur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4e4ebb8d-41d0-c326-595a-1f9b257e91fa/displayicon.png",
   "weapon": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "spectreReaver": {
   "uuid": "1cb1ab52-4c7d-0775-77f4-eaac99968261",
   "name": "Spectre (Pilleur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/0a0237d3-4d57-0ed2-ab65-c898a7bc755b/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "guardianReaver": {
   "uuid": "db348da1-49f2-0bad-b70a-e4ade9d31655",
   "name": "Guardian (Pilleur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/c9f0ea7f-4bed-b10e-62d2-0394444feed1/displayicon.png",
   "weapon": "4ade7faa-4cf1-8376-95ef-39884480959b",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "odinReaver": {
   "uuid": "8dda01a6-4237-f430-ac70-c3ba677963e9",
   "name": "Odin (Pilleur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/f5ce6297-4cd4-4b09-3931-5f8b20a4317d/displayicon.png",
   "weapon": "63e6c2b6-4a8e-869c-3d4c-e38355226584",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "karambitReaver": {
   "uuid": "b73d7b16-4652-bc5b-5c4c-068aabb19d0a",
   "name": "Karambit (Pilleur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/5ac106cd-45ef-a26f-2058-f382f20c64db/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "banditReaver": {
   "uuid": "ff766c80-4c4a-269d-2164-3ebb341de27a",
   "name": "Bandit (Pilleur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/3abfabeb-40d5-3aa2-0509-5d929b5bf1b3/displayicon.png",
   "weapon": "410b2e0b-4ceb-1321-1727-20858f7f3477",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "classicNeptune": {
   "uuid": "97d19265-4fa2-70ef-5f8c-6b9f03860705",
   "name": "Classic (Neptune)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/20fc1568-4ea5-8c2c-9c2f-de94e25d8e36/displayicon.png",
   "weapon": "29a0cfab-485b-f5d5-779a-b59f85e204a8",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "phantomRecon": {
   "uuid": "d67b929f-4431-61c0-286e-3ebf3d11c4af",
   "name": "Phantom (Reconnaissance)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/5be0b43b-4e66-ab8a-91d9-be9137e2e1c2/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "ghostRecon": {
   "uuid": "bb28991f-4ca9-ca54-962d-31b68c838625",
   "name": "Ghost (Reconnaissance)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/459343eb-4c56-4f10-ff2f-fbbf07d3695d/displayicon.png",
   "weapon": "1baa85b4-4c70-1284-64bb-6481dfc3bb4e",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "spectreSingularity": {
   "uuid": "0eab3e5c-4de4-e221-34fb-2ab435c89eb6",
   "name": "Spectre (Singularité)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/3b955119-421c-3319-50cc-1aaf06b42338/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "aresMagepunk": {
   "uuid": "0fac1dcf-48d0-c6c4-675e-2a8013bc879c",
   "name": "Ares (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/857ad950-486a-d199-7bf2-7092aaf88ae2/displayicon.png",
   "weapon": "55d8a0f4-4274-ca67-fe2c-06ab45efdf58",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "buckyOrigin": {
   "uuid": "96495eb3-40db-cb5b-1c69-17a3dde58ee3",
   "name": "Bucky (Origines)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/56042ce2-4f95-19be-7cac-5fb191683953/displayicon.png",
   "weapon": "910be174-449b-c412-ab22-d0873436b21b",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "frenzyXeno": {
   "uuid": "a4b0cd8b-40dc-41e3-646d-d58802b2e310",
   "name": "Frenzy (Xéno-chasseur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/8f254346-439f-0e98-2428-62b0c669d2ae/displayicon.png",
   "weapon": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "vandalSakura": {
   "uuid": "f946ef5c-46ab-e146-a712-1d99a1651356",
   "name": "Vandal (Sakura)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/3aeef60b-48fb-02aa-31b1-068aeb351213/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "stingerSakura": {
   "uuid": "1cd6f578-483b-37a1-a7ef-9a907fac416a",
   "name": "Stinger (Sakura)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/e2c84381-4fa6-29b4-37b9-21bba8ae24bf/displayicon.png",
   "weapon": "f7e1b454-4ad4-1063-ec0a-159e56b58941",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "classicSakura": {
   "uuid": "6ba7a7a0-4057-4d5c-7c98-579f232db298",
   "name": "Classic (Sakura)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/df639108-4e9d-7fc1-51da-4dbb810ba011/displayicon.png",
   "weapon": "29a0cfab-485b-f5d5-779a-b59f85e204a8",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "marshalCobra": {
   "uuid": "805722c4-4ac7-6179-7ce7-658b5f26d6ed",
   "name": "Marshal (Coalition : Cobra)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4dd7d0b9-40a9-de6c-ac61-aea19a6d8a77/displayicon.png",
   "weapon": "c4883e50-4494-202c-3ec3-6b8a9284f00b",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "judgeSensation": {
   "uuid": "8e27a0b3-4dc9-e2a7-e33a-29a616efc244",
   "name": "Judge (Sensation)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/65ed014b-4279-8ba5-01d3-f48d4e7f115c/displayicon.png",
   "weapon": "ec845bf4-4f79-ddda-a3da-0db3774b2794",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "bulldogMolten": {
   "uuid": "6ff0d2cf-488e-c565-d118-da9bd4ac1e3c",
   "name": "Bulldog (Âme en fusion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/5f0ecd25-464c-f8d1-5e72-e0922da5b311/displayicon.png",
   "weapon": "ae3de142-4d85-2547-dd26-4e90bed35cf7",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "outlawMolten": {
   "uuid": "20c9c715-44dc-e58f-5fdf-4593b24cf6fb",
   "name": "Outlaw (Âme en fusion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/fc793b9e-4644-0b7f-8240-47818532bb3d/displayicon.png",
   "weapon": "5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "sheriffOverdrive": {
   "uuid": "2674c385-4397-0383-04df-988d8d6fd2c8",
   "name": "Sheriff (Surtension)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/db36ee86-4aa7-249f-6745-5e9ddffa50b4/displayicon.png",
   "weapon": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "guardianRuin": {
   "uuid": "8966067d-4023-c88a-db56-2691f163d335",
   "name": "Guardian (Ruine)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/0e1af0d5-4dee-15db-25b5-31a7da6f1d52/displayicon.png",
   "weapon": "4ade7faa-4cf1-8376-95ef-39884480959b",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "meleeOrigin": {
   "uuid": "ac687fc4-40c5-4c41-6a7c-5eb59adabd60",
   "name": "Lame en croissant (Origines)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/5f059d7e-413c-445c-e36f-9a9791fba5b0/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "vandalSingularity": {
   "uuid": "d6c7ff28-467e-bb3f-3c0c-c5b9445e55ca",
   "name": "Vandal (Singularité)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/56c5c2cf-4213-6d98-f5d0-79954573930c/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "vandalNeptune": {
   "uuid": "db91451c-4309-2c8c-eded-bf842d844e52",
   "name": "Vandal (Neptune)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/49cea67c-4552-13c2-6b4b-8ba07761504e/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "vandalMagepunk": {
   "uuid": "148d7f02-4259-9c17-a1a4-6fa220a56551",
   "name": "Vandal (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/a0801408-4a88-3bc7-df50-0baaecf5040b/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "vandalIon": {
   "uuid": "596ce51d-40e3-dc21-b02d-b08d070a7883",
   "name": "Vandal (Ion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/a8c10620-46a8-794e-be55-a0a13edb8d44/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "vandalOni": {
   "uuid": "7156c2ee-41fc-f8f4-d457-ebb287965c08",
   "name": "Vandal (Oni)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/9246f649-40b1-4077-31d1-be856acf5dd9/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "vandalGlitchpop": {
   "uuid": "74789f33-4632-8052-96d7-258538721a32",
   "name": "Vandal (Glitchpop)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/7e44fc1b-44fa-cdda-8491-f8a5bca1cfa3/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "vandalAraxys": {
   "uuid": "4c926aa9-4f26-bc80-c486-9b888333373f",
   "name": "Vandal (Araxys)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/a3dba920-44ee-d7c5-5227-99a80aee3bd9/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "vandalRgx": {
   "uuid": "e5490f71-455b-74ad-f762-f5a876d4dff9",
   "name": "Vandal (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4e435234-49a2-1444-4640-908692c855b8/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "phantomKuronami": {
   "uuid": "3f6410af-4fd7-74fb-c0f4-6ab61d30022c",
   "name": "Phantom (Kuronami)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/0c989088-43ef-22ad-cc43-81a27bde2377/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "phantomGlitchpop": {
   "uuid": "25a7f0f2-4bce-7e45-b4b0-ca9264f5dfcc",
   "name": "Phantom (Glitchpop)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/9f6e4612-433b-aea9-1683-3db7aee90848/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "phantomIon": {
   "uuid": "e86bf7e4-4dd3-fbee-533b-fa875344bbaf",
   "name": "Phantom (Ion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/b8bb264c-4578-2410-8dfa-6aacfeb318b0/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "phantomPrelude": {
   "uuid": "ad2c5365-4147-23da-afaa-08b9bfb3817b",
   "name": "Phantom (Prélude au chaos)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4af26a7f-4933-f4ba-0356-5e9e21bc8e2f/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "phantomRgx": {
   "uuid": "499acf05-4f79-e345-3714-57bf7aa163ea",
   "name": "Phantom (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/49a986d0-4a07-b756-331e-babe1b2839d9/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "operatorKuronami": {
   "uuid": "a709ad22-45d5-0b51-5de2-85ad5c5ca405",
   "name": "Operator (Kuronami)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/70d67eb8-4d89-74d7-bedb-398d3096a937/displayicon.png",
   "weapon": "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "operatorIon": {
   "uuid": "bbf8ffb9-49c0-75c0-cc7d-8f8f03a4bd36",
   "name": "Operator (Ion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/24c73c29-443c-2440-d6db-838086f2451a/displayicon.png",
   "weapon": "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "operatorReaver": {
   "uuid": "aecab890-43b7-d719-06bc-9295e3d116dc",
   "name": "Operator (Pilleur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/7bfab387-4e97-d815-4488-c491e3a5520c/displayicon.png",
   "weapon": "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "sheriffIon": {
   "uuid": "83778c03-45a3-67a2-3c89-6b8598327d58",
   "name": "Sheriff (Ion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/2b555f97-46bb-5949-3531-979f5bc817f0/displayicon.png",
   "weapon": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "sheriffKuronami": {
   "uuid": "0eec6f2b-4d64-9c16-7846-b8865030f61c",
   "name": "Sheriff (Kuronami)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/72b3bacc-48ac-85f7-ec38-5ab629654486/displayicon.png",
   "weapon": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "spectreKuronami": {
   "uuid": "f743fe2f-4cab-71d9-81e2-5b8f2f52923f",
   "name": "Spectre (Kuronami)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4aa902b8-4418-9b72-74f5-e59464691b40/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "marshalKuronami": {
   "uuid": "fb9ff2b0-4d71-d53c-364e-fe98fb5a2411",
   "name": "Marshal (Kuronami)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/60edaaf5-41b2-1652-af0a-2dafed7bc71e/displayicon.png",
   "weapon": "c4883e50-4494-202c-3ec3-6b8a9284f00b",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "ghostKuronami": {
   "uuid": "431799d6-4e79-bdf2-573d-4cbc8112982e",
   "name": "Ghost (Kuronami)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/ca55e031-4ad3-19ab-7c39-42840e4d6f4a/displayicon.png",
   "weapon": "1baa85b4-4c70-1284-64bb-6481dfc3bb4e",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "ghostSingularity": {
   "uuid": "4582dd2b-4528-845d-dec8-16911ca7ba50",
   "name": "Ghost (Singularité)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/fbf4bc7e-4350-159b-dbfd-d38f5478cec5/displayicon.png",
   "weapon": "1baa85b4-4c70-1284-64bb-6481dfc3bb4e",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "classicGlitchpop": {
   "uuid": "8b2598eb-4db9-6338-4a25-c780402c780e",
   "name": "Classic (Glitchpop)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/25cb63cd-416e-ab23-2377-d18638679871/displayicon.png",
   "weapon": "29a0cfab-485b-f5d5-779a-b59f85e204a8",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "meleeIon": {
   "uuid": "a590c03a-43b1-a408-4c6b-0bb9fdda1570",
   "name": "Karambit (Ion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/a45e899f-459d-469b-dc8f-8da5c0546bf0/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "meleeGlitchpop": {
   "uuid": "ddc025b2-475f-889a-2800-80b4215582bc",
   "name": "Dague (Glitchpop)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/48ce4a70-4207-623b-4739-bfb937812432/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_94c085e6": {
   "uuid": "94c085e6-48e1-c879-2552-88bf7850c5a8",
   "name": "Odin (Xéno-chasseur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/89baf0f4-4648-69fc-f0af-2fbc69b97b80/displayicon.png",
   "weapon": "63e6c2b6-4a8e-869c-3d4c-e38355226584",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_a67c2daa": {
   "uuid": "a67c2daa-4f4d-1af0-0ff4-6fafde471776",
   "name": "Odin (Neptune)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/c96d991e-4807-5eee-0289-90b82f9be205/displayicon.png",
   "weapon": "63e6c2b6-4a8e-869c-3d4c-e38355226584",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_97af88e4": {
   "uuid": "97af88e4-4176-9fa3-4a26-57919443dab7",
   "name": "Odin (Glitchpop)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/549b06bb-4704-25ce-19d5-c9b70b10de19/displayicon.png",
   "weapon": "63e6c2b6-4a8e-869c-3d4c-e38355226584",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_5c13101a": {
   "uuid": "5c13101a-45e4-d568-aade-d6b0dadedcd1",
   "name": "Odin (Coalition : Cobra)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/dd2acfca-4366-7ac0-c13e-1eb2f1948273/displayicon.png",
   "weapon": "63e6c2b6-4a8e-869c-3d4c-e38355226584",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "cat_65baa0cd": {
   "uuid": "65baa0cd-42ec-f99d-54a0-338d795b5824",
   "name": "Odin (Sensation)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/1bfea917-4262-37ba-3a76-04b937f2d0be/displayicon.png",
   "weapon": "63e6c2b6-4a8e-869c-3d4c-e38355226584",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "cat_3bb7e1cd": {
   "uuid": "3bb7e1cd-4774-3b84-ab13-3fa8ca182f20",
   "name": "Odin (Orion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/10b34c7e-42cb-45bb-ec20-63b8b8332e6e/displayicon.png",
   "weapon": "63e6c2b6-4a8e-869c-3d4c-e38355226584",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "cat_e901bdeb": {
   "uuid": "e901bdeb-405f-d06c-0733-6783274d85b0",
   "name": "Ares (Singularité)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/642ee168-4f9e-1f5f-be72-01b3a41ac086/displayicon.png",
   "weapon": "55d8a0f4-4274-ca67-fe2c-06ab45efdf58",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_0f4b0478": {
   "uuid": "0f4b0478-4759-911d-c44b-2a907534789d",
   "name": "Ares (Ion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/c6c7ffc4-4892-6393-38b3-1b92837a8038/displayicon.png",
   "weapon": "55d8a0f4-4274-ca67-fe2c-06ab45efdf58",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_759bca71": {
   "uuid": "759bca71-4764-19f8-8890-239eedb78fa3",
   "name": "Ares (Oni)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/8b829b66-44ad-c5d3-4e03-f5bc3c6f5d12/displayicon.png",
   "weapon": "55d8a0f4-4274-ca67-fe2c-06ab45efdf58",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_2666f98d": {
   "uuid": "2666f98d-4f88-8cb9-4927-629d75a6a7ad",
   "name": "Ares (Sakura)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/9fbe39c6-42d7-b1db-9048-f0951ce2ff94/displayicon.png",
   "weapon": "55d8a0f4-4274-ca67-fe2c-06ab45efdf58",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "cat_6c4315b8": {
   "uuid": "6c4315b8-4ff1-baaa-5aac-5790c7443353",
   "name": "Vandal (Origines)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/1969e379-40ae-b28a-6fb3-819873a24fb9/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_72c1e90b": {
   "uuid": "72c1e90b-40ca-4304-02eb-28bb2aea4ed2",
   "name": "Vandal (Sensation)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/f4bfff96-487a-cf9e-08cc-d590d962c4e6/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "cat_5e080cdf": {
   "uuid": "5e080cdf-408c-a193-1eb9-7fa3af301f00",
   "name": "Vandal (Orion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/c871822c-431b-c8fd-2c3f-9c8cc79ee186/displayicon.png",
   "weapon": "9c82e19d-4575-0200-1a81-3eacf00cf872",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "cat_26d0c312": {
   "uuid": "26d0c312-46c2-1912-302a-b7b8f62640ca",
   "name": "Bulldog (Araxys)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/45e51d17-480a-6e28-cdd2-459d7758bea8/displayicon.png",
   "weapon": "ae3de142-4d85-2547-dd26-4e90bed35cf7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_8c6f8399": {
   "uuid": "8c6f8399-447b-a7de-7c93-b69273b054ac",
   "name": "Bulldog (Neptune)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/f76c27dc-4cc4-9648-a25c-72b9372ca23e/displayicon.png",
   "weapon": "ae3de142-4d85-2547-dd26-4e90bed35cf7",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_285c6731": {
   "uuid": "285c6731-4451-b930-7a3d-c5a736d00f5e",
   "name": "Bulldog (Glitchpop)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4a5ad8cd-4684-a47c-b393-ce9c6760d21a/displayicon.png",
   "weapon": "ae3de142-4d85-2547-dd26-4e90bed35cf7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_325d2274": {
   "uuid": "325d2274-487b-8672-84d6-6db8e9798447",
   "name": "Bulldog (Oni)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/94456e3a-459f-4447-cc0d-7e9b5d01b81e/displayicon.png",
   "weapon": "ae3de142-4d85-2547-dd26-4e90bed35cf7",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_1daefbff": {
   "uuid": "1daefbff-4581-aef3-5ed6-da894d7e4cc7",
   "name": "Bulldog (Protocole 781-A)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/544ddf0f-42c6-e410-c9db-fc8b3b2c84d4/displayicon.png",
   "weapon": "ae3de142-4d85-2547-dd26-4e90bed35cf7",
   "color": "#fad663",
   "tierIcon": "https://media.valorant-api.com/contenttiers/411e4a55-4e59-7757-41f0-86a53f101bb5/displayicon.png",
   "tierRank": 4,
   "edition": "Ultra"
  },
  "cat_3d71065e": {
   "uuid": "3d71065e-4f0b-19a8-26d5-129cddeb013b",
   "name": "Phantom (Force opérationnelle 809)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/eb32efb4-4db8-2740-e0ad-659a0cb8d174/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "cat_fac0cea1": {
   "uuid": "fac0cea1-45a9-1549-c120-af8f0150e562",
   "name": "Phantom (Xéno-chasseur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/c0879eb2-4e41-d7bd-80f7-dd8cb13a1e20/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_516ff0cb": {
   "uuid": "516ff0cb-4d4b-bf0e-d460-92b3c8d27259",
   "name": "Phantom (Neptune)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/b52673c5-4494-0fc4-db5a-7ea686b63569/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_f2531d6f": {
   "uuid": "f2531d6f-40d8-ad18-4e74-ed812e0a6b1f",
   "name": "Phantom (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/82da0235-41c6-4a04-8296-e9baaa8f12a0/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_9877d50b": {
   "uuid": "9877d50b-43b1-837a-802a-bf8a3b98e2dd",
   "name": "Phantom (Protocole 781-A)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/a7cf8684-41a0-3dd4-e30c-6f9b4b34e635/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#fad663",
   "tierIcon": "https://media.valorant-api.com/contenttiers/411e4a55-4e59-7757-41f0-86a53f101bb5/displayicon.png",
   "tierRank": 4,
   "edition": "Ultra"
  },
  "cat_8588c8ff": {
   "uuid": "8588c8ff-47a5-3900-0518-d6a80b31ba35",
   "name": "Phantom (Orion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/b737c20d-43f8-16ff-c2fd-07a45fa7beaf/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "cat_044b28ba": {
   "uuid": "044b28ba-4c3b-d315-140d-d9a249da5567",
   "name": "Phantom (Pilleur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4c18d802-409d-ec20-f630-d3abfcaa37c7/displayicon.png",
   "weapon": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_28a659a4": {
   "uuid": "28a659a4-439e-fcd0-6236-d39979ee5c51",
   "name": "Judge (Glitchpop)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/712c7a37-4524-0b27-dfdd-4e95181dd36e/displayicon.png",
   "weapon": "ec845bf4-4f79-ddda-a3da-0db3774b2794",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_0b8816a2": {
   "uuid": "0b8816a2-42ad-9353-c591-f7863981d7fe",
   "name": "Judge (Coalition : Cobra)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/fe644484-4d07-5472-9e4a-d3992f2f2ecb/displayicon.png",
   "weapon": "ec845bf4-4f79-ddda-a3da-0db3774b2794",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "cat_0666931c": {
   "uuid": "0666931c-4580-efd0-af47-afb9f2f72e55",
   "name": "Bucky (Xéno-chasseur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/01a984b8-4b91-ab61-60b9-1bb9ce54bd04/displayicon.png",
   "weapon": "910be174-449b-c412-ab22-d0873436b21b",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_aa6162a5": {
   "uuid": "aa6162a5-4c73-1c6f-5c69-9b9082e321fd",
   "name": "Bucky (Surtension)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/1e7be2e9-418e-7f39-d879-a8912be1d3ab/displayicon.png",
   "weapon": "910be174-449b-c412-ab22-d0873436b21b",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "cat_5ac14aef": {
   "uuid": "5ac14aef-41cc-a0c8-895f-e1a69b33aeff",
   "name": "Bucky (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/78776175-4040-282f-07a1-0199b1fdcf58/displayicon.png",
   "weapon": "910be174-449b-c412-ab22-d0873436b21b",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_31f6f214": {
   "uuid": "31f6f214-4379-749a-9285-04a5561e2d03",
   "name": "Bucky (Ion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/f00520c8-4b70-7255-d23c-c0a4887656a2/displayicon.png",
   "weapon": "910be174-449b-c412-ab22-d0873436b21b",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_7da96a2a": {
   "uuid": "7da96a2a-43ce-91c2-28f9-0c95529d133e",
   "name": "Bucky (Oni)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/cdc130c2-4b12-3702-c8f6-5a8920746395/displayicon.png",
   "weapon": "910be174-449b-c412-ab22-d0873436b21b",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_1bd0b030": {
   "uuid": "1bd0b030-49b3-4733-d6f0-28bcb7ed6df2",
   "name": "Frenzy (Force opérationnelle 809)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/bea776cb-4d13-136a-be7f-639dbb7ba01e/displayicon.png",
   "weapon": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "cat_d5ea8ae9": {
   "uuid": "d5ea8ae9-4055-9b65-1f39-ed97372d887a",
   "name": "Frenzy (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/6f2aefab-439d-140a-4dc6-87818e2d72cd/displayicon.png",
   "weapon": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_cceb25d7": {
   "uuid": "cceb25d7-41e7-1944-515f-2eb5695fd5cc",
   "name": "Frenzy (Origines)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/c4547e69-47a7-dc52-d09c-94bbf87dba0a/displayicon.png",
   "weapon": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_5596d764": {
   "uuid": "5596d764-4b62-210b-59db-7982e9d4c23f",
   "name": "Frenzy (Glitchpop)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4b74b3ee-4a63-7339-a28f-8b8be010ca5a/displayicon.png",
   "weapon": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_bb46d680": {
   "uuid": "bb46d680-4e05-bacd-6ecd-11895d2f22e7",
   "name": "Frenzy (Coalition : Cobra)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/337b4e6a-46d8-8359-50c0-388717617044/displayicon.png",
   "weapon": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "cat_906dcda9": {
   "uuid": "906dcda9-477a-6d09-f85d-599ccb86e168",
   "name": "Frenzy (Ion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/64fcb53f-465d-318e-5bf9-bfa7c39b1d67/displayicon.png",
   "weapon": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_7a20502f": {
   "uuid": "7a20502f-45b2-6781-b408-08bc86c5e5e2",
   "name": "Frenzy (Oni)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4add59eb-41f6-4184-3cb6-c89a81b6739b/displayicon.png",
   "weapon": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_531135cc": {
   "uuid": "531135cc-48cb-68bf-8c99-149e46670c80",
   "name": "Frenzy (Sensation)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/5a773352-456e-ef0b-35ab-c99ead159264/displayicon.png",
   "weapon": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "cat_111680fd": {
   "uuid": "111680fd-4562-f658-af1c-ed8f9cfe9f9c",
   "name": "Classic (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/90cd5d86-4516-918b-29af-07b116f63aa9/displayicon.png",
   "weapon": "29a0cfab-485b-f5d5-779a-b59f85e204a8",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_6cc70eae": {
   "uuid": "6cc70eae-4297-91d5-adb9-efa48004da77",
   "name": "Classic (Surtension)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/29a5ecc2-4f93-068a-130a-b5a8a113fec9/displayicon.png",
   "weapon": "29a0cfab-485b-f5d5-779a-b59f85e204a8",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "cat_2505a3cf": {
   "uuid": "2505a3cf-4604-d6ff-5785-d981df847fb7",
   "name": "Bandit (Âme en fusion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/d8606d62-4a88-39d6-4e65-3993b0f3f9b2/displayicon.png",
   "weapon": "410b2e0b-4ceb-1321-1727-20858f7f3477",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "cat_8a513c24": {
   "uuid": "8a513c24-4c4d-ac15-6066-a1b2ff577041",
   "name": "Ghost (Ruine)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/5e1f5465-40cd-2c0f-33ab-398c5367d080/displayicon.png",
   "weapon": "1baa85b4-4c70-1284-64bb-6481dfc3bb4e",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_c7261be6": {
   "uuid": "c7261be6-47d2-ef86-82f4-6a844e45d33c",
   "name": "Ghost (Pilleur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/a6fe7710-4edc-5e23-223d-aeaef3d17866/displayicon.png",
   "weapon": "1baa85b4-4c70-1284-64bb-6481dfc3bb4e",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_81bd181f": {
   "uuid": "81bd181f-4124-9e58-ffd4-09964dc0d2cc",
   "name": "Sheriff (Prélude au chaos)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/9124501c-4a46-f451-0c7c-088ebb217ce4/displayicon.png",
   "weapon": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_bfd9e773": {
   "uuid": "bfd9e773-4376-1f6a-98f2-dc93f0c0607c",
   "name": "Sheriff (Singularité)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4276d2b5-4b1c-b636-aff0-4ea579d875d7/displayicon.png",
   "weapon": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_6460edbf": {
   "uuid": "6460edbf-458d-bf61-7519-519305ba5da2",
   "name": "Sheriff (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/59733cf9-490b-e25b-2c6f-eca947628079/displayicon.png",
   "weapon": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_19b997bb": {
   "uuid": "19b997bb-461a-fa85-250d-a8b0b8908fea",
   "name": "Sheriff (Sakura)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/c8652efa-462f-d455-20b0-699dd00a9e2a/displayicon.png",
   "weapon": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "cat_4e98f273": {
   "uuid": "4e98f273-472c-3376-7195-46a1f81402cc",
   "name": "Shorty (Araxys)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/f41c7d7c-4701-1612-f375-7fbfa52b7ac7/displayicon.png",
   "weapon": "42da8ccc-40d5-affc-beec-15aa47b42eda",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_646e713f": {
   "uuid": "646e713f-4999-6c56-094c-dd9114bdb35a",
   "name": "Shorty (Neptune)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/93266c2b-400f-da62-24a0-739f51d33cc1/displayicon.png",
   "weapon": "42da8ccc-40d5-affc-beec-15aa47b42eda",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_c9572061": {
   "uuid": "c9572061-4ee1-ff7d-b60c-ebac198d3706",
   "name": "Shorty (Prélude au chaos)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/09fded5d-4add-00e7-d3c4-32b8f21c7944/displayicon.png",
   "weapon": "42da8ccc-40d5-affc-beec-15aa47b42eda",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_b36dad11": {
   "uuid": "b36dad11-4105-6c08-0486-17ba96d0f2a4",
   "name": "Shorty (Oni)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/a2950772-447a-f2db-be24-19b0e0ed736f/displayicon.png",
   "weapon": "42da8ccc-40d5-affc-beec-15aa47b42eda",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_2e1936ed": {
   "uuid": "2e1936ed-4582-628f-da9c-25a7f47323cc",
   "name": "Operator (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/2ad7a62f-4091-ecba-de21-d19edfb41086/displayicon.png",
   "weapon": "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_6db556e4": {
   "uuid": "6db556e4-4255-6c2c-6a80-8a9dfac96aa9",
   "name": "Operator (Araxys)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/bf2da3c9-43aa-5a37-9958-2a805298951f/displayicon.png",
   "weapon": "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_17831113": {
   "uuid": "17831113-4ff0-a6c9-0b20-6f9c077d74a2",
   "name": "Operator (Origines)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4d19c241-4350-6658-f5a6-5c99ca8e5e99/displayicon.png",
   "weapon": "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_b450a73d": {
   "uuid": "b450a73d-431e-56b7-5b7f-67bddd38ee66",
   "name": "Operator (Prélude au chaos)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/7c89312b-45fb-a892-4525-659ba3de4475/displayicon.png",
   "weapon": "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_da29ce1e": {
   "uuid": "da29ce1e-43bb-c043-9cbc-34850517dc23",
   "name": "Guardian (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/43361d49-4331-ee30-e356-0f925e6e17b9/displayicon.png",
   "weapon": "4ade7faa-4cf1-8376-95ef-39884480959b",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_1082032a": {
   "uuid": "1082032a-4f20-12db-93ea-549332f91ddf",
   "name": "Guardian (Neptune)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/c9ceffba-471d-ed6c-04a5-11b71bef3f60/displayicon.png",
   "weapon": "4ade7faa-4cf1-8376-95ef-39884480959b",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_80dbfa46": {
   "uuid": "80dbfa46-4a1f-c7a4-2e88-1499308c7b9a",
   "name": "Guardian (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/e63eab09-47e4-25be-6c9f-57995385429d/displayicon.png",
   "weapon": "4ade7faa-4cf1-8376-95ef-39884480959b",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_850fea42": {
   "uuid": "850fea42-419f-f284-84ae-40ae1eabbb5b",
   "name": "Guardian (Oni)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/fee2c305-40d1-1cca-08b8-46bceda98eca/displayicon.png",
   "weapon": "4ade7faa-4cf1-8376-95ef-39884480959b",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_539e07ec": {
   "uuid": "539e07ec-49b2-5f22-0d05-91b809229d64",
   "name": "Guardian (Reconnaissance)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/7bc358d8-42ad-611f-5594-37888c23abe3/displayicon.png",
   "weapon": "4ade7faa-4cf1-8376-95ef-39884480959b",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_fdeb2877": {
   "uuid": "fdeb2877-4030-e396-f0cb-998868362c12",
   "name": "Outlaw (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/a519475f-4326-481c-6900-989911df4ce0/displayicon.png",
   "weapon": "5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_27ab5ed6": {
   "uuid": "27ab5ed6-4614-d5c2-c53f-5391febe7099",
   "name": "Marshal (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/b2f78500-4322-b03d-2745-a3b2208d63fe/displayicon.png",
   "weapon": "c4883e50-4494-202c-3ec3-6b8a9284f00b",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_e78fb82c": {
   "uuid": "e78fb82c-4800-e102-b7a6-33946fa2f199",
   "name": "Spectre (Force opérationnelle 809)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/303530db-47fe-0e6e-5ea9-0cb5ed61758d/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#009587",
   "tierIcon": "https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png",
   "tierRank": 1,
   "edition": "Deluxe"
  },
  "cat_4f0c9544": {
   "uuid": "4f0c9544-469c-0c62-df2e-95b15d6f2333",
   "name": "Spectre (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/737d2d1b-4b47-87a4-6045-5183580d27ec/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_55153919": {
   "uuid": "55153919-4598-cb0f-4759-7ea546c6d121",
   "name": "Spectre (Neptune)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/ef773863-472d-4d81-e50e-1d887cea40f4/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_fbb2acd5": {
   "uuid": "fbb2acd5-4aef-1f50-da10-3084c323011c",
   "name": "Spectre (Prélude au chaos)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/1fcfdca5-4998-85d9-eede-f9a8b21349be/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_f9c2e823": {
   "uuid": "f9c2e823-4eeb-d872-8a4c-d5a0bf8a3b6c",
   "name": "Spectre (Ruine)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/87220abc-49a9-7472-ae09-29a6d711bbc3/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_68470542": {
   "uuid": "68470542-47f9-37e9-875f-1bb24f7a0cfa",
   "name": "Spectre (Âme en fusion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/b4de462b-45f2-61ea-c3e3-f49e35b5bd7d/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "cat_a3f8e1b3": {
   "uuid": "a3f8e1b3-4654-f3ea-15ba-9eb9fd6a0b0d",
   "name": "Spectre (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/7e45e9cd-4072-cc32-0898-d09c167cc0f9/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_eaa73ab9": {
   "uuid": "eaa73ab9-4688-0c40-09ad-85b535a50723",
   "name": "Spectre (Protocole 781-A)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/5eb7515f-40a1-2f15-de03-c9a024664737/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#fad663",
   "tierIcon": "https://media.valorant-api.com/contenttiers/411e4a55-4e59-7757-41f0-86a53f101bb5/displayicon.png",
   "tierRank": 4,
   "edition": "Ultra"
  },
  "cat_26b1c794": {
   "uuid": "26b1c794-4370-f354-ff4d-3a8b95edff79",
   "name": "Spectre (Reconnaissance)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/613dd54a-4068-0fab-7670-bf8268a9b76b/displayicon.png",
   "weapon": "462080d1-4035-2937-7c09-27aa2a5c27a7",
   "color": "#d1548d",
   "tierIcon": "https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png",
   "tierRank": 2,
   "edition": "Premium"
  },
  "cat_282c15e6": {
   "uuid": "282c15e6-4372-2f18-9143-2d9cdd942c4c",
   "name": "Stinger (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4dbeebb2-4b39-8aec-b639-00bc4948d0f3/displayicon.png",
   "weapon": "f7e1b454-4ad4-1063-ec0a-159e56b58941",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_5a4a0ea0": {
   "uuid": "5a4a0ea0-4ac6-d130-c917-45a7bb89ae42",
   "name": "Stinger (Prélude au chaos)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/5611fa1c-45bb-6c46-73cd-209031e72524/displayicon.png",
   "weapon": "f7e1b454-4ad4-1063-ec0a-159e56b58941",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_0a128cb6": {
   "uuid": "0a128cb6-4bbb-f618-85cb-82bbd17bcbb1",
   "name": "Stinger (Surtension)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/77d5c1dc-4dde-539c-3a5a-0a95eecba1e4/displayicon.png",
   "weapon": "f7e1b454-4ad4-1063-ec0a-159e56b58941",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "cat_9d7ed392": {
   "uuid": "9d7ed392-4c4c-b1c4-7232-3cbb07b2e133",
   "name": "Stinger (Sensation)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/fed9c3f3-40a5-da67-4ac9-4683cc5a0eba/displayicon.png",
   "weapon": "f7e1b454-4ad4-1063-ec0a-159e56b58941",
   "color": "#5a9fe2",
   "tierIcon": "https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png",
   "tierRank": 0,
   "edition": "Select"
  },
  "cat_58442f45": {
   "uuid": "58442f45-4783-42a2-f4cb-789a27555889",
   "name": "Couteau (Force opérationnelle 809)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/a2a5860a-4a34-8510-e067-93abc9f18e12/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_9fb366b6": {
   "uuid": "9fb366b6-46df-a722-0cf2-9c9b85936f17",
   "name": "Lame (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/a1762ed3-45bf-2dd5-776f-a18a33171e6f/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_03de6b1a": {
   "uuid": "03de6b1a-4497-72e8-ae0c-2984b2e7e2b9",
   "name": "Luciole (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/424ed674-47dd-0488-de93-6cb8e13d0b90/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_91130713": {
   "uuid": "91130713-44e6-8436-d34c-e3badaf241b7",
   "name": "Karambit (RGX 11z Pro)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/9f09d408-4e55-b9bb-580a-9fa37e3730b5/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_c5482640": {
   "uuid": "c5482640-4652-6948-29c6-769e8198db27",
   "name": "Couteau (Xéno-chasseur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/8e9f610a-41ea-ff48-d102-c7a0e5614c84/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_a486efac": {
   "uuid": "a486efac-4415-1bfa-68d1-19bca9968101",
   "name": "Moissonneur organique (Araxys)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/4351b2ed-42a1-4d84-804b-2f8d695e5069/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_c3f1c9d6": {
   "uuid": "c3f1c9d6-441b-7def-1bf2-2c82719a4de8",
   "name": "Ancre (Neptune)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/85db497e-4b7d-dd9d-bc09-6d926158ed74/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_4670c2c9": {
   "uuid": "4670c2c9-4445-1604-7000-fd99093b3504",
   "name": "Crochet (Neptune)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/cd0adb00-4863-aecf-da3b-1095d18f9715/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_f0c42e14": {
   "uuid": "f0c42e14-4a92-132d-dfd4-cbbef103340c",
   "name": "Hache (Glitchpop)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/f27623a6-40de-20b9-17b5-c5bed27453a7/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_151ee26c": {
   "uuid": "151ee26c-4e82-e7ca-dad1-099e7fb34774",
   "name": "Couteau (Singularité)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/ea441610-42da-e46f-8d7b-1b9759c105cd/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_a114e83d": {
   "uuid": "a114e83d-4662-6a6f-4717-bfb82fd9b8e0",
   "name": "Couteau papillon (Singularité)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/698dc2f6-4ba9-9409-4737-05afdc622a1c/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_c18e781e": {
   "uuid": "c18e781e-40a0-80e6-256a-54ae7355e7eb",
   "name": "Électrolame (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/c1326ee3-47af-d823-6686-618e1bcdf0c6/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_59f627f1": {
   "uuid": "59f627f1-42f3-670d-5323-3499c2913289",
   "name": "Électrogantelet (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/c5ec6a47-40c2-66ed-d546-5bad1eef6fd5/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_6029ac35": {
   "uuid": "6029ac35-4eca-8428-26d5-0896013e4c63",
   "name": "Commutateur (Magepunk)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/35792a19-4e62-f3bc-f5df-289599d6cafc/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_d0873346": {
   "uuid": "d0873346-4e42-238e-0251-a399eff11f2f",
   "name": "Naru-Kami (Kuronami)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/664f9851-4b50-1b7b-97eb-c4b475a89acd/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_46664f5b": {
   "uuid": "46664f5b-49ca-3e09-4fe5-56bdef536335",
   "name": "Épée d'énergie (Ion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/21ceb4b1-480f-dddb-1422-8aad73519181/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_206fc3fe": {
   "uuid": "206fc3fe-45a0-6c19-c367-229b98b6a2aa",
   "name": "Griffes (Oni)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/e34039b6-441d-3e17-2773-bdaf5c3d2faa/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_d78eef32": {
   "uuid": "d78eef32-4531-0f68-f2d2-d28c52ecea38",
   "name": "Épée (Orion)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/dcb0b818-4db1-c3f8-6055-d1ab2a0ae55a/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_0aecb2b8": {
   "uuid": "0aecb2b8-49cc-560e-42c7-6cbce44f05cf",
   "name": "Couteau (Pilleur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/d7a02a43-47a5-556c-a69f-ec9cf6ede66d/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_81c37ac1": {
   "uuid": "81c37ac1-48d4-9747-7fd6-56932358a3fe",
   "name": "Couteau papillon (Pilleur)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/f3ca2221-4c3a-75bc-8526-a1a0ff38493b/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  },
  "cat_39cf499b": {
   "uuid": "39cf499b-4f82-e875-5320-b0a1d7fc58d4",
   "name": "Balisong (Reconnaissance)",
   "icon": "https://media.valorant-api.com/weaponskinlevels/e85cf8b6-467b-bc6c-9013-959383f71b2e/displayicon.png",
   "weapon": "2f59173c-4bed-b6c3-2191-dea9b58be9c7",
   "color": "#f5955b",
   "tierIcon": "https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png",
   "tierRank": 3,
   "edition": "Exclusive"
  }
 },
 "cards": {
  "nova": {
   "uuid": "e9c8d760-4d06-4037-4882-6bab3610d9ea",
   "name": "Carte maîtrise de Jett",
   "icon": "https://media.valorant-api.com/playercards/e9c8d760-4d06-4037-4882-6bab3610d9ea/displayicon.png",
   "wide": "https://media.valorant-api.com/playercards/e9c8d760-4d06-4037-4882-6bab3610d9ea/wideart.png",
   "small": "https://media.valorant-api.com/playercards/e9c8d760-4d06-4037-4882-6bab3610d9ea/smallart.png"
  },
  "zephyr": {
   "uuid": "504f38e4-4874-845c-ccb6-a3aec7a3a1eb",
   "name": "Carte Omen de VALORANT",
   "icon": "https://media.valorant-api.com/playercards/504f38e4-4874-845c-ccb6-a3aec7a3a1eb/displayicon.png",
   "wide": "https://media.valorant-api.com/playercards/504f38e4-4874-845c-ccb6-a3aec7a3a1eb/wideart.png",
   "small": "https://media.valorant-api.com/playercards/504f38e4-4874-845c-ccb6-a3aec7a3a1eb/smallart.png"
  },
  "lumen": {
   "uuid": "ac12278e-4458-6a7c-3e91-788da8cd226c",
   "name": "Carte Nuit sous les étoiles",
   "icon": "https://media.valorant-api.com/playercards/ac12278e-4458-6a7c-3e91-788da8cd226c/displayicon.png",
   "wide": "https://media.valorant-api.com/playercards/ac12278e-4458-6a7c-3e91-788da8cd226c/wideart.png",
   "small": "https://media.valorant-api.com/playercards/ac12278e-4458-6a7c-3e91-788da8cd226c/smallart.png"
  },
  "kestrel": {
   "uuid": "1a127cbf-4131-3581-da59-529b7e0d9495",
   "name": "Carte Kuronami",
   "icon": "https://media.valorant-api.com/playercards/1a127cbf-4131-3581-da59-529b7e0d9495/displayicon.png",
   "wide": "https://media.valorant-api.com/playercards/1a127cbf-4131-3581-da59-529b7e0d9495/wideart.png",
   "small": "https://media.valorant-api.com/playercards/1a127cbf-4131-3581-da59-529b7e0d9495/smallart.png"
  },
  "sable": {
   "uuid": "dbf1b46f-480f-cfbd-8fa8-22a80f8a589d",
   "name": "Carte Araxys",
   "icon": "https://media.valorant-api.com/playercards/dbf1b46f-480f-cfbd-8fa8-22a80f8a589d/displayicon.png",
   "wide": "https://media.valorant-api.com/playercards/dbf1b46f-480f-cfbd-8fa8-22a80f8a589d/wideart.png",
   "small": "https://media.valorant-api.com/playercards/dbf1b46f-480f-cfbd-8fa8-22a80f8a589d/smallart.png"
  },
  "orbit": {
   "uuid": "4e2283eb-44c4-dd2e-c0a3-9fbcf5c574fc",
   "name": "Carte maîtrise de Gekko",
   "icon": "https://media.valorant-api.com/playercards/4e2283eb-44c4-dd2e-c0a3-9fbcf5c574fc/displayicon.png",
   "wide": "https://media.valorant-api.com/playercards/4e2283eb-44c4-dd2e-c0a3-9fbcf5c574fc/wideart.png",
   "small": "https://media.valorant-api.com/playercards/4e2283eb-44c4-dd2e-c0a3-9fbcf5c574fc/smallart.png"
  },
  "echo": {
   "uuid": "38e78d00-4a42-e605-847a-a3a2fc85cbf4",
   "name": "Carte Promenade enneigée",
   "icon": "https://media.valorant-api.com/playercards/38e78d00-4a42-e605-847a-a3a2fc85cbf4/displayicon.png",
   "wide": "https://media.valorant-api.com/playercards/38e78d00-4a42-e605-847a-a3a2fc85cbf4/wideart.png",
   "small": "https://media.valorant-api.com/playercards/38e78d00-4a42-e605-847a-a3a2fc85cbf4/smallart.png"
  },
  "araxys": {
   "uuid": "c5d4330e-4427-777e-ceee-5ca65c672b23",
   "name": "Carte Araxys, Ép 9",
   "icon": "https://media.valorant-api.com/playercards/c5d4330e-4427-777e-ceee-5ca65c672b23/displayicon.png",
   "wide": "https://media.valorant-api.com/playercards/c5d4330e-4427-777e-ceee-5ca65c672b23/wideart.png",
   "small": "https://media.valorant-api.com/playercards/c5d4330e-4427-777e-ceee-5ca65c672b23/smallart.png"
  },
  "seoul": {
   "uuid": "be21f94b-45ea-52b2-40d2-07b999f4a8ed",
   "name": "Carte Jett de nuit à Séoul",
   "icon": "https://media.valorant-api.com/playercards/be21f94b-45ea-52b2-40d2-07b999f4a8ed/displayicon.png",
   "wide": "https://media.valorant-api.com/playercards/be21f94b-45ea-52b2-40d2-07b999f4a8ed/wideart.png",
   "small": "https://media.valorant-api.com/playercards/be21f94b-45ea-52b2-40d2-07b999f4a8ed/smallart.png"
  }
 },
 "titles": {
  "nova": {
   "uuid": "25c60422-4246-fe96-9ac1-d88e7a379571",
   "name": "Inarrêtable"
  },
  "zephyr": {
   "uuid": "fd951671-4d72-9153-a0e7-73843da47654",
   "name": "IGL"
  },
  "lumen": {
   "uuid": "70b4b892-4cd8-0d62-0976-e4897410bdb0",
   "name": "Maelström"
  },
  "kestrel": {
   "uuid": "b957c1f1-4784-f202-9bee-8598ebaa8bad",
   "name": "Tireur précis"
  },
  "sable": {
   "uuid": "2178d2e2-402a-4d13-47d2-f8bf096067a3",
   "name": "Clutch polaire"
  },
  "orbit": {
   "uuid": "7c2efedc-4d1f-509a-fb02-f2af4d9395d5",
   "name": "Hors pair"
  },
  "echo": {
   "uuid": "c7b3b087-48eb-f231-6a50-209bd110f1f3",
   "name": "Roi des ombres"
  }
 },
 "sprays": {
  "araxys": {
   "uuid": "97672506-4484-d20f-6db7-acba862750c2",
   "name": "Graffiti Araxys, Ép 9",
   "icon": "https://media.valorant-api.com/sprays/97672506-4484-d20f-6db7-acba862750c2/fulltransparenticon.png"
  },
  "jettSpy": {
   "uuid": "93a2b549-47da-6dd9-182b-7d9f0fd698b2",
   "name": "Graffiti Jett espionne",
   "icon": "https://media.valorant-api.com/sprays/93a2b549-47da-6dd9-182b-7d9f0fd698b2/fulltransparenticon.png"
  }
 },
 "buddies": {
  "araxys": {
   "uuid": "ed2d3700-4bf6-b25c-8cc5-a98defd16db7",
   "name": "Porte-bonheur Araxys, Ép 9",
   "icon": "https://media.valorant-api.com/buddies/ed2d3700-4bf6-b25c-8cc5-a98defd16db7/displayicon.png"
  },
  "jettWind": {
   "uuid": "c679852f-4ba7-57d6-1e30-6d8ac22faf61",
   "name": "Porte-bonheur coupe-vent de Jett",
   "icon": "https://media.valorant-api.com/buddies/c679852f-4ba7-57d6-1e30-6d8ac22faf61/displayicon.png"
  }
 },
 "bundles": {
  "araxys": {
   "uuid": "a4c613c9-4970-61ca-e52a-918ae22f5315",
   "name": "Araxys",
   "icon": "https://media.valorant-api.com/bundles/a4c613c9-4970-61ca-e52a-918ae22f5315/displayicon2.png"
  }
 }
};
