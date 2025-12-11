# Résumé Segment 006

**Timestamp:** 22:30 - 28:04
**Speakers:** A, B, C, D, E, F
**Tags:** #matching-automatique #factures #imprimante-tickets #module-eco-organismes #mapping-categories

## Points discutés

- **Matching automatique besoins** :
  - Exemple: personne a besoin "petit frigo" (liste besoins)
  - Quand "petit frigo" rentré → notification automatique
  - Nécessite granularité suffisante (distinguer petit/gros frigo)
  - Sinon en "gros électroménager froid" → impossible de distinguer

- **Facturier D3E (équipements électroniques)** :
  - Facturier spécifique pour appareils électroniques
  - Traçabilité: prix de vente, date
  - Use case: retour client si problème → remboursement ou avoir
  - Question: faut-il l'imprimer ou dématérialiser ?

- **Imprimante tickets de caisse** :
  - Proposition A: acheter d'occasion imprimante tickets
  - Pas grosse imprimante, petit format
  - Imprimer factures, reçus (simple ou double exemplaire)
  - Pour clients ou pour compte interne

- **Alternative dématérialisation** :
  - Modèle moderne: donner email/téléphone → reçu numérique
  - Lien avec gestion comptes utilisateurs

- **Module éco-organismes (architecture)** :
  - Module dédié avec chaque éco-organisme identifié
  - Métadonnées: date de déclaration, grandes catégories
  - **Mapping automatique** : relier catégories internes → catégories éco-organismes
  - Ex: "petits appareils en mélangeant" relié à catégorie écologique
  - Paramétrage en amont, pas en saisie

- **Séparation gestion interne vs éco-organismes** :
  - Principe: gestion matière interne SÉPARÉE de déclarations éco-organismes
  - Flexibilité: si changement d'éco-organisme → pas impacter tout le système
  - Reclassement automatique entre catégories internes et externes

- **Consensus granularité minimale** :
  - Garder seulement le détail minimum requis par éco-organismes
  - Ne pas sur-compliquer avec détails inutiles
  - Catégories racines principales conservées

- **Discussion Discord sur éco-organismes** :
  - Code 500 et questions réseau national ressourceries
  - Notation des dons par rapport éco-organismes
  - Clarification en cours avec Corinne

- **Perplexity Pro pour recherches** :
  - Outil de recherche approfondie (sources légales, comptables)
  - Proposition: envoyer questions complexes législatives/comptables
  - Recherche sur toutes sources + croisement → réponses fixes ou hypothèses multiples

- **Catégories racines actuelles** :
  - Liste: électroménager, cuisine, loisirs, textile, décoration, livres, ameublement, animalerie, bijoux, cintres, jeux, luminaires, outillage, puericulture
  - Question: regroupements possibles ?
  - Ex: luminaires + électroménager ? (mais tondeuses thermiques...)

## Décisions prises

- **Décision**: Séparation claire gestion interne vs éco-organismes (mapping automatique)
- **Décision**: Granularité minimale = minimum requis éco-organismes

## Actions (RACI)

- Développer module éco-organismes avec mapping - Responsable: C
- Étudier imprimante tickets d'occasion - Responsable: A (quand budget)
- Clarifier questions éco-organismes avec Corinne - Responsable: équipe
- Analyser regroupements catégories racines possibles - Responsable: équipe

## Risques

- **Complexité mapping éco-organismes** : Besoin de bien définir les correspondances pour éviter erreurs déclaratives

## Questions ouvertes

- Faut-il une imprimante tickets physique ou privilégier dématérialisation ?
- Quels regroupements de catégories racines sont pertinents ?
- Le module éco-organismes couvrira-t-il tous les cas (écologique, autres) ?

## Tableau chronologique

| Timestamp | Speaker | Résumé |
|-----------|---------|--------|
| 22:30 | D | Exemple matching automatique "petit frigo" |
| 23:15 | E/A | Discussion facturier D3E et traçabilité |
| 24:00 | A | Proposition imprimante tickets d'occasion |
| 24:45 | C/D | Architecture module éco-organismes (mapping automatique) |
| 25:30 | D | Principe séparation gestion interne vs éco-organismes |
| 26:15 | C | Consensus granularité minimale suffisante |
| 27:00 | A | Mention Perplexity Pro pour recherches complexes |
| 27:30 | F | Liste catégories racines et question regroupements |
