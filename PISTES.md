# Pistes de recherche — NON VÉRIFIÉES

> **Statut : aucune page officielle n'a pu être lue.** L'environnement de travail bloque
> l'accès réseau à data.gouv.fr, insee.fr, legifrance.gouv.fr, odre.opendatasoft.com et à
> tous les domaines testés. Tout ce qui suit vient de résultats de moteur de recherche.
>
> **Aucun chiffre n'est reporté ici volontairement.** Deux incohérences repérées pendant la
> recherche suffisent à démontrer que ce niveau de fiabilité ne convient pas à REPÈRE. Ce
> fichier ne contient que des adresses à ouvrir et des points à trancher.

## Thème énergie — sources à ouvrir en premier

| À vérifier | Où |
|---|---|
| Licence exacte des données ODRÉ, et mention de paternité imposée | `odre.opendatasoft.com/pages/conditions-utilisation-v2/` |
| Fraîcheur et champs du jeu « production régionale annuelle par filière » | slug `prod-region-annuelle-filiere` sur ODRÉ |
| Motif d'export de l'API Opendatasoft v2.1 | `/api/explore/v2.1/catalog/datasets/<slug>/exports/csv` |
| Prix de l'électricité, série semestrielle européenne | Eurostat, jeu `nrg_pc_204` |
| Dispositif qui remplace l'ARENH depuis janvier 2026 | communiqué CRE du 30 avril 2025 sur le post-ARENH |
| Coût des mesures contre la hausse des prix de l'énergie | Cour des comptes, et publication CRE correspondante |

### Risque numéro un de la carte

Les jeux de données d'Enedis existent à la maille département et commune, mais ils ne
couvriraient que le réseau de distribution — donc **sans le nucléaire ni les grandes
centrales, raccordées au réseau de transport**. Une carte alimentée par Enedis montrerait
un paysage énergétique français sans nucléaire. À confirmer avant toute utilisation. Les
données régionales d'ODRÉ ne semblent pas avoir ce défaut.

### Le vrai risque du thème : les définitions, pas les chiffres

Sur quatre des cinq indicateurs envisagés, plusieurs définitions officielles concurrentes
coexistent, produites par des institutions publiques différentes, et donnent des résultats
sensiblement différents :

- **Prix de l'électricité** — tarif réglementé, prix moyen réellement payé, ou bande de
  consommation européenne. Trois producteurs, trois réponses.
- **Mix électrique** — France métropolitaine continentale ou France entière, production
  brute ou nette, mix de production ou de consommation, mix électrique ou mix énergétique
  primaire.
- **Consommation d'énergie** — corrigée ou non des variations climatiques, finale ou
  primaire, usages énergétiques seuls ou tous usages.
- **Dépendance énergétique** — le taux d'indépendance français et le taux de dépendance
  européen ne sont pas complémentaires et ne mesurent pas la même chose.
- **Précarité énergétique** — plusieurs indicateurs coexistent chez le même producteur.

Conséquence de conception, déjà appliquée dans le vérificateur : tout chiffre affiché doit
nommer sa définition retenue. Le vérificateur refuse une valeur dont le champ
`definition_retenue` n'est pas rempli.

## Positions de partis — documents publics repérés

Des textes de position publiés existent au moins pour le Parti socialiste, La France
insoumise, le Rassemblement national et Les Écologistes. Rien n'a été trouvé pour Les
Républicains ni Renaissance — recherche ciblée à refaire. Les adresses relevées n'ont pas
été ouvertes et aucune date de version n'a pu être établie.

Règle : ne citer que les documents publiés par l'organisation elle-même, et les débats
parlementaires comme source d'actes. Les comparateurs tiers portent une ligne éditoriale.

## Nomenclature des thèmes — ce que la recherche a trouvé

Deux candidates sérieuses, et aucune ne résout le problème politique.

**Missions du budget de l'État (loi de finances).** Une trentaine d'intitulés, votés en loi
de finances, donc datés et citables. Mais la plus grosse mission du budget est une ligne
purement technique de restitutions d'impôt ; la mission « Santé » ne couvre pas l'assurance
maladie, qui relève d'un autre texte ; logement, énergie et transports n'existent pas comme
missions et sont noyés dans des ensembles plus larges. Les intitulés changent d'une année à
l'autre. En revanche « Immigration, asile et intégration » y figure nommément.

**COFOG / CFAP.** Dix divisions, norme des Nations unies reprise par Eurostat et l'INSEE,
stable depuis la fin des années 1990, avec des données de dépenses publiques téléchargeables
et comparables entre pays européens. Les montants couvrent toutes les administrations
publiques, donc « Santé » y est économiquement juste. Mais l'immigration n'y apparaît nulle
part, et énergie comme transports sont enterrés au deuxième niveau sous « Affaires
économiques ».

Points à trancher, et à vérifier sur Légifrance et sur l'INSEE avant toute publication.
