# Story B48-P4: Refonte UX Page Gestion Catégories Admin

**Statut:** Ready for Development  
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

## 4. Audit UX & Recommandations (Sally - UX Expert)

### 4.1. Problèmes UX Identifiés

#### Problème 1 : Séparation artificielle des fonctionnalités
- **Symptôme** : Deux onglets distincts ("Gestion" et "Visibilité") créent une séparation mentale inutile
- **Impact** : L'utilisateur doit naviguer entre les onglets pour gérer une catégorie complètement
- **Cause** : Architecture basée sur des composants séparés plutôt que sur les besoins utilisateur

#### Problème 2 : Actions dispersées et difficiles d'accès
- **Symptôme** : Bouton d'édition dans une colonne à droite, loin du nom de la catégorie
- **Impact** : Mouvement oculaire et clic supplémentaires, fatigue visuelle
- **Cause** : Tableau classique avec colonnes d'actions séparées

#### Problème 3 : Pas de réorganisation manuelle intuitive
- **Symptôme** : Tri alphabétique uniquement, pas de contrôle sur l'ordre d'affichage
- **Impact** : Impossible d'organiser les catégories selon la logique métier
- **Cause** : Manque de contrôles drag-and-drop ou boutons monter/descendre

#### Problème 4 : Hiérarchie peu claire visuellement
- **Symptôme** : Indentation minimale (20px), pas de distinction visuelle forte entre niveaux
- **Impact** : Difficile de comprendre rapidement la structure hiérarchique
- **Cause** : Design de tableau plat adapté à une structure arborescente

#### Problème 5 : Informations contextuelles manquantes
- **Symptôme** : Visibilité et ordre d'affichage gérés dans un onglet séparé
- **Impact** : Pas de vue d'ensemble, nécessite de basculer entre onglets
- **Cause** : Séparation fonctionnelle plutôt qu'intégration

### 4.2. Solution UX Proposée : Interface Unifiée avec Vue en Liste Enrichie

#### Concept Principal
**Une seule vue unifiée** qui combine toutes les fonctionnalités dans une liste hiérarchique interactive, avec des actions contextuelles accessibles directement sur chaque ligne.

#### Principes de Design
1. **Proximité des actions** : Toutes les actions d'une catégorie sont accessibles directement sur sa ligne
2. **Feedback visuel immédiat** : Indicateurs visuels clairs pour statut, visibilité, archivage
3. **Réorganisation intuitive** : Drag-and-drop ou boutons fléchés pour réorganiser
4. **Hiérarchie visuelle forte** : Indentation claire, connecteurs visuels, badges de niveau
5. **Vue d'ensemble** : Toutes les informations importantes visibles sans navigation

### 4.3. Spécifications UI Détaillées

#### 4.3.1. Structure de la Page

