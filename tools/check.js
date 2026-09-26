// Vérifications du site, sans dépendance : node tools/check.js
// - dictionnaires FR et EN aux clés identiques, toute clé utilisée dans le HTML/JS existe ;
// - aucun script ni style en ligne (la CSP les interdit) ;
// - toutes les ressources locales référencées existent ; taille totale < 50 Mo.
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const errors = [];

global.window = {};
global.document = { documentElement: {} };
global.localStorage = { getItem: () => null };
Object.defineProperty(global, "navigator", { value: { languages: ["fr"] }, configurable: true });
require(path.join(root, "assets/js/i18n.js"));
const dict = window.KH_I18N;
const fr = Object.keys(dict.fr), en = Object.keys(dict.en);
fr.filter(k => !en.includes(k)).forEach(k => errors.push("clé absente en EN : " + k));
en.filter(k => !fr.includes(k)).forEach(k => errors.push("clé absente en FR : " + k));

const pages = ["index.html", "copyright.html"];
const main = fs.readFileSync(path.join(root, "assets/js/main.js"), "utf8");
const used = new Set();
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) used.add(m[1]);
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) m[1].split(";").forEach(p => used.add(p.split(":")[1].trim()));
  if (/<script(?![^>]*\ssrc=)[^>]*>/i.test(html)) errors.push(page + " : script en ligne");
  if (/<style|\sstyle="/i.test(html)) errors.push(page + " : style en ligne");
  for (const m of html.matchAll(/(?:src|href)="([^"#:]+)(?:#[^"]*)?"/g)) {
    if (!fs.existsSync(path.join(root, m[1]))) errors.push(page + " : ressource absente " + m[1]);
  }
}
if (/\sstyle=/.test(main)) errors.push("main.js : style en ligne dans le HTML généré");
// Clés littérales seulement : t("a.b") ou t("a.b", {...}), pas les préfixes concaténés.
for (const m of main.matchAll(/[^\w.]t\("([a-z][\w.]*\w)"\s*[,)]/g)) used.add(m[1]);
used.forEach(k => { if (!dict.fr[k]) errors.push("clé utilisée mais absente : " + k); });

let size = 0;
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p); else size += fs.statSync(p).size;
    if (/\.exe$/i.test(e.name)) errors.push("exécutable dans le site : " + p);
  }
})(root);
if (size > 50 * 1024 * 1024) errors.push("site trop lourd : " + (size / 1048576).toFixed(1) + " Mo");

console.log(errors.length ? errors.join("\n") : "OK (" + fr.length + " clés, " + (size / 1048576).toFixed(1) + " Mo)");
process.exit(errors.length ? 1 : 0);
