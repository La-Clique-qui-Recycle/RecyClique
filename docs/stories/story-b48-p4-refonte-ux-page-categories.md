# Story B48-P4: Refonte UX Page Gestion Catégories Admin

**Statut:** Draft (En attente recommandations UI/UX)  
**Épopée:** [EPIC-B48 – Améliorations Opérationnelles v1.3.2](../epics/epic-b48-ameliorations-operationnelles-v1.3.2.md)  
**Module:** Frontend Admin  
**Priorité:** MOYENNE (amélioration confort d'usage)

---

## 1. Contexte

La page actuelle de gestion des catégories dans l'admin (`/admin/categories`) présente deux volets séparés :

1. **"Gestion des catégories"** : Très difficilement utilisable
   - Manque d'options et de confort visuel/pratique
   - Boutons d'édition trop loin
   - Pas de possibilité de réorganiser l'ordre (tri alphabétique auto uniquement)
   - Interface peu ergonomique

2. **"Visibilité pour tickets de réception"** : Peut être confus
   - Fonctionnalités à améliorer
   - Séparation avec le premier volet pas toujours claire

**Besoin** : Unifier ces deux volets dans une interface cohérente, ergonomique et complète.

**Dépendance** : Cette story doit être faite **APRÈS** la story B48-P1 (Soft Delete des Catégories) car la refonte UX doit intégrer les nouvelles fonctionnalités d'archivage.

---

## 2. User Story

En tant que **Administrateur (Olive)**,  
je veux **une interface unifiée et ergonomique pour gérer les catégories et leur visibilité**,  
afin que **je puisse facilement organiser, modifier et configurer les catégories sans frustration**.

---

## 3. Objectifs de la Refonte

### Problèmes Identifiés (À valider avec UI/UX)

1. **Volets séparés** : Deux onglets distincts créent de la confusion
2. **Manque d'options** : Pas assez de contrôles pour gérer efficacement
3. **Confort visuel** : Interface peu claire, boutons mal positionnés
4. **Confort pratique** : Pas de réorganisation manuelle (tri alphabétique uniquement)
5. **Ergonomie** : Boutons d'édition trop loin, actions difficiles à trouver

### Objectifs (À compléter avec recommandations UI/UX)

1. **Unification** : Fusionner les deux volets en une interface cohérente
2. **Ergonomie** : Améliorer le confort visuel et pratique
3. **Fonctionnalités** : Ajouter les options manquantes (réorganisation, tri personnalisé)
4. **Clarté** : Rendre l'interface plus intuitive et moins confuse

---

## 4. Mandat UI/UX

**Action requise** : Mandater l'agent UI/UX de BMAD pour :
1. Analyser l'interface actuelle (`frontend/src/pages/Admin/Categories.tsx`)
2. Identifier les problèmes UX spécifiques
3. Proposer des recommandations de design
4. Valider ou compléter cette story avec les spécifications UI/UX détaillées

**Livrables attendus de l'agent UI/UX** :
- Audit UX de l'interface actuelle
- Recommandations de design (wireframes, composants, interactions)
- Spécifications détaillées pour la refonte
- Validation des objectifs et critères d'acceptation

---

## 5. Critères d'acceptation (À compléter après recommandations UI/UX)

### Interface Unifiée

1. **Fusion des volets** :
   - [ ] Les deux volets sont unifiés en une interface cohérente
   - [ ] La gestion des catégories et leur visibilité sont accessibles depuis la même vue
   - [ ] Pas de confusion entre les deux fonctionnalités

### Ergonomie & Confort

2. **Réorganisation manuelle** :
   - [ ] Boutons "Monter" / "Descendre" pour réorganiser l'ordre des catégories
   - [ ] Abandon du tri alphabétique automatique (ou option pour le désactiver)
   - [ ] Sauvegarde de l'ordre personnalisé

3. **Accessibilité des actions** :
   - [ ] Boutons d'édition facilement accessibles (pas trop loin)
   - [ ] Actions contextuelles claires et visibles
   - [ ] Menu contextuel ou actions rapides selon recommandations UI/UX

4. **Confort visuel** :
   - [ ] Interface claire et aérée
   - [ ] Hiérarchie visuelle évidente (catégories parentes / enfants)
   - [ ] Indicateurs visuels pour statut (actif, archivé, visible)
   - [ ] Feedback visuel sur les actions

### Fonctionnalités Complémentaires

5. **Gestion avancée** :
   - [ ] Intégration des fonctionnalités Soft Delete (toggle "Afficher archivés", restauration)
   - [ ] Gestion de la visibilité pour tickets de réception améliorée
   - [ ] Options de tri et filtrage selon recommandations UI/UX

---

## 6. Dépendances

- **Pré-requis OBLIGATOIRE** : B48-P1 (Soft Delete des Catégories) doit être terminée
  - La refonte UX doit intégrer les nouvelles fonctionnalités d'archivage
  - Le toggle "Afficher archivés" et la restauration doivent être inclus dans la nouvelle interface

- **Pré-requis** : Recommandations UI/UX de l'agent BMAD
  - Cette story ne peut pas être développée sans les spécifications UI/UX détaillées

---

## 7. Tâches (À compléter après recommandations UI/UX)

- [ ] **T0 - Mandat UI/UX** (À faire en premier)
  - Contacter agent UI/UX de BMAD
  - Fournir accès à l'interface actuelle
  - Recevoir recommandations et spécifications détaillées

- [ ] **T1 - Analyse & Spécifications** (Après recommandations UI/UX)
  - Valider les recommandations avec l'équipe
  - Compléter cette story avec les spécifications détaillées
  - Créer wireframes/mockups si nécessaire

- [ ] **T2 - Refonte Interface** (À définir selon recommandations)
  - [Tâches à compléter après recommandations UI/UX]

- [ ] **T3 - Tests** (À définir selon recommandations)
  - [Tâches à compléter après recommandations UI/UX]

---

## 8. Dev Notes

### Références Architecturales Clés

1. **Page actuelle** : `frontend/src/pages/Admin/Categories.tsx`
   - Structure actuelle avec deux onglets (Tabs)
   - Volets : "Gestion des catégories" et "Visibilité pour tickets de réception"

2. **Composants existants** :
   - `frontend/src/components/business/CategoryForm.tsx` - Formulaire catégorie
   - `frontend/src/components/business/CategorySelector.tsx` - Sélecteur catégories
   - `frontend/src/components/categories/CategoryDisplayManager.tsx` - Gestion affichage

3. **Fonctionnalités à intégrer** :
   - Soft Delete (B48-P1) : Toggle "Afficher archivés", restauration
   - Réorganisation manuelle : Boutons monter/descendre
   - Visibilité tickets : Amélioration interface

### Points d'Attention

- **Dépendance B48-P1** : Ne pas commencer cette story avant que B48-P1 soit terminée
- **Recommandations UI/UX** : Attendre les spécifications détaillées avant développement
- **Rétrocompatibilité** : S'assurer que les fonctionnalités existantes restent accessibles

---

## 9. Estimation

**À définir après recommandations UI/UX**

Estimation préliminaire : 5-8h (selon complexité de la refonte)

---

## 10. Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-09 | 1.0 | Création story draft (en attente recommandations UI/UX) | Sarah (PO) |

---

## 11. Definition of Done

- [ ] Recommandations UI/UX reçues et validées
- [ ] Story complétée avec spécifications détaillées
- [ ] Interface unifiée et ergonomique
- [ ] Réorganisation manuelle fonctionnelle
- [ ] Intégration Soft Delete (B48-P1) complète
- [ ] Tests UI/UX passent
- [ ] Aucune régression sur fonctionnalités existantes
- [ ] Code review validé

---

## 12. Notes

**Action immédiate requise** : Mandater l'agent UI/UX de BMAD pour analyser l'interface actuelle et fournir des recommandations détaillées avant de commencer le développement.

**Statut** : Cette story est en **draft** et ne peut pas être développée tant que :
1. B48-P1 (Soft Delete) n'est pas terminée
2. Les recommandations UI/UX ne sont pas reçues et validées