```
┌─────────────────────────────────────────────────────────────┐
│  Gestion des Catégories                                      │
│  [Importer] [Exporter ▼] [Actualiser] [+ Nouvelle catégorie] │
├─────────────────────────────────────────────────────────────┤
│  [☑ Afficher les éléments archivés]  [🔍 Rechercher...]    │
│  [📊 Vue: Liste | Grille]  [🔽 Trier: Ordre d'affichage]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─ Catégorie Racine 1                    [👁️] [📝] [⋮]    │
│  │  └─ Sous-catégorie 1.1                 [👁️] [📝] [⋮]    │
│  │  └─ Sous-catégorie 1.2                 [👁️] [📝] [⋮]    │
│  └─ Catégorie Racine 2                    [👁️] [📝] [⋮]    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### 4.3.2. Composant de Ligne de Catégorie

Chaque ligne de catégorie doit afficher :

1. **Zone de réorganisation** (gauche) :
   - Icône `IconGripVertical` pour drag-and-drop
   - OU boutons fléchés ↑↓ pour monter/descendre
   - Visible au survol de la ligne

2. **Indicateur d'expansion** (si enfants) :
   - Chevron droite/bas pour expand/collapse
   - Espace réservé si pas d'enfants

3. **Badge de statut** :
   - 🟢 Actif (par défaut, pas de badge)
   - 🟡 Archivé (si `deleted_at` présent)
   - Indicateur visuel discret

4. **Nom de la catégorie** :
   - Nom court (`name`) en gras pour catégories racines
   - Nom normal pour sous-catégories
   - Tooltip avec nom officiel (`official_name`) si présent
   - Style italique + grisé si archivée

5. **Informations contextuelles** (optionnel, collapsible) :
   - Nom officiel complet (si différent du nom court)
   - Prix min/max (si définis)
   - Date d'archivage (si archivée)

6. **Contrôles de visibilité** (inline) :
   - Checkbox "Visible pour tickets ENTRY/DEPOT"
   - Badge visuel : 👁️ si visible, 👁️‍🗨️ si masquée
   - Mise à jour optimiste (sans rechargement)

7. **Ordre d'affichage** (inline) :
   - Input numérique compact (80px) pour `display_order`
   - Mise à jour optimiste

8. **Actions contextuelles** (droite) :
   - Bouton d'édition (icône crayon) - toujours visible
   - Menu contextuel (⋮) avec :
     - Modifier
     - Archiver / Restaurer (selon statut)
     - Supprimer (si pas d'usage)
     - Dupliquer (optionnel)

#### 4.3.3. Améliorations Visuelles

**Hiérarchie** :
- Indentation : 24px par niveau (au lieu de 20px)
- Ligne de connexion visuelle (optionnel) pour montrer la parenté
- Fond légèrement différent pour les niveaux pairs (alternance subtile)

**Feedback visuel** :
- Survol de ligne : fond légèrement coloré, actions visibles
- État de chargement : spinner sur l'action en cours
- Confirmation : notification toast pour chaque action

**Responsive** :
- Sur petits écrans : masquer certaines colonnes, menu contextuel pour tout
- Mode compact : réduire l'espacement vertical

#### 4.3.4. Fonctionnalités de Réorganisation

**Option A : Drag-and-Drop (Recommandé)**
- Utiliser `@dnd-kit/core` ou `react-beautiful-dnd`
- Zone de drop visuelle lors du drag
- Validation : empêcher le drop invalide (ex: catégorie sous elle-même)
- Sauvegarde automatique de l'ordre après drop

**Option B : Boutons Fléchés (Fallback)**
- Boutons ↑↓ sur chaque ligne
- Monter/Descendre dans le même niveau hiérarchique
- Sauvegarde immédiate

**Ordre de tri** :
- Par défaut : `display_order` ASC, puis `name` ASC
- Option de tri : Alphabétique, Date de création, Date de modification

#### 4.3.5. Intégration Soft Delete (B48-P1)

**Toggle "Afficher archivés"** :
- En haut de la liste, à côté de la recherche
- Quand activé : afficher les catégories archivées avec style distinct
- Colonne "Date d'archivage" visible uniquement si toggle activé

**Actions sur catégories archivées** :
- Bouton "Restaurer" dans le menu contextuel
- Bouton "Restaurer" visible dans le modal d'édition
- Style visuel distinct (italique, grisé, icône archive)

#### 4.3.6. Suppression de l'Onglet "Visibilité"

**Fusion dans la vue principale** :
- Checkbox de visibilité directement sur chaque ligne
- Badge visuel pour indiquer l'état
- Tooltip explicatif : "Visible pour tickets ENTRY/DEPOT"
- Alert informatif en haut (une seule fois) expliquant la fonctionnalité

**Composant EnhancedCategorySelector** :
- Conserver pour les autres usages (création de tickets)
- Retirer de la page admin (remplacé par la vue unifiée)

### 4.4. Wireframe Conceptuel

```
┌─────────────────────────────────────────────────────────────────────┐
│  📦 Gestion des Catégories                                           │
│  Gérer les catégories de produits utilisées dans l'application       │
│                                                                       │
│  [📥 Importer] [📤 Exporter ▼] [🔄 Actualiser] [+ Nouvelle catégorie]│
├─────────────────────────────────────────────────────────────────────┤
│  ☑ Afficher les éléments archivés  🔍 [Rechercher...]              │
│  📊 Vue: ● Liste ○ Grille  🔽 Trier: Ordre d'affichage              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ═══════════════════════════════════════════════════════════════════ │
│  🟢 ▼ Métaux                    👁️ [12] [📝] [⋮]                    │
│     🟢   └─ Fer                 👁️ [8]  [📝] [⋮]                    │
│     🟢   └─ Aluminium           👁️ [5]  [📝] [⋮]                    │
│  🟢 ▼ Électronique              👁️ [15] [📝] [⋮]                    │
│     🟢   └─ Ordinateurs         👁️ [10] [📝] [⋮]                    │
│     🟡   └─ Téléphones          👁️‍🗨️ [3]  [📝] [⋮] (archivé)         │
│  🟢 ▼ Textile                   👁️ [7]  [📝] [⋮]                    │
│                                                                       │
│  ═══════════════════════════════════════════════════════════════════ │
│                                                                       │
│  ℹ️ Les catégories cochées (👁️) apparaissent dans les tickets        │
│    ENTRY/DEPOT. Les tickets SALE affichent toujours toutes les       │
│    catégories actives.                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.5. Composants Techniques à Créer/Modifier

1. **`CategoryListRow.tsx`** (nouveau)
   - Ligne de catégorie avec toutes les actions inline
   - Gestion du drag-and-drop ou boutons fléchés
   - États visuels (hover, loading, archived)

