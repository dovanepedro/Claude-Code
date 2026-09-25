# Arbitrages éditoriaux — journal des décisions

> Le cadrage réserve les décisions éditoriales à l'auteur : les déléguer reviendrait à publier
> un produit sans auteur. Ce fichier garde, pour chaque décision, les options lues à la source,
> la recommandation qui les accompagnait et ce que l'auteur a tranché. Une décision nouvelle
> s'ajoute ici avant d'être appliquée.
>
> Les chiffres cités servent à mesurer l'écart entre définitions, **pas à choisir** : une
> définition se choisit sur ses critères, jamais sur le chiffre qu'elle donne. Aucun n'est
> recopié à la main dans `donnees/` : chaque indicateur passe par un script d'import.

## Décisions du 25/09/2026

L'auteur a validé les recommandations 0 à 6 ci-dessous. Les trois règles, dont elles découlent,
sont adoptées avec elles.

| # | Décision | Appliquée |
|---|---|---|
| 0 | Carte : garder 2025, étiquetée « consolidée » | Statut affiché sous la carte ; réimport au second semestre 2026, révisions au journal des corrections. |
| 1 | Prix : enquête Eurostat, tranche DC, toutes taxes | `importer-eurostat.mjs`. La méthodologie d'Eurostat, lue le 25/09, décrit une moyenne pondérée par les parts de marché des fournisseurs. |
| 2 | Mix : répartition complète par filière | `importer-sdes.mjs`. **Ajustement** : RTE ne publie ses chiffres qu'en PDF et en images ; la répartition vient donc des séries du bilan du SDES, même territoire (métropole, Corse comprise), autre convention de comptage (total 551,1 TWh contre 547,5 chez RTE ; nucléaire identique). |
| 3 | Consommation finale corrigée du climat, si la loi confirme | Condition levée sans Légifrance : la fiche de l'INSEE sur l'indicateur 7.i2 des objectifs de développement durable (janvier 2026) cite l'article L. 100-4 mot pour mot et suit l'objectif en données corrigées des variations climatiques. `importer-sdes.mjs`. |
| 4 | Taux d'indépendance du SDES, convention nucléaire affichée | `importer-sdes.mjs`, indicateur renommé. |
| 5 | Précarité : convention de référence (10,1 % en 2023) | **En attente d'une question de méthode** (voir plus bas) : ce chiffre n'est publié que dans un PDF. |
| 6 | Titre de page officiel, nom court en navigation | Le titre d'une page de thème reprend l'intitulé confirmé de la nomenclature. |

### Question ouverte : un chiffre publié seulement en PDF

La source primaire du taux de précarité est une publication du ministère de la Transition
écologique (CGDD, *La précarité énergétique en 2023*, juin 2025), en PDF. Aucun fichier de
données associé n'a été trouvé. Le cadrage veut des chiffres qui arrivent « par un tuyau de
données, jamais rédigés » : un relevé à la main enfreindrait la règle, et l'assouplir revient à
l'auteur.

| Option | Ce que cela implique |
|---|---|
| **A. Relevé tracé** (recommandé) | Le chiffre est accompagné de la phrase exacte du document qui le contient, de sa page et de son adresse ; le vérificateur exige que la valeur figure dans cette phrase, et la page signale un chiffre relevé dans un document plutôt qu'importé. C'est le mécanisme déjà appliqué aux positions des partis. Exception réservée aux sources publiées seulement en document. |
| **B. Extraction automatique du PDF** | Un script lit le PDF et y cherche la phrase. Il faut une bibliothèque de lecture de PDF (une dépendance) ou environ deux cents lignes de code fragiles, qui casseront au premier changement de mise en page. |
| **C. Changer d'indicateur** | Eurostat publie par API la part des ménages qui ne peuvent pas chauffer convenablement leur logement. Importable, mais c'est un autre concept (déclaratif), et cela revient sur la décision 5. |
| **D. Attendre un fichier de données** | Le thème ne peut pas être publié sans ses cinq indicateurs : le jalon du 22 octobre glisse. |

**Recommandation : A.** Elle garde ce que la règle protège — aucun nombre ne sort d'un texte
généré, et chacun se conteste en une minute, source ouverte à la bonne page — sans ajouter de
code fragile.

### À vérifier par l'auteur

Les quatre valeurs importées restent marquées « non vérifiées » : c'est l'acte que le cadrage ne
délègue pas. Pour chacune, ouvrir la source et retrouver le chiffre affiché.

