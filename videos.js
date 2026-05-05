/* ============================================================
   AJOUTER UNE VIDÉO : copie le fichier dans /Video puis
   ajoute une entrée dans ce tableau.

   Champs :
     src      — nom du fichier dans le dossier Video/
     title    — titre affiché sous la vidéo
     category — "highlights" | "gameplay" | "live"
     duration — durée affichée (ex: "5:18")
     views    — vues affichées (ex: "14.2K")
     badge    — (optionnel) texte badge ex: "NOUVEAU"
     featured — (optionnel) true = grande carte en vedette
   ============================================================ */

const VIDEOS = [
  {
    src:      'Video/Arc Raider .mp4',
    title:    'Arc Raiders — Full Gameplay Session',
    category: 'gameplay',
    views:    '31.8K vues',
    badge:    'NOUVEAU',
    featured: true
  },
  {
    src:      'Video/Sniper ARC.mp4',
    title:    'Sniper insane — Kills ARC Raiders',
    category: 'highlights',
    views:    '14.2K vues'
  },
  {
    src:      'Video/2vs14.mp4',
    title:    '2 vs 14 — Clutch impossible !',
    category: 'highlights',
    views:    '8.5K vues'
  },
  {
    src:      'Video/PvP Pompe .mp4',
    title:    'PvP Pompe — Domination totale',
    category: 'highlights',
    views:    '22.1K vues'
  },
  {
    src:      'Video/Game 4K .mp4',
    title:    'Arc Raiders 4K — Gameplay premium',
    category: 'gameplay',
    views:    '17.3K vues'
  },
  {
    src:      'Video/Arc freindly.mp4',
    title:    'Arc Friendly — Moments drôles avec les viewers',
    category: 'gameplay',
    views:    '9.7K vues'
  },
  {
    src:      'Video/0430 (1).mp4',
    title:    'Session nuit — Gameplay complet',
    category: 'live',
    views:    '6.2K vues'
  }
];
