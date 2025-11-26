# Story B40-P1: Champ Note sur l'écran d'encaissement

**Statut:** READY TO BUILD  
**Épopée:** [EPIC-B40 – Notes Tickets & Bandeau KPI](../epics/epic-b40-caisse-notes-et-kpi.md)  
**Module:** Frontend Caisse  
**Priorité:** P1

## 1. Contexte

Les caissiers doivent noter des compléments (ajout sur autre ticket, incidents) mais n'ont aucun champ prévu. Ils utilisent des post-it ou des tickets papier, impossible à tracer.

## 2. User Story

En tant que **caissier**, je veux **saisir une note libre lors de l’encaissement** afin de conserver le contexte métier directement sur le ticket.

## 3. Critères d'acceptation

1. Champ texte multi-lignes « Note » visible sur l’écran d’encaissement (optionnel).  
2. La note est affichée dans le récapitulatif du ticket avant validation.  
3. Pour l’instant, la note est stockée dans l’état local (Zustand/Store) et envoyée au backend via un champ temporaire `note_draft`.  
4. La note reste disponible en cas de perte réseau tant que le ticket n’est pas validé.  
5. Tests UI couvrant saisie, suppression, persistance durant le wizard.  
6. Aucune migration base de données (Story B40-P5 s’en charge).

## 4. Intégration & Compatibilité

- Exposer le champ `note_draft` dans les events offline pour synchronisation ultérieure.  
- Sanitize texte (strip HTML).  
- Respecter accessibilité (label + description).

## 5. Definition of Done

- [ ] Champ note visible sur tous les écrans caisse pertinents.  
- [ ] Tests front ajoutés/passer.  
- [ ] Documentation caisse mise à jour (champ note).  
- [ ] Alignement PO validé en démo.

