// Nombre de téléchargements des applications, lu dans l'API publique GitHub (issue #3).
// Usage : node tools/downloads.js   (Node 18 ou plus récent, pour fetch)
// Rien n'est mesuré sur le site : GitHub compte lui-même chaque téléchargement d'un fichier de release.
const apps = [
  { name: 'Carnet de Vol', repo: 'kairhosen/CarnetDeVol-releases', exe: 'CarnetDeVol.exe' },
  { name: 'Camify', repo: 'kairhosen/Camify-releases', exe: 'Camify.exe' },
];

async function releases(repo) {
  const all = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'kairhosen-website-tools' },
    });
    if (!res.ok) throw new Error(`${repo} : HTTP ${res.status}`);
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < 100) return all;
  }
}

(async () => {
  let failed = false;
  for (const app of apps) {
    try {
      const list = await releases(app.repo);
      let total = 0;
      console.log(`\n${app.name} (${app.repo})`);
      for (const r of list) {
        const exe = (r.assets || []).find((a) => a.name === app.exe);
        const count = exe ? exe.download_count : 0;
        total += count;
        const date = (r.published_at || '').slice(0, 10);
        console.log(`  ${(r.tag_name || '?').padEnd(12)} ${date.padEnd(10)} ${String(count).padStart(7)}`);
      }
      console.log(`  ${'Total'.padEnd(23)} ${String(total).padStart(7)}`);
    } catch (e) {
      failed = true;
      console.error(`\n${app.name} : ${e.message}`);
    }
  }
  process.exitCode = failed ? 1 : 0;
})();
