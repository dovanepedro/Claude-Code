# REPÈRE

Comprendre ce qui se passe en France, et qui a le pouvoir d'y changer quelque chose.

La définition du produit est dans **[CADRAGE.md](CADRAGE.md)**. Les sources restant à
vérifier sont dans **[PISTES.md](PISTES.md)**.

## Travailler dessus

```sh
npm run verifier    # contrôle les données
npm run construire  # contrôle puis génère le site dans dist/
```

Aucune dépendance à installer. Node 18 ou plus suffit.

## Comment c'est rangé

```
donnees/
  nomenclature.json        les thèmes ne sont pas choisis : ils sont repris de la CFAP
  themes.json              la liste des thèmes et leur rattachement
  sources.json             le registre des sources, avec date de consultation
  corrections.json         le journal public des corrections
  themes/<theme>/
    indicateurs.json       les chiffres — jamais rédigés, toujours importés
    pouvoirs.json          qui peut décider quoi
    positions.json         citations exactes, avec source et date
    precedents.json        ce qui a déjà été tenté ailleurs
    evaluations.json       les chiffrages produits par d'autres
    carte.json             les valeurs territoriales
scripts/
  verifier.mjs             les règles du projet, en code
  construire.mjs           génération du site statique
```

## La règle qui tient tout le reste

`verifier.mjs` refuse, et empêche la construction du site :

- une valeur sans source identifiée ;
- une valeur sans unité, sans période ou sans définition retenue — plusieurs définitions
  officielles coexistent souvent pour un même sujet ;
- une source secondaire présentée comme vérifiée ;
- une position sans citation exacte, sans date ou sans source ;
- un thème publié dont un indicateur n'a pas été vérifié à la source primaire ;
- un thème publié dont l'intitulé repris de la nomenclature n'a pas été confirmé ;
- toute clé d'appréciation — `score`, `credibilite`, `faisabilite`, `classement`… REPÈRE
  ne note, ne classe et ne recommande rien.

Si la vérification n'est plus possible, on ne publie plus. On ne publie pas moins bien.
