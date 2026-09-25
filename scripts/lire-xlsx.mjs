// Lecture minimale d'un classeur .xlsx, sans dépendance : un .xlsx est une archive zip de fichiers XML.
// Ne sert qu'aux scripts d'import. Chaque cellule est rendue telle qu'écrite dans le fichier, en texte :
// c'est à l'appelant de convertir un nombre, et de refuser ce qui ne l'est pas.

import { inflateRawSync } from "node:zlib";

// Répertoire central de l'archive : nom de fichier → contenu décompressé.
function lireZip(tampon) {
  let fin = tampon.length - 22;
  while (fin >= 0 && tampon.readUInt32LE(fin) !== 0x06054b50) fin--;
  if (fin < 0) throw new Error("archive zip illisible : fin de répertoire introuvable");
  const nombre = tampon.readUInt16LE(fin + 10);
  let pos = tampon.readUInt32LE(fin + 16);
  const fichiers = new Map();
  for (let i = 0; i < nombre; i++) {
    if (tampon.readUInt32LE(pos) !== 0x02014b50) throw new Error("archive zip corrompue");
    const methode = tampon.readUInt16LE(pos + 10);
    const taille = tampon.readUInt32LE(pos + 20);
    const [lNom, lExtra, lCommentaire] = [28, 30, 32].map((d) => tampon.readUInt16LE(pos + d));
    const entete = tampon.readUInt32LE(pos + 42);
    const nom = tampon.toString("utf8", pos + 46, pos + 46 + lNom);
    const debut = entete + 30 + tampon.readUInt16LE(entete + 26) + tampon.readUInt16LE(entete + 28);
    const brut = tampon.subarray(debut, debut + taille);
    if (methode !== 0 && methode !== 8) throw new Error(`compression zip non prise en charge (${methode}) pour ${nom}`);
    fichiers.set(nom, () => (methode === 0 ? brut : inflateRawSync(brut)).toString("utf8"));
    pos += 46 + lNom + lExtra + lCommentaire;
  }
  return fichiers;
}

const ENTITES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const texte = (xml) => xml.replace(/<[^>]+>/g, "").replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) =>
  e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENTITES[e] ?? m);

function colonne(ref) {
  let n = 0;
  for (const c of ref.match(/^[A-Z]+/)[0]) n = n * 26 + c.charCodeAt(0) - 64;
  return n - 1;
}

// Renvoie les feuilles dans l'ordre du classeur : [{ nom, lignes }], chaque ligne étant un tableau
// indexé par numéro de colonne (A = 0), les cellules vides restant undefined.
export function lireClasseur(tampon) {
  const zip = lireZip(tampon);
  const lire = (nom) => {
    const f = zip.get(nom);
    if (!f) throw new Error(`classeur incomplet : ${nom} manquant`);
    return f();
  };
  const partagees = zip.has("xl/sharedStrings.xml")
    ? [...lire("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => texte(m[1]))
    : [];
  const cibles = new Map([...lire("xl/_rels/workbook.xml.rels").matchAll(/<Relationship\b[^>]*>/g)].map(([balise]) =>
    [balise.match(/Id="([^"]+)"/)[1], balise.match(/Target="([^"]+)"/)[1]]));
  return [...lire("xl/workbook.xml").matchAll(/<sheet\b[^>]*>/g)].map(([balise]) => {
    const cible = cibles.get(balise.match(/r:id="([^"]+)"/)[1]).replace(/^\//, "");
    const lignes = [];
    for (const [, ligne] of lire(cible.startsWith("xl/") ? cible : `xl/${cible}`).matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
      const cellules = [];
      for (const [, attributs, contenu = ""] of ligne.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const type = attributs.match(/\bt="([^"]+)"/)?.[1];
        const v = contenu.match(/<v>([\s\S]*?)<\/v>/)?.[1];
        const valeur = type === "s" ? partagees[Number(v)]
          : type === "inlineStr" ? texte(contenu.match(/<is>([\s\S]*?)<\/is>/)?.[1] ?? "")
          : v === undefined ? undefined : texte(v);
        const ref = attributs.match(/\br="([A-Z]+)\d+"/)?.[1];
        if (valeur !== undefined) cellules[ref ? colonne(ref) : cellules.length] = valeur;
      }
      lignes.push(cellules);
    }
    return { nom: texte(balise.match(/name="([^"]+)"/)[1]), lignes };
  });
}
