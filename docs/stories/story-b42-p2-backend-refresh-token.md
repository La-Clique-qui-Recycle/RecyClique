# Story B42-P2: Backend – Refresh token & réémission glissante

**Status:** On Hold  
**Epic:** [EPIC-B42 – Session glissante & anti-déconnexion](../epics/epic-b42-sliding-session.md)  
**Module:** API / Auth  
**Priority:** P0  
**Owner:** Backend Lead  
**Last Updated:** 2025-11-26

**Blocking:** En attente de la completion de [B42-P1](../stories/story-b42-p1-audit-sliding-session.md) (Audit & design). Le dev ne peut pas commencer l'implémentation sans le design validé et la RFC.

---

## Story Statement

**As a** backend developer,  
**I want** to introduire un mécanisme sécurisé de refresh token et de réémission glissante,  
**so that** les utilisateurs actifs restent connectés sans étendre indéfiniment la durée de validité d’un token compromis.

---

## Acceptance Criteria

1. **Refresh token sécurisé** – Création d’un refresh token persisté (table `user_sessions` ou équivalent) avec rotation, révocation et TTL max (ex. 24h). Stockage signé (JWT ou opaque) + hash si besoin.  
2. **Endpoint de refresh** – `POST /v1/auth/refresh` (role user) qui :  
   - Valide refresh token + IP/device si disponibles  
   - Réémet un access token neuf + nouveau refresh (rotation)  
   - Refuse si inactif depuis > `token_expiration_minutes` *ou* au-delà d’un seuil max paramétrable  
3. **Intégration ActivityService** – L’endpoint s’appuie sur `ActivityService` (ou timestamp DB) pour vérifier que l’utilisateur a eu une activité dans la fenêtre récente avant d’honorer le refresh.  
4. **Migration & compatibilité** – Migration DB + support des anciens tokens pendant la transition (ex: access token seul reste valide jusqu’à expiration).  
5. **Tests backend** – Pytest couvrant création, rotation, révocation, scénarios d’erreur (refresh rejeté, token expiré, refresh re-joué, etc.)

---

## Dev Notes

### Références
- **[RFC Sliding Session](../../architecture/sliding-session-rfc.md)** – Design complet validé (Option A: Refresh Token avec rotation)
- `api/src/recyclic_api/core/security.py` – à étendre pour générer refresh tokens.  
- `api/src/recyclic_api/core/auth.py` – `get_current_user`, `load_cached_user`, etc.  
- `api/src/recyclic_api/api/api_v1/endpoints/auth.py` – endpoints `/login`, `/logout`.  
- `api/src/recyclic_api/services/activity_service.py` – pour vérifier `last_activity`.  
- `api/tests/test_session_settings.py` – inspirations pour nouveaux tests.

### Décisions attendues
- Format du refresh token (JWT séparé vs token opaque random).  
- Lieu de stockage (table `user_sessions` avec `refresh_token_hash`, `user_agent`, `last_used_at`, `revoked`).  
- TTL double :  
  - `token_expiration_minutes` = durée de l’access token (ex. 240 min configurables).  
  - `refresh_token_max_minutes` = durée max absolue d’une session avant relogin complet (ex. 24h).  
- Hook d’audit (log chaque refresh).

### Testing
- Tests unitaires pour le service de refresh.  
- Tests API (pytest) simulant :  
  - refresh réussi  
  - refresh expiré / rejoué  
  - refresh depuis un user inactif (ActivityService > seuil)  
  - suppression d’un refresh après logout (`clear_user_activity` + invalidation DB).

---

## Tasks / Subtasks
1. **Modèle & migration (AC1, AC4)**  
   - [ ] Créer table `user_sessions` (id, user_id, refresh_token_hash, issued_at, expires_at, last_used_at, user_agent, ip, revoked_at).  
   - [ ] Script migration Alembic + seed initial.  
2. **Services & endpoints (AC2, AC3)**  
   - [ ] Service `RefreshTokenService` (création, validation, rotation, révocation).  
   - [ ] Endpoint `/v1/auth/refresh` + mise à jour `/logout` pour révoquer les refresh.  
   - [ ] Couplage avec `ActivityService` pour refuser un refresh si `last_activity` > `token_expiration_minutes` (ou seuil configurable).  
3. **Sécurité & observabilité**  
   - [ ] Ajouter logs (audit) + métriques pour refresh success/fail.  
   - [ ] Paramétrage via settings (`REFRESH_TOKEN_TTL_MINUTES`, etc.).  
4. **Tests (AC5)**  
   - [ ] Tests unitaires service refresh.  
   - [ ] Tests API e2e (login → refresh → déconnexion → refresh rejeté).  
   - [ ] Tests de charge légers (optionnel) pour vérifier la perf.

---

## Project Structure Notes
- Nouveau service dans `api/src/recyclic_api/services/refresh_token_service.py`.  
- Schémas Pydantic dans `api/src/recyclic_api/schemas/auth.py`.  
- Tests dans `api/tests/test_refresh_token.py`.  
- Paramètres dans `.env` + `core/config.py`.

---

## Validation Checklist
- [ ] Migration Alembic appliquée et testée.  
- [ ] Endpoint refresh documenté (OpenAPI).  
- [ ] Couverture tests ≥ 90 % sur le service.  
- [ ] Audit logs générés.  
- [ ] Aucune régression sur login/logout existants.

---

## Change Log
| Date       | Version | Description                            | Author |
|------------|---------|----------------------------------------|--------|
| 2025-11-26 | v0.1    | Draft initial de la story B42-P2       | BMad Master |

