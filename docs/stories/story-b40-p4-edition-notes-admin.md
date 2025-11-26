# Story B40-P4: Edition des notes côté Admin

**Statut:** READY TO BUILD  
**Épopée:** [EPIC-B40 – Notes & Encaissement Libre](../epics/epic-b40-caisse-notes-et-encaissement-libre.md)  
**Module:** Frontend Admin  
**Priorité:** P2

## 1. Contexte

Les notes saisies par les caissiers doivent pouvoir être corrigées ou complétées par l’administration (ex : rattacher une note à un incident). L’écran `admin > tickets` n’offre pas cette possibilité.

## 2. User Story

En tant qu’**administrateur**, je veux **éditer la note associée à un ticket depuis l’interface Admin**, afin d’y ajouter des précisions ou corriger les saisies.

## 3. Critères d'acceptation

1. La vue `admin/tickets/:id` affiche le champ Note et un bouton “Modifier la note”.  
2. L’édition est réservée aux rôles Admin/SuperAdmin (contrôle RBAC).  
3. Tant que la migration B40-P5 n’est pas livrée, la modification réécrit la note dans le même adaptateur temporaire que B40-P1 (stockage en mémoire/log).  
4. Historique minimal dans la console Admin (timestamp + user).  
5. Tests frontend/permission couvrant lecture/édition.  
6. Messages d’erreur clairs si l’adaptateur temporaire est indisponible.

## 4. Intégration & Compatibilité

- Prévoir interface `NotesRepository` afin de basculer facilement vers la DB (P5).  
- API existante `GET/PUT /cash/tickets/:id` évolue seulement lorsque B40-P5 est prête.  
- Aucune migration DB dans cette story.

## 5. Definition of Done

- [ ] Edition note disponible en admin et restreinte aux bons rôles.  
- [ ] Tests front & RBAC ajoutés.  
- [ ] Documentation admin mise à jour.  
- [ ] Feature flag si nécessaire (`adminTicketNotes`).

