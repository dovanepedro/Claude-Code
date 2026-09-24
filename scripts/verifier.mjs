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

// --- Thèmes ---
const themes = lire(join(D, "themes.json")) ?? [];
const STATUTS = ["brouillon", "a_relire", "publie", "demonstration"];

for (const theme of themes) {
  const dossier = join(D, "themes", theme.id);
  const ou = `thème « ${theme.id} »`;

  if (!STATUTS.includes(theme.statut)) err(`${ou} : statut « ${theme.statut} » inconnu.`);
  const publie = theme.statut === "publie";
  const demo = theme.statut === "demonstration";

  if (publie && !theme.nomenclature?.mission)
    err(`${ou} : publié sans rattachement à la nomenclature officielle.`);

  const indicateurs = lire(join(dossier, "indicateurs.json")) ?? [];
  const positions = lire(join(dossier, "positions.json")) ?? [];
  const pouvoirs = lire(join(dossier, "pouvoirs.json")) ?? [];
  chercherClesInterdites({ indicateurs, positions, pouvoirs }, ou);

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

  if (publie) {
    for (const s of new Set([...indicateurs, ...positions].map((x) => x.source_id).filter(Boolean)))
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
