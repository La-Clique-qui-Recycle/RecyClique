# Compte-rendu - Réunion Recyclic

**Date :** 2025-01-27  
**Meeting ID :** 2025-01-27-test-transcription  
**Durée totale :** 51 minutes 44 secondes (3104 secondes)  
**Participants :** Speaker A, Speaker B, Speaker C, Speaker D, Speaker E, Speaker F  
**Format :** Réunion enregistrée (5 fichiers audio)

---

## Ordre du jour

1. **Bugs et besoins** remarqués par l'équipe
2. **Point PAECO** : état d'avancement et interface Recyclic PAECO
3. **Catégories et déclarations aux éco-organismes**
4. **Comptes utilisateurs dans Recyclic** : code PIN, alertes, communication interne

---

## 1. Bugs et besoins identifiés

### Problèmes identifiés

- **Perte de temps à la caisse** : Saisie des prix individuels sur chaque objet est chronophage
- **Débat non résolu** : Prix minimum vs prix indicatif (depuis réunion précédente)

### Décisions prises

- **Proposition** : Prix à zéro par défaut, somme globale à la fin (à valider)
- **Décision** : Supprimer case "dons" séparée, intégrer dans le total
- **Décision** : Créer module STT (Speech-to-Text) basé sur WhisperWrite pour entrées vocales à la caisse

### Actions (RACI)

- Implémenter prix zéro par défaut + somme globale - **Responsable: A**
- Supprimer case dons séparée - **Responsable: A**
- Créer module STT basé sur WhisperWrite - **Responsable: A**

### Questions ouvertes

- Comment gérer la comptabilité avec prix zéro par défaut ?
- Comment intégrer les dons dans le total sans case séparée ?

---

## 2. Point PAECO

### Contexte

Point mentionné dans l'ordre du jour mais non approfondi dans les segments analysés.

### Éléments mentionnés

- Interface Recyclic PAECO à développer
- Lien avec gestion des participants/bénéficiaires
- Lien avec comptabilité des dons
- Connexion future Recyclic ↔ PAECO (automatique)
- Correspondances à documenter pour liaison automatique

### Actions (RACI)

- Documenter correspondances Recyclic ↔ PAECO - **Responsable: À définir**
- Planifier développement interface Recyclic PAECO - **Responsable: À définir**

---

## 3. Catégories et déclarations aux éco-organismes

### Contexte

Sujet mentionné dans l'ordre du jour mais non développé dans les segments analysés (001-003). À vérifier dans segments suivants.

### Décisions prises

- **Décision** : Ajouter dénomination complète aux catégories
- **Décision** : Dénomination rapide pour affichage (boutons), complète pour comptabilité et pop-up pédagogique

### Actions (RACI)

- Ajouter dénomination complète aux catégories - **Responsable: A**
- Implémenter pop-up pédagogique au survol - **Responsable: A**

---

## 4. Comptes utilisateurs et code PIN

### Contexte

Le système de code PIN existe déjà mais n'est pas activé. Discussion sur architecture complète de gestion des droits.

### Décisions prises

- **Décision** : Activer système code PIN avec vérification unicité
- **Décision** : Code PIN identifie utilisateur rapidement (pas besoin de nom)
- **Décision** : Distinction entre connexion site (identifié/mot de passe) et poste local (code PIN)
- **Décision** : Déconnexion automatique après inactivité (paramétrable, timing différent caisse vs admin)
- **Décision** : Gérer comptes utilisateurs via PAECO (adhérents, newsletter, droits)

### Détails techniques

- Code PIN unique par utilisateur (vérification si déjà pris)
- Compte "LaClic" (partagé) vs comptes individuels
- Bénévole avec code PIN accède à son espace personnel selon droits
- Admin avec code PIN accède à toute l'interface selon niveau
- Déconnexion automatique : 5 minutes pour caisse (paramétrable)

### Actions (RACI)

- Activer code PIN pour caisse/réception - **Responsable: A**
- Implémenter vérification unicité code PIN - **Responsable: A**
- Configurer déconnexion automatique (timing caisse) - **Responsable: A**
- Définir droits précis pour chaque rôle (bénévole, caisse, compta, admin, SNU) - **Responsable: Équipe**

### Questions ouvertes

- Quels droits précis pour chaque type d'utilisateur (bénévole, caisse, compta, admin, SNU) ?
- Quand activer les comptes individuels vs compte unique actuel ?

---

## 5. Communication interne

### Contexte

Sujet mentionné dans l'ordre du jour ("alertes entre les postes et les messages éventuels, qui peuvent même être à distance") mais non développé dans les segments analysés.

### Actions (RACI)

- Clarifier besoins communication interne - **Responsable: À définir**

---

## 6. Sortie de stock depuis réception

### Décisions prises

- **Décision** : Ajouter fonctionnalité sortie de stock sur écran réception
- **Décision** : Case à cocher "sortie" avec destination recyclage par défaut

