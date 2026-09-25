// Importe depuis le bilan énergétique du SDES trois indicateurs du thème énergie : la consommation
// finale d'énergie, le taux d'indépendance énergétique et la production d'électricité par filière.
//
// Même contrat que importer-odre.mjs : les valeurs sont recopiées sans calcul ni conversion, et
// l'import s'arrête si le producteur change le libellé, l'unité, le périmètre ou le type d'une série.
// Aucune somme n'est affichée : le total de la production est celui que publie le SDES. La somme des
// filières ne sert qu'à contrôler que la répartition est complète.
//
// Usage : npm run importer:sdes   (réseau requis)

import { lireClasseur } from "./lire-xlsx.mjs";
import { aujourdhui, echec, telecharger, majIndicateurs, majConsultation } from "./importer-commun.mjs";

// Édition lue. À remplacer à la parution du bilan définitif de 2025, puis de chaque bilan suivant.
const SOURCE_ID = "sdes-bilan-2025-provisoire";
const FICHIER = "https://www.statistiques.developpement-durable.gouv.fr/media/9283/download?inline";
const STATUT = "données provisoires";

// Chaque série est décrite par ce qu'en dit le producteur : [libellé, unité, périmètre, type de données].
const S = (libelle, unite, perimetre, type) => ({ libelle, unite, perimetre, type });
const SERIES = {
  SY020TFC: S("Consommation finale à usage énergétique, toutes énergies confondues", "TWh", "France", "CVC"),
  "SY027%FR": S("Taux d'indépendance énergétique", "%", "France", "Réelles"),
  EL019TMR: S("Production nette d'électricité", "TWh", "Métropole", "Réelles"),
};
// Filières dont la somme fait le total EL019TMR, dans l'ordre des codes du producteur. L'hydraulique y
// compte les stations de pompage : c'est la convention qui fait tomber la somme juste.
const FILIERES = {
  EL020TMR: "Production nette d'électricité nucléaire",
  EL021TMR: "Production nette d'électricité hydraulique (y compris pompages)",
  EL023TMR: "Production nette d'électricité géothermique",
  EL024TMR: "Production nette d'électricité solaire photovoltaïque",
  EL025TMR: "Production nette d'électricité issue des énergies marines",
  EL026TMR: "Production nette d'électricité éolienne",
  EL027TMR: "Production nette d'électricité des centrales thermiques classiques",
  EL028TMR: "Production nette d'électricité par procédés chimiques",
  EL029TMR: "Production nette d'électricité, autres sources",
};
for (const [code, libelle] of Object.entries(FILIERES)) SERIES[code] = S(libelle, "TWh", "Métropole", "Réelles");

const [feuille] = lireClasseur(await telecharger(FICHIER));
const [entete, ...lignes] = feuille.lignes;
const col = (nom) => {
  const i = entete.indexOf(nom);
  if (i < 0) echec(`colonne « ${nom} » introuvable : la structure du fichier a changé.`);
  return i;
};
const [cCode, cLib, cUnite, cGeo, cType] = ["CODTOT", "LIBSERIE", "UNITE", "NIVGEO", "TYPDONNEE"].map(col);
const annee = entete.filter((h) => /^\d{4}$/.test(h)).sort().at(-1);
const cAnnee = col(annee);

const lues = {};
for (const [code, attendu] of Object.entries(SERIES)) {
  const trouvees = lignes.filter((l) => l[cCode] === code);
  if (trouvees.length !== 1) echec(`série ${code} présente ${trouvees.length} fois au lieu d'une.`);
  const l = trouvees[0];
  const lu = S(l[cLib], l[cUnite], l[cGeo], l[cType]);
  for (const k of Object.keys(attendu))
    if (lu[k] !== attendu[k]) echec(`série ${code} : ${k} « ${lu[k]} » au lieu de « ${attendu[k]} ».`);
  const valeur = Number(l[cAnnee]);
  if (l[cAnnee] === undefined || !Number.isFinite(valeur)) echec(`série ${code} : pas de valeur numérique pour ${annee}.`);
  lues[code] = { ...lu, code, valeur };
}

const total = lues.EL019TMR.valeur;
const somme = Object.keys(FILIERES).reduce((s, code) => s + lues[code].valeur, 0);
if (Math.abs(somme - total) > 1e-9 * total)
  echec(`les filières font ${somme} TWh pour un total publié de ${total} TWh : la répartition n'est plus complète.`);

const serie = ({ code, libelle, perimetre, type }) => ({ code, libelle, perimetre, type_donnees: type });
const date = aujourdhui();
const commun = (s) => ({ unite: s.unite, valeur: s.valeur, periode: `${annee} (${STATUT})`, serie: serie(s), source_id: SOURCE_ID, importe_le: date });

majIndicateurs("energie", {
  "energie-consommation-finale": commun(lues.SY020TFC),
  "energie-independance": commun(lues["SY027%FR"]),
  "energie-mix-electrique": {
    ...commun(lues.EL019TMR),
    libelle_valeur: lues.EL019TMR.libelle,
    decomposition: Object.keys(FILIERES).map((code) => ({ code, libelle: lues[code].libelle, valeur: lues[code].valeur })),
  },
});
majConsultation(SOURCE_ID, date);

console.log(`✓ Bilan énergétique du SDES, ${annee} (${STATUT}) : 3 indicateurs, ${Object.keys(FILIERES).length} filières dont la somme égale le total publié.`);
