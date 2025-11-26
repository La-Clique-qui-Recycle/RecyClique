# Story B42-P5: Hardening & tests de sécurité sliding session

**Status:** Draft  
**Epic:** [EPIC-B42 – Session glissante & anti-déconnexion](../epics/epic-b42-sliding-session.md)  
**Module:** QA / Sécurité / DevOps  
**Priority:** P1  
**Owner:** Security & QA Leads  
**Last Updated:** 2025-11-26

---

## Story Statement

**As a** security/QA engineer,  
**I want** to valider la robustesse du nouveau mécanisme de session glissante par des tests approfondis,  
**so that** aucune régression de sécurité ou de stabilité n’est introduite (replay, CSRF, fuite refresh, load).

---

## Acceptance Criteria

1. **Pen-tests ciblés** – Scripts (ou outils) testant :  
   - replay d’un refresh token (doit être rejeté)  
   - refresh provenant d’une IP différente (selon policy)  
   - tentative CSRF si refresh exposé via cookie  
2. **Tests longue durée** – Scénario automatisé simulant une session de 10h (ping + refresh) pour vérifier absence de fuite mémoire et maintien des droits.  
3. **Tests offline** – Couvrir les cas où l’agent perd le réseau > `token_expiration_minutes` puis revient (doit afficher warning, redemander login proprement).  
4. **Chaos / résilience** – Test enchaînant redémarrage API/Redis pour s’assurer que les refresh tokens et ActivityService gèrent les redémarrages (pas de logout massif).  
5. **Rapport de validation** – Document listant tests exécutés, résultats, recommandations (must-have pour Go/No-Go).

---

## Dev Notes

### Références
- Stories P2–P4 (implémentations).  
- `docs/testing-strategy.md` pour exigences QA.  
- Outillage existant : Playwright, pytest, scripts load (k6?).

### Plan de tests
- **Backend**: pytest + tests manuels Postman pour rejeter refresh rejoué/expiré.  
- **Frontend**: Playwright scenario “simulate clock + offline/online”.  
- **Load**: script k6 ou Locust pour 100 sessions en parallèle rafraîchissant toutes les 5 min.

### Sécurité
- Vérifier stockage refresh (localStorage interdit). Si cookie HTTP-only → tests CSRF (double-submit token, SameSite).  
- Vérifier logs d’audit (chaque refresh + logout).

---

## Tasks / Subtasks
1. **Pen-test scripts (AC1)**  
   - [ ] Créer scripts Python ou Postman collection.  
   - [ ] Documenter comment les exécuter.  
2. **Long-run scenario (AC2)**  
   - [ ] Utiliser Playwright ou Cypress avec timers mockés.  
   - [ ] Vérifier qu’après 10h, l’utilisateur est toujours connecté (si activité).  
3. **Offline / chaos (AC3 & AC4)**  
   - [ ] Simuler perte réseau > expiration → check UX.  
   - [ ] Redémarrer API/Redis pendant session → vérifier re-sync.  
4. **Reporting (AC5)**  
   - [ ] Rédiger rapport `docs/qa/reports/sliding-session-validation.md`.  
   - [ ] Lister issues / mitigations.  
5. **Gate QA**  
   - [ ] Soumettre à l’agent QA pour gate PASS.

---

## Project Structure Notes
- Scripts pen-test dans `scripts/security/sliding-session/`.  
- Rapports QA dans `docs/qa/reports/`.  
- Tests e2e additionnels sous `frontend/src/test/e2e/`.

---

## Validation Checklist
- [ ] Tous les AC validés avec preuves (logs, captures).  
- [ ] Rapport partagé avec PO + Sec.  
- [ ] Aucun finding bloquant ouvert.  
- [ ] Gate QA = PASS.

---

## Change Log
| Date       | Version | Description                               | Author |
|------------|---------|-------------------------------------------|--------|
| 2025-11-26 | v0.1    | Draft initial de la story B42-P5           | BMad Master |

