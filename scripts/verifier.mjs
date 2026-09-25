// Contrôle des données avant construction du site.
// Ce script est la traduction en code de la garantie de REPÈRE :
// aucun chiffre ne peut être publié sans source identifiée et vérifiée.
// S'il échoue, le site ne se construit pas. C'est voulu.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const RACINE = new URL("..", import.meta.url).pathname;
const D = join(RACINE, "donnees");

const erreurs = [];
const alertes = [];

const err = (m) => erreurs.push(m);
const avert = (m) => alertes.push(m);

function lire(chemin) {
  if (!existsSync(chemin)) { err(`Fichier manquant : ${chemin.replace(RACINE, "")}`); return null; }
  try { return JSON.parse(readFileSync(chemin, "utf8")); }
  catch (e) { err(`JSON invalide dans ${chemin.replace(RACINE, "")} : ${e.message}`); return null; }
}

// Aucune colonne d'appréciation. REPÈRE ne note, ne classe et ne recommande rien.
const CLES_INTERDITES = [
  "score", "notation", "credibilite", "faisabilite", "affinite",
  "recommandation", "recommande", "classement", "rang", "match", "compatibilite",
];

function chercherClesInterdites(valeur, chemin) {
  if (Array.isArray(valeur)) return valeur.forEach((v, i) => chercherClesInterdites(v, `${chemin}[${i}]`));
  if (valeur && typeof valeur === "object") {
    for (const [cle, v] of Object.entries(valeur)) {
      if (CLES_INTERDITES.includes(cle.toLowerCase()))
        err(`Clé d'appréciation interdite « ${cle} » dans ${chemin}. REPÈRE ne note ni ne classe.`);
      chercherClesInterdites(v, `${chemin}.${cle}`);
    }
  }
}

// --- Sources ---
const sources = lire(join(D, "sources.json")) ?? [];
const parId = new Map();
for (const [i, s] of sources.entries()) {
  const ou = `sources.json[${i}]`;
  for (const champ of ["id", "titre", "producteur", "url", "date_consultation", "type"])
    if (!s[champ]) err(`${ou} : champ « ${champ} » manquant.`);
  if (s.type && !["primaire", "secondaire"].includes(s.type))
    err(`${ou} : type « ${s.type} » inconnu (attendu : primaire ou secondaire).`);
  if (s.id && parId.has(s.id)) err(`${ou} : identifiant « ${s.id} » en double.`);
  if (s.id) parId.set(s.id, s);
}

// --- Nomenclature des thèmes ---
// REPÈRE ne choisit pas ses thèmes. Ils sont rattachés à une nomenclature publiée,
// et un thème ne peut pas être publié tant que l'intitulé repris n'a pas été
// confirmé à la source officielle.
const nomenclature = lire(join(D, "nomenclature.json")) ?? {};
const divisions = new Map((nomenclature.divisions ?? []).map((d) => [d.code, d]));
if (!divisions.size) err("nomenclature.json : aucune division. Les thèmes n'ont plus de rattachement.");

// --- Thèmes ---
const themes = lire(join(D, "themes.json")) ?? [];
const STATUTS = ["a_venir", "brouillon", "a_relire", "publie", "demonstration"];

