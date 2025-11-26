# Epic: Caisse - Notes Tickets & Bandeau KPI Temps Réel

**ID:** EPIC-B40-CAISSE-NOTES-KPI  
**Titre:** Notes enrichies sur tickets avec bandeau KPI temps réel  
**Thème:** Caisse / Pilotage & Qualité des données  
**Statut:** Proposition  
**Priorité:** P1 (Critique)

---

## 1. Objectif de l'Epic

Permettre aux caissiers d'ajouter des notes contextualisées sur chaque ticket et d'afficher en permanence les KPIs de caisse (nb de tickets, CA, dons, poids sortis/rentrés, montant dernier ticket) afin de sécuriser la tenue de caisse quotidienne et améliorer la traçabilité opérationnelle.

---

## 2. Description

Aujourd'hui, aucune note opérationnelle n'est stockée avec les tickets, obligeant les équipes à maintenir des traces hors système (post-it, tickets papier). Le bandeau caisse reste limité et ne reflète pas les chiffres clés du jour en temps réel.

Cet epic introduit :
- Un champ note côté caisse pour contextualiser chaque ticket
- La possibilité pour l'admin d'amender ces notes
- Un bandeau KPI temps réel affichant les indicateurs clés (tickets, CA, dons, poids)

Les modifications de schéma (stockage des notes en base) arrivent en toute fin d'epic pour respecter la contrainte PO (développement frontend d'abord, DB ensuite).

---

## 3. Stories de l'Epic (ordre imposé)

1. **STORY-B40-P1 – Champ Note côté caisse (Frontend)**  
   - Ajouter un champ texte libre « Note » sur l'écran d'encaissement.  
   - Sauvegarder temporairement la note dans l'état local/appli (pas encore DB).  
   - Afficher la note dans l'aperçu du ticket avant validation.

2. **STORY-B40-P2 – Bandeau caisse KPI temps réel**  
   - Afficher : nb tickets du jour, montant dernier ticket, CA, dons, poids sortis, poids rentrés.  
   - Reposer sur les APIs live (Epic B38) ou fallback existant.  
   - Rafraîchissement discret (polling) et indicateurs visuels.

3. **STORY-B40-P4 – Edition des notes côté Admin**  
   - Dans `admin/…/visualiser les tickets`, permettre aux admins d'éditer la note d'un ticket.  
   - Historiser les modifications (audit log en mémoire ou table existante) mais sans nouvelle colonne DB (utiliser table logs existante si disponible, sinon stockage temporaire identique Story P1).  
   - Restreindre l'action aux rôles Admin/SuperAdmin.

4. **STORY-B40-P5 – Migration DB pour les notes de tickets**  
   - Ajouter une colonne `note` (TEXT) sur la table des tickets + champs ORM/API.  
   - Migrer les notes temporaires (stories précédentes) vers la nouvelle colonne.  
   - Couvrir par tests API & Playwright.

---

## 4. Compatibilité & Contraintes

- Les stories P1, P2, P4 n'altèrent pas la base de données.  
- Les notes doivent être filtrées côté API pour éviter injection HTML.  
- Le bandeau KPI repose sur les APIs existantes (Epic B38) sans modification backend supplémentaire.  
- Migration additive uniquement (pas de breaking change pour P5).

---

## 5. Definition of Done

- [ ] Champ note disponible côté caisse + édition admin.  
- [ ] Bandeau KPI affiche 6 indicateurs en temps réel.  
- [ ] Notes persistées en base de données (colonne `note` sur table tickets).  
- [ ] Documentation caisse & procédures admin mises à jour.  
- [ ] Tests backend (API + migrations) et frontend (Playwright/Vitest) verts.  
- [ ] Aucune régression sur la clôture de caisse quotidienne.

---

## 6. Historique des Changements

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2025-11-26 | v2.0 | Refonte complète : suppression encaissements libres et correction CB, recentrage sur notes + KPI | BMad Master |
| 2025-11-26 | v1.0 | Création epic initial | BMad Master |

