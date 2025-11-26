# Story B40-P3: Workflow Encaissement libre (UX + API contract)

**Statut:** READY TO BUILD  
**Épopée:** [EPIC-B40 – Notes & Encaissement Libre](../epics/epic-b40-caisse-notes-et-encaissement-libre.md)  
**Module:** Frontend + Service Caisse  
**Priorité:** P1

## 1. Contexte

Certaines opérations demandent d’ajouter un montant libre (ex : complément de 3 €). Il n’existe aucun flux dédié, ce qui force des contournements dangereux.

## 2. User Story

En tant que **responsable caisse**, je veux **un bouton “Encaissement libre” avec saisie de montant + note obligatoire**, afin de tracer ces ajustements séparément des tickets standards.

## 3. Critères d'acceptation

1. Bouton “Encaissement libre” visible sur l’écran principal caisse (icône + libellé).  
2. Ouverture d’un modal/formulaire avec : montant (double), note obligatoire, sélection moyen de paiement (espèces/chèque/CB).  
3. Feature flag `cashFreeEntry` contrôlant la disponibilité du flux.  
4. Côté front, appel d’un nouveau service `cashFreeEntryService.create(data)` qui, pour cette story, sérialise la donnée dans un adaptateur temporaire (ex : envoi vers API mock ou stockage local) en attendant la persistence (B40-P6).  
5. Le bandeau KPI affiche ces montants via un accumulateur local (préciser qu’ils sont “non persistés” tant que P6 non livrée).  
6. Tests UI/Service validant champ obligatoire Note et flux complet.

## 4. Intégration & Compatibilité

- Pas de modification DB à ce stade.  
- Préparer le contrat JSON final attendu par l’API (afin de limiter rework en P6).  
- Mode offline : stocker les entrées libres en file d’attente synchronisable.

## 5. Definition of Done

- [ ] UX validée (PO + caissiers).  
- [ ] Feature flag opérationnel.  
- [ ] Tests front/service ajoutés.  
- [ ] Documentation (guide caisse) décrivant le flux libre.

