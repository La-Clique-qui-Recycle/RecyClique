# Story B45-P2: Filtres Avancés

**Statut:** Draft  
**Épopée:** [EPIC-B45 – Audit Sessions Avancé](../epics/epic-b45-audit-sessions-avance.md)  
**Module:** Frontend Admin  
**Priorité:** P2 (Phase 1 - Fondations)

## 1. Contexte

Les filtres actuels dans `SessionManager.tsx` et `ReceptionSessionManager.tsx` sont basiques (date, statut, opérateur/bénévole). Pour un audit efficace, il faut des filtres avancés permettant de cibler précisément les sessions/tickets selon des critères métier (montant, variance, durée, etc.).

Cette story fait partie de la Phase 1 (Fondations) de l'Epic B45 et est un prérequis pour les fonctionnalités d'analyse avancée (Phase 2).

## 2. User Story

En tant que **administrateur**, je veux **filtrer les sessions/tickets avec des critères avancés (montant, variance, durée, etc.)**, afin de cibler précisément les données à analyser lors des audits.

## 3. Critères d'acceptation

1. **Filtres avancés Sessions de Caisse** :
   - Montant min/max (CA total)
   - Variance (oui/non ou seuil numérique)
   - Durée session (min/max en heures)
   - Méthode paiement (multi-sélection)
   - Présence don (oui/non)

2. **Filtres avancés Sessions de Réception** :
   - Poids min/max (kg)
   - Catégorie (multi-sélection)
   - Destination (multi-sélection)
   - Nombre lignes min/max

3. **Filtres combinables** : Tous les filtres utilisent une logique ET (tous les critères doivent être satisfaits)

4. **Sauvegarde filtres dans URL** : Les filtres sont encodés dans l'URL (query params) pour permettre le partage de vues filtrées

5. **Interface utilisateur** : Filtres avancés dans un accordéon expandable sous les filtres de base (selon design B45-P0)

## 4. Intégration & Compatibilité

- **Composants existants** : `SessionManager.tsx`, `ReceptionSessionManager.tsx`
- **Filtres existants** : Date, statut, opérateur/bénévole, recherche
- **Backend** : Endpoints doivent supporter les nouveaux filtres
- **Design** : Suivre architecture interface définie dans B45-P0

## 5. Dev Notes

### Références Architecturales Clés

1. **COMMENCER PAR** : `docs/architecture/index.md` - Navigation complète de l'architecture
2. **Design UX** : `docs/ux/audit-sessions-advanced-design.md` - Architecture interface (validé dans B45-P0)
3. **Frontend** : `docs/architecture/6-architecture-des-composants.md` - Patterns composants React
4. **API** : `docs/architecture/7-design-et-intgration-api.md` - Design API et intégration
5. **Décisions techniques** : `docs/architecture/technical-decisions-b45.md` - Décisions prises par l'Architect
6. **Testing** : `docs/testing-strategy.md` - Standards de tests

### Composants Existants à Étudier

- **`frontend/src/pages/Admin/SessionManager.tsx`** : 
  - Filtres actuels (lignes ~22-100)
  - Structure `FiltersBar`
  - Gestion état filtres
  
- **`frontend/src/pages/Admin/ReceptionSessionManager.tsx`** :
  - Filtres actuels
  - Structure similaire à SessionManager

### Structure de Données

**Filtres Sessions de Caisse** :
```typescript
interface AdvancedCashSessionFilters {
  // Filtres existants
  date_from?: string
  date_to?: string
  status?: 'open' | 'closed'
  operator_id?: string
  site_id?: string
  search?: string
  
  // Nouveaux filtres avancés
  amount_min?: number
  amount_max?: number
  variance_threshold?: number
  variance_has_variance?: boolean  // true = avec variance, false = sans variance
  duration_min_hours?: number
  duration_max_hours?: number
  payment_methods?: string[]  // multi-sélection
  has_donation?: boolean
}
```

**Filtres Sessions de Réception** :
```typescript
interface AdvancedReceptionTicketFilters {
  // Filtres existants
  date_from?: string
  date_to?: string
  status?: 'open' | 'closed'
  benevole_id?: string
  site_id?: string
  search?: string
  
  // Nouveaux filtres avancés
  poids_min?: number
  poids_max?: number
  categories?: string[]  // multi-sélection
  destinations?: string[]  // multi-sélection
  lignes_min?: number
  lignes_max?: number
}
```

### Endpoints API à Étendre

**Backend** :

