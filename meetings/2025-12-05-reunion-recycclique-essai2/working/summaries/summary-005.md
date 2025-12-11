# Résumé Segment 005

**Timestamp:** 18:00 - 23:29
**Speakers:** A, B, C, D, E, F
**Tags:** #bug-ticket #eco-organismes #granularite #ecran-tactile #caisse-differee

## Points discutés

- **Bug tickets de caisse** : Items du ticket précédent qui traînent dans le nouveau ticket (non vierge) - Rapporté par B et D

- **Problème écran tactile** : Décision de débrancher l'USB de l'écran tactile pour éviter bugs (potentiellement lié au bug tickets)

- **Granularité catégories (suite)** :
  - Exemple vaisselle: métal, grès, ustensiles, couverts... → jusqu'où détailler ?
  - Choix organisationnel: granularité extrême vs simplicité
  - Exemple: "couvert en argent" vs juste "vaisselle"
  - Idéal: si catégorie connue → saisir directement, sinon → mapping automatique

- **Module caisse différée** :
  - Nouvelle fonctionnalité: rentrer caisses antérieures jour par jour
  - Use case: panne électricité/internet → noter sur papier → saisir plus tard
  - Créer caisse avec date antérieure (jour D)
  - Disponible aussi pour les entrées/réceptions

- **Import Excel pour entrées** : Module d'import direct de fichiers Excel déjà développé

- **Débat utilité statistiques détaillées** :
  - Question: besoin de savoir combien de batteurs, mixeurs vendus ?
  - Consensus: complique sans réelle utilité
  - Exception: matching automatique (ex: "besoin petit frigo" → notification quand petit frigo rentré)

- **Bug affichage cumuls** : Cumul "toujours" pour entrées vs cumul "jour" pour sorties → incohérence (déjà corrigé dans nouvelle version en cours)

- **Point Paeko reporté** : Sujet gardé pour après les catégories

## Décisions prises

- **Décision**: Débrancher l'USB de l'écran tactile pour résoudre le bug
- **Décision**: Pas de granularité extrême sur catégories (rester au minimum éco-organismes)

## Actions (RACI)

- Investiguer et corriger bug tickets non vierges - Responsable: C
- Débrancher écran tactile USB - Responsable: équipe (immédiat)
- Finaliser harmonisation affichages cumuls - Responsable: C (déjà en cours)

## Risques

- **Bug tickets persistant** : Si débrancher écran ne résout pas → investigation plus approfondie nécessaire

## Questions ouvertes

- Le bug tickets est-il vraiment lié à l'écran tactile ?
- Quelle granularité exacte retenir pour chaque catégorie principale ?

## Tableau chronologique

| Timestamp | Speaker | Résumé |
|-----------|---------|--------|
| 18:00 | B/D | Rapport bug: tickets de caisse non vierges |
| 19:00 | A/C | Décision débrancher écran tactile USB |
| 19:45 | C | Explication granularité catégories (vaisselle exemple) |
| 20:30 | A/C | Présentation module caisse différée (panne internet) |
| 21:15 | D/C | Débat utilité statistiques détaillées (consensus: pas utile) |
| 22:00 | A/D | Constat bug affichage cumuls (déjà corrigé en dev) |
