# REPÈRE — Cadrage

**Date :** 24 septembre 2026
**Statut :** validé
**Remplace :** tous les documents et règles antérieurs (rapport NOVA v1.1, dossier pilote Logement, carnet de chantier, ancien CLAUDE.md). Ils ne font plus autorité.

---

## Ce que c'est

Un outil pour comprendre ce qui se passe en France et comment la politique y décide.

Pour quelqu'un qui veut voter en sachant ce qu'il fait, et pour quiconque entend une
annonce ou une polémique et se demande : **qui a réellement le pouvoir de faire ça ?**

REPÈRE est né de la présidentielle, mais il n'existe pas pour elle. L'élection est le
moment où plus de gens regarderont, rien de plus.

---

## Les deux modules

### Module 1 — L'état des lieux

Les chiffres réels du pays, par thème. Une carte quand le territoire a quelque chose
à dire.

**Règle absolue : les chiffres sont importés depuis les sources officielles, jamais
rédigés.** Ils arrivent par un tuyau de données et s'affichent tels quels, avec leur
producteur et leur date. Aucun nombre ne sort d'un texte généré.

### Module 2 — La politique française

Trois contenus, un seul module :

- **Comment c'est organisé** — qui décide quoi, à quel niveau. Permanent, ne périme jamais.
- **Les partis et leurs positions** — permanent. C'est par là qu'on commence.
- **Les candidats** — à partir de leur déclaration publique de candidature.

Le module ne s'appelle pas « Présidentielle 2027 ». L'élection est une section à
l'intérieur, pas le nom de la maison. Tout ce qu'il contient doit survivre au 3 mai 2027.

---

## Le lien entre les deux modules, c'est le produit

Une mesure d'un programme renvoie à l'état réel du sujet, puis à qui peut la décider.

La jonction se fait par des **thèmes communs aux deux modules**. Ces thèmes sont repris
d'une nomenclature officielle existante — ils ne sont pas choisis à la main. Le choix
des thèmes est déjà un choix politique ; on le délègue à une source citable.

---

## Ce que REPÈRE affiche sur une mesure

1. **L'état des lieux chiffré** — le chiffre d'aujourd'hui, sa source, sa date.
2. **Qui a le pouvoir de la décider** — loi, décret, commune, régulateur, Europe.
3. **Ce qui a déjà été tenté** — où, quand, avec quelle issue, et pourquoi ce n'est pas
   exactement comparable.
4. **Les chiffrages déjà produits par d'autres** — avec leurs méthodes et leurs
   désaccords. Quand personne n'a chiffré, on écrit que personne n'a chiffré.

## Ce que REPÈRE ne fait jamais

- **Son propre chiffrage.** Rassembler des calculs faits par d'autres est de la
  documentation. En produire un est de la modélisation : ça demande une équipe, et ça se
  fait attaquer même avec une équipe.
- **Aucun score, aucune note, aucun classement, aucun « voilà le candidat qui vous
  ressemble ».**

---

## Les règles qui remplacent les jugements

Partout où une décision éditoriale pourrait être attaquée, on la remplace par une règle
citable.

| Question | Règle |
|---|---|
| Qui figure comme candidat ? | Celui qui a déclaré publiquement sa candidature. Date et source à l'appui. Avant ça, il peut exister comme responsable de parti. |
| Quels thèmes ? | Repris d'une nomenclature officielle. |
| Quels chiffres ? | Ceux de la source officielle, importés, jamais réécrits. |

---

## La garantie

**L'exactitude des chiffres ne se sacrifie jamais.** Si la vérification n'est plus
possible, on ne publie plus — on ne publie pas moins bien.

Chaque page porte un lien de signalement d'erreur. **Les corrections sont publiées** :
quoi, quand, pourquoi, sur une page consultable par tous. Un site qui affiche ses
corrections est plus crédible qu'un site qui n'en a jamais eu.

## Ordre de sacrifice en cas de retard

Décidé à froid, pour ne pas avoir à le décider dans l'urgence :

1. La carte interactive
2. Les précédents et les chiffrages existants
3. Les candidats
4. **La vérification — jamais**

---

## Premier jalon

**Un seul thème — l'énergie — complet, en ligne, à une adresse partageable.**

Contenu attendu :
- 5 chiffres importés d'une source officielle, avec producteur et date
- Une carte : la production d'électricité par région et par filière
- Qui décide du prix de l'électricité, expliqué clairement
- Les précédents et les chiffrages existants
- Les positions de plusieurs partis sur l'énergie, en citation exacte et sourcée
- Un lien de signalement d'erreur et une page de corrections

**Échéance : 22 octobre 2026** (4 semaines).

**Ce qu'on en apprend :** le coût réel d'un thème, mesuré au chronomètre au lieu
d'estimé — et si le travail plaît. Douze thèmes, c'est environ un an.

---

## Les moyens

- 5 h par semaine dans une mauvaise semaine, 10 à 15 h dans une bonne. Moyenne ≈ 8 h.
- Seul.
- Niveau technique débutant. Le code et la rédaction passent par une IA.
- Aucune page complète écrite à ce jour.

**Ce que l'IA accélère :** le code, la rédaction, la collecte de sources.
**Ce qu'elle n'accélère pas :** la vérification, et les décisions éditoriales. Déléguer
les secondes reviendrait à publier un produit sans auteur.

**Estimation révisée** (IA + chiffres importés plutôt que rédigés) : 170 à 270 h pour
l'ensemble. Environ 240 h disponibles avant le 18 avril 2027. Jouable dans la fourchette
basse, sans marge.

## Construction

Un dépôt de code piloté par IA, avec **les données dans des fichiers versionnés** plutôt
que dans une base. Chaque chiffre vit dans un fichier lisible, avec sa source et sa
date ; chaque modification laisse une trace consultable. C'est aussi la réponse toute
prête le jour où un chiffre est contesté.

---

## À vérifier avant de s'engager

Rien de ce qui suit n'a pu être lu à la source : l'accès direct à legifrance, à la CNIL
et à service-public est bloqué depuis l'environnement de travail. **À confirmer avant
tout usage.**

- Les données de production d'électricité par région : existence, fréquence de mise à
  jour, licence.
- Présidentielle annoncée aux **18 avril et 2 mai 2027** (Conseil des ministres du
  1er juillet 2026). Décret de convocation non publié — attendu au plus tard début
  février 2027. Liste officielle des candidats vers la mi-mars 2027.
- **Pas de législatives programmées en 2027.** L'Assemblée en exercice a été élue en
  2024 ; terme ordinaire en 2029. Une dissolution est une hypothèse, pas un calendrier.
- Interdiction de la publicité commerciale à visée électorale (L52-1) applicable à
  compter du **1er octobre 2026**. Concerne toute acquisition payante liée au scrutin.
- Une opinion politique est une donnée sensible au sens du RGPD. REPÈRE n'en collecte
  aucune — pas de questionnaire, pas de compte, pas de préférence enregistrée.

## Pas encore décidé

- Le nom de domaine et l'hébergement.
- Les onze autres thèmes (à fixer une fois le coût réel du premier connu).
- La nomenclature officielle précise d'où les thèmes seront repris.
- L'outil d'écriture du contenu — à ajouter seulement si écrire dans des fichiers
  s'avère pénible après un thème complet.
