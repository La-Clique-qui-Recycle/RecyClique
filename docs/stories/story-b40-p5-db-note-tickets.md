# Story B40-P5: Migration DB – Notes sur les tickets

**Statut:** READY TO BUILD  
**Épopée:** [EPIC-B40 – Notes Tickets & Bandeau KPI](../epics/epic-b40-caisse-notes-et-kpi.md)  
**Module:** Backend / Base de données  
**Priorité:** P1

## 1. Contexte

Les stories précédentes stockent les notes côté client ou via un adaptateur temporaire. Pour sécuriser la donnée, il faut ajouter une colonne persistante sur les tickets.

## 2. User Story

En tant que **Tech Lead**, je veux **stocker les notes de tickets dans la base PostgreSQL**, afin de les retrouver dans l’Admin, les exports et l’historique.

## 3. Critères d'acceptation

1. Ajouter la colonne `note TEXT NULL` (ou `VARCHAR` selon guidelines) à la table `cash_ticket` (à confirmer).  
2. Mettre à jour models ORM, schémas Pydantic, serializers front.  
3. Migration Alembic générée + script de backfill des notes temporaires (Story B40-P1/P4).  
4. Endpoints `POST/PUT /cash/tickets` acceptent le champ `note`.  
5. Tests backend (unitaires + API) couvrant création/lecture/édition.  
6. Documentation DB (diagramme) mise à jour.

## 4. Intégration & Compatibilité

- Migration additive uniquement (pas de breaking change).  
- Synchroniser caches offline (IndexedDB) pour inclure le champ note.  
- Gestion RGPD : les notes peuvent contenir des données sensibles → rappeler la politique.

## 5. Definition of Done

- [ ] Migration Alembic appliquée localement + CI.  
- [ ] Notes persistées et visibles en Admin.  
- [ ] Tests backend verts.  
- [ ] Guide d’exploitation mis à jour (sauvegardes avant migration).

