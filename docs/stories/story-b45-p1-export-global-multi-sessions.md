# Story B45-P1: Export Global Multi-Sessions/Tickets

**Statut:** Draft  
**Épopée:** [EPIC-B45 – Audit Sessions Avancé](../epics/epic-b45-audit-sessions-avance.md)  
**Module:** Frontend Admin + Backend API  
**Priorité:** P1 (Phase 1 - Fondations)

## 1. Contexte

Actuellement, les exports de sessions de caisse et de tickets de réception se font un par un. Pour un audit efficace, il est nécessaire de pouvoir exporter toutes les sessions/tickets filtrés en une seule opération, avec support de formats CSV consolidé et Excel avec onglets.

Cette story fait partie de la Phase 1 (Fondations) de l'Epic B45 et est un prérequis pour les fonctionnalités d'analyse avancée (Phase 2).

## 2. User Story

En tant que **administrateur**, je veux **exporter toutes les sessions/tickets filtrés en une seule opération**, afin de gagner du temps lors des audits et analyses de grandes quantités de données.

## 3. Critères d'acceptation

1. **Bouton "Exporter toutes les sessions filtrées"** dans `SessionManager.tsx`
2. **Bouton "Exporter tous les tickets filtrés"** dans `ReceptionSessionManager.tsx`
3. **Format CSV consolidé** : Toutes les sessions/tickets dans un seul fichier CSV
4. **Format Excel avec onglets** : Export Excel avec onglets "Résumé" + "Détails"
5. **Endpoints API** : 
   - `POST /v1/admin/reports/cash-sessions/export-bulk`
   - `POST /v1/admin/reports/reception-tickets/export-bulk`
6. **Respect des filtres** : L'export doit respecter tous les filtres actifs (date, statut, opérateur/bénévole, etc.)
7. **Performance** : Export doit fonctionner même avec 1000+ sessions/tickets (streaming si nécessaire)

## 4. Intégration & Compatibilité

- **Composants existants** : `SessionManager.tsx`, `ReceptionSessionManager.tsx`
- **Services existants** : `cashSessionsService.ts`, `receptionTicketsService.ts`
- **Patterns à réutiliser** : Export CSV existant (un par un) comme base
- **Nouveaux endpoints** : Backend API pour exports bulk

## 5. Dev Notes

### Références Architecturales Clés

1. **COMMENCER PAR** : `docs/architecture/index.md` - Navigation complète de l'architecture
2. **Design UX** : `docs/ux/audit-sessions-advanced-design.md` - Architecture interface (validé dans B45-P0)
3. **Frontend** : `docs/architecture/6-architecture-des-composants.md` - Patterns composants React
4. **API** : `docs/architecture/7-design-et-intgration-api.md` - Design API et intégration
5. **Décisions techniques** : `docs/architecture/technical-decisions-b45.md` - Décisions prises par l'Architect
6. **Testing** : `docs/testing-strategy.md` - Standards de tests

### Composants Existants à Étudier

- **`frontend/src/pages/Admin/SessionManager.tsx`** : Composant de référence pour sessions de caisse
  - Export CSV actuel (ligne par ligne)
  - Structure des filtres
  - Service `cashSessionsService.ts`
  
- **`frontend/src/pages/Admin/ReceptionSessionManager.tsx`** : Composant de référence pour sessions de réception
  - Export CSV actuel (ligne par ligne)
  - Structure des filtres
  - Service `receptionTicketsService.ts`

### Endpoints API Existants

**Sessions de Caisse** :
- `GET /v1/admin/cash-sessions/export-csv/{id}` : Export CSV d'une session (existant)
- `GET /v1/admin/cash-sessions` : Liste avec filtres (existant)

**Sessions de Réception** :
- `GET /v1/reception/tickets/{id}/export-csv` : Export CSV d'un ticket (existant)
- `GET /v1/reception/tickets` : Liste avec filtres (existant)

### Nouveaux Endpoints à Créer

**Backend API** :

1. **`POST /v1/admin/reports/cash-sessions/export-bulk`**
   - **Request Body** : 
     ```json
     {
       "filters": {
         "date_from": "2025-01-01",
         "date_to": "2025-01-31",
         "status": "closed",
         "operator_id": "uuid",
         "site_id": "uuid"
       },
       "format": "csv" | "excel"
     }
     ```
   - **Response** : Fichier binaire (CSV ou Excel)
   - **Headers** : `Content-Disposition: attachment; filename="cash-sessions-export-{date}.{ext}"`
   - **Performance** : Streaming pour grandes quantités

2. **`POST /v1/admin/reports/reception-tickets/export-bulk`**
   - **Request Body** : 
     ```json
     {
       "filters": {
         "date_from": "2025-01-01",
         "date_to": "2025-01-31",
         "status": "closed",
         "benevole_id": "uuid",
         "site_id": "uuid"
       },
       "format": "csv" | "excel"
     }
     ```
   - **Response** : Fichier binaire (CSV ou Excel)
   - **Headers** : `Content-Disposition: attachment; filename="reception-tickets-export-{date}.{ext}"`
   - **Performance** : Streaming pour grandes quantités

