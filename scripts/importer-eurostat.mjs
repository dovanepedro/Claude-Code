// Importe depuis Eurostat le prix de l'électricité pour les ménages (jeu nrg_pc_204).
//
// Même contrat que les autres imports : la valeur est recopiée telle quelle, en euros par
// kilowattheure, sans conversion. L'import s'arrête si Eurostat change le libellé d'une dimension
// (tranche de consommation, unité, taxes, devise) : on relit alors la source avant de continuer.
//
// Usage : npm run importer:eurostat   (réseau requis)

import { aujourdhui, echec, telecharger, majIndicateurs, majConsultation } from "./importer-commun.mjs";

const SOURCE_ID = "eurostat-nrg-pc-204";
const JEU = "nrg_pc_204";
const FILTRE = { geo: "FR", nrg_cons: "KWH2500-4999", tax: "I_TAX", currency: "EUR", unit: "KWH" };
const LIBELLES = {
  geo: "France",
  nrg_cons: "Consommation de 2 500 kWh à 4 999 kWh - tranche DC",
  tax: "Toutes taxes et prélèvements compris",
  currency: "Euro",
  unit: "Kilowattheure",
};

const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${JEU}?`
  + new URLSearchParams({ ...FILTRE, lang: "fr" });
const d = await telecharger(url, "json");
if (d.error) echec(`Eurostat : ${JSON.stringify(d.error)}`);

for (const [dimension, attendu] of Object.entries(LIBELLES)) {
  const lu = Object.values(d.dimension?.[dimension]?.category?.label ?? {});
  if (lu.length !== 1 || lu[0] !== attendu) echec(`dimension ${dimension} : « ${lu.join(" / ")} » au lieu de « ${attendu} ».`);
}
if (d.id.some((dim, i) => dim !== "time" && d.size[i] !== 1)) echec("la requête renvoie plusieurs séries au lieu d'une.");

// Dernier semestre publié. Une période sans valeur reste sans valeur : on ne remonte pas en silence.
const temps = d.dimension.time.category.index;
const periodes = Object.keys(temps).sort((a, b) => temps[a] - temps[b]);
const derniere = periodes.at(-1);
const valeur = d.value[temps[derniere]];
if (typeof valeur !== "number") echec(`pas de valeur publiée pour ${derniere}, dernière période du jeu.`);
const drapeau = d.status?.[temps[derniere]];

const m = derniere.match(/^(\d{4})-S([12])$/);
if (!m) echec(`période « ${derniere} » inattendue (semestre attendu).`);
const periode = `${m[2] === "1" ? "1er" : "2e"} semestre ${m[1]}`;

const date = aujourdhui();
majIndicateurs("energie", {
  "energie-prix-electricite-menages": {
    unite: "€/kWh",
    valeur,
    periode: drapeau ? `${periode} (drapeau Eurostat « ${drapeau} »)` : periode,
    serie: { code: JEU, libelle: d.label, perimetre: LIBELLES.geo, type_donnees: `${LIBELLES.nrg_cons} ; ${LIBELLES.tax}` },
    source_id: SOURCE_ID,
    importe_le: date,
  },
});
majConsultation(SOURCE_ID, date, { date_publication: d.updated?.slice(0, 10) ?? null });

console.log(`✓ Eurostat ${JEU} : ${periode}, ${valeur} €/kWh${drapeau ? ` (drapeau « ${drapeau} »)` : ""}. Jeu mis à jour le ${d.updated?.slice(0, 10)}.`);
