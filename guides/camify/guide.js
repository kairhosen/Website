/* Script commun aux trois guides de Camify : thème clair/sombre, emplacements réservés pour les
   captures et vidéos pas encore disponibles, animations figées si l'utilisateur le demande. */
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  var label = function (dark) { return btn.getAttribute(dark ? 'data-light' : 'data-dark'); };
  var stored = null;
  try { stored = localStorage.getItem('camify-doc-theme'); } catch (e) {}
  if (stored === 'dark' || stored === 'light') {
    root.setAttribute('data-theme', stored);
    btn.textContent = label(stored === 'dark');
  }
  btn.addEventListener('click', function () {
    var current = root.getAttribute('data-theme');
    var isDark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    btn.textContent = label(next === 'dark');
    try { localStorage.setItem('camify-doc-theme', next); } catch (e) {}
  });

  // Capture ou vidéo absente : emplacement réservé indiquant le fichier attendu.
  var todo = root.lang === 'es' ? 'Captura pendiente' : root.lang === 'en' ? 'Screenshot to come' : 'Capture à venir';
  function placeholder(media) {
    var box = document.createElement('div');
    box.className = 'shot-todo';
    var title = document.createElement('strong');
    title.textContent = '📷 ' + todo;
    var name = document.createElement('code');
    name.textContent = media.getAttribute('src');
    box.appendChild(title);
    box.appendChild(name);
    media.replaceWith(box);
  }
  document.querySelectorAll('figure.shot img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) placeholder(img);
    else img.addEventListener('error', function () { placeholder(img); });
  });
  document.querySelectorAll('figure.shot video').forEach(function (video) {
    video.addEventListener('error', function () { placeholder(video); }, true);
    if (video.error) placeholder(video);
  });

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('svg').forEach(function (svg) { if (svg.pauseAnimations) svg.pauseAnimations(); });
    document.querySelectorAll('video').forEach(function (video) { video.removeAttribute('autoplay'); video.pause(); video.controls = true; });
  }
})();