| Indicateur | Affiché | Où le retrouver |
|---|---|---|
| Prix de l'électricité | 0,2561 €/kWh, 2ᵉ semestre 2025 | Eurostat, jeu `nrg_pc_204`, France, tranche DC, toutes taxes |
| Production par filière | 551,1 TWh, dont nucléaire 373,0 | SDES, séries longues du bilan 2025 provisoire, lignes `EL019TMR` à `EL029TMR`, colonne 2025 |
| Consommation finale | 1 533 TWh | Même fichier, ligne `SY020TFC`, colonne 2025 |
| Indépendance énergétique | 62,7 % | Même fichier, ligne `SY027%FR` ; le même chiffre figure dans la synthèse du bilan |

Une fois vérifiées, passer `verifie` à `true` dans `donnees/themes/energie/indicateurs.json`, ou
le demander.

## Les trois règles

Elles tranchent d'avance la moitié des cas ci-dessous, et remplacent un jugement par une règle
citable, dans l'esprit du cadrage.

1. **REPÈRE ne dérive aucun chiffre.** Ni somme de mois, ni somme de régions, ni « 100 moins
   x », ni ratio. Si le chiffre voulu n'est pas publié tel quel, on change de chiffre.
2. **Quand un producteur publie plusieurs variantes d'un même indicateur, REPÈRE reprend celle
   qu'il désigne lui-même comme sa référence**, et nomme les autres dans la définition retenue.
3. **Une unité incomplète vaut une unité absente.** « euros TTC » sans quantité de référence ne
   passe pas, même quand l'ordre de grandeur rend la réponse évidente.

---

## 0. La carte : année 2025 consolidée ou 2024 définitive ?

La fiche du jeu régional parle de production « définitive ». Mais la fiche éCO2mix du même
producteur (`eco2mix-national-cons-def`, sur ODRÉ) précise qu'une année ne devient définitive
qu'au second semestre de l'année suivante, et ne déclare définitives que les données de
janvier 2012 à décembre 2024. Les valeurs 2025 de la carte, chargées le 17/02/2026, sont donc
vraisemblablement consolidées.

Contrôle de cohérence : la somme des 13 régions pour 2025 (547,4 TWh) et celle du nucléaire
(373,0 TWh) concordent avec le bilan électrique 2025 de RTE (547,5 et 373,0 TWh en France
métropolitaine). Le périmètre de RTE inclut donc la Corse, comme la carte.

| Option | Conséquence |
|---|---|
| **A.** Garder 2025, étiquetée « données consolidées, non encore définitives » | Chiffre le plus récent, celui que RTE communique dans son bilan officiel. Réimport au second semestre 2026, toute révision inscrite au journal des corrections. |
| **B.** Afficher 2024, définitive | Aucune révision possible, mais un an de retard sur ce que publie RTE. |

**Recommandation : A.** Le cadrage demande « le chiffre d'aujourd'hui » et prévoit un journal
des corrections pour exactement ce cas. Côté code : un champ de statut dans `carte.json`,
affiché sous la carte.

---

## 1. Prix de l'électricité pour les ménages

| Option | Producteur | Ce que c'est | Dernière valeur lue | Import |
|---|---|---|---|---|
| **A.** Prix moyen payé, enquête semestrielle européenne, une tranche de consommation, toutes taxes | Eurostat (`nrg_pc_204`), repris par le SDES | Prix moyen payé par les ménages selon l'enquête d'Eurostat, comparable entre pays ; contrats couverts à relire dans sa méthodologie | 2ᵉ semestre 2025 : 25,6104 « euros TTC » (tranche DC), 24,8119 (toutes tranches) — **via le SDES, unité incomplète** | API Eurostat (en maintenance le 24/09) ou fichier SDES « Conjoncture mensuelle de l'énergie », Licence Ouverte |
| **B.** Tarif réglementé de vente, une case de la grille (option, puissance souscrite) | Proposé par la CRE, arrêté par les ministres | Un barème, pas un prix moyen : abonnement + prix du kWh, par option et par puissance | Délibération CRE n° 2026-147 du 15/07/2026 : proposition de + 2,50 % TTC en moyenne au 1ᵉʳ août 2026 | PDF uniquement (annexes de barèmes) |
| *Écarté* : indice des prix à la consommation, poste électricité | INSEE | Un indice (base 100), pas un prix | — | — |