2. **`CategoryTreeView.tsx`** (nouveau)
   - Vue arborescente unifiée
   - Gestion de l'expansion/collapse
   - Intégration des contrôles de visibilité et ordre

3. **`Categories.tsx`** (refonte)
   - Supprimer les Tabs
   - Intégrer CategoryTreeView
   - Ajouter barre de recherche et filtres

4. **Hooks personnalisés** :
   - `useCategoryDragDrop.ts` : Gestion du drag-and-drop
   - `useCategoryActions.ts` : Actions contextuelles (edit, archive, restore, delete)

### 4.6. Priorités d'Implémentation

**Phase 1 - Fondations** (2-3h) :
- Supprimer les Tabs, créer la vue unifiée
- Intégrer les contrôles de visibilité inline
- Ajouter les actions contextuelles (menu ⋮)

**Phase 2 - Réorganisation** (2-3h) :
- Implémenter drag-and-drop OU boutons fléchés
- Sauvegarde automatique de l'ordre
- Validation des règles hiérarchiques

**Phase 3 - Polish** (1-2h) :
- Améliorer la hiérarchie visuelle
- Ajouter les tooltips et feedbacks
- Optimiser le responsive

**Total estimé : 5-8h**

---

## 5. Critères d'acceptation

### Interface Unifiée

1. **Fusion des volets** :
   - [ ] Les onglets "Gestion" et "Visibilité" sont supprimés
   - [ ] Toutes les fonctionnalités sont accessibles dans une vue unique
   - [ ] Les contrôles de visibilité sont inline sur chaque ligne de catégorie
   - [ ] L'ordre d'affichage est modifiable directement dans la liste

### Ergonomie & Confort

2. **Réorganisation manuelle** :
   - [ ] Drag-and-drop fonctionnel OU boutons fléchés ↑↓ pour réorganiser
   - [ ] Réorganisation limitée au même niveau hiérarchique (pas de changement de parent via drag)
   - [ ] Sauvegarde automatique de l'ordre après modification
   - [ ] Option de tri : Ordre d'affichage (défaut), Alphabétique, Date de création
   - [ ] Validation : empêcher les réorganisations invalides (ex: catégorie sous elle-même)

3. **Accessibilité des actions** :
   - [ ] Bouton d'édition visible directement sur chaque ligne (icône crayon)
   - [ ] Menu contextuel (⋮) avec toutes les actions : Modifier, Archiver/Restaurer, Supprimer
   - [ ] Actions visibles au survol de la ligne (feedback visuel)
   - [ ] Tooltips explicatifs sur tous les contrôles

4. **Confort visuel** :
   - [ ] Hiérarchie claire : indentation 24px par niveau
   - [ ] Indicateurs visuels : 🟢 Actif, 🟡 Archivé, 👁️ Visible, 👁️‍🗨️ Masquée
   - [ ] Style distinct pour catégories archivées (italique, grisé)
   - [ ] Feedback immédiat : notifications toast pour chaque action
   - [ ] États de chargement : spinner sur actions en cours

### Fonctionnalités Complémentaires

5. **Intégration Soft Delete (B48-P1)** :
   - [ ] Toggle "Afficher les éléments archivés" en haut de la liste
   - [ ] Colonne "Date d'archivage" visible uniquement si toggle activé
   - [ ] Bouton "Restaurer" dans le menu contextuel et le modal d'édition
   - [ ] Affichage visuel distinct pour les catégories archivées

6. **Gestion de la visibilité** :
   - [ ] Checkbox "Visible pour tickets ENTRY/DEPOT" inline sur chaque ligne
   - [ ] Mise à jour optimiste (sans rechargement de page)
   - [ ] Badge visuel 👁️/👁️‍🗨️ pour indiquer l'état de visibilité
   - [ ] Alert informatif expliquant la différence ENTRY vs SALE (une seule fois, en haut)

7. **Ordre d'affichage** :
   - [ ] Input numérique compact (80px) pour `display_order` sur chaque ligne
   - [ ] Mise à jour optimiste lors de la modification
   - [ ] Tri par défaut : `display_order` ASC, puis `name` ASC

8. **Recherche et filtrage** :
   - [ ] Barre de recherche pour filtrer par nom
   - [ ] Filtre par statut : Toutes, Actives uniquement, Archivées uniquement
   - [ ] Option de vue : Liste (défaut) / Grille (optionnel)

---

## 6. Dépendances

- **Pré-requis OBLIGATOIRE** : B48-P1 (Soft Delete des Catégories) doit être terminée
  - La refonte UX doit intégrer les nouvelles fonctionnalités d'archivage
  - Le toggle "Afficher archivés" et la restauration doivent être inclus dans la nouvelle interface

