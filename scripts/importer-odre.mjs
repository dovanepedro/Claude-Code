// Importe depuis ODRÉ la production d'électricité par région et par filière,
// pour la carte du thème énergie, et les contours des régions qui l'accompagnent.
//
// Les valeurs sont recopiées telles que le producteur les publie : aucun calcul,
// aucune conversion d'unité, et une valeur absente (null) reste absente — jamais 0.
// Le script ne touche qu'aux champs de données de carte.json ; titre, périmètre,
// note et points à vérifier sont rédigés à la main et conservés d'un import à l'autre.
//
// Usage : npm run importer:odre   (réseau requis ; la construction du site, elle, n'en a pas besoin)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const RACINE = new URL("..", import.meta.url).pathname;
const D = join(RACINE, "donnees");
const JEU = "prod-region-annuelle-filiere";
const SOURCE_ID = "odre-production-regionale-filiere";
const API = `https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/${JEU}`;

// Les séries attendues, dans l'ordre où le producteur les publie.
// Si ODRÉ en ajoute, en retire ou en renomme une, l'import s'arrête : on relit la source avant de continuer.
const SERIES = [
  "production_nucleaire", "production_thermique", "production_hydraulique",
  "production_eolienne", "production_solaire", "production_bioenergies",
];

function echec(message) {
  console.error(`\n✗ Import interrompu : ${message}\n  Rien n'a été écrit.\n`);
  process.exit(1);
}

async function lireJson(url) {
  const r = await fetch(url);
  if (!r.ok) echec(`${url} a répondu ${r.status}.`);
  return r.json();
}

const fiche = await lireJson(API);
const enregistrements = await lireJson(`${API}/exports/json`);

// Libellés et unité : repris des champs de la fiche, pas rédigés.
const champs = new Map(fiche.fields.map((f) => [f.name, f.label]));
for (const s of SERIES) if (!champs.has(s)) echec(`le champ « ${s} » n'existe plus dans le jeu ${JEU}.`);
const inattendues = fiche.fields.map((f) => f.name).filter((n) => n.startsWith("production_") && !SERIES.includes(n));
if (inattendues.length) echec(`nouveau(x) champ(s) de production : ${inattendues.join(", ")}.`);

const unites = new Set(SERIES.map((s) => champs.get(s).match(/\(([^)]+)\)\s*$/)?.[1]));
if (unites.size !== 1 || unites.has(undefined)) echec(`unités incohérentes entre les séries : ${[...unites].join(", ")}.`);
const [unite] = unites;

// La carte montre la dernière année publiée par le producteur.
const annee = enregistrements.map((e) => String(e.annee)).sort().at(-1);
const lignes = enregistrements
  .filter((e) => String(e.annee) === annee)
  .sort((a, b) => a.code_insee_region.localeCompare(b.code_insee_region));
if (!lignes.length) echec("aucun enregistrement pour la dernière année.");

const valeurs = lignes.map((e) => {
  const ligne = { code_insee_region: e.code_insee_region, region: e.region };
  for (const s of SERIES) {
    const v = e[s];
    if (v !== null && typeof v !== "number") echec(`${e.region}, ${s} : valeur non numérique « ${v} ».`);
    ligne[s] = v;
  }
  return ligne;
});

// Contours : ceux que le producteur joint à ses propres chiffres.
const regions = {};
for (const e of lignes) {
  const forme = e.geo_shape_region?.geometry;
  if (!forme?.coordinates) echec(`contour manquant pour ${e.region}.`);
  regions[e.code_insee_region] = { nom: e.region, type: forme.type, coordinates: forme.coordinates };
}

const aujourdhui = new Date().toISOString().slice(0, 10);
const cheminCarte = join(D, "themes", "energie", "carte.json");
const ancienne = JSON.parse(readFileSync(cheminCarte, "utf8"));

const carte = {
  titre: ancienne.titre,
  source_id: SOURCE_ID,
  jeu_de_donnees: JEU,
  annee,
  unite,
  perimetre: ancienne.perimetre ?? null,
  geometrie: "regions",
  series: SERIES.map((s) => ({ champ: s, libelle: champs.get(s) })),
  valeurs,
  importe_le: aujourdhui,
  note: ancienne.note ?? null,
  a_verifier: ancienne.a_verifier ?? null,
};

// Contours sur une ligne par région : le fichier reste lisible et un changement de tracé reste visible dans un diff.
const corps = Object.entries(regions).map(([code, r]) => `    ${JSON.stringify(code)}: ${JSON.stringify(r)}`).join(",\n");
const geometrie = `{
  "source_id": ${JSON.stringify(SOURCE_ID)},
  "champ_source": "geo_shape_region",
  "note": "Contours des régions tels que le producteur les joint au jeu ${JEU}, recopiés sans retouche. Ils ne servent qu'au dessin : aucun chiffre affiché n'en dépend.",
  "regions": {
${corps}
  }
}
`;

mkdirSync(join(D, "geometries"), { recursive: true });
writeFileSync(join(D, "geometries", "regions.json"), geometrie);
writeFileSync(cheminCarte, JSON.stringify(carte, null, 2) + "\n");

// La date de consultation de la source est celle de l'import, pas une date rédigée.
const cheminSources = join(D, "sources.json");
const sources = JSON.parse(readFileSync(cheminSources, "utf8"));
const source = sources.find((s) => s.id === SOURCE_ID);
if (source) {
  source.date_consultation = aujourdhui;
  writeFileSync(cheminSources, JSON.stringify(sources, null, 2) + "\n");
} else {
  console.warn(`  avertissement — la source « ${SOURCE_ID} » n'existe pas encore dans sources.json : la créer à la main.`);
}

console.log(`✓ ${valeurs.length} régions importées pour ${annee} (${unite}), ${SERIES.length} séries, contours inclus.`);
console.log(`  Fiche ODRÉ : données traitées le ${fiche.metas?.default?.data_processed?.slice(0, 10) ?? "?"}.`);
