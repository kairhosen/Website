# Site Kairhosen : Carnet de Vol et Camify

Site de présentation des deux applications Windows gratuites pour Microsoft Flight Simulator 2024 :

- **Carnet de Vol** : enregistre, note et cartographie chaque vol, avec statistiques, import
  SimBrief / SimToolKitPro et suivi du vol en direct depuis le téléphone ;
- **Camify** : caméras cinématiques (traveling, flyby, tour de contrôle), replay de
  l'atterrissage dans MSFS et pilotage depuis le téléphone.

Site statique (HTML, CSS, JavaScript), sans framework, bibliothèque ni étape de build : il
s'ouvre aussi directement depuis le disque (`file://`). Aucun cookie, traceur ni police web ;
CSP stricte dans chaque page (aucun script ni style en ligne).

## Contenu

- `index.html` (FR) et `index-en.html` (EN) : accueil partagé plein écran entre les deux
  applications, puis sections chargées au défilement en alternant les applications (captures,
  modes de Camify animés en SVG avec leur vidéo réelle au clic, page du téléphone). Le bouton
  FR/EN passe d'une page à l'autre ; les textes sont dans `assets/js/i18n.js`.
- `copyright.html` / `copyright-en.html` : copyright, marques, composants tiers, sources de
  données et licences des deux applications.
- `guides/<application>/` : copies des guides utilisateur des applications (FR, EN, ES) et de
  leurs images, à recopier à chaque modification des guides.
- `robots.txt`, `sitemap.xml`.
- Boutons de téléchargement : dernière version des dépôts publics `kairhosen/CarnetDeVol-releases`
  et `kairhosen/Camify-releases` (API GitHub, réponse validée), jamais des dépôts privés.

## Outils

```bash
node tools/check.js                 # vérifications (clés FR/EN, aucun script ni style en ligne, ressources, < 50 Mo)
node tools/serve.js [dossier] [port] # aperçu local en lecture seule sur 127.0.0.1 (port 8765)
node tools/downloads.js             # nombre de téléchargements par version
```

## Déploiement

Chaque push sur `main` met le site en ligne aussitôt : le workflow « Déployer » lance
`node tools/check.js`, puis envoie chez IONOS par SFTP les seules pages publiques (`index*.html`,
`copyright*.html`, `robots.txt`, `sitemap.xml`, `assets/`, `guides/`) ; ce README, `CLAUDE.md`
et `tools/` ne sont pas publiés.

Audience : statistiques de l'hébergeur IONOS (tirées des journaux du serveur, sans cookie) et
compteurs de téléchargement GitHub (`tools/downloads.js`).
