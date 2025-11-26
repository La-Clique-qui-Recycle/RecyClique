# Story B42-P3: Frontend – Intégration refresh & pings intelligents

**Status:** Draft  
**Epic:** [EPIC-B42 – Session glissante & anti-déconnexion](../epics/epic-b42-sliding-session.md)  
**Module:** Frontend (React / Auth)  
**Priority:** P0  
**Owner:** Frontend Lead  
**Last Updated:** 2025-11-26

---

## Story Statement

**As a** frontend developer,  
**I want** to intégrer le refresh token et synchroniser les pings d’activité avec la réémission de l’access token,  
**so that** les utilisateurs actifs restent connectés sans action manuelle et sont prévenus en cas de souci.

---

## Acceptance Criteria

1. **Stockage sécurisé** – Le refresh token est stocké dans un emplacement sûr (HTTP-only cookie si fourni par le backend, sinon storage chiffré + rotation). Aucun accès via JS si possible.  
2. **Client refresh loop** – `axiosClient` ou un hook dédié déclenche automatiquement un refresh :  
   - Proactif (ex: 2 min avant expiration de l’access token)  
   - Réactif (sur 401, tente un refresh une seule fois avant de rediriger login)  
3. **Couplage ping activité** – Les pings `/v1/activity/ping` sont conservés mais orchestrés pour éviter le double trafic : si un refresh vient d’être fait, pas de ping inutile. En cas d’onglet caché, arrêt propre.  
4. **Gestion offline & alertes** – Si la connexion est perdue ou si le refresh échoue, afficher un bandeau d’alerte avec compte à rebours (ex: “connexion expirera dans 2 min”).  
5. **Tests front** – Vitest/RTL sur le hook refresh + tests e2e Playwright (scénario navigation longue durée, reconnection offline→online).

---

## Dev Notes

### Références
- `frontend/src/api/axiosClient.ts` (intercepteurs 401).  
- `frontend/src/stores/authStore.ts` (state token, login/logout).  
- `frontend/src/App.jsx` (ping actuel toutes les 5 min).  
- `frontend/src/pages/Admin/Settings.tsx` (affiche la valeur `token_expiration_minutes` – info utile pour afficher les warnings).

### Consignes UX
- Pas de popups intrusifs. Utiliser un bandeau sticky ou toast persistant.  
- Prévoir un indicateur discret (ex: “Session sécurisée ✓”) qui passe en orange quand un refresh est en attente.  
- Si le refresh échoue définitivement, laisser l’utilisateur enregistrer (ex: modale “sauvegarder brouillon” si applicable).

### Technique
- Conserver l’access token en mémoire (Zustand) + localStorage pour compat legacy.  
- Gérer la clock drift : utiliser `exp` du JWT pour calculer l’heure d’expiration.  
- Exposer un hook `useSessionHeartbeat()` qui orchestre ping + refresh + alerts.  
- Prévoir un canal pour marquer un refresh comme “non autorisé” si le backend détecte une anomalie (flag renvoyé dans la réponse).

### Tests
- Unit tests :  
  - simulate `exp` proche + vérif que `refresh()` se déclenche.  
  - ensure 401 triggers single retry.  
- E2E Playwright :  
  - scénario “tab actif 3h” (mock timers)  
  - scénario offline (navigator offline) => bandeau warning.

---

## Tasks / Subtasks
1. **Hook & store (AC1 & AC2)**  
   - [ ] Étendre `authStore` pour stocker metadata de session (exp, refreshPending).  
   - [ ] Créer `useSessionHeartbeat` (setInterval + window visibility).  
   - [ ] Modifier `axiosClient` pour tenter refresh une seule fois sur 401.  
2. **UI & alerting (AC4)**  
   - [ ] Créer un composant `SessionStatusBanner`.  
   - [ ] Brancher sur `useSessionHeartbeat` pour afficher countdown + actions (forcer refresh, sauvegarder brouillon).  
3. **Ping orchestration (AC3)**  
   - [ ] Ajuster `App.jsx` pour éviter double ping (si refresh => skip ping).  
   - [ ] Pause/resume sur `document.hidden`.  
4. **Tests (AC5)**  
   - [ ] Vitest pour hook + store.  
   - [ ] Playwright pour scénarios longue session & offline.  
5. **Docs**  
   - [ ] Mettre à jour `docs/runbooks/dev-workflow-guide.md` (section Auth).  
   - [ ] Ajouter FAQ “Pourquoi je vois bannière session ?”.

---

## Project Structure Notes
- Nouveaux fichiers possibles :  
  - `frontend/src/hooks/useSessionHeartbeat.ts`  
  - `frontend/src/components/ui/SessionStatusBanner.tsx`  
- Tests dans `frontend/src/test/hooks/useSessionHeartbeat.test.ts` + `frontend/src/test/e2e/session-refresh.spec.ts`.

---

## Validation Checklist
- [ ] Hook refresh opérationnel (vérifié via tests).  
- [ ] Bandeau UX validé par PO.  
- [ ] Aucun rafraîchissement infini (détection anti-boucle).  
- [ ] Mode offline testé.  
- [ ] Docs mises à jour.

---

## Change Log
| Date       | Version | Description                              | Author |
|------------|---------|------------------------------------------|--------|
| 2025-11-26 | v0.1    | Draft initial de la story B42-P3          | BMad Master |

