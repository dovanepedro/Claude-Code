# Pistes de recherche

> **Statut au 24/09/2026 : l'accès réseau est ouvert**, et les premières sources officielles ont
> été lues. Restent inaccessibles depuis l'environnement de travail : Légifrance (refus 403),
> onpe.org et ademe.fr (vérification anti-robots), l'API d'Eurostat (en maintenance ce jour-là),
> data.gouv.fr (connexions coupées par intermittence).
>
> **Aucun chiffre n'est reporté ici, volontairement.** Ce fichier ne contient que des adresses
> à ouvrir et des points à trancher. Les chiffres lus à la source, datés, sont dans
> [ARBITRAGES.md](ARBITRAGES.md), en attente des choix de l'auteur.

## Thème énergie — ce qui a été ouvert

| Question | Réponse lue à la source |
|---|---|
| Licence des données ODRÉ | Licence Ouverte v2.0 (Etalab) : mention du producteur et de la date de mise à jour. |
| Jeu « production régionale annuelle par filière » | Importé : `npm run importer:odre`. Réseaux de transport et de distribution, donc nucléaire compris ; contours des régions fournis. |
| Motif d'export de l'API Opendatasoft v2.1 | `/api/explore/v2.1/catalog/datasets/<slug>/exports/json` |
| Statut définitif ou consolidé d'une année | Fiche `eco2mix-national-cons-def` : définitive au second semestre de l'année suivante. |
| Prix de l'électricité, série européenne | Repris par le SDES dans « Conjoncture mensuelle de l'énergie » (API DiDo), avec une unité incomplète. API Eurostat à relire. |
| Dispositif qui succède à l'ARENH | La délibération CRE n° 2026-147 confirme la fin de l'ARENH au 31/12/2025, sans décrire ce qui lui succède. **À lire.** |
| Coût des mesures contre la hausse des prix | Pas encore ouvert : Cour des comptes et CRE. |

### Le risque numéro un de la carte est écarté

La carte montrerait une France sans nucléaire si elle reposait sur les jeux d'Enedis, qui ne
couvrent que la distribution. Le jeu régional d'ODRÉ couvre les deux réseaux, et ses totaux 2025
concordent avec le bilan électrique national de RTE.

### Le vrai risque du thème : les définitions, pas les chiffres

Confirmé à la lecture, et pire que prévu sur la précarité : un même producteur publie cinq
valeurs pour la même année selon les aides qu'il compte. Détail et recommandations dans
[ARBITRAGES.md](ARBITRAGES.md).

## « Qui décide » — pistes pour sourcer `pouvoirs.json`

La délibération CRE n° 2026-147 du 15/07/2026 (tarifs réglementés au 1ᵉʳ août 2026) cite les
articles qui organisent le pouvoir sur le prix, et donne donc les textes à lire :

- **L. 337-4** du code de l'énergie : la CRE propose les tarifs réglementés aux ministres de
  l'énergie et de l'économie. Le mécanisme exact d'adoption reste à lire dans l'article.
- **L. 337-6** : niveau fixé « par empilement des coûts ».
- **R. 337-20-2** : les ministres adressent à la CRE des orientations de politique énergétique
  (courrier du 9 juillet 2026, publié avec la délibération).
- **L. 337-7** et **L. 337-8** : qui a droit au tarif réglementé, en métropole continentale et
  dans les zones non interconnectées.
- **Article 19 de la loi de finances pour 2025** : réforme du mécanisme de capacité.

Légifrance refuse les lecteurs automatiques. Voies à essayer : l'API Légifrance du portail PISTE
(inscription nécessaire), ou la lecture des articles par l'auteur, qui colle l'URL et la date de
version consultée.

## Positions de partis — documents publics repérés

Des textes de position publiés existent au moins pour le Parti socialiste, La France
insoumise, le Rassemblement national et Les Écologistes. Rien n'a été trouvé pour Les
Républicains ni Renaissance — recherche ciblée à refaire. Les adresses relevées n'ont pas
été ouvertes et aucune date de version n'a pu être établie.

Règle : ne citer que les documents publiés par l'organisation elle-même, et les débats
parlementaires comme source d'actes. Les comparateurs tiers portent une ligne éditoriale.

## Nomenclature des thèmes — tranché

Codes et intitulés confirmés au tableau 3.301 des comptes de la Nation (INSEE), le seul document
de l'INSEE trouvé qui donne codes, divisions et sous-classes. La page de définition de l'INSEE
formule deux divisions autrement ; les deux versions sont consignées dans `nomenclature.json`.
Les tableaux par fonction du millésime 2025 sont annoncés pour décembre 2026 : relire les
intitulés à leur sortie.
