# Story B41-P2: Simulation complète des tickets en mode virtuel

**Statut:** READY TO BUILD  
**Épopée:** [EPIC-B41 – Caisse Virtuelle & Formation](../epics/epic-b41-caisse-virtuelle.md)  
**Module:** Frontend Caisse  
**Priorité:** P2

## 1. Contexte

Le mode virtuel (Story P1) doit proposer une expérience complète : création, modification, encaissement de tickets fictifs avec bandeau KPI simulé.

## 2. User Story

En tant que **bénévole en formation**, je veux **utiliser la caisse virtuelle comme la vraie**, afin de m’entraîner sur des scénarios réalistes (articles, dons, encaissement).

## 3. Critères d'acceptation

1. Possibilité de créer des tickets à partir du catalogue existant (données mockées).  
2. Les KPI du bandeau utilisent les données locales simulées.  
3. Export local (JSON) de la session pour partager avec un formateur.  
4. Message final rappelant que les données sont fictives et ne doivent pas être comptées.  
5. Tests UI couvrant création → encaissement complet en mode virtuel.  
6. Aucune requête réseau envoyée pendant le parcours simulé.

## 4. Intégration & Compatibilité

- Réutiliser les mêmes composants que la caisse réelle, branchés sur `VirtualCashStore`.  
- Les raccourcis clavier et focus (Epic B39) fonctionnent aussi en mode virtuel.  
- Option pour précharger des scénarios (fixtures JSON).

## 5. Definition of Done

- [ ] Parcours complet simulé démontré (enregistrement vidéo).  
- [ ] Tests front ajoutés.  
- [ ] Guide onboarding incluant scénarios exemples.  
- [ ] Aucun impact sur la base réelle.

