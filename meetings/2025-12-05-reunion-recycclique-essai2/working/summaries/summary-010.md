# Résumé Segment 010

**Timestamp:** 40:30 - 45:33
**Speakers:** A, B, C, D, E, F
**Tags:** #elo-asso #api-integration #chatbot-categories #participants #gestion-membres

## Points discutés

- **Elo Asso: modules et intégration** :
  - Utilisé actuellement pour gestion adhésions (même pour adhésions boutique)
  - Modules: adhésion + crowdfunding
  - API Elo Asso probablement disponible pour communication inter-sites

- **Vision intégration Elo Asso ↔ Recyclic** :
  - Gérer membres par Recyclic → envoi automatique vers Elo Asso
  - Même principe que connexion future avec Paeko
  - Alternative: gérer adhésions directement dans Recyclic, garder Elo Asso juste pour vitrine/crowdfunding

- **Avantages Elo Asso** :
  - Lien web public (inscription depuis n'importe où)
  - Visibilité réseaux sociaux
  - Module paiement adhésion
  - Numérotation membres automatique
  - Système rappel cotisations impayées

- **Avantages gestion membres Paeko** :
  - Opérations comptables facilitées (frais, etc.)
  - Attribution automatique numéro membre
  - Frais kilométriques poussés auto selon membre
  - Gestion déjà prête (vs développement custom)

- **Base de connaissances avec chatbot** :
  - Accessible par Discord ou dans Recyclic
  - Question texte ou audio: "j'ai un tube cathodique, je le mets dans quoi ?"
  - Recherche automatique dans documentation officielle, normes, etc.
  - Réponses précises avec références

- **Création sous-catégories EEE (en cours)** :
  - F crée les sous-catégories en direct pendant réunion
  - 1-PAM (Petits Appareils Mélange), 2-Écrans, etc.
  - Pas de prix par défaut

- **Cas particuliers catégories** :
  - Tubes cathodiques: écrans (benne spéciale écologique)
  - Si trop gros → à côté de la benne (comme frigo)
  - Cosmétiques/parfums: pas d'éco-organisme → poubelle (produits dangereux)
  - Pistolet d'arrosage: jardin thermique ou outillage ? → chatbot répond

- **Participants vs utilisateurs vs adhérents** :
  - **Participants**: clients enregistrés (liste besoins, tickets, promotions)
  - **Utilisateurs**: terme technique (applis)
  - **Adhérents**: statut spécial avec accès espace membre
  - Choix opt-in/opt-out pour promotions/newsletters
  - Gestion compte possible → passage adhérent → éventuellement admin

- **Niveaux d'habilitation déjà en place** :
  - Utilisateur basique
  - Adhérent (espace supplémentaire)
  - Habilité caisse (mais pas réception)
  - Habilité réception (mais pas caisse)
  - Admin (accès complet)
  - Système déjà implémenté dans administrations Recyclic

## Décisions prises

- **Décision**: Explorer API Elo Asso pour intégration automatique
- **Décision**: Comparer gestion membres Elo Asso vs Paeko (pas encore tranché)

## Actions (RACI)

- Vérifier existence/documentation API Elo Asso - Responsable: A
- Créer sous-catégories EEE restantes - Responsable: F (en cours)
- Alimenter base connaissances chatbot - Responsable: C (futur)

## Risques

- **Dédoublement données membres** : Si Elo Asso + Paeko + Recyclic → risque incohérences

## Questions ouvertes

- API Elo Asso existe-t-elle et est-elle documentée ?
- Faut-il centraliser gestion membres dans Paeko ou garder Elo Asso ?
- Quand le chatbot catégories sera-t-il opérationnel ?

## Tableau chronologique

| Timestamp | Speaker | Résumé |
|-----------|---------|--------|
| 40:30 | A/D | Elo Asso: adhésion + crowdfunding, API probable |
| 41:15 | C | Vision intégration Elo Asso ↔ Recyclic |
| 42:00 | E/A | Avantages Paeko pour gestion membres (frais auto, etc.) |
| 42:45 | A/C | Chatbot catégories: question → recherche docs → réponse |
| 43:30 | F/C | Création sous-catégories EEE en direct |
| 44:15 | A | Distinction participants/utilisateurs/adhérents/admins |
| 44:45 | A | Niveaux habilitation déjà implémentés (caisse, réception, admin) |
