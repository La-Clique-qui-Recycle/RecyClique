# Story B45-P3: Format Excel avec Mise en Forme

**Statut:** Draft  
**Épopée:** [EPIC-B45 – Audit Sessions Avancé](../epics/epic-b45-audit-sessions-avance.md)  
**Module:** Frontend Admin + Backend API  
**Priorité:** P3 (Phase 1 - Fondations)

## 1. Contexte

L'export CSV existe déjà, mais pour un audit professionnel, il est nécessaire d'avoir un export Excel avec mise en forme (en-têtes en gras, couleurs, bordures, formules). Cette story ajoute le support Excel avec onglets et mise en forme professionnelle.

Cette story fait partie de la Phase 1 (Fondations) de l'Epic B45 et complète l'export global (B45-P1).

## 2. User Story

En tant que **administrateur**, je veux **exporter les sessions/tickets en format Excel avec mise en forme professionnelle**, afin de produire des rapports auditables et présentables directement.

## 3. Critères d'acceptation

1. **Export Excel avec bibliothèque** : Utiliser `exceljs` (frontend) ou `openpyxl` (backend)
2. **Mise en forme en-têtes** : En-têtes en gras, couleurs, bordures
3. **Onglets Excel** : 
   - Onglet "Résumé" : KPIs et totaux
   - Onglet "Détails" : Liste complète des sessions/tickets
   - Onglet "Graphiques" (optionnel, Phase 2)
4. **Formules automatiques** : Totaux, moyennes, calculs automatiques dans onglet Résumé
5. **Compatibilité** : Fichier compatible Excel et LibreOffice
6. **Performance** : Export Excel < 30 secondes pour 1000 sessions (objectif epic)

## 4. Intégration & Compatibilité

- **Story précédente** : B45-P1 (Export Global) - Cette story étend l'export global avec format Excel
- **Composants existants** : `SessionManager.tsx`, `ReceptionSessionManager.tsx`
- **Services existants** : `cashSessionsService.ts`, `receptionTicketsService.ts`
- **Endpoints** : Étendre les endpoints de B45-P1 pour supporter format Excel

## 5. Dev Notes

### Références Architecturales Clés

1. **COMMENCER PAR** : `docs/architecture/index.md` - Navigation complète de l'architecture
2. **Frontend** : `docs/architecture/6-architecture-des-composants.md` - Patterns composants React
3. **API** : `docs/architecture/7-design-et-intgration-api.md` - Design API et intégration
4. **Design UX** : `docs/ux/audit-sessions-advanced-design.md` - Architecture interface (créé dans B45-P0)
5. **Décisions techniques** : `docs/architecture/technical-decisions-b45.md` - Décisions prises par l'Architect
6. **Testing** : `docs/testing-strategy.md` - Standards de tests

### Décisions Techniques (Architect)

**Bibliothèque Frontend** : `exceljs` (TypeScript/React)
- Meilleure intégration React/TypeScript
- Support mise en forme avancée
- Génération côté client possible

**Bibliothèque Backend** : `openpyxl` (Python)
- Standard Python pour Excel
- Support mise en forme complète
- Compatible Excel et LibreOffice

**Référence** : `docs/architecture/technical-decisions-b45.md`

### Structure Excel

**Onglet "Résumé"** :
- Ligne 1 : Titre "Résumé Sessions de Caisse" (gras, centré, couleur)
- Ligne 2 : Période (date début - date fin)
- Ligne 3 : Vide
- Ligne 4 : En-têtes (Statut, Nombre, CA Total, Total Dons, Variance Moyenne) - gras, fond gris
- Lignes 5-6 : Données par statut (ouvert, fermé)
- Ligne 7 : Totaux (formule SUM) - gras
- Ligne 8 : Moyennes (formule AVERAGE)

**Onglet "Détails"** :
- Ligne 1 : En-têtes colonnes (Statut, Date, Opérateur, Nb ventes, Total ventes, Total dons, Écart) - gras, fond gris
- Lignes 2+ : Données sessions/tickets
- Colonnes formatées : Dates (format date), Montants (format monétaire), Nombres (format nombre)

### Composants Existants à Étudier

- **`frontend/src/pages/Admin/SessionManager.tsx`** : Export CSV actuel
- **`frontend/src/services/cashSessionsService.ts`** : Service export CSV
- **Backend** : Endpoints export existants (réception)

### Endpoints API à Étendre

**Backend** : Étendre les endpoints de B45-P1
- `POST /v1/admin/reports/cash-sessions/export-bulk` : Ajouter paramètre `format: "excel"`
- `POST /v1/admin/reports/reception-tickets/export-bulk` : Ajouter paramètre `format: "excel"`

**Format Request** :
```json
{
  "filters": { ... },
  "format": "excel"  // ou "csv"
}
```

### Bibliothèques à Installer

**Frontend** :
- `exceljs` : Génération Excel côté client (optionnel, peut être fait côté serveur)

**Backend** :
- `openpyxl` : Génération Excel côté serveur (recommandé)

### Fichiers à Créer/Modifier

**Frontend** :
- `frontend/src/services/cashSessionsService.ts` : Étendre méthode `exportBulk()` pour Excel
- `frontend/src/services/receptionTicketsService.ts` : Étendre méthode `exportBulk()` pour Excel
- `frontend/src/pages/Admin/SessionManager.tsx` : Menu déroulant format (CSV | Excel)
- `frontend/src/pages/Admin/ReceptionSessionManager.tsx` : Menu déroulant format (CSV | Excel)

