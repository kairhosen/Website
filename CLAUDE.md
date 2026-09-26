# CLAUDE.md

Site de présentation commun aux applications de l'éditeur Kairhosen pour MSFS 2024 :
Carnet de Vol (dépôt privé `kairhosen/CarnetDeVol`) et Camify (dépôt privé `kairhosen/Camify`).
Les applications sont les vedettes : l'éditeur n'apparaît que discrètement (en-tête, pied de page).

## Règles

- HTML/CSS/JS statique, sans framework, bibliothèque, police web, traceur ni cookie ; doit marcher
  en `file://`.
- Sécurité : CSP stricte dans chaque page (`script-src 'self'; style-src 'self'`, aucun script ni
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
  (préfixes `fr-`, `en-`). Camify n'a pas encore de captures : ses modes sont illustrés par des
  SVG animés (`MODE_ART` dans `main.js`, scène du panneau d'accueil dans `index.html`).
- Guides : `guides/carnetdevol/` = copies des guides de `CarnetDeVol/docs/` ; les images de
  plaquette pointent vers `../../assets/img/carnetdevol/`, `images/` reprend `docs/images/`.
  À recopier à chaque modification des guides sources.
- Guides de Camify : `guides/camify/` = copies de `Camify/docs/` (trois guides + `guide.css` +
  `guide.js`, et `images/` quand les captures et vidéos existeront). Leurs animations SVG sont
  les mêmes que `MODE_ART` : modifier les deux ensemble.

## Vérifier

`node tools/check.js` (clés de langue, pas de script/style en ligne, ressources présentes,
taille). Ouvrir `index.html` en clair et en sombre, en 1440 px et 390 px de large.
