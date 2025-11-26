# Epic: Caisse Virtuelle & Mode Formation

**ID:** EPIC-B41-CAISSE-VIRTUELLE  
**Titre:** Mode caisse déconnecté pour onboarding & formation  
**Thème:** Caisse / Formation & Qualité  
**Statut:** Proposition  
**Priorité:** P2 (Important mais non bloquant)

---

## 1. Objectif de l'Epic

Mettre à disposition un espace de caisse virtuel totalement déconnecté de la base de données de production permettant de simuler des tickets et encaissements en toute sécurité, avec la possibilité future d’ajouter des bulles interactives de tutoriel.

## 2. Description

Les nouveaux caissiers et bénévoles n’ont aucun environnement d’entraînement. L’objectif est d’offrir une copie fonctionnelle de la caisse (mêmes écrans, mêmes contrôles) mais opérant sur un magasin de données local (IndexedDB/localStorage) sans impact sur les chiffres officiels. Cet epic est livré en fin de roadmap (facultatif) mais documente tous les besoins pour un déploiement ultérieur. Les bulles interactives sont planifiées mais non activées tant que la base virtuelle n’est pas éprouvée.

## 3. Stories de l'Epic (ordre imposé)

1. **STORY-B41-P1 – Mode déconnecté & stockage local**  
   - Ajouter un “toggle” Caisse virtuelle (feature flag).  
   - Lorsque activé, toutes les écritures se font dans IndexedDB/localStorage isolé.  
   - Les données simulées sont purgeables depuis l’UI.

2. **STORY-B41-P2 – Simulation complète des tickets**  
   - Permettre création, modification, encaissement de tickets fictifs (y compris dons).  
   - Gérer le bandeau KPI en version simulée, sans toucher aux stats réelles.  
   - Ajouter un récapitulatif de session (tickets simulés).

3. **STORY-B41-P3 – Infrastructure bulles interactives (préparation)**  
   - Mettre en place un système générique de “guided tours” (ex : react-joyride) désactivé par défaut.  
   - Définir le format des scripts de tutoriel (JSON ou Markdown).  
   - Préparer 2-3 bulles placeholders pour futurs parcours (“Créer un ticket”, “Encaisser”).

## 4. Compatibilité & Contraintes

- Mode virtuel totalement isolé des APIs (aucun appel réseau).  
- Doit fonctionner offline sur tablettes en local-first.  
- Aucun impact sur la base de données ni sur les statistiques officielles.  
- Les bulles interactives ne s’affichent pas en mode production tant qu’elles ne sont pas validées.

## 5. Definition of Done

- [ ] Toggle “Caisse virtuelle” disponible et documenté.  
- [ ] La simulation reproduit fidèlement les écrans caisse (ajout, encaissement, KPI).  
- [ ] Les données simulées sont stockées localement et réinitialisables.  
- [ ] Infrastructure de bulles/tutoriels prête, désactivée par défaut.  
- [ ] Guide d’onboarding mis à jour (docs/architecture + runbook formation).

