# Résumé Segment 001

**Timestamp:** 0:00 - 5:24
**Speakers:** A, B, C, D, E, F
**Tags:** #ordre-du-jour #paeko #categories #utilisateurs #tarification

## Points discutés

- **Ordre du jour établi** avec 4 points principaux :
  1. Bugs et besoins remontés
  2. Point sur Paeko (logiciel de compta asso, futur backend de RecycClique)
  3. Catégories et déclarations aux éco-organismes
  4. Comptes utilisateurs et code PIN pour la caisse

- **Gestion des catégories** : Proposition d'avoir deux dénominations
  - Dénomination rapide pour l'affichage (ex: "bricot" au lieu de "articles de bricolage")
  - Dénomination complète officielle pour la comptabilité matière et documentation pédagogique
  - Affichage rapide sur les boutons, complète en survol de souris

- **Module STT (Speech-to-Text)** : Besoin d'un module de transcription vocale
  - Basé sur WhisperWrite ou API text-to-speech
  - Utilisable sur tous les champs texte avec bouton ou raccourci clavier

- **Gestion des sorties de stock** : Ajout d'une fonctionnalité sur l'écran de réception
  - Bouton pour indiquer une sortie au lieu d'une entrée
  - Deux choix dans la liste déroulante: recyclage (éco-organismes) ou autre
  - Comptabilisation dans le "poids sorti" global

- **Comptes utilisateurs et code PIN** :
  - Système de code PIN existant mais non activé
  - Permet de verrouiller la caisse quand personne n'est devant
  - Gestion des droits selon le profil (caisse, réception, administration)
  - Connexion en ligne depuis n'importe où selon les droits

- **Débat sur la tarification** :
  - Conflit entre "prix minimum" et "prix indicatif"
  - Besoin de clarifier la politique tarifaire
  - Proposition : prix minimum par défaut + don à 0€ possible

- **Problème opérationnel caisse** :
  - B exprime que la saisie du prix pour chaque objet fait perdre du temps
  - Préférence pour une somme globale en fin de transaction
  - Débat sur l'intérêt d'avoir des prix fixes vs prix libres

- **Chatbot/IA pour aide à la catégorisation** :
  - Catégorie "?" ouvrant un champ de recherche (clavier/vocal)
  - Ex: "j'ai un fer à repasser, ça va dans quelle catégorie?"
  - Interrogation de base de connaissances locale/globale
  - Fallback sur recherche internet (type Perplexity)

- **Base de connaissances universelle** :
  - Documents sources: éco-organismes, normes, catégories, lois, compta
  - Bibliothèque partageable entre ressourceries
  - Possibilité d'enregistrer les résultats chatbot (local/global)

- **Élicitation de groupe avec IA** :
  - Agent IA posant des questions en réunion
  - Enregistrement et synthèse automatique
  - Création/mise à jour des "documents de vérité"
  - Élaboration de chartes, grilles tarifaires, etc.

## Décisions prises

- Aucune décision formelle prise dans ce segment
- Plusieurs propositions en discussion sans résolution définitive

## Actions (RACI)

- Ajouter dans la liste des évolutions Recyclic :
  - Module STT (Speech-to-Text)
  - Gestion des sorties de stock sur écran réception
  - Double dénomination pour les catégories
  - Chatbot d'aide à la catégorisation

## Risques

- **Débat non résolu sur la tarification** (prix minimum vs indicatif)
  - Risque de confusion opérationnelle
  - Pas de règle claire établie malgré discussions précédentes

- **Complexité croissante du logiciel** :
  - Multiplication des fonctionnalités demandées
  - Risque de sur-ingénierie ("2027" mentionné ironiquement)

- **Décalage entre automatisation et solutions manuelles** :
  - Plaisanterie sur "piège à souris" vs système numérique
  - Tension entre complexité technique et simplicité d'usage

## Questions ouvertes

- Quelle est la règle définitive pour la tarification ? Prix minimum obligatoire ou prix indicatif avec liberté ?
- Quand le système de code PIN sera-t-il activé ?
- Comment gérer les niveaux de droits utilisateurs (bénévoles, caisse, réception, admin) ?
- Les bases de connaissances IA seront-elles locales ou partagées entre ressourceries ?
- Faut-il vraiment passer par la saisie individuelle des prix ou privilégier une somme globale ?

## Tableau chronologique

| Timestamp | Speaker | Résumé |
|-----------|---------|--------|
| 0:00 | A | Présentation de l'ordre du jour: bugs, Paeko, catégories, comptes utilisateurs |
| 0:30 | A | Proposition double dénomination catégories (rapide + complète) |
| 1:00 | A | Besoin module STT pour saisie vocale |
| 1:15 | A | Ajout fonction sortie de stock sur écran réception |
| 1:45 | C | Discussion comptes utilisateurs via Paeko |
| 2:30 | B | Problème perte de temps avec saisie prix individuels |
| 3:00 | A | Débat prix minimum vs prix indicatif (non résolu) |
| 3:45 | A | Proposition chatbot IA pour aide catégorisation |
| 4:30 | A | Concept base de connaissances universelle partagée |
| 5:00 | C | Gestion droits utilisateurs selon profils |
