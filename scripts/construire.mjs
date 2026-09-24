// Construit le site statique dans dist/ à partir des fichiers de donnees/.
// Ne s'exécute qu'après verifier.mjs : aucune page ne se construit sur des données non conformes.

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { rendreCarte } from "./carte.mjs";

const RACINE = new URL("..", import.meta.url).pathname;
const D = join(RACINE, "donnees");
const DIST = join(RACINE, "dist");

const lire = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : []);
const ech = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const sources = lire(join(D, "sources.json"));
const parId = new Map(sources.map((s) => [s.id, s]));
const nomenclature = existsSync(join(D, "nomenclature.json")) ? JSON.parse(readFileSync(join(D, "nomenclature.json"), "utf8")) : { divisions: [] };
const divisions = new Map((nomenclature.divisions ?? []).map((d) => [d.code, d]));
const themes = lire(join(D, "themes.json")).sort((a, b) => a.ordre - b.ordre);
const ouverts = themes.filter((t) => t.statut !== "a_venir");
const corrections = lire(join(D, "corrections.json"));

function citation(id) {
  const s = parId.get(id);
  if (!s) return `<span class="manque">source à renseigner</span>`;
  const secondaire = s.type === "secondaire" ? ` <span class="drapeau">source secondaire — à reconfirmer</span>` : "";
  return `<a class="source" href="${ech(s.url)}" rel="noopener">${ech(s.producteur)}</a>, consultée le ${ech(s.date_consultation)}${secondaire}`;
}

function page({ titre, corps, actuel }) {
  const nav = [["index", "Accueil"], ["methode", "Méthode"], ["corrections", "Corrections"]]
    .map(([f, l]) => `<a href="${f}.html"${actuel === f ? ' aria-current="page"' : ""}>${l}</a>`).join("");
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ech(titre)} — REPÈRE</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="evitement" href="#contenu">Aller au contenu</a>
<header><a class="marque" href="index.html">REPÈRE</a><nav>${nav}</nav></header>
<main id="contenu">${corps}</main>
<footer>
<p>REPÈRE n'émet aucune recommandation de vote, aucun score et aucun classement.
Chaque chiffre affiché porte son producteur, sa définition et sa date.</p>
<p><a href="corrections.html">Signaler une erreur</a> · <a href="methode.html">Comment c'est fait</a></p>
</footer>
</body>
</html>`;
}

function rattachement(theme) {
  const div = divisions.get(theme.nomenclature?.division);
  if (!div) return "";
  const sous = theme.nomenclature.sous_classe
    ? ` — sous-classe ${ech(theme.nomenclature.sous_classe)} « ${ech(theme.nomenclature.libelle_sous_classe)} »` : "";
  return `<p class="rattachement">Division ${ech(div.code)} « ${ech(div.libelle)} »${sous} de la ${ech(nomenclature.referentiel)}. REPÈRE ne choisit pas ses thèmes : il reprend ce découpage.</p>`;
}

function pageTheme(theme) {
  const dossier = join(D, "themes", theme.id);
  const indicateurs = lire(join(dossier, "indicateurs.json"));
  const pouvoirs = lire(join(dossier, "pouvoirs.json"));
  // Ordre alphabétique imposé : jamais un ordre lié à la notoriété ou aux sondages.
  const positions = lire(join(dossier, "positions.json"))
    .sort((a, b) => String(a.organisation).localeCompare(String(b.organisation), "fr"));
  const carte = existsSync(join(dossier, "carte.json")) ? JSON.parse(readFileSync(join(dossier, "carte.json"), "utf8")) : null;

  const banniere = theme.statut === "demonstration"
    ? `<p class="banniere">Contenu de démonstration. Les valeurs de cette page sont fictives et ne décrivent rien de réel. Elle existe pour montrer le gabarit.</p>`
    : theme.statut !== "publie"
    ? `<p class="banniere">Brouillon. Ce thème n'est pas publié : les données ne sont pas complètes.</p>` : "";

  const blocIndic = indicateurs.map((i) => {
    const vide = i.valeur === null || i.valeur === undefined;
    return `<article class="indicateur${vide ? " vide" : ""}">
<h3>${ech(i.nom)}</h3>
<p class="valeur">${vide ? "<span class='manque'>à renseigner</span>" : `${ech(i.valeur)} <span class="unite">${ech(i.unite)}</span>`}</p>
<dl>
<dt>Période</dt><dd>${vide ? "—" : ech(i.periode)}</dd>
<dt>Définition retenue</dt><dd>${ech(i.definition_retenue)}</dd>
<dt>Source</dt><dd>${vide ? "—" : citation(i.source_id)}</dd>
<dt>Vérification</dt><dd>${i.verifie ? "vérifié à la source primaire" : "<span class='drapeau'>non vérifié</span>"}</dd>
</dl></article>`;
  }).join("");

  const blocPouvoirs = pouvoirs.length ? `<table>
<caption>Qui peut décider quoi</caption>
<thead><tr><th scope="col">Niveau</th><th scope="col">Ce qui relève de lui</th><th scope="col">Source</th></tr></thead>
<tbody>${pouvoirs.map((p) => `<tr><th scope="row">${ech(p.libelle)}</th><td>${ech(p.ce_qui_releve)}</td><td>${p.source_id ? citation(p.source_id) : "<span class='manque'>à renseigner</span>"}</td></tr>`).join("")}</tbody>
</table>` : `<p class="manque">À renseigner.</p>`;

  const blocPositions = positions.length ? `<table>
<caption>Positions, par ordre alphabétique — citations exactes, sans reformulation</caption>
<thead><tr><th scope="col">Organisation</th><th scope="col">Citation</th><th scope="col">Date</th><th scope="col">Source</th></tr></thead>
<tbody>${positions.map((p) => `<tr><th scope="row">${ech(p.organisation)}</th><td><blockquote>${ech(p.verbatim)}</blockquote></td><td>${ech(p.date_position)}</td><td>${citation(p.source_id)}</td></tr>`).join("")}</tbody>
</table>` : `<p class="manque">Aucune position renseignée à ce jour. Une absence n'est jamais comblée par déduction.</p>`;

  const contours = carte?.geometrie && carte.valeurs?.length
    ? JSON.parse(readFileSync(join(D, "geometries", `${carte.geometrie}.json`), "utf8")).regions : null;
  const blocCarte = contours
    ? rendreCarte({ carte, contours, ech, citation, dateSource: parId.get(carte.source_id)?.date_publication })
    : `<p class="manque">${ech(carte?.titre ?? "Carte")} — géométrie non encore récupérée. ${ech(carte?.note ?? "")}</p>`;

  return page({
    titre: theme.nom, actuel: "",
    corps: `${banniere}
<h1>${ech(theme.nom)}</h1>
${rattachement(theme)}
<section><h2>L'état des lieux</h2>${blocIndic}</section>
<section><h2>Sur le territoire</h2>${blocCarte}</section>
<section><h2>Qui décide</h2>${blocPouvoirs}</section>
<section><h2>Positions</h2>${blocPositions}</section>`,
  });
}

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const liste = themes.map((t) => t.statut === "a_venir"
  ? `<li><span class="avenir">${ech(t.nom)}</span> <span class="statut">à venir</span></li>`
  : `<li><a href="theme-${ech(t.id)}.html">${ech(t.nom)}</a> <span class="statut">${ech(t.statut)}</span></li>`).join("");
