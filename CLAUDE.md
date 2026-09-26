# CLAUDE.md

Site de présentation commun aux applications de l'éditeur Kairhosen pour MSFS 2024 :
Carnet de Vol (dépôt privé `kairhosen/CarnetDeVol`) et Camify (dépôt privé `kairhosen/Camify`).
Les applications sont les vedettes : l'éditeur n'apparaît que discrètement (en-tête, pied de page).

## Règles

- HTML/CSS/JS statique, sans framework, bibliothèque, police web, traceur ni cookie ; doit marcher
  en `file://`.
- Sécurité : CSP stricte dans chaque page (`script-src 'self'; style-src 'self'; media-src 'self'`, aucun script ni
  style en ligne, y compris dans le HTML généré par `main.js` : délais d'animation par classes
  `d1`/`d2`). Seule requête externe : l'API publique GitHub `releases/latest` des dépôts
  `*-releases`, dont la réponse est validée (`sanitizeRelease`) et insérée par `textContent`.
- Textes dans `assets/js/i18n.js` (FR et EN aux clés identiques ; `cdv.*`, `camify.*`, `cr.*`,
  le reste commun). Langue : choix enregistré dans `localStorage` (`kh-lang`), sinon navigateur.
- Téléchargements uniquement vers les dépôts publics `kairhosen/CarnetDeVol-releases` et
  `kairhosen/Camify-releases`, jamais vers les dépôts privés. Pas d'exe dans ce dépôt, 50 Mo max.
- Chaque application a sa charte : `.theme-cdv` (bleu ciel, orange) et `.theme-camify` (nuit
  violette, corail) définissent les variables `--app-*` lues par les composants.
- `copyright.html` regroupe les mentions des deux applications (tableau des sources avec la
  colonne Application). À mettre à jour quand une application ajoute un service ou un composant
  tiers (voir leurs `THIRD-PARTY-NOTICES.txt` et annexes de guide).

## Contenu repris des applications

- Captures : `assets/img/carnetdevol/` = copies de `CarnetDeVol/docs/images/brochure/`
  (préfixes `fr-`, `en-`). `assets/img/camify/` = copies renommées de `Camify/docs/images/`
  (`<lang>-onglet-camera-sombre.png` → `<lang>-camera-sombre.png`, `-onglet-camera-clair` →
  `-camera-clair`, `-reglages-flyby` → `-flyby`, `-onglet-configuration` → `-config`,
  `-onglet-journal` → `-journal`), en FR et EN, montrées par la galerie `camify-gallery`
  (`gallery()` dans `main.js`, commune aux deux applications ; `CAMIFY_SIZE` = taille des captures).
  Les modes de Camify restent illustrés par des SVG animés (`MODE_ART` dans `main.js`, scène du
  panneau d'accueil dans `index.html`) ; le bouton « Voir en situation réelle » de chaque carte
  remplace l'animation par la vidéo du guide (`MODE_VIDEO`, fichiers de `guides/camify/images/`),
  chargée seulement au clic.
- Guides : `guides/carnetdevol/` = copies des guides de `CarnetDeVol/docs/` ; les images de
  plaquette pointent vers `../../assets/img/carnetdevol/`, `images/` reprend `docs/images/`.
  À recopier à chaque modification des guides sources.
- Guides de Camify : `guides/camify/` = copies de `Camify/docs/` (trois guides + `guide.css` +
  `guide.js`, et `images/` = captures et vidéos de `Camify/docs/images/`). Leurs animations SVG
  sont les mêmes que `MODE_ART` : modifier les deux ensemble. Les captures se régénèrent dans le
  dépôt Camify (`tools/Screenshots`) : recopier ensuite `guides/camify/images/` et
  `assets/img/camify/`.

## Vérifier

`node tools/check.js` (clés de langue, pas de script/style en ligne, ressources présentes,
taille). Ouvrir `index.html` en clair et en sombre, en 1440 px et 390 px de large.