Points à connaître :
- Le SDES écrit « euros TTC » sans quantité de référence, alors qu'il précise « 100 kWh » pour
  le propane ou le bois. La valeur n'a de sens que pour 100 kWh, mais la règle 3 s'applique :
  lire l'unité chez Eurostat, qui l'exprime en €/kWh, quand son API sera rétablie.
- Les bornes de la tranche DC sont à relire dans la nomenclature d'Eurostat avant d'être citées.
- Le tarif réglementé ne concerne que les ménages qui l'ont gardé ; leur part reste à établir
  (déjà notée dans `pouvoirs.json`). Une proposition de la CRE n'est pas une décision.

**Recommandation : A, tranche DC**, sous réserve de ce que dit la méthodologie d'Eurostat sur les
contrats couverts : c'est un prix moyen payé, publié tel quel par un producteur public. Le tarif réglementé a sa place dans le bloc « Qui décide », où il
illustre précisément le levier de l'État.

---

## 2. Mix électrique

Problème de structure d'abord : le schéma n'accepte **qu'une valeur par indicateur**, alors
qu'un mix est une répartition. Choisir la part à mettre en avant est un choix de cadrage, et il
est politiquement chargé.

| Option | Producteur | Dernière valeur lue | Ce que le choix met en avant |
|---|---|---|---|
| **A.** Part décarbonée de la production | RTE, bilan électrique 2025 | 95,2 % en 2025, France métropolitaine | Le nucléaire et les renouvelables ensemble |
| **B.** Part renouvelable de la production | RTE, même document | Publiée dans un graphique seulement ; valeur 2025 à lire dans le rapport complet | Les renouvelables seules, selon les conventions de la directive 2009/28/CE (déchets ménagers comptés à 50 %, hydraulique diminuée de 70 % du pompage) |
| **C.** Production totale | RTE : 547,5 TWh (métropole, Corse comprise) · SDES : 559 TWh nets (métropole et 5 DROM) | 2025 | Rien sur le mix ; montre au passage que deux périmètres officiels coexistent |
| **D.** Répartition complète par filière, en TWh | RTE, bilan électrique 2025 | Nucléaire 373,0 · hydraulique 62,4 · … | Aucune filière : toutes sont affichées |

Points à connaître :
- Les séries mensuelles du SDES et le jeu éCO2mix au pas demi-horaire donnent la production
  par filière, mais obtenir une année impose d'additionner : la règle 1 les écarte.
- Aucun jeu national annuel par filière n'a été trouvé sur ODRÉ. Les chiffres de RTE sont
  dans des PDF ; un fichier de données du bilan est à chercher sur
  analysesetdonnees.rte-france.com avant de pouvoir importer.

**Recommandation : D**, le seul choix qui ne cadre rien, sur le même périmètre que la carte.
C'est une petite évolution du schéma (une décomposition au lieu d'une valeur, vérifiée par les
mêmes règles), que je peux faire dès que tu valides.

---

## 3. Consommation finale d'énergie

Toutes les options ci-dessous viennent du **même document** : SDES, *Bilan énergétique de la
France en 2025 — données provisoires* (avril 2026, version modifiée en mai 2026). Périmètre :
France métropolitaine et cinq DROM.

| Option | Valeur 2025 lue | Ce qu'elle compte |
|---|---|---|
| **A.** Consommation finale d'énergie, données réelles | 1 609 TWh | Tous usages, y compris non énergétiques (114 TWh, surtout la pétrochimie) |
| **B.** Consommation finale à usage énergétique, données réelles | 1 495 TWh | L'énergie effectivement consommée comme énergie |
| **C.** La même, corrigée des variations climatiques | Niveau non publié dans la synthèse : seulement − 1,1 % sur un an et − 9,6 % depuis 2012 | Neutralise l'effet d'un hiver froid ou doux |
| **D.** Consommation finale d'énergie au sens d'Eurostat | Eurostat (`sdg_07_11`), non lu : serveur en maintenance | Définition européenne, écart avec le SDES à établir |

Point à connaître : le résumé d'un moteur de recherche appelait « consommation d'énergie » le
chiffre de 1 495 TWh. C'est la démonstration concrète de la règle qui interdit d'en reprendre.

**Recommandation : C**, si Légifrance confirme ce que suggère la comparaison du SDES avec 2012 :
que c'est la grandeur visée par les objectifs légaux de réduction. C'est alors celle que cite le
débat public. Le niveau est à chercher dans les fichiers de données du bilan. À défaut, B.

