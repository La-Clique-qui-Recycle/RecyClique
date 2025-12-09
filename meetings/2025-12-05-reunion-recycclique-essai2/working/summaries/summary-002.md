# Résumé Segment 002

**Timestamp:** 4:30 - 9:37
**Speakers:** A, B, C, D, E, F
**Tags:** #code-pin #tarification #droits-utilisateurs #dons #benevoles

## Points discutés

- **Système de code PIN** :
  - Chaque utilisateur a un code PIN unique (4 chiffres)
  - Tape le code → identification automatique (pas besoin de rentrer le nom)
  - Si code déjà pris → message d'erreur, choisir un autre
  - Double système: identifiant+mot de passe (connexion web) + code PIN (identification rapide sur poste)

- **Différence identifiant vs code PIN** :
  - **Identifiant + mot de passe**: connexion au site depuis n'importe où (domicile, autre poste)
  - **Code PIN**: passage rapide d'un utilisateur à l'autre sur le même poste (caisse/réception)
  - Droits différenciés selon le profil:
    - Admin: accès complet (Recyclic, compta, admin)
    - Bénévole: accès limité selon habilitation + espace personnel

- **Déconnexion automatique** :
  - Après 5 minutes d'inactivité
  - Timing différencié possible selon le poste (caisse vs administration)
  - Réflexe caissier classique de verrouillage

- **Débat tarification (suite segment 001)** :
  - Désaccord persistant: "prix minimum" ou "prix indicatif" ?
  - B affirme que c'est un prix minimum
  - A/D soutiennent que c'est indicatif
  - Observation terrain: les gens ne descendent jamais sous le prix minimum (donc c'est un minimum de fait)
  - Différences de discours entre personnes → confusion

- **Proposition tarifaire simplifiée** :
  - Mettre tous les prix par défaut à 0€
  - Supprimer les prix sur les catégories
  - Ne rentrer qu'un prix global à la fin (à la louche, au jugé, ou discussion client)
  - Simplification compta: plus de distinction ventes/dons détaillés
  - Problème soulevé: risque de confusion comptable avec les dons

- **Gestion des dons** :
  - Actuellement: ventes + dons séparés
  - Avec système prix global: 14,50€ encaissés dont 50 centimes= don automatique
  - Question: comment l'expert comptable va-t-il interpréter ça ?
  - Prévision: lien avec Paeko pour gérer les dons correctement

- **Modularité et paramétrage** :
  - Possibilité d'activer/désactiver fonctionnalités dans les settings
  - Ex: module code PIN activable quand besoin apparaît
  - Module paiement global en fin de caisse (optionnel)
  - Permet adaptation selon les besoins de chaque ressourcerie

- **Identification des sessions** :
  - Sans code PIN: toute la session est au nom du compte global ("La Clique")
  - Avec code PIN: chaque action tracée au nom de l'utilisateur
  - Important pour traçabilité et responsabilité

- **Perspective bénévoles et SNU** :
  - Anticipation de l'arrivée de bénévoles nombreux
  - Besoin de limiter les droits par sécurité
  - Exemple: SNU avec accès réception mais pas admin/compta
  - Tant qu'on est "entre nous" ça va, mais pas à terme

- **Clarification nécessaire de la politique tarifaire** :
  - A insiste: la tarification doit être un sujet d'étude à part entière
  - Recherche précédente partagée sur les pratiques des ressourceries en France
  - 3 fonctionnements différents identifiés (détails non mentionnés)
  - Recyclic doit appliquer la politique choisie, mais il faut d'abord la définir clairement
  - Sans clarté interne → confusion pour les clients aussi

## Décisions prises

- **Décision**: La tarification sera traitée comme un sujet/chantier à part entière (pas résolu dans cette réunion)
- **Décision**: Le système code PIN sera modulaire et activable selon besoin

## Actions (RACI)

- Clarifier et formaliser la politique tarifaire - Responsable: équipe (chantier à ouvrir)
- Implémenter option de paramétrage pour activer/désactiver modules - Responsable: développement
- Prévoir système de déconnexion automatique avec timing configurable - Responsable: développement

## Risques

- **Confusion tarifaire persistante** :
  - Désaccord interne non résolu depuis plusieurs réunions
  - Risque de discours différents selon les personnes à la caisse
  - Impact négatif sur l'expérience client

- **Complexité comptable avec prix global** :
  - Si passage à prix global unique, risque de confusion dons/ventes
  - L'expert comptable pourrait refuser cette méthode
  - Incompatibilité potentielle avec Paeko

- **Sécurité et droits d'accès** :
  - Sans gestion des droits, risque avec bénévoles non formés
  - Accès trop large = risque d'erreurs ou malveillance

## Questions ouvertes

- Quel est le terme exact à utiliser: prix minimum ou prix indicatif ?
- Comment gérer comptablement un système de prix global (ventes + dons confondus) ?
- Quel timing de déconnexion automatique pour la caisse vs administration ?
- Quand activer le système de code PIN (maintenant ou plus tard) ?
- Quels sont les 3 fonctionnements tarifaires identifiés dans l'étude ?

## Tableau chronologique

| Timestamp | Speaker | Résumé |
|-----------|---------|--------|
| 4:30 | C | Explication système code PIN (4 chiffres, identification rapide) |
| 5:00 | B/A | Débat prix minimum vs indicatif (désaccord persistant) |
| 5:45 | C | Différence identifiant web vs code PIN poste |
| 6:15 | A | Proposition prix à 0 par défaut + prix global en fin |
| 7:00 | C | Déconnexion auto après 5 min d'inactivité |
| 7:30 | C | Modularité: activation/désactivation modules selon besoin |
| 8:00 | F | Anticipation bénévoles/SNU: besoin de gestion droits |
| 8:45 | A | Insistance: tarification = sujet d'étude séparé, 3 modèles identifiés |
