# Story B40-P6: Persistance des encaissements libres

**Statut:** READY TO BUILD  
**Épopée:** [EPIC-B40 – Notes & Encaissement Libre](../epics/epic-b40-caisse-notes-et-encaissement-libre.md)  
**Module:** Backend / Base de données  
**Priorité:** P1

## 1. Contexte

Le flux Encaissement libre (Story B40-P3) repose encore sur un adaptateur temporaire. Pour qu’il soit exploitable (exports, contrôles), il faut persister ces opérations.

## 2. User Story

En tant que **responsable financier**, je veux **que chaque encaissement libre soit stocké en base avec montant, note, caissier et moyen de paiement**, afin de l’inclure dans les contrôles journaliers.

## 3. Critères d'acceptation

1. Créer une table `cash_free_entries` (ou équivalent) avec :  
   - `id UUID`, `amount NUMERIC(10,2)`, `note TEXT`, `payment_method ENUM`, `cashier_id UUID`, `created_at TIMESTAMPTZ`, `source_ticket_id UUID NULL`.  
2. Exposer API `POST /cash/free-entries` + `GET /cash/free-entries?date=YYYY-MM-DD`.  
3. Mettre à jour le bandeau KPI pour inclure ces montants dans CA/dons.  
4. Migration Alembic + index sur `created_at`.  
5. Tests backend (unitaires + API) + tests front (Playwright) validant l’écriture réelle.  
6. Export journalier/closing caisse inclut ces entrées.

## 4. Intégration & Compatibilité

- Feature flag `cashFreeEntry` toujours supporté (peut désactiver la fonctionnalité).  
- Prévoir script de migration des données temporaires générées avant P6 (si disponibles).  
- Vérifier que les permissions (RBAC) empêchent l’accès aux non-autorisés.

## 5. Definition of Done

- [ ] Table et API en production.  
- [ ] Bandeau KPI reflète les montants persistés.  
- [ ] Exports journaliers incluent les encaissements libres.  
- [ ] Documentation technique & métier mise à jour.  
- [ ] Procédure de rollback documentée (drop table + suppression flag).