**Backend** :
- `api/src/recyclic_api/services/report_service.py` : Ajouter fonction `generate_excel_export()`
- `api/src/recyclic_api/api/api_v1/endpoints/reports.py` : Étendre endpoints pour format Excel

### Points d'Attention Techniques

1. **Performance** :
   - Pour 1000+ sessions, génération Excel peut être lente
   - Utiliser streaming si possible
   - Afficher indicateur de progression

2. **Mise en forme** :
   - En-têtes : Gras, fond gris (#f3f4f6), bordures
   - Totaux : Gras, fond jaune clair (#fff3e0)
   - Colonnes : Largeur auto-ajustée

3. **Formules** :
   - Totaux : `=SUM(D5:D6)` pour colonnes numériques
   - Moyennes : `=AVERAGE(E5:E6)`
   - Compatibilité Excel/LibreOffice

4. **Compatibilité** :
   - Tester sur Excel (Windows, Mac)
   - Tester sur LibreOffice
   - Format `.xlsx` (pas `.xls`)

## 6. Tasks / Subtasks

- [ ] **Backend - Bibliothèque Excel** (AC: 1)
  - [ ] Installer `openpyxl` dans `requirements.txt`
  - [ ] Créer fonction `generate_excel_export()` dans `report_service.py`
  - [ ] Tests unitaires génération Excel (pytest)

- [ ] **Backend - Endpoint Export Excel Sessions** (AC: 1, 2, 3, 4, 5)
  - [ ] Étendre endpoint `POST /v1/admin/reports/cash-sessions/export-bulk` pour format Excel
  - [ ] Créer onglet "Résumé" avec KPIs et formules
  - [ ] Créer onglet "Détails" avec toutes les sessions
  - [ ] Appliquer mise en forme (en-têtes gras, couleurs, bordures)
  - [ ] Ajouter formules (totaux, moyennes)
  - [ ] Tests endpoint (pytest)

- [ ] **Backend - Endpoint Export Excel Tickets** (AC: 1, 2, 3, 4, 5)
  - [ ] Étendre endpoint `POST /v1/admin/reports/reception-tickets/export-bulk` pour format Excel
  - [ ] Créer onglet "Résumé" avec KPIs et formules
  - [ ] Créer onglet "Détails" avec tous les tickets
  - [ ] Appliquer mise en forme
  - [ ] Ajouter formules
  - [ ] Tests endpoint (pytest)

- [ ] **Frontend - Service Export Excel** (AC: 1, 6)
  - [ ] Étendre `cashSessionsService.exportBulk()` pour format Excel
  - [ ] Étendre `receptionTicketsService.exportBulk()` pour format Excel
  - [ ] Gérer téléchargement fichier Excel (blob)
  - [ ] Gérer indicateur de progression
  - [ ] Tests unitaires service (Jest)

- [ ] **Frontend - UI Menu Format** (AC: 1, 6)
  - [ ] Ajouter menu déroulant format (CSV | Excel) dans `SessionManager.tsx`
  - [ ] Ajouter menu déroulant format (CSV | Excel) dans `ReceptionSessionManager.tsx`
  - [ ] Appeler service avec format sélectionné
  - [ ] Afficher indicateur de progression
  - [ ] Tests composant (React Testing Library)

- [ ] **Tests Performance** (AC: 6)
  - [ ] Test export Excel 1000 sessions (< 30 secondes)
  - [ ] Test export Excel 1000 tickets (< 30 secondes)
  - [ ] Optimisation si nécessaire

- [ ] **Tests Compatibilité** (AC: 5)
  - [ ] Tester fichier Excel sur Excel Windows
  - [ ] Tester fichier Excel sur Excel Mac
  - [ ] Tester fichier Excel sur LibreOffice
  - [ ] Vérifier formules fonctionnent partout

- [ ] **Tests d'intégration** (AC: 1-6)
  - [ ] Test export Excel sessions (pytest)
  - [ ] Test export Excel tickets (pytest)
  - [ ] Test mise en forme (vérifier styles)
  - [ ] Test formules (vérifier calculs)

- [ ] **Tests E2E** (AC: 1-6)
  - [ ] Test workflow : Filtrer → Exporter Excel → Vérifier fichier (Playwright/Cypress)

## 7. Testing

### Standards de Tests

- **Tests unitaires** : Jest (frontend) + pytest (backend)
- **Tests d'intégration** : pytest pour endpoints API
- **Tests E2E** : Playwright ou Cypress pour workflows complets
- **Tests performance** : pytest avec timing
- **Standards** : Suivre `docs/testing-strategy.md`

### Tests Critiques

1. **Performance** : Export Excel de 1000+ sessions doit être < 30 secondes
2. **Compatibilité** : Fichier doit s'ouvrir correctement dans Excel et LibreOffice
3. **Formules** : Totaux et moyennes doivent être calculés correctement
4. **Mise en forme** : En-têtes, couleurs, bordures doivent être appliqués

## 8. Dépendances

- **B45-P0** : Design UX doit être complété (fait)
- **B45-P1** : Export Global doit exister (prérequis logique)
- **Bibliothèques** : Installation `openpyxl` (backend) et optionnellement `exceljs` (frontend)

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

