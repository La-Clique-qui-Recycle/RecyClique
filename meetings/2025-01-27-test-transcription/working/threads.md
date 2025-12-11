# Sujets Récurrents (Threads)

**Meeting :** 2025-01-27-test-transcription  
**Date d'analyse :** 2025-01-27  
**Segments analysés :** 001, 002, 003 (sur 12)

---

## Thread #tarification

**Apparu dans segments :** 001, 002, 003

### Évolution

Le sujet de la tarification apparaît dès le segment 001 comme un débat non résolu de réunions précédentes. Il traverse tous les segments analysés avec des tentatives de clarification qui n'aboutissent pas.

- **Segment 001** : Débat prix minimum vs prix indicatif identifié comme non résolu depuis réunion précédente
- **Segment 002** : Tentative de clarification avec confusion entre "prix minimum" et "prix indicatif", proposition de prix zéro + somme globale
- **Segment 003** : Reconnaissance que c'est un "chantier" à part entière nécessitant recherche approfondie (3 fonctionnements identifiés dans recycleries françaises)

### Décisions finales

- **Décision formelle** : La tarification est reportée comme un chantier séparé à approfondir
- **Décision technique** : Prix à zéro par défaut, somme globale à la fin (proposition)
- **Décision opérationnelle** : Utiliser système de notes sur tickets pour cas particuliers

### Actions

- Approfondir recherche sur pratiques tarification recycleries en France (3 fonctionnements identifiés) - Responsable: A
- Définir politique tarifaire claire avec cas particuliers - Responsable: Équipe
- Vérifier compatibilité système avec promotions - Responsable: A
- Documenter politique tarifaire une fois définie - Responsable: A

### Questions ouvertes

- Comment résoudre définitivement le débat prix minimum vs prix indicatif ?
- Quels sont les 3 fonctionnements tarifaires identifiés dans la recherche ?
- Comment formaliser politique tarifaire avec cas particuliers ?
- Comment garantir compatibilité avec toutes les promotions futures ?

---

## Thread #comptes-utilisateurs-code-pin

**Apparu dans segments :** 001, 002

### Évolution

Le système de code PIN existe déjà mais n'est pas activé. La discussion évolue de l'activation simple vers une architecture complète de gestion des droits.

- **Segment 001** : Demande d'activation code PIN existant pour caisse/réception (sécurité, verrouillage)
- **Segment 002** : Détails techniques : code PIN unique par utilisateur, distinction connexion site vs poste local, droits différenciés

### Décisions finales

- **Décision** : Activer système code PIN avec vérification unicité
- **Décision** : Code PIN identifie utilisateur rapidement (pas besoin de nom)
- **Décision** : Distinction entre connexion site (identifié/mot de passe) et poste local (code PIN)
- **Décision** : Déconnexion automatique après inactivité (paramétrable, timing différent caisse vs admin)

### Actions

- Activer code PIN pour caisse/réception - Responsable: A
- Implémenter vérification unicité code PIN - Responsable: A
- Configurer déconnexion automatique (timing caisse) - Responsable: A
- Définir droits précis pour chaque rôle (bénévole, caisse, compta, admin, SNU) - Responsable: Équipe

### Questions ouvertes

- Quels droits précis pour chaque type d'utilisateur (bénévole, caisse, compta, admin, SNU) ?
- Quand activer les comptes individuels vs compte unique actuel ?

---

## Thread #fonctionnalités-caisse

**Apparu dans segments :** 001, 002

### Évolution

Plusieurs problèmes et besoins identifiés pour améliorer l'expérience à la caisse.

- **Segment 001** : Problème perte de temps avec saisie prix individuels
- **Segment 002** : Proposition prix zéro + somme globale, suppression case dons séparée

### Décisions finales

- **Décision** : Prix à zéro par défaut, somme globale à la fin
- **Décision** : Supprimer case dons séparée, intégrer dans total
- **Décision** : Module STT (Speech-to-Text) pour entrées vocales

