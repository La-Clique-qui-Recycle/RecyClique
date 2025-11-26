# Story B41-P1: Activer le mode caisse déconnecté

**Statut:** READY TO BUILD  
**Épopée:** [EPIC-B41 – Caisse Virtuelle & Formation](../epics/epic-b41-caisse-virtuelle.md)  
**Module:** Frontend Caisse  
**Priorité:** P2

## 1. Contexte

Les nouveaux caissiers n’ont pas d’environnement de test. Il faut introduire un mode “caisse virtuelle” qui redirige toutes les opérations vers un stockage local isolé.

## 2. User Story

En tant que **formateur**, je veux **activer un mode caisse virtuelle qui ne touche pas la base de données**, afin de faire pratiquer les nouveaux arrivants sans risque.

## 3. Critères d'acceptation

1. Ajout d’un toggle “Caisse virtuelle” accessible aux Admins (feature flag + bouton).  
2. Quand activé, le frontend utilise un adaptateur `VirtualCashStore` basé sur IndexedDB/localStorage (pas d’appel API).  
3. Un badge “Mode virtuel” s’affiche clairement sur l’interface.  
4. Bouton “Réinitialiser la session” pour purger les données simulées.  
5. Tests UI vérifiant le basculement en mode virtuel.  
6. Logs console avertissent qu’aucune donnée réelle n’est modifiée.

## 4. Intégration & Compatibilité

- Le mode par défaut reste “Production” (toggle off).  
- Prévoir stockage séparé par utilisateur (clé namespacée).  
- Aucun changement backend/BDD.

## 5. Definition of Done

- [ ] Toggle disponible + badge affiché.  
- [ ] Données stockées localement uniquement en mode virtuel.  
- [ ] Tests front ajoutés/passer.  
- [ ] Documentation onboarding mise à jour (comment activer).