1. **`GET /v1/admin/cash-sessions`** : Étendre pour supporter nouveaux filtres
   - Ajouter query params : `amount_min`, `amount_max`, `variance_threshold`, `variance_has_variance`, `duration_min_hours`, `duration_max_hours`, `payment_methods[]`, `has_donation`

2. **`GET /v1/reception/tickets`** : Étendre pour supporter nouveaux filtres
   - Ajouter query params : `poids_min`, `poids_max`, `categories[]`, `destinations[]`, `lignes_min`, `lignes_max`

### Sauvegarde URL (Query Params)

**Format** : Encoder tous les filtres dans l'URL
- Exemple : `/admin/cash-sessions?date_from=2025-01-01&date_to=2025-01-31&amount_min=100&variance_threshold=10&payment_methods[]=cash&payment_methods[]=card`

**Bibliothèque** : Utiliser `URLSearchParams` (natif) ou `query-string` si besoin de plus de fonctionnalités

**Synchronisation** :
- Au chargement : Lire filtres depuis URL
- Au changement filtre : Mettre à jour URL (sans rechargement page)
- Au partage : URL contient tous les filtres

### Composant UI - AdvancedFiltersAccordion (Design UX)

**Référence** : `docs/ux/audit-sessions-advanced-design.md` - Component: AdvancedFiltersAccordion

**Spécifications** :
- **Position** : Sous les filtres de base (toujours visibles)
- **Pattern** : Accordéon expandable
- **Par défaut** : Fermé (masqué) pour ne pas surcharger l'interface
- **Bouton** : "Filtres Avancés ▼" pour ouvrir/fermer
- **Animation** : Transition douce (0.2s) selon design UX
- **Responsive** : Sur mobile/tablette, utiliser modal au lieu d'accordéon

**Pattern d'interaction** :
1. Clic sur "Filtres Avancés ▼" → Accordéon s'ouvre
2. Remplir critères avancés
3. Clic sur "Appliquer" → Filtres appliqués, URL mise à jour, tableau mis à jour
4. Accordéon peut rester ouvert ou se fermer automatiquement

**User Flow** : Voir `docs/ux/audit-sessions-advanced-design.md` - Flow 2: Filtres Avancés

**Composants UI** :
- **Inputs numériques** : Montant min/max, poids min/max, durée min/max, lignes min/max
- **Select multi** : Méthode paiement, catégorie, destination
- **Toggle/Switch** : Variance oui/non, présence don
- **Slider (optionnel)** : Pour ranges (montant, poids)

### Fichiers à Créer/Modifier

**Frontend** :
- `frontend/src/pages/Admin/SessionManager.tsx` : 
  - Ajouter section filtres avancés (accordéon)
  - Ajouter gestion état nouveaux filtres
  - Ajouter synchronisation URL
- `frontend/src/pages/Admin/ReceptionSessionManager.tsx` :
  - Ajouter section filtres avancés (accordéon)
  - Ajouter gestion état nouveaux filtres
  - Ajouter synchronisation URL
- `frontend/src/services/cashSessionsService.ts` : Étendre interface `CashSessionFilters`
- `frontend/src/services/receptionTicketsService.ts` : Étendre interface filtres

**Backend** :
- `api/src/recyclic_api/api/api_v1/endpoints/cash_sessions.py` : Ajouter query params nouveaux filtres
- `api/src/recyclic_api/api/api_v1/endpoints/reception.py` : Ajouter query params nouveaux filtres
- `api/src/recyclic_api/services/cash_session_service.py` : Logique filtrage avancé
- `api/src/recyclic_api/services/reception_service.py` : Logique filtrage avancé

### Écarts Identifiés (Audit Brownfield)

**Référence** : `docs/architecture/audit-brownfield-b45-validation.md` - Section 4.1

**Fonctionnalités manquantes** :
- ❌ **Filtres avancés** : Code actuel ne contient que filtres de base (date, statut, opérateur, site, recherche)
- ❌ **Schéma** : `CashSessionFilters` ne contient pas les nouveaux champs (montant, variance, durée, paiement, don)
- ❌ **Service** : `CashSessionService.get_sessions_with_filters()` ne supporte pas les filtres avancés

**Action requise** : Étendre `CashSessionFilters` et `CashSessionService.get_sessions_with_filters()` pour supporter tous les filtres avancés

### Points d'Attention Techniques

1. **Performance** :
   - Filtres côté backend (pas côté client)
   - Index DB si nécessaire (montant, poids, variance)
   - Pagination maintenue avec filtres
   - **Variance** : Calculer variance côté backend si pas déjà fait
   - **Durée** : Calculer durée session (closed_at - opened_at) côté backend

2. **Variance** :
   - Calculer variance côté backend si pas déjà fait
   - Filtrer par seuil ou présence/absence