### Actions

- Implémenter prix zéro par défaut + somme globale - Responsable: A
- Supprimer case dons séparée - Responsable: A
- Créer module STT basé sur WhisperWrite - Responsable: A

### Questions ouvertes

- Comment gérer la comptabilité avec prix zéro par défaut ?
- Comment intégrer les dons dans le total sans case séparée ?

---

## Thread #catégories-dénominations

**Apparu dans segments :** 001

### Évolution

Besoin d'améliorer la gestion des catégories avec double dénomination.

- **Segment 001** : Demande dénomination rapide (affichage) + complète (comptabilité, pop-up pédagogique)

### Décisions finales

- **Décision** : Ajouter dénomination complète aux catégories
- **Décision** : Dénomination rapide pour affichage (boutons), complète pour comptabilité et pop-up

### Actions

- Ajouter dénomination complète aux catégories - Responsable: A
- Implémenter pop-up pédagogique au survol - Responsable: A

---

## Thread #chatbot-ia-base-connaissances

**Apparu dans segments :** 001, 002

### Évolution

Proposition d'intégration IA pour aide à la catégorisation et recherche.

- **Segment 001** : Chatbot IA pour catégorisation (ex: "fer à repasser, quelle catégorie ?")
- **Segment 001** : Bases de connaissances partagées (documents éco-organismes, normes, textes de loi)
- **Segment 001** : Question trace/mémoire chatbots (locale vs globale)

### Décisions finales

- **Décision** : Développer chatbot IA pour catégorisation
- **Décision** : Créer bases de connaissances partagées (locale privée + globale partagée)

### Actions

- Développer chatbot IA pour catégorisation - Responsable: A
- Créer bases de connaissances (documents éco-organismes, normes, textes de loi) - Responsable: A
- Implémenter système trace/mémoire chatbots (locale vs globale) - Responsable: A

### Questions ouvertes

- Comment gérer la trace/mémoire des chatbots (locale vs globale) ?
- Quelle API utiliser pour recherche fallback (Perplexity Pro mentionné) ?

---

## Thread #logs-audit-traçabilité

**Apparu dans segments :** 002, 003

### Évolution

Besoin de traçabilité pour savoir qui a fait quoi, quand.

- **Segment 002** : Demande système visualisation logs
- **Segment 003** : Explication système existant (journal d'audit, activités et logs)

### Décisions finales

- **Décision** : Utiliser système logs/audit existant
- **Décision** : Améliorer traçabilité (opérateur, timestamp, détails)

### Actions

- Améliorer logs/audit pour traçabilité complète - Responsable: C
- Documenter utilisation système logs existant - Responsable: C

---

## Thread #sortie-stock-réception

**Apparu dans segments :** 001

### Évolution

Besoin de pouvoir sortir des objets du stock depuis l'écran de réception.

- **Segment 001** : Demande fonctionnalité sortie de stock sur écran réception (case à cocher, destination recyclage)

### Décisions finales

- **Décision** : Ajouter fonctionnalité sortie de stock sur écran réception
- **Décision** : Case à cocher "sortie" avec destination recyclage par défaut

### Actions

- Implémenter sortie de stock sur réception - Responsable: A
- Ajouter case à cocher + destination recyclage - Responsable: A

---

## Synthèse des priorités

### Chantiers majeurs (à approfondir séparément)
1. **Tarification** : Chantier complet nécessitant recherche et définition politique
2. **Comptes utilisateurs / Code PIN** : Architecture complète à finaliser

### Fonctionnalités à implémenter
1. Prix zéro + somme globale (caisse)
2. Module STT (Speech-to-Text)
3. Sortie stock depuis réception
4. Dénomination complète catégories
5. Chatbot IA catégorisation
6. Bases de connaissances partagées

### Questions critiques non résolues
1. Prix minimum vs prix indicatif
2. Droits utilisateurs par rôle
3. Gestion cas particuliers vs politique générale
4. Compatibilité avec promotions



