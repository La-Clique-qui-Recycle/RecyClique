# Story B40-P2: Bandeau Caisse – KPI temps réel

**Statut:** READY TO BUILD  
**Épopée:** [EPIC-B40 – Notes Tickets & Bandeau KPI](../epics/epic-b40-caisse-notes-et-kpi.md)  
**Module:** Frontend Caisse  
**Priorité:** P1

## 1. Contexte

Le bandeau caisse n'affiche que peu d'informations. Les caissiers veulent suivre en temps réel le nombre de tickets, le dernier montant encaissé, le CA, les dons et les poids sortis/rentrés, tout comme le souhaite l'équipe Réception.

## 2. User Story

En tant que **responsable caisse**, je veux **voir les KPI clés du jour dans un bandeau mis à jour en temps réel**, afin de vérifier instantanément la cohérence des encaissements.

## 3. Critères d'acceptation

1. Bandeau affichant : `Tickets jour`, `Dernier ticket`, `CA jour`, `Dons jour`, `Poids sortis`, `Poids rentrés`.  
2. Consommation de l'API live (Epic B38) pour récupérer les données temps réel.  
3. Rafraîchissement toutes les 10 s (configurable) avec état “Live” et timestamp.  
4. Mise en forme responsive (tablettes + desktop).  
5. Tests UI/Playwright vérifiant affichage et rafraîchissement.  
6. Fallback en mode offline (affiche dernière valeur connue + badge “Hors ligne”).

## 4. Intégration & Compatibilité

- Repos sur services existants (`cashStatsService`).  
- Aucune migration DB.  
- Interaction avec Sentry pour logguer erreurs de rafraîchissement.

## 5. Definition of Done

- [ ] Bandeau déployé et validé par PO.  
- [ ] Tests front automatisés.  
- [ ] Documentation caisse (section KPI) mise à jour.  
- [ ] Alerting configuré sur erreurs d’appel API.