3. **Multi-sélection** :
   - Utiliser composant Mantine `MultiSelect` ou équivalent
   - Encoder dans URL comme array : `payment_methods[]=cash&payment_methods[]=card`

4. **Synchronisation URL** :
   - Débounce pour éviter trop de mises à jour URL
   - Gérer historique navigateur (back/forward)

5. **Validation** :
   - Min < Max pour ranges
   - Formats numériques valides
   - Dates cohérentes

## 6. Tasks / Subtasks

- [ ] **Backend - Étendre Endpoint Sessions de Caisse** (AC: 1)
  - [ ] Ajouter query params nouveaux filtres dans `cash_sessions.py`
  - [ ] Implémenter logique filtrage avancé dans `cash_session_service.py`
  - [ ] Calculer variance si nécessaire
  - [ ] Calculer durée session si nécessaire
  - [ ] Tests unitaires filtres (pytest)

- [ ] **Backend - Étendre Endpoint Tickets de Réception** (AC: 2)
  - [ ] Ajouter query params nouveaux filtres dans `reception.py`
  - [ ] Implémenter logique filtrage avancé dans `reception_service.py`
  - [ ] Tests unitaires filtres (pytest)

- [ ] **Frontend - Service Filtres Sessions** (AC: 1, 3, 4)
  - [ ] Étendre interface `CashSessionFilters` dans `cashSessionsService.ts`
  - [ ] Ajouter fonction encodage/décodage URL
  - [ ] Tests unitaires service (Jest)

- [ ] **Frontend - Service Filtres Tickets** (AC: 2, 3, 4)
  - [ ] Étendre interface filtres dans `receptionTicketsService.ts`
  - [ ] Ajouter fonction encodage/décodage URL
  - [ ] Tests unitaires service (Jest)

- [ ] **Frontend - UI Filtres Avancés SessionManager** (AC: 1, 3, 4, 5)
  - [ ] Créer composant accordéon filtres avancés
  - [ ] Ajouter inputs numériques (montant, variance, durée)
  - [ ] Ajouter select multi (méthode paiement)
  - [ ] Ajouter toggle (variance, don)
  - [ ] Intégrer dans `SessionManager.tsx`
  - [ ] Synchroniser avec URL (lecture/écriture)
  - [ ] Tests composant (React Testing Library)

- [ ] **Frontend - UI Filtres Avancés ReceptionSessionManager** (AC: 2, 3, 4, 5)
  - [ ] Créer composant accordéon filtres avancés
  - [ ] Ajouter inputs numériques (poids, lignes)
  - [ ] Ajouter select multi (catégorie, destination)
  - [ ] Intégrer dans `ReceptionSessionManager.tsx`
  - [ ] Synchroniser avec URL (lecture/écriture)
  - [ ] Tests composant (React Testing Library)

- [ ] **Tests d'intégration** (AC: 1-5)
  - [ ] Test filtres avancés sessions (pytest)
  - [ ] Test filtres avancés tickets (pytest)
  - [ ] Test combinaison filtres (ET logique)
  - [ ] Test synchronisation URL

- [ ] **Tests E2E** (AC: 1-5)
  - [ ] Test workflow : Appliquer filtres avancés → Vérifier résultats (Playwright/Cypress)
  - [ ] Test partage URL : Copier URL → Ouvrir dans nouvel onglet → Vérifier filtres appliqués

## 7. Testing

### Standards de Tests

- **Tests unitaires** : Jest (frontend) + pytest (backend)
- **Tests d'intégration** : pytest pour endpoints API
- **Tests E2E** : Playwright ou Cypress pour workflows complets
- **Standards** : Suivre `docs/testing-strategy.md`

### Tests Critiques

1. **Filtres combinés** : Vérifier que tous les filtres fonctionnent ensemble (ET logique)
2. **Synchronisation URL** : Vérifier que filtres sont correctement encodés/décodés
3. **Performance** : Filtres ne doivent pas ralentir l'affichage
4. **Validation** : Min < Max, formats valides

## 8. Dépendances

- **B45-P0** : Design UX doit être complété avant (architecture interface)
- **B45-P1** : Export global peut utiliser ces filtres (pas bloquant)

## 9. Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-27 | 1.0 | Création story initiale | Bob (SM) |

## 10. Dev Agent Record

### Agent Model Used
_À remplir par le dev agent_

### Debug Log References
_À remplir par le dev agent_

### Completion Notes List
_À remplir par le dev agent_

### File List
_À remplir par le dev agent_

## 11. QA Results
_À remplir par le QA agent_

