# Story B42-P1: Audit & design de la session glissante

**Status:** Draft  
**Epic:** [EPIC-B42 – Session glissante & anti-déconnexion](../epics/epic-b42-sliding-session.md)  
**Module:** Auth / Platform  
**Priority:** P0  
**Owner:** Tech Lead (avec support Sec & PO)  
**Last Updated:** 2025-11-26

---

## Story Statement

**As a** Tech Lead,  
**I want** to produire une analyse exhaustive de la durée de session existante et du couplage avec ActivityService,  
**so that** nous disposions d’un design validé pour implémenter une session glissante sans régression de sécurité.

---

## Acceptance Criteria

1. **Cartographie complète** – Diagramme + tableau décrivant tous les composants influençant la session (JWT, `token_expiration_minutes`, ping `/v1/activity/ping`, ActivityService, AuthStore, axios interceptors).  
2. **Design cible validé** – Document “Sliding Session RFC” expliquant l’option retenue (refresh token vs réémission) avec flux séquence, TTL max, stratégies de rotation et impacts sécurité.  
3. **Plan de migration** – Stratégie pour déployer sans déconnecter les utilisateurs (double validation tokens existants + nouveaux).  
4. **Checklist sécurité** – Analyse des risques (replay, CSRF, fuite refresh token) et contre-mesures approuvées par l’agent Sec.  
5. **Backlog clarifié** – Mise à jour des stories B42-P2→P5 si le design impose des ajustements d’AC.

---

## Dev Notes

### Références Architecturales clés
1. `api/src/recyclic_api/core/security.py` – `create_access_token()` + `get_token_expiration_minutes()` (valeur actuelle 240 min).  
2. `frontend/src/api/axiosClient.ts` & `frontend/src/stores/authStore.ts` – stockage token + interception 401.  
3. `frontend/src/App.jsx` – ping `/v1/activity/ping` toutes les 5 min (arrêt quand onglet caché).  
4. `api/src/recyclic_api/services/activity_service.py` – seuil `activity_threshold_minutes` (par défaut 15) + stockage Redis.  
5. `docs/pending-tech-debt/story-b27-p1...` – historique de la story qui a introduit la config session (utile pour comprendre contraintes PO).

### Insights existants
- L’admin a actuellement réglé `token_expiration_minutes = 240`.  
- ActivityService est déjà scale-ready (cache + Redis) et pourrait alimenter la décision de rafraîchissement.  
- Middleware ActivityTracker est commenté → seul l’endpoint `/v1/activity/ping` met à jour Redis.

### Détails à collecter
- **Backend:**  
  - Comment le token est vérifié (`verify_token`), où se trouve `get_current_user`.  
  - Possibilités d’émettre un refresh token (JWT séparé ? table `user_sessions` ?).  
- **Frontend:**  
  - Où stocker un refresh token (HTTP-only cookie vs memory).  
  - Impact sur mode offline (IndexedDB).  
- **Tests:**  
  - Inventaire existant `api/tests/test_session_settings.py`, e2e Auth (Playwright).  

### Testing Standards
- Faire référence à `docs/testing-strategy.md` pour exigences Auth.  
- Préparer la liste de tests obligatoires pour P2–P5 (unitaires, integration, e2e).

---

## Tasks / Subtasks
1. **Audit technique complet (AC1)**  
   - [ ] Lire `core/security`, `core/auth`, `activity_service`, `authStore`, `axiosClient`.  
   - [ ] Produire un tableau “Composant / Rôle / Limites”.  
2. **Design RFC (AC2 & AC3)**  
   - [ ] Décrire au moins 2 options (refresh token vs sliding reissue).  
   - [ ] Choisir l’option retenue avec critères (sécurité, effort, offline).  
   - [ ] Écrire la section “Plan de migration & rollback”.  
3. **Analyse sécurité (AC4)**  
   - [ ] Faire relire par agent Sec / QA.  
   - [ ] Ajouter diagramme menaces + mitigations.  
4. **Mise à jour backlog (AC5)**  
   - [ ] Ajuster AC/Tâches des stories P2–P5 si besoin.  
   - [ ] Lier la RFC dans chaque story.

---

## Project Structure Notes
- Le document de design peut être stocké dans `docs/architecture/` (ex: `docs/architecture/sliding-session-rfc.md`).  
- Ajouter un lien dans l’epic B42 et dans les stories P2–P5.  
- Aucun code modifié dans cette story.

---

## Validation Checklist
- [ ] RFC approuvée (PO + Tech Lead + Sec).  
- [ ] Plan de migration validé par Ops.  
- [ ] Backlog mis à jour et communiqué.  
- [ ] Aucun changement de code non documenté.

---

## Change Log
| Date       | Version | Description                    | Author |
|------------|---------|--------------------------------|--------|
| 2025-11-26 | v0.1    | Création du draft de la story  | BMad Master |