for (const theme of themes) {
  const dossier = join(D, "themes", theme.id);
  const ou = `thème « ${theme.id} »`;

  if (!STATUTS.includes(theme.statut)) err(`${ou} : statut « ${theme.statut} » inconnu.`);
  const publie = theme.statut === "publie";
  const demo = theme.statut === "demonstration";

  if (!demo) {
    const code = theme.nomenclature?.division;
    if (!code) err(`${ou} : aucun rattachement à une division de la nomenclature.`);
    else if (!divisions.has(code)) err(`${ou} : division « ${code} » absente de nomenclature.json.`);
    else if (publie) {
      const div = divisions.get(code);
      if (!div.libelle_confirme)
        err(`${ou} : publié alors que l'intitulé de la division « ${code} » n'est pas confirmé à la source officielle.`);
      if (!nomenclature.source_id) err(`${ou} : publié alors que la nomenclature elle-même n'a pas de source.`);
      if (theme.nomenclature.sous_classe && !theme.nomenclature.libelle_confirme)
        err(`${ou} : publié alors que l'intitulé de la sous-classe « ${theme.nomenclature.sous_classe} » n'est pas confirmé.`);
    }
  }
  if (theme.statut === "a_venir") continue; // thème annoncé, pas encore ouvert

  const indicateurs = lire(join(dossier, "indicateurs.json")) ?? [];
  const positions = lire(join(dossier, "positions.json")) ?? [];
  const pouvoirs = lire(join(dossier, "pouvoirs.json")) ?? [];
  const carte = existsSync(join(dossier, "carte.json")) ? lire(join(dossier, "carte.json")) : null;
  chercherClesInterdites({ indicateurs, positions, pouvoirs, carte }, ou);

  if (publie && indicateurs.length !== 5)
    err(`${ou} : ${indicateurs.length} indicateur(s), or un thème publié en compte exactement 5.`);

  for (const ind of indicateurs) {
    const oui = `${ou} / indicateur « ${ind.id} »`;
    const renseigne = ind.valeur !== null && ind.valeur !== undefined;

    if (renseigne) {
      if (typeof ind.valeur !== "number") err(`${oui} : la valeur doit être un nombre.`);
      if (!ind.source_id) err(`${oui} : valeur renseignée sans source. Interdit.`);
      else if (!parId.has(ind.source_id)) err(`${oui} : source « ${ind.source_id} » introuvable.`);
      if (!ind.unite) err(`${oui} : valeur renseignée sans unité.`);
      if (!ind.periode) err(`${oui} : valeur renseignée sans période de référence.`);
      if (!ind.definition_retenue || /À RENSEIGNER/i.test(ind.definition_retenue))
        err(`${oui} : valeur renseignée sans définition retenue. Plusieurs définitions officielles coexistent souvent.`);
    }
    // Une répartition s'affiche sous le total que publie le producteur : REPÈRE n'additionne jamais.
    if (ind.decomposition !== undefined) {
      if (!Array.isArray(ind.decomposition) || !ind.decomposition.length) err(`${oui} : décomposition vide.`);
      else for (const [k, part] of ind.decomposition.entries()) {
        if (!part.libelle) err(`${oui} / part[${k}] : libellé manquant.`);
        if (part.valeur !== null && typeof part.valeur !== "number")
          err(`${oui} / part[${k}] : ni un nombre ni une absence déclarée (null).`);
      }
      if (!renseigne) err(`${oui} : décomposition sans total publié par le producteur.`);
    }
    if (ind.verifie === true) {
      const s = parId.get(ind.source_id);
      if (!s) err(`${oui} : marqué vérifié sans source valide.`);
      else if (s.type === "secondaire")
        err(`${oui} : marqué vérifié alors que « ${s.id} » est une source secondaire.`);
    }
    if (publie && !ind.verifie)
      err(`${oui} : thème publié avec un indicateur non vérifié à la source primaire.`);
    if (!publie && renseigne && !ind.verifie && !demo)
      avert(`${oui} : valeur renseignée mais pas encore vérifiée à la source primaire.`);
  }

  for (const [i, p] of positions.entries()) {
    const oup = `${ou} / position[${i}]`;
    if (!p.organisation) err(`${oup} : organisation manquante.`);
    if (!p.verbatim?.trim()) err(`${oup} : verbatim vide. Une position sans citation exacte ne se publie pas.`);
    if (!p.source_id) err(`${oup} : source manquante.`);
    else if (!parId.has(p.source_id)) err(`${oup} : source « ${p.source_id} » introuvable.`);
    if (!p.date_position) err(`${oup} : date de la position manquante.`);
  }

  // La carte obéit aux mêmes règles que les indicateurs : pas un chiffre sans source.
  if (carte?.valeurs?.length) {
    const ouc = `${ou} / carte`;
    if (!carte.source_id) err(`${ouc} : valeurs sans source. Interdit.`);
    else if (!parId.has(carte.source_id)) err(`${ouc} : source « ${carte.source_id} » introuvable.`);
    if (!carte.unite) err(`${ouc} : valeurs sans unité.`);
    if (!carte.annee) err(`${ouc} : valeurs sans année de référence.`);
    const contours = carte.geometrie ? lire(join(D, "geometries", `${carte.geometrie}.json`))?.regions : null;
    if (!contours) err(`${ouc} : aucun contour pour dessiner les valeurs.`);
    const series = (carte.series ?? []).map((s) => s.champ);
    if (!series.length) err(`${ouc} : aucune série déclarée.`);
    for (const v of carte.valeurs) {
      if (contours && !contours[v.code_insee_region])
        err(`${ouc} : aucun contour pour la région « ${v.code_insee_region} ».`);
      // Une absence se déclare (null) ; un champ manquant ou une valeur texte est une erreur.
      for (const s of series)
        if (v[s] !== null && typeof v[s] !== "number")
          err(`${ouc} / ${v.region} : « ${s} » n'est ni un nombre ni une absence déclarée (null).`);
    }
    if (publie && carte.a_verifier?.trim())
      err(`${ouc} : thème publié alors qu'un point de la carte reste à vérifier.`);
  }

  if (publie) {
    for (const s of new Set([...indicateurs, ...positions, carte ?? {}].map((x) => x.source_id).filter(Boolean)))
      if (parId.get(s)?.type === "secondaire")
        err(`${ou} : publié en s'appuyant sur la source secondaire « ${s} ».`);
  }
}

// --- Corrections ---
for (const [i, c] of (lire(join(D, "corrections.json")) ?? []).entries())
  for (const champ of ["date_signalement", "page", "description"])
    if (!c[champ]) err(`corrections.json[${i}] : champ « ${champ} » manquant.`);

// --- Verdict ---
for (const a of alertes) console.warn(`  avertissement — ${a}`);
if (erreurs.length) {
  console.error(`\n✗ ${erreurs.length} erreur(s). Le site ne sera pas construit.\n`);
  for (const e of erreurs) console.error(`  • ${e}`);
  console.error("");
  process.exit(1);
}
console.log(`✓ Données conformes — ${sources.length} source(s), ${themes.length} thème(s), ${alertes.length} avertissement(s).`);
