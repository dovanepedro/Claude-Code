// Rendu de la carte d'un thème : une petite carte par série, puis le tableau de toutes les valeurs.
//
// Choix de rendu, et pourquoi :
// - une carte par série plutôt qu'une carte unique : aucune série n'est mise en avant ;
// - une échelle continue de 0 au maximum de la série, sans classes : un découpage en classes
//   serait un choix de seuils, donc un choix éditorial ;
// - une rampe sans couleur (l'encre du site) : une carte des régions en bleu, rouge ou vert
//   se lit comme une carte électorale ;
// - une valeur absente est hachurée, jamais peinte comme un zéro ;
// - le tableau reprend chaque valeur : la carte n'est jamais le seul accès à un chiffre.
// Aucun JavaScript côté navigateur : SVG statique, contours définis une fois et réutilisés.

// Projection conique conforme de Lambert, paramètres de Lambert-93 (projection officielle en France
// métropolitaine), en version sphérique : largement suffisante pour un dessin.
const RAD = Math.PI / 180;
const [PHI1, PHI2, PHI0, LAMBDA0] = [44 * RAD, 49 * RAD, 46.5 * RAD, 3 * RAD];
const tg = (phi) => Math.tan(Math.PI / 4 + phi / 2);
const N = Math.log(Math.cos(PHI1) / Math.cos(PHI2)) / Math.log(tg(PHI2) / tg(PHI1));
const F = (Math.cos(PHI1) * tg(PHI1) ** N) / N;
const RHO0 = F / tg(PHI0) ** N;

function projeter([lon, lat]) {
  const rho = F / tg(lat * RAD) ** N;
  const theta = N * (lon * RAD - LAMBDA0);
  return [rho * Math.sin(theta), RHO0 - rho * Math.cos(theta)];
}

const LARGEUR = 1000;
const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

function polygones(forme) {
  return forme.type === "Polygon" ? [forme.coordinates] : forme.coordinates;
}

// Contours projetés, ramenés à une boîte de LARGEUR unités, arrondis à l'unité pour alléger la page.
function tracer(contours) {
  const projetes = Object.entries(contours).map(([code, r]) => [code, polygones(r).map((p) => p.map((anneau) => anneau.map(projeter)))]);
  const points = projetes.flatMap(([, ps]) => ps.flat(2));
  const [xmin, xmax] = [Math.min(...points.map((p) => p[0])), Math.max(...points.map((p) => p[0]))];
  const [ymin, ymax] = [Math.min(...points.map((p) => p[1])), Math.max(...points.map((p) => p[1]))];
  const k = LARGEUR / (xmax - xmin);
  const chemins = new Map(projetes.map(([code, ps]) => [code, ps.flat().map((anneau) => {
    const pts = anneau.map(([x, y]) => [Math.round((x - xmin) * k), Math.round((ymax - y) * k)])
      .filter((p, i, t) => i === 0 || p[0] !== t[i - 1][0] || p[1] !== t[i - 1][1]);
    return `M${pts.map((p) => p.join(" ")).join("L")}Z`;
  }).join("")]));
  return { chemins, hauteur: Math.round((ymax - ymin) * k) };
}

export function rendreCarte({ carte, contours, ech, citation }) {
  const { chemins, hauteur } = tracer(contours);
  const defs = `<svg class="carte-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
${[...chemins].map(([code, d]) => `<path id="region-${ech(code)}" d="${d}" fill-rule="evenodd" vector-effect="non-scaling-stroke"/>`).join("\n")}
<pattern id="hachures" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="26" class="hachure"/></pattern>
</defs></svg>`;

  const figures = carte.series.map(({ champ, libelle }) => {
    const connues = carte.valeurs.map((v) => v[champ]).filter((x) => x !== null);
    if (connues.some((x) => x < 0)) throw new Error(`Carte : valeur négative dans « ${champ} », rendu impossible sans la déformer.`);
    const max = Math.max(0, ...connues);
    const absentes = carte.valeurs.some((v) => v[champ] === null);
    const regions = carte.valeurs.map((v) => {
      const x = v[champ];
      if (x === null) return `<use href="#region-${ech(v.code_insee_region)}" class="sans-valeur"><title>${ech(v.region)} : valeur non publiée par le producteur</title></use>`;
      const part = max > 0 ? Math.round((x / max) * 1000) / 10 : 0;
      return `<use href="#region-${ech(v.code_insee_region)}" style="fill:color-mix(in oklab,var(--carte-fort) ${part}%,var(--carte-faible))"><title>${ech(v.region)} : ${ech(nombre.format(x))} ${ech(carte.unite)}</title></use>`;
    }).join("");
    return `<figure class="petite-carte">
<figcaption>${ech(libelle)}</figcaption>
<svg viewBox="0 0 ${LARGEUR} ${hauteur}" role="img" aria-label="${ech(`${libelle}, par région, ${carte.annee}. Chaque valeur figure dans le tableau qui suit.`)}">${regions}</svg>
<p class="echelle"><span>0</span><span class="degrade" aria-hidden="true"></span><span>${ech(nombre.format(max))}</span></p>
${absentes ? `<p class="echelle-absence"><span class="pastille-hachures" aria-hidden="true"></span>valeur non publiée</p>` : ""}
</figure>`;
  }).join("");

  const tableau = `<table class="tableau-carte">
<caption>${ech(carte.titre)} — ${ech(carte.annee)}, en ${ech(carte.unite)}. Régions dans l'ordre de leur code officiel.</caption>
<thead><tr><th scope="col">Région</th>${carte.series.map((s) => `<th scope="col">${ech(s.libelle)}</th>`).join("")}</tr></thead>
<tbody>${carte.valeurs.map((v) => `<tr><th scope="row">${ech(v.region)}</th>${carte.series.map((s) => `<td data-serie="${ech(s.libelle)}">${v[s.champ] === null ? `<span class="manque">non publiée</span>` : ech(nombre.format(v[s.champ]))}</td>`).join("")}</tr>`).join("")}</tbody>
</table>`;

  return `<p>${ech(carte.titre)}, ${ech(carte.annee)}, en ${ech(carte.unite)}. ${ech(carte.perimetre ?? "")}</p>
<p class="source">Source : ${citation(carte.source_id)}.</p>
${carte.statut_donnees ? `<p class="note">${ech(carte.statut_donnees)}</p>` : ""}
${defs}
<p class="consigne">Chaque carte a sa propre échelle, de 0 au maximum de sa filière : une même teinte ne représente pas la même quantité d'une carte à l'autre. Pour comparer les filières entre elles, lire le tableau.</p>
<div class="cartes">${figures}</div>
${carte.note ? `<p class="note">${ech(carte.note)}</p>` : ""}
${carte.a_verifier ? `<p class="drapeau">À vérifier avant publication : ${ech(carte.a_verifier)}</p>` : ""}
${tableau}`;
}
