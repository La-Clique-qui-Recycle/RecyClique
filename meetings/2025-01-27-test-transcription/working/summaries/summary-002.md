# Résumé Segment 002

**Tags :** #tarification #code-pin #droits-utilisateurs #chatbot #prix-global

## Points discutés

- Continuation débat prix minimum vs prix indicatif (non résolu)
- Fonctionnement code PIN : identification rapide, unique par utilisateur, accès selon droits
- Distinction connexion site (identifié/mot de passe) vs poste local (code PIN)
- Proposition : prix à zéro par défaut, somme globale à la fin
- Déconnexion automatique après inactivité (5 min pour caisse, réglable)
- Suppression case "dons" séparée, intégration dans total
- Système de logs/audit pour traçabilité (qui a fait quoi, quand)
- Paramétrage flexible : activation/désactivation modules selon besoins
- Droits utilisateurs différenciés (bénévole, caisse, admin, compta)

## Décisions prises

- Décision : Prix à zéro par défaut, somme globale à la fin
- Décision : Supprimer case dons séparée, intégrer dans total
- Décision : Code PIN unique par utilisateur avec vérification unicité
- Décision : Déconnexion automatique après inactivité (paramétrable)

## Actions (RACI)

- Implémenter prix zéro par défaut + somme globale - Responsable: A
- Supprimer case dons séparée - Responsable: A
- Activer système code PIN avec vérification unicité - Responsable: A
- Configurer déconnexion automatique (timing caisse) - Responsable: A
- Améliorer logs/audit pour traçabilité complète - Responsable: C

## Risques

- Débat tarification toujours non résolu crée confusion opérationnelle
- Besoin de clarification sur politique tarifaire avant implémentation
- Gestion des cas particuliers (personnes en difficulté) vs politique générale

## Questions ouvertes

- Comment résoudre définitivement le débat prix minimum vs indicatif ?
- Comment gérer les exceptions (personnes en difficulté) sans compromettre politique ?
- Quels droits précis pour chaque rôle (SNU, bénévole, caisse, compta, admin) ?

## Tableau chronologique

| Timestamp | Speaker | Résumé |
|-----------|---------|--------|
| 00:03:48 | A | Explication chatbot IA pour catégorisation |
| 00:04:00 | A | Débat prix minimum vs indicatif (non résolu) |
| 00:04:25 | A | Question trace/mémoire chatbots |
| 00:04:33 | C | Explication code PIN : identification rapide, unique |
| 00:05:00 | C | Distinction connexion site vs poste local |
| 00:05:30 | B | Confusion prix minimum vs indicatif |
| 00:05:50 | A | Proposition prix zéro + somme globale |
| 00:06:10 | E | Déconnexion automatique après inactivité |
| 00:06:30 | A | Suppression case dons séparée |
| 00:07:00 | C | Paramétrage flexible modules |
| 00:07:30 | F | Question droits utilisateurs pour SNU/bénévoles |



