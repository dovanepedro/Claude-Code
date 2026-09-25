// Outils partagés par les scripts d'import d'indicateurs.
//
// Un import ne possède que les champs de données d'un indicateur (CHAMPS_DONNEES) : il les remplace
// tous à chaque passage. Tout le reste — nom, définition retenue, nombre de décimales affichées,
// vérification — est rédigé ou décidé à la main, et conservé tel quel.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const RACINE = new URL("..", import.meta.url).pathname;
export const D = join(RACINE, "donnees");

const CHAMPS_DONNEES = ["unite", "valeur", "libelle_valeur", "periode", "serie", "decomposition", "source_id", "importe_le"];
const ORDRE = ["id", "nom", "definition_retenue", ...CHAMPS_DONNEES.slice(0, 4), "decimales", ...CHAMPS_DONNEES.slice(4), "verifie"];

export const aujourdhui = () => new Date().toISOString().slice(0, 10);

export function echec(message) {
  console.error(`\n✗ Import interrompu : ${message}\n  Rien n'a été écrit.\n`);
  process.exit(1);
}

export async function telecharger(url, format) {
  const r = await fetch(url);
  if (!r.ok) echec(`${url} a répondu ${r.status}.`);
  if (format === "json") {
    const brut = await r.text();
    try { return JSON.parse(brut); } catch { echec(`${url} n'a pas renvoyé de JSON (serveur en maintenance ?) : ${brut.slice(0, 80)}`); }
  }
  return Buffer.from(await r.arrayBuffer());
}

// `donnees` : identifiant d'indicateur → nouveaux champs de données. Tous doivent exister dans le fichier.
export function majIndicateurs(theme, donnees) {
  const chemin = join(D, "themes", theme, "indicateurs.json");
  const indicateurs = JSON.parse(readFileSync(chemin, "utf8"));
  for (const id of Object.keys(donnees))
    if (!indicateurs.some((i) => i.id === id)) echec(`indicateur « ${id} » absent de ${theme}/indicateurs.json.`);
  const resultat = indicateurs.map((ind) => {
    if (!donnees[ind.id]) return ind;
    const garde = Object.fromEntries(Object.entries(ind).filter(([k]) => !CHAMPS_DONNEES.includes(k)));
    const complet = { ...garde, ...donnees[ind.id] };
    const cles = [...ORDRE.filter((k) => k in complet), ...Object.keys(complet).filter((k) => !ORDRE.includes(k))];
    return Object.fromEntries(cles.map((k) => [k, complet[k]]));
  });
  writeFileSync(chemin, JSON.stringify(resultat, null, 2) + "\n");
}

// La date de consultation d'une source est celle de l'import, pas une date rédigée. `lu` complète
// avec ce que le producteur déclare lui-même, comme la date de dernière mise à jour du jeu.
export function majConsultation(sourceId, date, lu = {}) {
  const chemin = join(D, "sources.json");
  const sources = JSON.parse(readFileSync(chemin, "utf8"));
  const source = sources.find((s) => s.id === sourceId);
  if (!source) echec(`la source « ${sourceId} » n'existe pas dans sources.json : la créer à la main d'abord.`);
  Object.assign(source, lu, { date_consultation: date });
  writeFileSync(chemin, JSON.stringify(sources, null, 2) + "\n");
}
