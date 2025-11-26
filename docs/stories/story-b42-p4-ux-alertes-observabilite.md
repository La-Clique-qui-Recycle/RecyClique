# Story B42-P4: UX, Alertes & Observabilité des sessions

**Status:** On Hold  
**Epic:** [EPIC-B42 – Session glissante & anti-déconnexion](../epics/epic-b42-sliding-session.md)  
**Module:** UX / Admin / Observabilité  
**Priority:** P1  
**Owner:** PO + UX + SRE  
**Last Updated:** 2025-11-26

**Blocking:** En attente de la completion de [B42-P2](../stories/story-b42-p2-backend-refresh-token.md) et [B42-P3](../stories/story-b42-p3-frontend-refresh-integration.md). L'observabilité nécessite que les mécanismes core soient implémentés.

---

## Story Statement

**As a** Product Owner,  
**I want** des alertes claires côté utilisateur et des métriques côté admin sur les sessions,  
**so that** les opérateurs ne sont jamais surpris par une déconnexion et l’équipe peut surveiller le taux de refresh/erreurs.

---

## Acceptance Criteria

1. **Warning UX** – Quand un refresh échoue (raison réseau ou refus backend), afficher une bannière persistante avec countdown + CTA “Réessayer” / “Sauvegarder” / “Se reconnecter”.  
2. **Admin insights** – Ajout d’un module “Sessions” dans `/admin/dashboard` ou `/admin/health` présentant :  
   - nombre de sessions actives  
   - taux de refresh réussis / échoués  
   - top erreurs (par IP/site)  
3. **Logs & métriques** – Exposer des compteurs Prometheus (ou équivalent) : `session_refresh_success`, `session_refresh_failure`, `session_logout_forced`.  
4. **Alerting Ops** – Créer une alerte (Grafana/Email) si >5% des refresh échouent sur 15 min.  
5. **Documentation** – Mettre à jour guides utilisateur & runbook admin (explications sur bannière, comment adapter `token_expiration_minutes`, différence avec `activity_threshold`).

---

## Dev Notes

### Références
- **[RFC Sliding Session](../../architecture/sliding-session-rfc.md)** – Design complet validé
- `frontend/src/components/...` (bannière venant de Story P3).  
- `frontend/src/pages/Admin/Health.tsx` ou `Dashboard` – à étendre pour afficher stats.  
- `api/src/recyclic_api/core/metrics.py` (si existant) ou introduire un module Prometheus.  
- `docs/runbooks/dev-workflow-guide.md`, `docs/architecture/architecture.md` – sections Auth/Monitoring.

### Données exposées
- Backend doit enregistrer chaque refresh (succès/échec) avec timestamp, user_id, site, IP.  
- Possibilité d’agréger en base (view materialized) ou via Redis + exporter.  
- Prévoir pagination pour ne pas surcharger l’admin.

### UX
- Bannière cohérente avec la charte (utiliser composants existants).  
- Message générique “Votre session doit être renouvelée” avec détails (ex: “perte réseau détectée, tentative automatique dans 20 s”).  
- Support dark mode / responsive.

---

## Tasks / Subtasks
1. **Bannière & UX (AC1)**  
   - [ ] Intégrer le bandeau dans toutes les pages protégées (layout global).  
   - [ ] Ajouter actions (retry, re-login).  
   - [ ] QA multi-device (tablette caisse).  
2. **Observabilité backend (AC3 & AC4)**  
   - [ ] Instrumenter refresh/logouts (Prometheus counters + logs structurés).  
   - [ ] Ajouter alerte Ops (grafana/pager).  
3. **Admin dashboard (AC2)**  
   - [ ] Créer un widget “Sessions actives” + graphiques.  
   - [ ] Endpoint backend `/v1/admin/sessions/metrics`.  
4. **Docs (AC5)**  
   - [ ] Guide utilisateur : explication bannière & bonne pratique (ne pas fermer l’onglet).  
   - [ ] Runbook admin : comment surveiller et ajuster les paramètres.  
5. **Tests**  
   - [ ] Tests UI (Playwright) pour bannière (success/failure).  
   - [ ] Tests API pour endpoint metrics.  
   - [ ] Tests alerting (simulate failure rate > threshold).

---

## Project Structure Notes
- Nouveau composant admin dans `frontend/src/pages/Admin/HealthSessions.tsx` (ou section).  
- Backend metrics dans `api/src/recyclic_api/services/metrics/session_metrics.py`.  
- Config alerting documentée dans `docs/runbooks/monitoring.md`.

---

## Validation Checklist
- [ ] Bannière validée par PO + testée sur tablette.  
- [ ] Dashboard admin affiche données live.  
- [ ] Alerting déclenché en test.  
- [ ] Documentation mise à jour.  
- [ ] Aucun impact perf significatif (<5% overhead).

---

## Change Log
| Date       | Version | Description                               | Author |
|------------|---------|-------------------------------------------|--------|
| 2025-11-26 | v0.1    | Draft initial de la story B42-P4           | BMad Master |

