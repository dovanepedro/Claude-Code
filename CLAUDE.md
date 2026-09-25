# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

*(Le dépôt est entièrement en français : données, interface, commentaires de code et messages
de commit. Ce fichier l'est aussi, pour rester lisible par son auteur.)*

## Le produit

REPÈRE expose, thème par thème, l'état chiffré de la France et **qui a le pouvoir de décider**
sur ce thème. Il ne note rien, ne classe rien, ne recommande rien et ne produit aucun chiffrage
propre.

**[CADRAGE.md](CADRAGE.md) fait autorité sur le périmètre du produit** et remplace explicitement
tous les documents antérieurs (rapport NOVA, dossier pilote Logement, carnet de chantier). Le lire
avant toute décision de contenu. [PISTES.md](PISTES.md) liste les sources restant à ouvrir et les
pièges connus ; il ne contient volontairement aucun chiffre. [ARBITRAGES.md](ARBITRAGES.md) est le
journal des décisions éditoriales : ce que l'auteur a tranché, et ce qui l'attend encore. Ne jamais
trancher à sa place ; une décision nouvelle s'y inscrit avant d'être appliquée.

## Commandes

```sh
npm run verifier    # contrôle les données, sort en code 1 si une règle est violée
npm run construire  # vérifie PUIS génère le site statique dans dist/
npm run importer    # relance tous les imports (réseau requis) ; un par source :
npm run importer:odre      # carte énergie (ODRÉ)
npm run importer:sdes      # consommation finale, indépendance, production par filière (SDES)
npm run importer:eurostat  # prix de l'électricité pour les ménages (Eurostat)
```

Aucune dépendance, aucun `npm install`. Node 18+ ; scripts `.mjs` natifs.

**Il n'y a pas de suite de tests, et c'est volontaire :** `verifier.mjs` joue ce rôle. Pour
l'exercer, casser délibérément une donnée (retirer un `source_id` d'un indicateur renseigné,
ajouter une clé `score`, passer un thème à `publie`) et vérifier que la sortie est non nulle,
puis annuler. Il n'existe pas d'option pour ne vérifier qu'un seul thème : le script parcourt
tout, c'est rapide.

## Architecture

Générateur statique sans base de données. **Chaque chiffre vit dans un fichier JSON versionné,
avec sa source et sa date** — c'est la réponse toute prête le jour où un chiffre est contesté, et
la raison pour laquelle une IA ne peut pas en inventer un : les valeurs sont importées dans des
fichiers de données, jamais rédigées dans de la prose générée.

```
donnees/
  nomenclature.json   les divisions CFAP/COFOG ; les thèmes ne sont pas choisis, ils en sont repris
  themes.json         liste des thèmes, statut, ordre, rattachement à la nomenclature
  sources.json        registre unique des sources ; tout source_id doit y exister
  corrections.json    journal public des corrections
  themes/<id>/        indicateurs · pouvoirs · positions · precedents · evaluations · carte
  geometries/         contours partagés entre thèmes (regions.json, repris d'ODRÉ)
scripts/
  verifier.mjs        les règles éditoriales du projet, traduites en code
  construire.mjs      génère dist/ (index, une page par thème ouvert, methode, corrections)
  carte.mjs           rendu SVG des cartes (Lambert-93, une petite carte par série, sans JS)
  importer-*.mjs      un script par source importée ; seul chemin d'entrée d'un chiffre
  importer-commun.mjs ce qu'un import possède dans un indicateur, et ce qu'il ne touche jamais
  lire-xlsx.mjs       lecture des classeurs Excel des producteurs, sans dépendance
site/style.css        recopié tel quel dans dist/
```

`dist/` est généré et ignoré par git ; ne jamais l'éditer à la main.

### `verifier.mjs` est le garde-fou, pas un linter

C'est le fichier le plus important du dépôt. Il fait échouer la construction, et **ses règles ne
se contournent pas : si une donnée ne passe pas, c'est la donnée qui change, jamais la règle.**
Assouplir un contrôle revient à supprimer la garantie du produit, ce qui ne se fait qu'avec un
accord explicite de l'auteur.

Il refuse notamment :

- une valeur renseignée sans `source_id`, sans `unite`, sans `periode`, ou dont
  `definition_retenue` est vide ou encore marqué `À RENSEIGNER` — plusieurs définitions
  officielles concurrentes coexistent sur la plupart des sujets, celle retenue doit être nommée ;
- `verifie: true` sur une source de type `secondaire` ;
- une position sans `verbatim`, sans `date_position` ou sans source ;
- un thème `publie` qui n'a pas exactement 5 indicateurs, tous `verifie`, ou dont l'intitulé
  de nomenclature n'est pas confirmé à la source officielle ;
- une carte dont les valeurs n'ont pas de source, d'unité, d'année ou de contour, dont une valeur
  n'est ni un nombre ni `null` déclaré, ou qui garde un `a_verifier` sur un thème `publie` ;
- une `decomposition` sans le total publié par le producteur en `valeur`, ou dont une part n'a pas
  de libellé ou n'est ni un nombre ni `null` : REPÈRE n'additionne jamais ;
- **toute clé d'appréciation**, cherchée récursivement dans toutes les données :
  `score`, `notation`, `credibilite`, `faisabilite`, `affinite`, `recommandation`,
  `classement`, `rang`, `match`, `compatibilite`. Ne pas introduire de champ voisin par
  contournement — c'est l'interdit central du produit.

