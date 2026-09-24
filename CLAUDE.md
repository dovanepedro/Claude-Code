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
pièges connus ; il ne contient volontairement aucun chiffre.

## Commandes

```sh
npm run verifier    # contrôle les données, sort en code 1 si une règle est violée
npm run construire  # vérifie PUIS génère le site statique dans dist/
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
scripts/
  verifier.mjs        les règles éditoriales du projet, traduites en code
  construire.mjs      génère dist/ (index, une page par thème ouvert, methode, corrections)
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
une division ou à une sous-classe. Aucun `libelle_confirme` ne vaut `true` à ce jour : les
intitulés proviennent de résultats de recherche et doivent être confirmés à la définition publiée
par l'INSEE avant toute publication. Le découpage a des absences assumées, listées dans
`absences_a_assumer` et affichées sur la page de méthode plutôt que dissimulées.

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

## État actuel

Premier jalon : le thème **énergie** complet et en ligne, **échéance 22 octobre 2026**. Il est en
`brouillon`, ses 5 indicateurs sont vides, la carte n'a pas de géométrie et `pouvoirs.json` est
rédigé mais entièrement non sourcé. `sources.json` ne contient que la source fictive de
démonstration.

L'accès réseau aux sources officielles (INSEE, Légifrance, data.gouv.fr, ODRÉ) a été bloqué
pendant la construction de l'ossature ; c'est ce qui explique que tout soit en attente de
vérification. Trois points à trancher en priorité, détaillés dans PISTES.md : les intitulés CFAP,
la licence ODRÉ, et le fait qu'un jeu de données départemental issu du réseau de distribution
montrerait une France sans nucléaire.