### Actions (RACI)

- Implémenter sortie de stock sur réception - **Responsable: A**
- Ajouter case à cocher + destination recyclage - **Responsable: A**

---

## 7. Chatbot IA et bases de connaissances

### Décisions prises

- **Décision** : Développer chatbot IA pour catégorisation (ex: "fer à repasser, quelle catégorie ?")
- **Décision** : Créer bases de connaissances partagées (locale privée + globale partagée)
- **Décision** : Documents sources (éco-organismes, normes, textes de loi, fonctionnement compta)

### Actions (RACI)

- Développer chatbot IA pour catégorisation - **Responsable: A**
- Créer bases de connaissances (documents éco-organismes, normes, textes de loi) - **Responsable: A**
- Implémenter système trace/mémoire chatbots (locale vs globale) - **Responsable: A**

### Questions ouvertes

- Comment gérer la trace/mémoire des chatbots (locale vs globale) ?
- Quelle API utiliser pour recherche fallback (Perplexity Pro mentionné) ?

---

## 8. Tarification (Chantier majeur)

### Contexte

Débat non résolu depuis réunion précédente. Identifié comme chantier à part entière nécessitant recherche approfondie.

### État actuel

- Confusion entre "prix minimum" et "prix indicatif"
- Recherche effectuée sur pratiques tarification recycleries en France (3 fonctionnements identifiés)
- Politique tarifaire = sujet d'étude à définir avant implémentation

### Décisions prises

- **Décision formelle** : La tarification est reportée comme un chantier séparé à approfondir
- **Décision technique** : Prix à zéro par défaut, somme globale à la fin (proposition)
- **Décision opérationnelle** : Utiliser système de notes sur tickets pour cas particuliers

### Actions (RACI)

- Approfondir recherche sur pratiques tarification recycleries en France (3 fonctionnements identifiés) - **Responsable: A**
- Définir politique tarifaire claire avec cas particuliers - **Responsable: Équipe**
- Vérifier compatibilité système avec promotions - **Responsable: A**
- Documenter politique tarifaire une fois définie - **Responsable: A**

### Questions ouvertes

- Comment résoudre définitivement le débat prix minimum vs prix indicatif ?
- Quels sont les 3 fonctionnements tarifaires identifiés dans la recherche ?
- Comment formaliser politique tarifaire avec cas particuliers ?
- Comment garantir compatibilité avec toutes les promotions futures ?

### Risques identifiés

- Politique tarifaire floue = confusion pour utilisateurs et équipe
- Risque d'incohérence entre politique générale et cas particuliers
- Promotions peuvent casser logique tarifaire si non prévu

---

## 9. Logs et traçabilité

### Contexte

Besoin de savoir qui a fait quoi, quand. Système existant à améliorer.

### Décisions prises

- **Décision** : Utiliser système logs/audit existant (journal d'audit, activités et logs)
- **Décision** : Améliorer traçabilité (opérateur, timestamp, détails)

### Actions (RACI)

- Améliorer logs/audit pour traçabilité complète - **Responsable: C**
- Documenter utilisation système logs existant - **Responsable: C**

---

## Points divers

### Sujets non prévus abordés

- Système élicitation IA pour tarification (basé sur méthode BMAD)
- Visualisation logs pour traçabilité opérations
- Compatibilité système avec promotions (ex: fringues à 1€)

---

## Prochaines étapes

### Chantiers majeurs (à approfondir séparément)

1. **Tarification** : Chantier complet nécessitant recherche et définition politique
   - Approfondir recherche pratiques recycleries françaises
   - Définir politique tarifaire claire
   - Résoudre débat prix minimum vs indicatif

2. **Comptes utilisateurs / Code PIN** : Architecture complète à finaliser
   - Définir droits précis par rôle
   - Activer système code PIN
   - Documenter architecture

### Fonctionnalités à implémenter (priorité)

1. Prix zéro + somme globale (caisse)
2. Module STT (Speech-to-Text)
3. Sortie stock depuis réception
4. Dénomination complète catégories
5. Chatbot IA catégorisation
6. Bases de connaissances partagées

### Questions critiques à résoudre

1. Prix minimum vs prix indicatif
2. Droits utilisateurs par rôle
3. Gestion cas particuliers vs politique générale
4. Compatibilité avec promotions

---

## Annexes

- **Transcription complète** : `transcriptions/full-transcript.json`
- **Segments** : `working/segments/segment-*.md` (12 segments)
- **Résumés** : `working/summaries/summary-*.md` (3 résumés)
- **Threads** : `working/threads.md`
- **Rapport validation** : `working/validation-report.md`
- **Index segments** : `working/index.json`

---

**Généré le :** 2025-01-27  
**Workflow :** meeting-transcription  
**Statut validation :** ✅ OK avec recommandations mineures