### Cycle de vie d'un thème

`a_venir` (annoncé, aucune page générée, aucun fichier requis) → `brouillon` → `a_relire` →
`publie`. Le statut `demonstration` est réservé à `_demonstration`, qui existe pour faire tourner
le gabarit avec des valeurs **manifestement** fausses (999, « unités fictives », source
`https://example.invalid/`) et échappe aux contrôles de nomenclature.

Passer un thème à `publie` est un acte, pas une formalité : le vérificateur exige alors que tout
soit sourcé et vérifié à la source primaire.

### Nomenclature

Les thèmes sont rattachés à la CFAP (COFOG des Nations unies, reprise par Eurostat et l'INSEE), à
une division ou à une sous-classe. Codes et intitulés sont confirmés au tableau 3.301 des comptes
de la Nation (source `insee-cn2024-tableau-3301`). L'INSEE formule deux divisions autrement sur
sa page de définition : les deux versions sont dans `variante_connue` et affichées sur la page de
méthode. Le découpage a des absences assumées, listées dans `absences_a_assumer` et affichées sur
la page de méthode plutôt que dissimulées.

## Conventions

- **Identifiants et champs en français** (`ce_qui_releve`, `date_position`, `verifie`), interface
  en français, messages de commit en français à l'impératif.
- **Ordre alphabétique imposé** sur les positions dans `construire.mjs` : jamais un ordre lié à la
  notoriété ou aux sondages. Les thèmes suivent leur champ `ordre`.
- **Une absence s'affiche, elle ne se comble pas.** Un champ vide produit « à renseigner » ou
  « Aucune position renseignée à ce jour » — ne jamais déduire une valeur manquante.
- Tout texte inséré dans une page passe par `ech()` ; pas de bibliothèque de gabarits.
- Accessibilité et mobile font partie du rendu, pas d'une passe ultérieure : lien d'évitement,
  `aria-current`, tableaux sémantiques qui s'effondrent sous 560 px, thème sombre via
  `prefers-color-scheme` protégé par `:root:not([data-theme="light"])`.
- Un fait non encore lu à la source se consigne dans un champ `a_verifier` ou une `note`, à côté
  d'un `source_id: null`. C'est le motif utilisé partout dans `energie/` : écrire ce qui est
  structurellement durable, marquer le reste comme à lire.
- **Un chiffre entre par un script d'import, jamais à la main.** Modèles : `importer-odre.mjs`
  pour une carte, `importer-sdes.mjs` pour des indicateurs. Un import recopie sans calcul ni
  conversion, garde `null` pour une absence, contrôle ce que le producteur dit de chaque série
  (libellé, unité, périmètre) et s'arrête au moindre changement, ne possède que les champs de
  données (nom, définition retenue, `decimales`, `verifie`, notes restent rédigés à la main), et
  un réimport le même jour doit être identique au bit près.
- Les trois règles adoptées par l'auteur le 25/09/2026 (détail dans ARBITRAGES.md) : REPÈRE ne
  dérive aucun chiffre (ni somme, ni différence, ni ratio) ; quand un producteur publie plusieurs
  variantes, on reprend celle qu'il désigne comme sa référence ; une unité incomplète vaut une
  unité absente. Arrondir pour afficher n'est pas calculer : la valeur complète reste dans le
  fichier de données.
- `verifie: true` est posé par l'auteur, après avoir ouvert la source et retrouvé le chiffre :
  c'est la vérification que le cadrage ne délègue pas. Un import ne le pose jamais.
- Les résumés de moteurs de recherche ne sont jamais une source : un chiffre se lit dans le
  document du producteur. Le 24/09/2026, un tel résumé a nommé « consommation d'énergie » ce qui
  n'en était qu'une des définitions.

## État actuel

Premier jalon : le thème **énergie** complet et en ligne, **échéance 22 octobre 2026**. Il est en
`brouillon`. Au 25/09/2026 :

- **Carte : faite**, données 2025 consolidées affichées comme telles (décision 0).
- **Indicateurs : quatre sur cinq importés** (prix, production par filière, consommation finale,
  indépendance), marqués non vérifiés en attendant le contrôle de l'auteur.
- **Précarité : bloquée** sur une question de méthode posée à l'auteur (ARBITRAGES.md) : le seul
  document source est un PDF du ministère, sans fichier de données.
- **Nomenclature confirmée** ; les pages de thème prennent l'intitulé officiel pour titre.
- **`pouvoirs.json` : rédigé, non sourcé.** Articles à lire dans PISTES.md. Le vérificateur ne
  contrôle pas encore ses sources : ajouter la règle en les sourçant.
- Positions, précédents et évaluations : pas commencés.

Ce qui bloque la publication, d'après le vérificateur : la vérification des quatre indicateurs par
l'auteur et le taux de précarité.

Mises à jour attendues : données 2025 définitives de la carte au second semestre 2026 (réimport,
révisions au journal des corrections) ; prix Eurostat chaque semestre ; bilan définitif 2025 du
SDES l'an prochain (changer l'édition dans `importer-sdes.mjs`) ; tableaux INSEE par fonction du
millésime 2025 en décembre 2026 (relire les intitulés de la nomenclature).

Réseau depuis cet environnement : ouvert, sauf Légifrance (403), onpe.org et ademe.fr
(anti-robots) et data.gouv.fr (coupures). L'API d'Eurostat, en maintenance le 24/09, répond.
