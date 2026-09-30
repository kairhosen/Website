/*
 * Site Kairhosen : Carnet de Vol et Camify.
 * Traduction FR/EN, sections chargées au fil du défilement (en alternant les deux applications),
 * animations au scroll, visionneuse d'images et dernière version publiée de chaque application.
 * Aucune dépendance : fonctionne aussi en ouvrant les fichiers directement (file://).
 *
 * Sécurité : la CSP interdit scripts et styles en ligne. Le HTML généré ici ne contient que des
 * textes de i18n.js (écrits pour le site) ; toute donnée venant de l'API GitHub est validée
 * (sanitizeRelease) puis insérée avec textContent ou dans des attributs href déjà contrôlés.
 */
(function () {
  "use strict";

  var DICT = window.KH_I18N;
  var lang = window.KH_LANG || "en";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var APPS = {
    cdv: { repo: "kairhosen/CarnetDeVol-releases", exe: "CarnetDeVol.exe", release: null },
    camify: { repo: "kairhosen/Camify-releases", exe: "Camify.exe", release: null }
  };
  Object.keys(APPS).forEach(function (id) {
    var app = APPS[id];
    app.latestExe = "https://github.com/" + app.repo + "/releases/latest/download/" + app.exe;
    app.latestPage = "https://github.com/" + app.repo + "/releases/latest";
  });

  // Guides publiés sur le site (null = pas encore disponible).
  var GUIDES = {
    cdv: [["FR", "guides/carnetdevol/guide-utilisateur.html"], ["EN", "guides/carnetdevol/user-guide.html"], ["ES", "guides/carnetdevol/guia-usuario.html"]],
    camify: [["FR", "guides/camify/guide-utilisateur.html"], ["EN", "guides/camify/user-guide.html"], ["ES", "guides/camify/guia-usuario.html"]]
  };

  // ===== Traduction =====

  function t(key, vars) {
    var text = (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        text = text.split("{" + name + "}").join(vars[name]);
      });
    }
    return text;
  }

  function applyStatic(root) {
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    root.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var parts = pair.split(":");
        el.setAttribute(parts[0].trim(), t(parts[1].trim()));
      });
    });
  }

  function applyLanguage() {
    document.documentElement.lang = lang;
    var page = document.body.getAttribute("data-page");
    document.title = t(page === "copyright" ? "meta.copyrightTitle" : "meta.homeTitle");
    applyStatic(document);
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
    });
    document.querySelectorAll("img[data-shot]").forEach(function (img) {
      img.src = shot(img.getAttribute("data-shot").split(":")[1]);
    });
    Object.keys(APPS).forEach(renderRelease);
  }

  // Chaque page est figée dans sa langue (voir i18n.js) : le bouton FR/EN navigue vers le
  // fichier de l'autre langue au lieu de réécrire le texte en place, pour que chaque URL garde
  // un contenu stable côté moteurs de recherche.
  var LANG_PAGES = {
    "index.html": "index-en.html", "index-en.html": "index.html",
    "copyright.html": "copyright-en.html", "copyright-en.html": "copyright.html"
  };

  function otherLangUrl(next) {
    if (next === lang) return null;
    var file = location.pathname.split("/").pop() || "index.html";
    var target = LANG_PAGES[file];
    return target ? target + location.hash : null;
  }

  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = otherLangUrl(btn.getAttribute("data-lang"));
      if (url) location.href = url;
    });
  });

  // ===== Captures =====

  // Carnet de Vol : copies de CarnetDeVol/docs/images/brochure. Camify : copies de Camify/docs/images
  // (fenêtre entière ; sa hauteur suit les cadres affichés, d'où une taille par capture).
  function shot(name, app) {
    if (app === "camify") return "assets/img/camify/" + lang + "-" + name + ".png";
    return "assets/img/carnetdevol/" + lang + "-" + name + (name === "carte" || name === "telephone" ? ".jpg" : ".png");
  }

  var SIZES = {
    vols: [1286, 866], carte: [1286, 866], historique: [1845, 866],
    stats: [1286, 866], config: [1286, 950], atterrissage: [344, 134], telephone: [585, 1000]
  };
  // config : fenêtre modale de configuration, dont la hauteur varie avec la langue (retours à la ligne).
  var CAMIFY_SIZES = {
    "camera-sombre": [1000, 717], "camera-clair": [1000, 485], flyby: [1000, 607],
    config: { fr: [680, 796], en: [680, 779] }
  };

  function shotSize(name, app) {
    var size = (app === "camify" ? CAMIFY_SIZES : SIZES)[name];
    return Array.isArray(size) ? size : size[lang];
  }

  function zoomable(name, alt, extraClass, app) {
    var size = shotSize(name, app);
    var caption = app !== "camify" && name === "carte" ? alt + " — " + t("cdv.osm") : alt;
    return '<button type="button" class="zoom ' + (extraClass || "") + '" data-full="' + shot(name, app) +
      '" data-caption="' + escapeAttr(caption) + '" aria-label="' + escapeAttr(alt) + '">' +
      '<img src="' + shot(name, app) + '" alt="' + escapeAttr(alt) + '" width="' + size[0] + '" height="' + size[1] +
      '" loading="lazy" decoding="async" /></button>';
  }

  function escapeAttr(text) {
    var tmp = document.createElement("span");
    tmp.innerHTML = text;
    return (tmp.textContent || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  // ===== Illustrations des modes Camify (SVG animés en CSS) =====

  // Avion de ligne vu de trois-quarts, nez à droite : aile et stabilisateur éloignés (lavande), dérive,
  // fuselage, pare-brise et hublots, aile, stabilisateur et réacteur proches.
  var PLANE = '<path fill="#DCD3EE" d="M13 2 L22.5 2 L11.5 -4.6 L8.5 -4.6 Z M-1 2.5 L4 2.5 L-0.5 -0.3 L-2.5 -0.3 Z"/><path d="M-2.5 2.2 L-5.5 -7.5 L-2.2 -7.5 L5.5 1.2 Z"/><path d="M-3.5 2.6 C1 1.4 5 0.6 9 0.6 L31 0.6 C34.5 0.6 37.5 2.8 37.5 4.6 C37.5 6.4 35 8 31 8 L9 8 C4 8 0 6.2 -3.5 3.6 Z"/><path fill="#2A1D4A" fill-opacity="0.6" d="M32.4 2.2 L35.2 2.2 L36.5 3.9 L32.4 3.9 Z"/><path stroke="#2A1D4A" stroke-opacity="0.45" stroke-width="0.9" stroke-dasharray="1 1.3" d="M9 3.2 H30.5"/><path d="M13 5 L22.5 5 L11.5 17 L8.5 17 Z M-1 4.6 L4 4.6 L-0.5 9.5 L-2.5 9.5 Z"/><path d="M13 9.3 H19.6 A1.7 1.7 0 0 1 19.6 12.7 H13 Z"/>';
  var CAMERA = '<rect x="-9" y="-6" width="18" height="12" rx="2"/><path d="M9 -3 L15 -6 V6 L9 3 Z"/>';

  var MODE_ART = {
    traveling: '<svg viewBox="0 0 240 140" aria-hidden="true"><ellipse class="orbit" cx="120" cy="70" rx="90" ry="38"/>' +
      '<g class="art-plane" transform="translate(102 66)">' + PLANE + "</g>" +
      '<g class="art-cam">' + CAMERA +
      '<animateMotion dur="9s" repeatCount="indefinite" path="M210 70 A90 38 0 1 1 30 70 A90 38 0 1 1 210 70"/></g></svg>',
    flyby: '<svg viewBox="0 0 240 140" aria-hidden="true"><path class="path" d="M-10 58 Q120 40 250 30"/>' +
      '<g class="art-plane fly-across">' + PLANE + "</g>" +
      '<g class="art-cam" transform="translate(130 112)">' + CAMERA + "</g></svg>",
    // Piste vue de côté depuis la tour : elle s'étend dans le sens du vol de l'avion, qui s'y pose.
    tower: '<svg viewBox="0 0 240 140" aria-hidden="true">' +
      '<g class="tower-icon" transform="translate(200 40)"><rect x="-4" y="10" width="8" height="62"/><path d="M-12 0 H12 L9 12 H-9 Z"/></g>' +
      '<path class="runway" d="M6 130 L214 130 L234 114 L26 114 Z"/>' +
      '<path class="runway-line" d="M24 122 H216"/>' +
      '<path class="runway-threshold" d="M14 116 V128 M18 116 V128 M22 116 V128"/>' +
      '<g class="art-plane landing">' + PLANE + "</g></svg>"
  };

  // Vidéos réelles des modes (mêmes fichiers que les guides), chargées seulement au clic.
  var MODE_VIDEO = {
    traveling: "guides/camify/images/demo-traveling.mp4",
    flyby: "guides/camify/images/demo-flyby.mp4",
    tower: "guides/camify/images/demo-tour.mp4"
  };

  // Bascule d'une carte de mode entre l'animation et la vidéo réelle. Éléments créés par le DOM
  // (pas de HTML), source prise dans MODE_VIDEO uniquement.
  function toggleModeVideo(btn) {
    var mode = btn.getAttribute("data-mode");
    var art = btn.closest(".mode-card").querySelector(".mode-art");
    var svg = art.querySelector("svg");
    var label = btn.querySelector(".btn-video-label");
    var icon = btn.querySelector("[aria-hidden]");
    var video = art.querySelector("video");
    if (video) {
      video.pause();
      video.remove();
      svg.classList.remove("is-hidden");
      btn.setAttribute("aria-pressed", "false");
      icon.textContent = "▶";
      label.textContent = t("camify.modes.watch");
      return;
    }
    if (!MODE_VIDEO[mode]) return;
    video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("aria-label", t("camify.modes.videoLabel", { name: t("camify.modes." + mode + ".title") }));
    if (reduceMotion) video.controls = true; else video.autoplay = true;
    video.addEventListener("error", function () {
      video.remove();
      svg.classList.remove("is-hidden");
      btn.hidden = true; // vidéo illisible par ce navigateur : on garde l'animation
      btn.setAttribute("aria-pressed", "false");
    });
    video.src = MODE_VIDEO[mode];
    svg.classList.add("is-hidden"); // un <svg> n'a pas la propriété hidden des éléments HTML
    art.appendChild(video);
    if (!reduceMotion) {
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () { video.controls = true; });
    }
    btn.setAttribute("aria-pressed", "true");
    icon.textContent = "↺";
    label.textContent = t("camify.modes.back");
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".btn-video");
    if (btn) toggleModeVideo(btn);
  });

  // ===== Sections du flux (scrolling infini) =====

  function sectionHead(prefix, withSubtitle) {
    return '<header class="section-head reveal"><p class="kicker">' + t(prefix + ".kicker") + "</p>" +
      "<h2>" + t(prefix + ".title") + "</h2>" +
      (withSubtitle ? '<p class="subtitle">' + t(prefix + ".subtitle") + "</p>" : "") + "</header>";
  }

  function appBadge(app) {
    var logo = app === "cdv" ? "assets/img/carnetdevol/logo.svg" : "assets/img/camify/logo.svg";
    var name = app === "cdv" ? t("cdv.name") : "Camify";
    return '<div class="app-badge reveal"><img src="' + logo + '" alt="" width="40" height="40" /><span>' + name + "</span></div>";
  }

  function cards(prefix, items) {
    return '<div class="features">' + items.map(function (it, i) {
      return '<article class="feature reveal d' + (i % 3) + '">' +
        '<span class="feature-icon" aria-hidden="true">' + it[1] + "</span>" +
        "<h3>" + t(prefix + it[0] + ".title") + "</h3><p>" + t(prefix + it[0] + ".text") + "</p></article>";
    }).join("") + "</div>";
  }

  // Bandeau de captures qui défile (en double pour une boucle continue), cliquables pour agrandir.
  function gallery(app, names, sectionClass) {
    var items = function (hidden) {
      return names.map(function (n) {
        // Page du téléphone : pas un onglet, texte alternatif propre (cdv.shotAlt.telephone).
        var alt = n === "telephone" ? t(app + ".shotAlt.telephone") : t(app + ".shotAlt", { name: t(app + ".tab." + n) });
        // Capture plus haute que large (fenêtre de configuration) : vignette plus étroite, pour
        // garder la même hauteur que ses voisines.
        var size = shotSize(n, app);
        var item = size[1] > size[0] ? "marquee-item portrait" : "marquee-item";
        // Page du téléphone, encore plus élancée : même hauteur que les captures de fenêtre.
        if (size[1] > size[0] * 1.5) item += " phone";
        return hidden
          ? '<div class="' + item + '" aria-hidden="true"><img src="' + shot(n, app) + '" alt="" loading="lazy" decoding="async" /></div>'
          : '<div class="' + item + '">' + zoomable(n, alt, "", app) + "</div>";
      }).join("");
    };
    return '<section class="section ' + sectionClass + " theme-" + app + '" id="' + app + '-gallery"><div class="container">' +
      '<header class="section-head reveal"><p class="kicker">' + t(app + ".gallery.kicker") + "</p><h2>" + t(app + ".gallery.title") + "</h2>" +
      '<p class="subtitle">' + t(app + ".gallery.hint") + "</p></header></div>" +
      '<div class="marquee reveal"><div class="marquee-track">' + items(false) + items(true) + "</div></div></section>";
  }

  var CHUNKS = [
    function cdvFeatures() {
      return '<section class="section theme-cdv app-section" id="carnetdevol"><div class="container">' + appBadge("cdv") +
        sectionHead("cdv.features", true) +
        cards("cdv.features.", [["live", "📡"], ["landing", "🛬"], ["map", "🗺️"], ["phone", "📱"], ["stats", "📊"], ["local", "🔒"]]) +
        "</div></section>";
    },

    function camifyModes() {
      return '<section class="section section-dark theme-camify app-section" id="camify"><div class="container">' + appBadge("camify") +
        sectionHead("camify.modes", true) +
        '<div class="modes">' + ["traveling", "flyby", "tower"].map(function (m, i) {
          return '<article class="mode-card reveal d' + i + '"><div class="mode-art mode-' + m + '">' + MODE_ART[m] + "</div>" +
            '<div class="mode-body"><h3>' + t("camify.modes." + m + ".title") + "</h3><p>" + t("camify.modes." + m + ".text") + "</p>" +
            '<button type="button" class="btn btn-small btn-video" data-mode="' + m + '" aria-pressed="false">' +
            '<span aria-hidden="true">▶</span> <span class="btn-video-label">' + t("camify.modes.watch") + "</span></button></div></article>";
        }).join("") + "</div></div></section>";
    },

    function cdvJourney() {
      var steps = [["before", "vols", "1"], ["during", "carte", "2"], ["after", "historique", "3"]];
      return '<section class="section section-tint theme-cdv" id="cdv-journey"><div class="container">' + sectionHead("cdv.journey", false) +
        steps.map(function (s, i) {
          var p = "cdv.journey." + s[0];
          var media = zoomable(s[1], t(p + ".alt"), "frame");
          if (s[0] === "after") {
            media += '<div class="popup-shot">' + zoomable("atterrissage", t(p + ".popupAlt"), "contain") + "</div>";
          }
          if (s[0] === "during") {
            media += '<div class="phone-shot">' + zoomable("telephone", t(p + ".phoneAlt"), "") + "</div>";
          }
          return '<article class="journey-step' + (i % 2 ? " reverse" : "") + '">' +
            '<div class="journey-text reveal"><span class="phase"><span class="phase-num">' + s[2] + "</span>" + t(p + ".phase") + "</span>" +
            "<h3>" + t(p + ".title") + "</h3><p>" + t(p + ".text") + "</p></div>" +
            '<div class="journey-media reveal">' + media + "</div></article>";
        }).join("") + "</div></section>";
    },

    function camifyFeatures() {
      return '<section class="section theme-camify" id="camify-features"><div class="container">' + sectionHead("camify.features", false) +
        cards("camify.features.", [["hotkey", "⌨️"], ["takeover", "🎮"], ["size", "📐"], ["airports", "🛫"], ["live", "🎬"], ["local", "🔒"]]) +
        "</div></section>";
    },

    function cdvGallery() {
      return gallery("cdv", ["vols", "carte", "telephone", "historique", "stats", "config"], "section-navy");
    },

    function camifyGallery() {
      return gallery("camify", ["camera-sombre", "camera-clair", "flyby", "config"], "section-dark");
    },

    function shared() {
      return '<section class="section section-tint" id="shared"><div class="container">' + sectionHead("shared", true) +
        '<div class="shared">' + [["free", "🎁"], ["exe", "📦"], ["private", "🔒"], ["connect", "🔌"]].map(function (it, i) {
          return '<div class="shared-item reveal d' + (i % 3) + '"><span aria-hidden="true">' + it[1] + "</span>" +
            "<h3>" + t("shared." + it[0] + ".title") + "</h3><p>" + t("shared." + it[0] + ".text") + "</p></div>";
        }).join("") + "</div></div></section>";
    },

    function guides() {
      var card = function (app, logo) {
        var links = GUIDES[app]
          ? GUIDES[app].map(function (g) { return '<a class="btn btn-ghost btn-small" href="' + g[1] + '" lang="' + g[0].toLowerCase() + '">' + g[0] + "</a>"; }).join("")
          : '<span class="soon">' + t("guides.soon") + "</span>";
        return '<article class="guide-card reveal theme-' + app + '"><img src="' + logo + '" alt="" width="56" height="56" />' +
          "<h3>" + t("guides." + app) + '</h3><div class="guide-links">' + links + "</div></article>";
      };
      return '<section class="section" id="guides"><div class="container">' + sectionHead("guides", true) +
        '<div class="guides">' + card("cdv", "assets/img/carnetdevol/logo.svg") + card("camify", "assets/img/camify/logo.svg") +
        "</div></div></section>";
    },

    function cta() {
      return '<section class="cta" id="get"><div class="container reveal">' +
        "<h2>" + t("cta.title") + "</h2><p>" + t("cta.text") + "</p>" +
        '<div class="cta-actions">' +
        '<a class="btn btn-large btn-cdv js-download" data-app="cdv" href="' + downloadUrl("cdv") + '">' + t("cta.cdv") + "</a>" +
        '<a class="btn btn-large btn-camify js-download" data-app="camify" href="' + downloadUrl("camify") + '">' + t("cta.camify") + "</a>" +
        "</div></div></section>";
    }
  ];

  var feed = document.getElementById("feed");
  var sentinel = document.getElementById("feed-sentinel");
  var loaded = 0;

  function appendChunk(instant) {
    if (!feed || loaded >= CHUNKS.length) return false;
    var holder = document.createElement("div");
    holder.innerHTML = CHUNKS[loaded]();
    var section = holder.firstElementChild;
    feed.appendChild(section);
    loaded++;
    wire(section, instant);
    if (loaded >= CHUNKS.length && sentinel) sentinel.hidden = true;
    return true;
  }

  // Charge la section suivante chaque fois que le bas du flux approche de l'écran.
  if (feed && sentinel) {
    if ("IntersectionObserver" in window) {
      var feedObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        appendChunk(false);
        // Section plus courte que l'écran : le repère reste visible, on le ré-observe.
        feedObserver.unobserve(sentinel);
        if (loaded < CHUNKS.length) requestAnimationFrame(function () { feedObserver.observe(sentinel); });
      }, { rootMargin: "0px 0px 300px 0px" });
      feedObserver.observe(sentinel);
    } else {
      while (appendChunk(true)) { /* navigateur ancien : tout d'un coup */ }
    }
  }

  // Un lien vers une section pas encore chargée charge le flux jusqu'à elle.
  function revealTarget(id) {
    if (!id || !feed) return null;
    var target = document.getElementById(id);
    while (!target && appendChunk(true)) target = document.getElementById(id);
    return target;
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute("href").slice(1);
    if (!id || document.getElementById(id)) return; // section déjà chargée : défilement natif
    var target = revealTarget(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", "#" + id);
    }
  });

  // ===== Animations au scroll =====

  var revealObserver = "IntersectionObserver" in window && !reduceMotion
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.15 })
    : null;

  function wire(root, instant) {
    // Animations SVG (SMIL) figées si l'utilisateur a demandé moins de mouvement.
    if (reduceMotion) {
      root.querySelectorAll("svg").forEach(function (svg) { if (svg.pauseAnimations) svg.pauseAnimations(); });
    }
    root.querySelectorAll(".reveal").forEach(function (el) {
      if (revealObserver && !instant) revealObserver.observe(el);
      else el.classList.add("is-visible");
    });
  }

  // ===== Accueil partagé : le panneau survolé ou focalisé s'élargit =====

  var split = document.querySelector(".split");
  if (split) {
    split.querySelectorAll(".app-panel").forEach(function (panel) {
      var focus = function () { split.setAttribute("data-focus", panel.getAttribute("data-app")); };
      panel.addEventListener("mouseenter", focus);
      panel.addEventListener("focusin", focus);
    });
    split.addEventListener("mouseleave", function () { split.removeAttribute("data-focus"); });
  }

  // ===== En-tête =====

  var header = document.querySelector(".site-header");
  if (header && !header.classList.contains("is-solid")) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ===== Visionneuse =====

  var lightbox = document.getElementById("lightbox");
  var lastFocus = null;

  function openLightbox(src, caption) {
    if (!lightbox) return;
    lastFocus = document.activeElement;
    var img = lightbox.querySelector("img");
    img.src = src;
    img.alt = caption;
    lightbox.querySelector("figcaption").textContent = caption;
    lightbox.hidden = false;
    document.body.classList.add("no-scroll");
    lightbox.querySelector(".lightbox-close").focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".zoom");
    if (btn) { openLightbox(btn.getAttribute("data-full"), btn.getAttribute("data-caption")); return; }
    if (lightbox && !lightbox.hidden && (e.target === lightbox || e.target.closest(".lightbox-close"))) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "Tab" && lightbox && !lightbox.hidden) {
      e.preventDefault(); // seul élément focalisable : le bouton Fermer
      lightbox.querySelector(".lightbox-close").focus();
    }
  });

  // ===== Dernière version publiée de chaque application =====

  function downloadUrl(id) {
    var app = APPS[id];
    return app.release && app.release.url ? app.release.url : app.latestExe;
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Les liens et l'empreinte viennent de l'API GitHub ou du cache sessionStorage : n'accepter que
  // des adresses du dépôt de l'application et une empreinte SHA-256 bien formée, sinon garder les
  // liens stables.
  var SHA256_PATTERN = /^sha256:([0-9a-f]{64})$/i;

  function sanitizeRelease(id, r) {
    if (!r || typeof r !== "object") return null;
    var app = APPS[id];
    var repo = escapeRegExp(app.repo);
    var downloadPattern = new RegExp("^https://github\\.com/" + repo + "/releases/download/[^/?#]+/" + escapeRegExp(app.exe) + "$", "i");
    var notesPattern = new RegExp("^https://github\\.com/" + repo + "/releases/tag/[^/?#]+$", "i");
    var hash = SHA256_PATTERN.exec(String(r.digest || ""));
    return {
      tag: String(r.tag || "").slice(0, 40),
      date: String(r.date || "").slice(0, 40),
      size: typeof r.size === "number" && r.size > 0 ? r.size : 0,
      url: downloadPattern.test(String(r.url || "")) ? r.url : app.latestExe,
      notes: notesPattern.test(String(r.notes || "")) ? r.notes : app.latestPage,
      digest: hash ? "sha256:" + hash[1].toLowerCase() : "",
      at: typeof r.at === "number" ? r.at : 0
    };
  }

  function renderRelease(id) {
    var app = APPS[id];
    var release = app.release;
    document.querySelectorAll('.js-download[data-app="' + id + '"]').forEach(function (a) { a.href = downloadUrl(id); });
    document.querySelectorAll('.js-notes[data-app="' + id + '"]').forEach(function (a) {
      a.href = release && release.notes ? release.notes : app.latestPage;
    });

    var box = document.querySelector('.release-hash[data-app="' + id + '"]');
    if (box) {
      var hash = release && release.digest ? release.digest.slice("sha256:".length) : "";
      box.hidden = !hash;
      box.querySelector(".hash-value").textContent = hash;
      box.querySelector(".hash-command").textContent = "(Get-FileHash .\\" + app.exe + ').Hash -eq "' + hash + '"';
    }

    var info = document.querySelector('.release-info[data-app="' + id + '"]');
    if (!info || !release) return;
    var date = new Date(release.date);
    var dateText = isNaN(date) ? "" : new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" }).format(date);
    var size = release.size ? t("hero.sizeUnit", { size: new Intl.NumberFormat(lang).format(Math.round(release.size / 1048576)) }) : "";
    info.textContent = t("hero.release", { version: release.tag.replace(/^v/i, ""), date: dateText, size: size }).replace(/ · $/, "");
  }

  function loadRelease(id) {
    var app = APPS[id];
    var cacheKey = "kh-release-" + id;
    try {
      var cached = sanitizeRelease(id, JSON.parse(sessionStorage.getItem(cacheKey) || "null"));
      if (cached && Date.now() - cached.at < 3600 * 1000) { app.release = cached; renderRelease(id); return; }
    } catch (e) { /* pas de cache */ }
    if (!window.fetch) return;
    fetch("https://api.github.com/repos/" + app.repo + "/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
      credentials: "omit",
      referrerPolicy: "no-referrer"
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        var exe = (data.assets || []).filter(function (a) { return a && a.name === app.exe; })[0];
        app.release = sanitizeRelease(id, {
          tag: data.tag_name,
          date: data.published_at,
          size: exe ? exe.size : 0,
          url: exe ? exe.browser_download_url : app.latestExe,
          notes: data.html_url,
          digest: exe ? exe.digest : "",
          at: Date.now()
        });
        try { sessionStorage.setItem(cacheKey, JSON.stringify(app.release)); } catch (e) { /* pas de cache */ }
        renderRelease(id);
      })
      .catch(function () { /* on garde le lien stable vers la dernière version */ });
  }

  // ===== Démarrage =====

  applyLanguage();
  wire(document, false);
  if (document.querySelector(".js-download")) Object.keys(APPS).forEach(loadRelease);
  if (location.hash) {
    var initial = revealTarget(location.hash.slice(1));
    if (initial) setTimeout(function () { initial.scrollIntoView(); }, 0);
  }
})();
