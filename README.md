# Site Kairhosen : Carnet de Vol et Camify

Site de présentation des deux applications Windows gratuites pour Microsoft Flight Simulator 2024 :

- **Carnet de Vol** : enregistre, note et cartographie chaque vol ;
- **Camify** : caméras cinématiques (traveling, flyby, tour de contrôle).

Site statique (HTML, CSS, JavaScript), sans framework ni étape de build : il s'ouvre aussi
directement depuis le disque (`file://`). Hébergé tel quel chez un hébergeur statique (hors GitHub Pages).

- `index.html` : accueil partagé plein écran entre les deux applications, puis sections chargées
  au défilement en alternant les applications.
- `copyright.html` : copyright, marques, composants tiers, sources de données et licences des
  deux applications.
- `guides/<application>/` : guides utilisateur (FR, EN, ES).

Vérifications : `node tools/check.js`.

Audience : statistiques de l'hébergeur IONOS (tirées des journaux du serveur, sans cookie) et
nombre de téléchargements par version avec `node tools/downloads.js`.
