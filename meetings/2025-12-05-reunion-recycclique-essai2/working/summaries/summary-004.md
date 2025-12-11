# Résumé Segment 004

**Timestamp:** 13:30 - 18:35
**Speakers:** A, B, C, D, E, F
**Tags:** #prix-zero #granularite-categories #eco-organismes #mode-encaissement #llm-matching

## Points discutés

- **Consensus sur système de prix à 0 par défaut** :
  - Valeur nulle (--) par défaut sur tous les articles
  - Comptabilisation: matière, poids, catégories
  - Prix global saisi en fin de transaction (négocié avec client)
  - Exception: articles à prix fixe (ex: collier 15€) peuvent être saisis individuellement

- **Récapitulatif final du système proposé** :
  1. Saisie: catégorie + poids (sans prix)
  2. Prix par défaut = null (pas affiché)
  3. Possibilité de saisir un prix pour article spécifique si besoin
  4. Total négocié en fin avec client
  5. Option paramétrable dans settings (activable/désactivable)

- **Granularité des catégories** :
  - Question centrale: niveau de détail nécessaire ?
  - Exemple vaisselle: métallique, grès, ustensiles, couverts... jusqu'où aller ?
  - Trade-off: détail vs simplicité d'usage
  - Principe: ne pas saisir "200g d'assiettes" mais "vaisselle"

- **Mapping automatique catégories (LLM)** :
  - Système de rapprochement intelligent
  - Ex: "tasse en grès" → catégorisé automatiquement dans "vaisselle"
  - Similaire au module d'import déjà développé
  - But: fluidité saisie sans contrainte de nomenclature stricte

- **Module vocal avec reconnaissance catégories** :
  - Saisie: "3 casseroles" (vocal)
  - Transcription: "3 casseroles"
  - Mapping automatique: → catégorie "vaisselle"
  - Pas besoin de dire "3, V-A-I-S-S-E-L-L-E..."

- **Déclarations éco-organismes (intro)** :
  - Sujet complexe et technique
  - Besoin de binôme pour dégrossir
  - C manque de connaissance métier spécifique
  - Besoin d'ouvrir un chantier dédié (forum)
  - Connaissance distribuée dans l'équipe à rassembler

- **Question priorité données par catégorie** :
  - Est-ce important de savoir combien rapporte chaque pôle (textile, livres, vaisselle...) ?
  - Utilité questionnée vs temps/énergie dépensés
  - Pour réception: actuellement rapide et satisfaisant
  - Pour caisse: items variés donc + complexe

- **Communication et affichage** :
  - Observation: bon travail réseaux sociaux et façade
  - Manque: communication interne et fonctionnement interne
  - Besoin futur de communiquer efficacement (affichage, site internet)
  - Prérequis: clarté sur points clés dont tarification

## Décisions prises

- **Décision**: Mode prix à 0 par défaut sera implémenté comme option paramétrable
- **Décision**: Module de mapping automatique catégories sera développé (déjà en cours)
- **Décision**: Chantier éco-organismes sera ouvert sur le forum avec binôme

## Actions (RACI)

- Implémenter option "prix par défaut = 0" désactivable - Responsable: développement
- Finaliser module mapping automatique catégories (LLM) - Responsable: C
- Ouvrir chantier éco-organismes sur forum - Responsable: C
- Identifier binôme pour travailler sur déclarations éco-organismes - Responsable: équipe

## Risques

- **Complexité déclarations éco-organismes** :
  - Sujet technique lourd
  - Connaissance fragmentée dans l'équipe
  - Risque d'erreurs sans clarification collective

- **Dépendance au mapping LLM** :
  - Si système défaillant → blocage saisie rapide
  - Nécessite apprentissage/calibrage

## Questions ouvertes

- Quel niveau de granularité catégories faut-il maintenir ?
- Est-il vraiment nécessaire de tracker les ventes par catégorie détaillée ?
- Qui sera en binôme pour le chantier éco-organismes ?
- Quand lancer le travail sur les déclarations aux éco-organismes ?

## Tableau chronologique

| Timestamp | Speaker | Résumé |
|-----------|---------|--------|
| 13:30 | C | Module vocal faisable et intéressant |
| 14:00 | A/C | Débat utilité granularité catégories (pôle textile, etc.) |
| 14:45 | A | Récapitulatif: prix par défaut =0, saisie catégorie+poids, total en fin |
| 15:30 | C | Mapping automatique catégories via LLM ("tasse grès" → "vaisselle") |
| 16:15 | C | Annonce chantier éco-organismes (besoin binôme, forum) |
| 17:00 | A | Observation: communication externe OK, interne à améliorer |
| 17:45 | A | Option paramétrable pour activer/désactiver prix dans settings |