### Structure de Données

**Format CSV Consolidé** :
- **Ligne 1** : En-têtes (Statut, Date, Opérateur/Bénévole, CA/Poids, Variance, etc.)
- **Lignes suivantes** : Une ligne par session/ticket avec toutes les données

**Format Excel avec Onglets** :
- **Onglet "Résumé"** : 
  - Colonnes : Statut, Date, Opérateur/Bénévole, CA/Poids Total, Nombre ventes/lignes, Variance
  - Mise en forme : En-têtes en gras, totaux en bas
- **Onglet "Détails"** :
  - Colonnes : ID Session/Ticket, Date, Opérateur/Bénévole, Détails complets
  - Mise en forme : En-têtes en gras, bordures

### Composant UI - ExportButton (Design UX)

**Référence** : `docs/ux/audit-sessions-advanced-design.md` - Component: ExportButton

**Spécifications** :
- **Position** : Barre d'outils en haut à droite (selon design UX)
- **Variants** : Primary bouton "Exporter tout" avec menu déroulant
- **Menu déroulant** : Options CSV | Excel
- **States** : Default, Loading (spinner + texte "Export en cours..."), Disabled (si aucune session)
- **Icône** : Download ou FileSpreadsheet (lucide-react)
- **Indicateur de chargement** : Spinner + texte "Export en cours..."

**Pattern d'interaction** :
1. Clic sur bouton "Exporter tout" → Menu déroulant apparaît
2. Sélection format (CSV ou Excel) → Export démarre
3. Indicateur de chargement affiché pendant export
4. Téléchargement automatique du fichier

**User Flow détaillé** : Voir `docs/ux/audit-sessions-advanced-design.md` - Flow 1: Export Global Multi-Sessions (Phase 1)

### Bibliothèques Frontend

- **CSV** : Utiliser `papaparse` ou génération manuelle (déjà utilisé dans exports existants)
- **Excel** : Utiliser `exceljs` (frontend) ou génération côté serveur avec `openpyxl` (backend)
  - **Décision technique** : Voir `docs/architecture/technical-decisions-b45.md`
  - **Recommandation** : Génération côté serveur pour meilleure performance

### Bibliothèques Backend

- **CSV** : Utiliser `csv` (Python) ou génération manuelle
- **Excel** : Utiliser `openpyxl` (Python) pour génération Excel
  - **Alternative** : `xlsxwriter` si besoin de plus de contrôle

### Patterns à Réutiliser

- **Export CSV existant** : Voir `cashSessionsService.exportCSV()` et `receptionTicketsService.exportCSV()`
- **Gestion des filtres** : Réutiliser la logique de filtrage existante
- **Téléchargement fichier** : Pattern blob download existant

### Fichiers à Créer/Modifier

**Frontend** :
- `frontend/src/services/cashSessionsService.ts` : Ajouter méthode `exportBulk(filters, format)`
- `frontend/src/services/receptionTicketsService.ts` : Ajouter méthode `exportBulk(filters, format)`
- `frontend/src/pages/Admin/SessionManager.tsx` : Ajouter bouton "Exporter tout" dans barre d'outils
- `frontend/src/pages/Admin/ReceptionSessionManager.tsx` : Ajouter bouton "Exporter tout" dans barre d'outils

**Backend** :
- `api/src/recyclic_api/api/api_v1/endpoints/reports.py` : Nouveaux endpoints export-bulk
- `api/src/recyclic_api/services/report_service.py` : Logique génération exports bulk (CSV + Excel)

### Écarts Identifiés (Audit Brownfield)

**Référence** : `docs/architecture/audit-brownfield-b45-validation.md` - Section 4.1

**Fonctionnalités manquantes** :
- ❌ **Export Global CSV** : Aucun endpoint d'export global pour sessions de caisse
- ❌ **Export Global Excel** : Aucun endpoint d'export Excel
- ✅ **Réception** : Export CSV existe pour tickets individuels (`/tickets/{id}/export-csv`)

**Action requise** : Créer endpoints `POST /v1/admin/reports/cash-sessions/export-bulk` et `/v1/admin/reports/reception-tickets/export-bulk`

### Points d'Attention Techniques

1. **Performance** : 
   - Pour 1000+ sessions/tickets, utiliser streaming côté backend
   - Afficher indicateur de progression côté frontend
   - Limiter exports à 10 000 éléments max (avertir utilisateur)
   - **Objectif epic** : Export Excel < 30 secondes pour 1000 sessions

2. **Format Excel** :
   - Compatibilité Excel et LibreOffice
   - Mise en forme professionnelle (en-têtes gras, couleurs, bordures)
   - Formules pour totaux automatiques