---

## 4. Dépendance énergétique

| Option | Producteur | Définition exacte | Dernière valeur lue |
|---|---|---|---|
| **A.** Taux d'indépendance énergétique | SDES, bilan énergétique | « rapport entre la production d'énergie primaire sur le territoire et la demande intérieure d'énergie » | 62,7 % en 2025 (provisoire), métropole et 5 DROM |
| **B.** Taux de dépendance énergétique | Eurostat (`nrg_ind_id`) | Importations nettes rapportées à l'énergie disponible | Non lu : serveur en maintenance |

Points à connaître :
- Convention décisive, écrite par le SDES : l'énergie nucléaire est comptée comme produite sur
  le territoire, l'uranium importé n'étant pas compté comme une importation, « par convention
  statistique internationale ». Elle doit figurer dans la définition retenue affichée.
- Rien ne garantit que A et B soient complémentaires : agrégats et conventions diffèrent, et B
  n'a pas pu être lu. Quoi qu'il en soit, par la règle 1, REPÈRE ne calcule jamais « 100 − A ».
- Choisir A implique de renommer l'indicateur : le SDES publie une **in**dépendance.

**Recommandation : A**, la définition est écrite en toutes lettres par le producteur, avec sa
convention.

---

## 5. Précarité énergétique

Source consultée : ONPE, *Tableau de bord de la précarité énergétique*, novembre 2025. Les
sites onpe.org et ademe.fr bloquent les lecteurs automatiques : le document a été lu dans la
copie qu'en héberge le réseau RAPPEL (precarite-energie.org). **À relire à la source avant tout
import.**

| Option | Producteur réel | Ce que c'est | Dernière valeur lue |
|---|---|---|---|
| **A.** Taux d'effort énergétique (TEE_3D) : ménages qui dépensent plus de 8 % de leurs revenus pour les factures énergétiques de leur logement et appartiennent aux trois premiers déciles de revenus | Ministère de la Transition écologique (CGDD), modèle de microsimulation Prometheus ; l'ONPE le relaie | **Une estimation par modèle**, faute d'enquête récente : la dernière enquête logement complète date de 2013 | 2023 : **cinq valeurs officielles** selon les aides comptées — 10,1 % (avec bouclier tarifaire, sans chèque énergie : la référence de l'ONPE), 8,6 %, 6,3 %, 17,9 % (sans bouclier ni chèques), 18,6 % (idem, corrigé de la météo) |
| **B.** Froid ressenti : avoir souffert du froid au moins 24 h dans son logement l'hiver précédent | Médiateur national de l'énergie, baromètre énergie-info | Un sondage déclaratif en ligne, environ 2 000 personnes | 35 % pour l'hiver 2024-2025 |
| **C.** Bas revenus, dépenses élevées (BRDE) | ONPE, enquête logement | Aucune valeur récente | 2013 |
| **D.** Incapacité à chauffer convenablement son logement | Eurostat, enquête SILC (`ilc_mdes01`) | Déclaratif, comparable entre pays | Non lu : serveur en maintenance |

Point à connaître : entre 10,1 % et 17,9 %, la différence mesure l'effet des aides publiques.
Afficher l'une plutôt que l'autre, c'est déjà dire si ces aides ont marché. La règle 2 tranche
sans que REPÈRE ait à choisir.

**Recommandation : A, dans la convention de référence de l'ONPE (10,1 % en 2023)**, en nommant
les autres variantes dans la définition retenue. B pourrait en être le complément, si le nombre
d'indicateurs le permet.

---

## 6. Nom du thème

Les thèmes sont repris de la nomenclature, mais celui-ci s'appelle « Énergie » alors que la
sous-classe officielle est « 04.3 — Combustibles et énergie ». Même question pour le futur thème
« Logement et équipements collectifs », que le tableau de l'INSEE écrit au pluriel
(« Logements »). Garder un nom court est défendable, mais c'est une liberté prise avec la règle.

**Recommandation :** reprendre l'intitulé officiel en titre de page et garder le nom court dans
la navigation.

---

## Ce qui ne dépend pas de toi

Une fois ces choix faits, chaque indicateur retenu reçoit son script d'import et sa source dans
`sources.json`, sur le modèle de la carte, et le vérificateur fait le reste.
