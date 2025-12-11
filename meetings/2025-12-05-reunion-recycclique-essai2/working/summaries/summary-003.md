# Résumé Segment 003

**Timestamp:** 9:00 - 14:08
**Speakers:** A, B, C, D, E, F
**Tags:** #tarification #logs-audit #saisie-vocale #module-caisse #promotions

## Points discutés

- **Cas concret tarification: le radiateur à 3€** :
  - Radiateur avec un pied cassé
  - Prix affiché: 3€ (jugé trop bas par certains, "prix de participation" pas "prix de vente")
  - D: "3€ ce n'est même pas le prix d'une baguette"
  - B l'a donné car client en difficulté + objet abîmé
  - Débat: descendre sous le prix minimum est-il acceptable ?

- **Flexibilité tarifaire vs politique affichée** :
  - Distinction proposée entre:
    - **Politique de prix officielle** (communiquée publiquement)
    - **Pratique ponctuelle** (pour personnes en difficulté, objets abîmés)
  - Risque: si flexibilité visible → tous les clients vont réclamer
  - Pratique actuelle: ajustements discrets au cas par cas

- **Fonctionnalité logs et audit déjà existante** :
  - Menu: Administration → Journal d'audit → Activités et logs
  - Affiche: connexions, déconnexions, configuration système
  - Rapports et exports: Sessions de caisse/réception
  - Détail complet: heure, opérateur, contenu ticket
  - Permet litiges et traçabilité
  - Note: actuellement tout au nom de "La Clique" (compte global)
  - À terme: noms individuels avec code PIN

- **Ajout de notes sur les ventes** :
  - Possibilité d'ajouter une note au moment du paiement
  - Utile pour se rappeler un contexte particulier (ex: objet abîmé, client en difficulté)
  - Permet de justifier un prix atypique

- **Logs des réceptions** :
  - Nouvelle version: accès à toutes les sessions de réception
  - Détail: qui a fait quelles entrées, quand
  - Ex: "Greg a fait les entrées hier, je veux savoir ce qu'il a pesé"

- **Compatibilité avec les promotions** :
  - Problème soulevé: politique tarifaire doit être compatible avec promos ponctuelles
  - Exemple: "tous les fringues à 1€"
  - Ne pas créer un système qui bloque les promotions
  - Besoin d'équilibre entre rigueur tarifaire et flexibilité commerciale

- **Difficulté caisse avec affluence** :
  - B: "Hier après-midi, 4 personnes en caisse en même temps, première fois, c'est chiant"
  - Saisie prix individuel = perte de temps importante quand affluence
  - Besoin d'efficacité accrue

- **Récapitulatif oral des achats** :
  - B pratique courante: "3€ de livres, 2€ de vaisselle, 1€ de..."
  - Clarifie pour le caissier et pour le client
  - Question: système prix global empêche-t-il ce récap ?

- **Module de saisie vocale à la caisse (détaillé)** :
  - **Fonctionnement proposé** :
    - Bouton à appuyer → parler → transcription automatique
    - Ex: "3 kg de livres" → s'affiche automatiquement
    - Ligne par ligne: pesée + annonce vocale
    - Possibilité de correction manuelle si erreur
    - Quand c'est bon → validation → total calculé (ex: 17,50€)

  - **Avantages** :
    - Gain de temps considérable
    - Libère les mains pour peser/manipuler
    - Plus fluide avec affluence

  - **Contraintes techniques** :
    - Nécessite micro à proximité (ou casque Bluetooth)
    - Casque toute la journée ? Pas forcément confortable
    - Besoin d'équipement dédié par poste

- **Système de communication interne type interphone** :
  - Proposition: utiliser le micro pour communication inter-postes
  - Ex: "Le petit Olivier est attendu à la caisse, sa maman se fait du souci"
  - Type supermarché/grande surface
  - Multi-usage: saisie vocale + talkie-walkie/annonces
  - Réaction: "Pourquoi pas, on est ouvert à tout" (C)

- **Interrogation sur bénéficier de la position de Gaby** :
  - Gaby (F) en distanciel, peu d'expérience caisse
  - Question posée mais Gaby n'a pas pu répondre (connexion?)

- **Consensus sur module vocal** :
  - D: "Le plus simple dans un premier temps, c'est vraiment un micro, un bouton"
  - Rentrer catégorie + poids OK, mais prix de chaque catégorie = contraignant
  - Donner montant total en fin = plus fluide

## Décisions prises

- **Décision**: La tarification reste un chantier séparé (confirmation segment 002)
- **Décision implicite**: Notes sur ventes seront ajoutées dans nouvelle version

## Actions (RACI)

- Finaliser système de notes sur les ventes/réceptions - Responsable: développement
- Étudier faisabilité module saisie vocale caisse - Responsable: développement
- Évaluer équipement nécessaire (micro, casque, bouton) - Responsable: équipe
- Réfléchir à système communication interne (interphone/annonces) - Responsable: équipe

## Risques

- **Incohérence tarifaire visible** :
  - Cas concret (radiateur 3€) montre désaccords internes
  - Flexibilité non cadrée = risque de demandes systématiques de réductions

- **Dépendance matérielle (module vocal)** :
  - Besoin de micro/casque fonctionnel en permanence
  - Panne matérielle = blocage caisse
  - Confort d'usage (casque toute la journée ?)

- **Complexité avec promotions** :
  - Système tarifaire trop rigide pourrait empêcher promos
  - Besoin d'anticiper ces cas d'usage

## Questions ouvertes

- Comment formaliser la flexibilité tarifaire (cas sociaux, objets abîmés) sans créer d'effet d'aubaine ?
- Quel équipement exact pour le module vocal (micro table, casque, bouton physique/logiciel) ?
- Le système de communication interne est-il prioritaire ou secondaire ?
- Comment gérer les promotions ponctuelles dans le système tarifaire ?
- Gaby a-t-elle des retours d'expérience caisse ? (question restée sans réponse)

## Tableau chronologique

| Timestamp | Speaker | Résumé |
|-----------|---------|--------|
| 9:00 | D/B | Débat radiateur 3€: trop bas ou juste avec contexte ? |
| 9:45 | E/A | Proposition: politique officielle + flexibilité discrète |
| 10:15 | F/C | Démonstration logs/audit existants dans administration |
| 10:45 | C | Présentation notes sur ventes (nouvelle version) |
| 11:15 | E | Compatibilité nécessaire avec promotions ponctuelles |
| 11:45 | B | Témoignage: 4 clients simultanés, saisie prix = perte temps |
| 12:15 | C/D | Détail module saisie vocale: bouton + micro + transcription |
| 13:15 | C | Proposition système communication type interphone |
| 13:45 | D | Consensus: module vocal = solution la plus simple |