3. **Filtres** :
   - Respecter tous les filtres actifs (même logique que liste)
   - Validation des filtres côté backend

4. **Gestion d'erreurs** :
   - Timeout si export trop long
   - Message d'erreur clair si échec
   - Logs côté backend pour debugging

## 6. Tasks / Subtasks

- [ ] **Backend - Endpoint Export Bulk Sessions de Caisse** (AC: 5)
  - [ ] Créer endpoint `POST /v1/admin/reports/cash-sessions/export-bulk` dans `reports.py`
  - [ ] Ajouter logique génération CSV consolidé dans `report_service.py`
  - [ ] Ajouter logique génération Excel avec onglets dans `report_service.py`
  - [ ] Implémenter streaming pour grandes quantités
  - [ ] Ajouter validation des filtres
  - [ ] Tests unitaires endpoint (pytest)

- [ ] **Backend - Endpoint Export Bulk Tickets de Réception** (AC: 5)
  - [ ] Créer endpoint `POST /v1/admin/reports/reception-tickets/export-bulk` dans `reports.py`
  - [ ] Ajouter logique génération CSV consolidé dans `report_service.py`
  - [ ] Ajouter logique génération Excel avec onglets dans `report_service.py`
  - [ ] Implémenter streaming pour grandes quantités
  - [ ] Ajouter validation des filtres
  - [ ] Tests unitaires endpoint (pytest)

- [ ] **Frontend - Service Export Bulk Sessions** (AC: 1, 3, 4)
  - [ ] Ajouter méthode `exportBulk(filters, format)` dans `cashSessionsService.ts`
  - [ ] Gérer téléchargement fichier (blob)
  - [ ] Gérer indicateur de progression
  - [ ] Gestion d'erreurs
  - [ ] Tests unitaires service (Jest)

- [ ] **Frontend - Service Export Bulk Tickets** (AC: 2, 3, 4)
  - [ ] Ajouter méthode `exportBulk(filters, format)` dans `receptionTicketsService.ts`
  - [ ] Gérer téléchargement fichier (blob)
  - [ ] Gérer indicateur de progression
  - [ ] Gestion d'erreurs
  - [ ] Tests unitaires service (Jest)

- [ ] **Frontend - UI SessionManager** (AC: 1, 6)
  - [ ] Ajouter bouton "Exporter tout" dans barre d'outils `SessionManager.tsx`
  - [ ] Menu déroulant pour choix format (CSV | Excel)
  - [ ] Récupérer filtres actifs
  - [ ] Appeler service `exportBulk()`
  - [ ] Afficher indicateur de progression
  - [ ] Gestion d'erreurs (toast/notification)
  - [ ] Tests composant (React Testing Library)

- [ ] **Frontend - UI ReceptionSessionManager** (AC: 2, 6)
  - [ ] Ajouter bouton "Exporter tout" dans barre d'outils `ReceptionSessionManager.tsx`
  - [ ] Menu déroulant pour choix format (CSV | Excel)
  - [ ] Récupérer filtres actifs
  - [ ] Appeler service `exportBulk()`
  - [ ] Afficher indicateur de progression
  - [ ] Gestion d'erreurs (toast/notification)
  - [ ] Tests composant (React Testing Library)

- [ ] **Tests d'intégration** (AC: 1-7)
  - [ ] Test export CSV bulk sessions (pytest)
  - [ ] Test export Excel bulk sessions (pytest)
  - [ ] Test export CSV bulk tickets (pytest)
  - [ ] Test export Excel bulk tickets (pytest)
  - [ ] Test respect des filtres (pytest)
  - [ ] Test performance avec 1000+ éléments (pytest)

- [ ] **Tests E2E** (AC: 1-7)
  - [ ] Test workflow complet : Filtrer → Exporter CSV → Vérifier fichier (Playwright/Cypress)
  - [ ] Test workflow complet : Filtrer → Exporter Excel → Vérifier fichier (Playwright/Cypress)

## 7. Testing

### Standards de Tests

- **Tests unitaires** : Jest (frontend) + pytest (backend)
- **Tests d'intégration** : pytest pour endpoints API
- **Tests E2E** : Playwright ou Cypress pour workflows complets
- **Standards** : Suivre `docs/testing-strategy.md`

### Tests Critiques

1. **Performance** : Export de 1000+ sessions/tickets doit fonctionner
2. **Format Excel** : Compatibilité Excel et LibreOffice
3. **Filtres** : Tous les filtres doivent être respectés
4. **Gestion d'erreurs** : Timeout, erreurs réseau, validation

## 8. Dépendances

- **B45-P0** : Design UX doit être complété avant (architecture interface)
- **B44-P4** : Sessions de Réception doit exister (prérequis epic)
- **Bibliothèques** : Installation `exceljs` (frontend) et `openpyxl` (backend)

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

