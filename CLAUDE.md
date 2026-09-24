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
pièges connus ; il ne contient volontairement aucun chiffre. [ARBITRAGES.md](ARBITRAGES.md) liste
les décisions éditoriales qui attendent l'auteur, avec les options lues à la source : ne pas les
trancher à sa place.

## Commandes

```sh
npm run verifier    # contrôle les données, sort en code 1 si une règle est violée
npm run construire  # vérifie PUIS génère le site statique dans dist/
npm run importer:odre  # réimporte la carte énergie depuis ODRÉ (réseau requis)
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
- **Un chiffre entre par un script d'import, jamais à la main.** Modèle : `importer-odre.mjs`.
  Il recopie sans calcul ni conversion, garde `null` pour une absence, s'arrête si le producteur
  change ses champs ou ses unités, ne possède que les champs de données (titre, note et
  `a_verifier` rédigés à la main sont conservés), et un réimport doit être identique au bit près.
- Les résumés de moteurs de recherche ne sont jamais une source : un chiffre se lit dans le
  document du producteur. Le 24/09/2026, un tel résumé a nommé « consommation d'énergie » ce qui
  n'en était qu'une des définitions.

## État actuel

Premier jalon : le thème **énergie** complet et en ligne, **échéance 22 octobre 2026**. Il est en
`brouillon`. Au 24/09/2026 :

- **Carte : faite.** Production d'électricité 2025 par région et par filière, importée d'ODRÉ
  (Licence Ouverte), contrôlée par le vérificateur, rendue en six petites cartes et un tableau.
  Un point reste ouvert : 2025 est vraisemblablement consolidée, pas définitive.
- **Nomenclature : confirmée** à l'INSEE ; elle ne bloque plus la publication.
- **Indicateurs : vides**, en attente des arbitrages de l'auteur (ARBITRAGES.md). Chaque indicateur
  retenu recevra son script d'import.
- **`pouvoirs.json` : rédigé, non sourcé.** Les articles à lire sont dans PISTES.md. Attention :
  le vérificateur ne contrôle pas encore les sources des pouvoirs ; ajouter la règle en les
  sourçant.
- Positions, précédents et évaluations : pas commencés.

Ce qui bloque encore la publication, d'après le vérificateur : les cinq indicateurs et le point à
vérifier de la carte.

Réseau depuis cet environnement : ouvert, sauf Légifrance (403), onpe.org et ademe.fr
(anti-robots), l'API d'Eurostat (en maintenance le 24/09) et data.gouv.fr (coupures).
