# Export documentation écosystème – Recyclic

**Date d’export :** 2025-01-30  
**Objectif :** Fournir un lot de documents utiles pour décrire Recyclic dans un écosystème global (définition, état actuel, vision, module éco-organismes). Aucun déplacement ni réécriture : copies uniquement.

## Contenu

### Définition et état actuel
- **brief.md** – Projet Recyclic : solution open source pour ressourceries, bot Telegram IA, caisse, exports Ecologic ; problème, solution, cibles, MVP, vision long terme.
- **goals-and-background-context.md** – Objectifs (digitalisation, conformité Ecologic, réduction admin, traçabilité) et contexte.
- **intro-project-analysis-and-context.md** – État actuel (RecyClique/Recyclic), stack Docker, périmètre v1.3.0, analyse brownfield.
- **architecture.md** – Vision métier, principes, stack, composants (Bot, API, Frontend, Gemini AI), données, rôles, workflows, infra.
- **requirements.md** – Exigences fonctionnelles et non fonctionnelles (interface caisse, catégories, renommage RecyClique, etc.).
- **user-interface-design-goals.md** – Vision UX, paradigmes d’interaction, écrans principaux, accessibilité, branding.
- **coding-standards.md** – Standards de code, gestion de la dette technique, patterns.
- **testing-strategy.md** – Charte de stratégie de test, pyramide, patterns, 401/403.

### Module éco-organismes (dossier `eco-organismes/`)
- **README.md** – Vue d’ensemble du module, phase études, liste des docs, cas d’usage déclaration.
- **00-besoins-utilisateur.md** – Besoins : multi-partenaires, déclarations trimestrielles, flux reçus/recyclés/vendus, intégration deposits/inventory/caisse.
- **01-fiche-eco-maison.md** – Fiche eco-maison : DEA, Jouets, ABJ, catégories, barèmes, consignes.
- **02-modele-donnees.md** – Modèle de données (EcoOrganism, DeclarationPeriod, Declaration, CategoryMapping, etc.).
- **03-specifications-fonctionnelles.md** – Specs fonctionnelles et UI : workflows déclaration, API, permissions.
- **04-guide-mapping-categories.md** – Guide opérationnel mapping catégories RecyClique ↔ éco-organismes.

## Exclusions volontaires
- Stories, epics, rapports d’implémentation, archives, pending-tech-debt (nombreux éléments obsolètes ou trop détaillés pour un export “écosystème”).

## Paheko
- **Paheko** (logiciel de gestion d’association) est mentionné comme futur moteur backend pour RecyClique (comptabilité, utilisateurs, adhérents). Références dans le dépôt :
  - `docs/v1.4.3-specifications-completes.md` (comparaison logiciels, pas de doc d’intégration)
  - `scripts/generate_meeting_report.py` (template de compte-rendu : « Point Paheko », intégration prévue, gestion participants/adhérents).
- Aucun document dédié à l’intégration Paheko n’a été trouvé au moment de l’export.