- **Pré-requis** : Recommandations UI/UX de l'agent BMAD
  - Cette story ne peut pas être développée sans les spécifications UI/UX détaillées

---

## 7. Tâches

### Phase 1 - Fondations (2-3h)

- [ ] **T1.1 - Supprimer les Tabs et créer la vue unifiée**
  - Supprimer le composant `Tabs` de `Categories.tsx`
  - Retirer l'utilisation de `EnhancedCategorySelector` dans l'onglet "Visibilité"
  - Créer le composant `CategoryTreeView.tsx` pour la vue arborescente unifiée

- [ ] **T1.2 - Intégrer les contrôles de visibilité inline**
  - Ajouter checkbox de visibilité directement sur chaque ligne
  - Implémenter la mise à jour optimiste via `toggleCategoryVisibility`
  - Ajouter les badges visuels 👁️/👁️‍🗨️
  - Ajouter l'alert informatif en haut de page

- [ ] **T1.3 - Ajouter les actions contextuelles**
  - Créer le composant `CategoryListRow.tsx` avec toutes les actions
  - Implémenter le menu contextuel (⋮) avec Modifier, Archiver/Restaurer, Supprimer
  - Rendre le bouton d'édition toujours visible sur chaque ligne

### Phase 2 - Réorganisation (2-3h)

- [ ] **T2.1 - Implémenter la réorganisation**
  - Option A (recommandé) : Intégrer `@dnd-kit/core` pour drag-and-drop
  - Option B (fallback) : Ajouter boutons fléchés ↑↓ sur chaque ligne
  - Créer le hook `useCategoryDragDrop.ts` pour gérer la logique
  - Valider les règles hiérarchiques (pas de drop invalide)

- [ ] **T2.2 - Sauvegarde automatique de l'ordre**
  - Appeler `updateDisplayOrder` après chaque modification
  - Gérer les états de chargement pendant la sauvegarde
  - Afficher une notification de confirmation

- [ ] **T2.3 - Options de tri**
  - Ajouter un sélecteur de tri : Ordre d'affichage (défaut), Alphabétique, Date
  - Implémenter la logique de tri dans `CategoryTreeView`

### Phase 3 - Polish & Intégration (1-2h)

- [ ] **T3.1 - Améliorer la hiérarchie visuelle**
  - Augmenter l'indentation à 24px par niveau
  - Ajouter des styles distincts pour les niveaux pairs/impairs
  - Améliorer la distinction visuelle des catégories archivées

- [ ] **T3.2 - Ajouter recherche et filtres**
  - Implémenter la barre de recherche pour filtrer par nom
  - Ajouter le toggle "Afficher les éléments archivés" (intégration B48-P1)
  - Afficher la colonne "Date d'archivage" conditionnellement

- [ ] **T3.3 - Tooltips et feedbacks**
  - Ajouter des tooltips sur tous les contrôles
  - Améliorer les messages de notification
  - Ajouter des états de chargement visuels

- [ ] **T3.4 - Tests et validation**
  - Tester toutes les actions (édition, archivage, restauration, suppression)
  - Valider la réorganisation (drag-and-drop ou flèches)
  - Vérifier la mise à jour optimiste de la visibilité
  - Tester le responsive sur petits écrans

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

**Estimation détaillée** :
- Phase 1 - Fondations : 2-3h
- Phase 2 - Réorganisation : 2-3h
- Phase 3 - Polish & Intégration : 1-2h

**Total : 5-8h** (selon choix drag-and-drop vs boutons fléchés)

---

## 10. Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-09 | 1.0 | Création story draft (en attente recommandations UI/UX) | Sarah (PO) |
| 2025-01-XX | 2.0 | Recommandations UX détaillées ajoutées, story complétée | Sally (UX Expert) |

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

**Recommandations UX validées** : Les spécifications détaillées ont été ajoutées dans la section 4. La story est maintenant prête pour le développement.

**Dépendances** :
- ✅ B48-P1 (Soft Delete) est terminée (Ready for Review)
- ✅ Recommandations UI/UX complétées

**Choix techniques à valider** :
- Drag-and-drop (`@dnd-kit/core`) vs Boutons fléchés : Préférer drag-and-drop si possible, sinon fallback sur boutons
- Bibliothèque de drag-and-drop : `@dnd-kit/core` recommandée (plus moderne et accessible que `react-beautiful-dnd`)

**Points d'attention** :
- La mise à jour optimiste doit gérer les erreurs (rollback si échec API)
- La validation des règles hiérarchiques doit empêcher les réorganisations invalides
- Le responsive doit être testé sur petits écrans (masquer certaines colonnes si nécessaire)

