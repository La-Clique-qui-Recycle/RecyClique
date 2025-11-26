# Epic: Caisse - Notes Tickets & Encaissement Libre

**ID:** EPIC-B40-CAISSE-NOTES-ENCAISSEMENT  
**Titre:** Notes enrichies & encaissements libres avec bandeau KPI  
**Thème:** Caisse / Pilotage & Qualité des données  
**Statut:** Proposition  
**Priorité:** P1 (Critique)

---

## 1. Objectif de l'Epic

Permettre aux caissiers d’ajouter des notes contextualisées sur chaque ticket, d’effectuer des encaissements libres tracés (montant + note obligatoire) et d’afficher en permanence les KPIs de caisse (nb de tickets, CA, dons, poids sortis/rentrés, montant dernier ticket) afin de sécuriser la tenue de caisse quotidienne.

## 2. Description

Aujourd’hui, aucune note opérationnelle n’est stockée avec les tickets, obligeant les équipes à maintenir des traces hors système. De plus, certains ajustements (ex : complément de 3 €) nécessitent un encaissement libre inexistant. Le bandeau caisse reste limité et ne reflète pas les chiffres clés du jour. Cet epic introduit un champ note côté caisse, la possibilité pour l’admin d’amender ces notes, un bandeau KPI temps réel, ainsi qu’un flux d’encaissement libre (sans décaissement). Les modifications de schéma (stockage des notes + journal des encaissements libres) arrivent en toute fin d’epic pour respecter la contrainte PO.

## 3. Stories de l'Epic (ordre imposé)

1. **STORY-B40-P1 – Champ Note côté caisse (Frontend)**  
   - Ajouter un champ texte libre « Note » sur l’écran d’encaissement.  
   - Sauvegarder temporairement la note dans l’état local/appli (pas encore DB).  
   - Afficher la note dans l’aperçu du ticket avant validation.

2. **STORY-B40-P2 – Bandeau caisse KPI temps réel**  
   - Afficher : nb tickets du jour, montant dernier ticket, CA, dons, poids sortis, poids rentrés.  
   - Reposer sur les APIs live (Epic B38) ou fallback existant.  
   - Rafraîchissement discret (polling) et indicateurs visuels.

3. **STORY-B40-P3 – Workflow Encaissement libre (UX + API contract)**  
   - Ajouter un bouton « Encaissement libre » ouvrant un formulaire montant + note obligatoire.  
   - Implémenter côté front et service une API `POST /cash/free-entries` (feature flag) écrivant vers un adaptateur temporaire (journal en mémoire ou fichier).  
   - Les montants saisis se reflètent dans le bandeau (mais marqués comme « non persistés » jusqu’à Story P6).

4. **STORY-B40-P4 – Edition des notes côté Admin**  
   - Dans `admin/…/visualiser les tickets`, permettre aux admins d’éditer la note d’un ticket.  
   - Historiser les modifications (audit log en mémoire ou table existante) mais sans nouvelle colonne DB (utiliser table logs existante si disponible, sinon stockage temporaire identique Story P1).  
   - Restreindre l’action aux rôles Admin/SuperAdmin.

5. **STORY-B40-P5 – Migration DB pour les notes de tickets**  
   - Ajouter une colonne `note` (TEXT) sur la table des tickets + champs ORM/API.  
   - Migrer les notes temporaires (stories précédentes) vers la nouvelle colonne.  
   - Couvrir par tests API & Playwright.

6. **STORY-B40-P6 – Persistance des encaissements libres**  
   - Créer la table `cash_free_entries` (ou équivalent) : `id`, `amount`, `note`, `cashier_id`, `payment_method`, `created_at`.  
   - Mettre à jour l’API `POST /cash/free-entries` pour écrire dans cette table.  
   - Synchroniser bandeau KPI + exports journaux sur ces encaissements.

## 4. Compatibilité & Contraintes

- Les stories P1-P4 n’altèrent pas la base de données.  
- Les notes doivent être filtrées côté API pour éviter injection HTML.  
- Les encaissements libres sont uniquement positifs (pas de décaissement).  
- Les exports réglementaires devront intégrer les encaissements libres une fois la persistance (P6) achevée.

## 5. Definition of Done

- [ ] Champ note disponible côté caisse + édition admin.  
- [ ] Bandeau KPI affiche 6 indicateurs en temps réel.  
- [ ] Encaissement libre opérationnel et tracé en base (après P6).  
- [ ] Documentation caisse & procédures admin mises à jour.  
- [ ] Tests backend (API + migrations) et frontend (Playwright/Vitest) verts.  
- [ ] Aucune régression sur la clôture de caisse quotidienne.