const listeDivisions = (nomenclature.divisions ?? [])
  .map((d) => `<li>${ech(d.code)} — ${ech(d.libelle)}${d.libelle_confirme ? "" : ` <span class="drapeau">intitulé à confirmer</span>`}</li>`).join("");
const absences = (nomenclature.absences_a_assumer ?? []).map((a) => `<li>${ech(a)}</li>`).join("");
writeFileSync(join(DIST, "index.html"), page({
  titre: "Accueil", actuel: "index",
  corps: `<h1>Comprendre qui décide quoi</h1>
<p class="chapeau">REPÈRE rassemble, thème par thème : l'état chiffré du pays, qui a le pouvoir de décider, ce qui a déjà été tenté ailleurs, et ce que d'autres ont chiffré. Sans jamais dire quoi en penser.</p>
<h2>Thèmes</h2><ul class="themes">${liste}</ul>`,
}));

for (const t of ouverts) writeFileSync(join(DIST, `theme-${t.id}.html`), pageTheme(t));

writeFileSync(join(DIST, "corrections.html"), page({
  titre: "Corrections", actuel: "corrections",
  corps: `<h1>Corrections</h1>
<p>Toute erreur signalée et corrigée est publiée ici : ce qui était écrit, ce qui a changé, et quand.</p>
<p><strong>Signaler une erreur :</strong> <span class="manque">adresse de contact à renseigner</span></p>
${corrections.length ? `<ul>${corrections.map((c) => `<li><strong>${ech(c.date_signalement)}</strong> — ${ech(c.page)} : ${ech(c.description)}${c.date_correction ? ` <em>(corrigé le ${ech(c.date_correction)})</em>` : " <em>(en cours)</em>"}</li>`).join("")}</ul>`
  : `<p>Aucune correction à ce jour. Cette page reste publiée : un site qui affiche ses corrections est plus crédible qu'un site qui n'en a jamais eu.</p>`}`,
}));

writeFileSync(join(DIST, "methode.html"), page({
  titre: "Méthode", actuel: "methode",
  corps: `<h1>Comment c'est fait</h1>
<h2>Ce que REPÈRE ne fait pas</h2>
<ul>
<li>Aucun chiffrage propre. REPÈRE rassemble des évaluations produites par d'autres et affiche leurs désaccords.</li>
<li>Aucun score, aucune note, aucun classement, aucune correspondance entre un électeur et un candidat.</li>
<li>Aucune donnée d'opinion politique collectée. Pas de compte, pas de questionnaire.</li>
</ul>
<h2>Les chiffres</h2>
<p>Ils sont importés depuis les fichiers publiés par leurs producteurs officiels, jamais rédigés. Chacun porte son producteur, sa définition retenue, sa période et sa date de consultation. Quand plusieurs définitions officielles coexistent pour un même sujet, celle retenue est nommée.</p>
<h2>Les positions</h2>
<p>Citations exactes, avec leur source et leur date. Ordre alphabétique. Une absence de position est affichée comme telle, jamais déduite.</p>
<h2>Les thèmes</h2>
<p>Ils sont repris d'une nomenclature officielle publiée, pas choisis par REPÈRE : la ${ech(nomenclature.referentiel)}, issue de la ${ech(nomenclature.origine)}</p>
<ul>${listeDivisions}</ul>
<h3>Ce que ce découpage ne sépare pas</h3>
<ul>${absences}</ul>`,
}));

copyFileSync(join(RACINE, "site", "style.css"), join(DIST, "style.css"));
console.log(`✓ Site construit — ${ouverts.length + 3} page(s), ${themes.length - ouverts.length} thème(s) annoncé(s).`);
