# EPIC-B47: Import Legacy CSV & Template Offline

**Statut:** Draft  
**Module:** Backend API + Frontend Admin + Ops  
**Priorité:** Moyenne (amélioration historique des données)

---

## 1. Contexte

Avant le déploiement de Recyclic, les réceptions étaient enregistrées manuellement dans un fichier CSV/Excel (`IMPORT_202509_ENTREES _ LaClique.csv`). Ce fichier contient environ 630 lignes de données historiques avec plusieurs problèmes :

- **Dates incohérentes** : Beaucoup de lignes sans date (lignes 3-106), dates répétées de manière sporadique, formats variés (`25/09/2025`, `27/sept`, `09/oct`)
- **Catégories non normalisées** : Variations et typos (`Vaisselle`, `VAISELLE`, `vaiselle`, `DEEE`, `D3E`, `deee`, `EEE`, `EEE PAM`)
- **Poids approximatifs** : Arrondis Excel (`0.569999...` au lieu de `0.57`)
- **Structure hétérogène** : Colonnes supplémentaires inutiles, notes à ignorer

**Besoin métier :**
1. Importer ces données historiques dans Recyclic pour avoir un historique complet
2. Créer un template CSV offline pour les cas où internet est en panne et qu'on doit saisir manuellement

---

## 2. Objectif de l'Epic

Mettre en place un **système d'import de données legacy** avec mapping intelligent des catégories et génération d'un **template CSV offline** standardisé pour les réceptions manuelles.

**Valeur ajoutée :**
- Historique complet des réceptions dans Recyclic
- Capacité de saisie offline en cas de panne réseau
- Normalisation et validation des données avant import

---

## 3. Portée

**Inclus dans cet epic :**

### Phase 1 : Nettoyage CSV Legacy
- Script Python de normalisation des dates (fill-down + répartition 17-20/09 pour orphelins)
- Arrondi des poids à 2 décimales
- Suppression des notes
- Production d'un CSV conforme au template offline

### Phase 2 : Import avec Mapping Intelligent
- Service d'import avec fuzzy matching (Levenshtein) pour les catégories
- Interface web de validation/correction manuelle du mapping
- Injection en base : création de `PosteReception`/`TicketDepot`/`LigneDepot` par jour
- Rapport d'import avec statistiques

### Phase 3 : Template Offline
- Génération du template CSV vierge basé sur la structure normalisée
- Documentation d'utilisation
- Endpoint API pour télécharger le template

**Exclus (hors scope immédiat) :**
- Import automatique récurrent (uniquement pour le CSV legacy historique)
- Gestion des conflits de dates (import séquentiel par date)

---

## 4. Critères d'acceptation de l'Epic

1. **Nettoyage réussi** : Le script produit un CSV valide avec toutes les dates normalisées (ISO 8601) et poids arrondis
2. **Mapping fiable** : 100% des catégories mappables avec validation manuelle possible
3. **Import complet** : Toutes les lignes valides importées en base avec création des sessions/tickets par jour
4. **Template utilisable** : CSV template offline téléchargeable et conforme à la structure `LigneDepot`
5. **Aucune régression** : Les fonctionnalités de réception existantes restent intactes
6. **Documentation** : Guide utilisateur pour l'import et l'utilisation du template offline

---

## 5. Structure des Données

### Modèle `LigneDepot` (existant)
- `ticket_id` (UUID) → référence `TicketDepot`
- `category_id` (UUID) → référence `Category`
- `poids_kg` (Numeric 8,3)
- `destination` (Enum: `MAGASIN`, `RECYCLAGE`, `DECHETERIE`)
- `notes` (String, nullable)

### Template CSV Offline
Colonnes requises :
- `date` (ISO 8601: `YYYY-MM-DD`) → pour créer le ticket par jour
- `category` (String) → nom de la catégorie (sera mappé vers `category_id` à l'import)
- `poids_kg` (Decimal, 2 décimales)
- `destination` (`MAGASIN`|`RECYCLAGE`|`DECHETERIE`)
- `notes` (String, optionnel)

---

## 6. Stories (Ordre d'exécution)

### Story B47-P1 : Script de Nettoyage CSV Legacy
**Objectif** : Normaliser le CSV legacy pour produire un fichier conforme au template offline

**Critères d'acceptation** :
- Script Python `scripts/clean_legacy_import.py`
- Normalisation des dates :
  - Lignes 3-106 (orphelines) : répartition uniforme entre 17-20/09/2025
  - Principe "fill-down" : une date s'applique à toutes les lignes suivantes jusqu'à la prochaine date
  - Conversion en ISO 8601 (`YYYY-MM-DD`)
- Arrondi des poids à 2 décimales
- Suppression de la colonne `Notes`
- Production de `IMPORT_202509_ENTREES_CLEANED.csv` conforme au template

**Estimation** : 3 points  
**Prérequis** : Aucun

---

### Story B47-P2 : Service d'Import avec Fuzzy Matching
**Objectif** : Créer le service backend d'import avec mapping intelligent des catégories

**Critères d'acceptation** :
- Service `LegacyImportService` avec :
  - Chargement des catégories depuis la base (`CategoryService`)
  - Fuzzy matching (Levenshtein) pour proposer des mappings
  - Génération d'un fichier JSON de mapping (`category_mapping.json`)
  - Validation des mappings (seuil de confiance configurable)
- Endpoint API `POST /api/v1/admin/import/legacy/analyze` :
  - Upload du CSV nettoyé
  - Analyse et proposition de mappings
  - Retourne les catégories non mappables
- Endpoint API `POST /api/v1/admin/import/legacy/execute` :
  - Upload du CSV + fichier de mapping validé
  - Création des `PosteReception` par jour (ou réutilisation)
  - Création des `TicketDepot` par jour
  - Création des `LigneDepot` avec catégories mappées
  - Destination par défaut : `MAGASIN` (ou configurable)
  - Rapport d'import avec statistiques

**Estimation** : 5 points  
**Prérequis** : B47-P1

---

### Story B47-P3 : Interface Web de Validation Mapping
**Objectif** : Créer l'interface admin pour valider/corriger les mappings de catégories

**Critères d'acceptation** :
- Page admin `/admin/import/legacy` :
  - Upload du CSV nettoyé
  - Affichage des propositions de mapping (fuzzy matching)
  - Indicateur de confiance pour chaque mapping
  - Possibilité de corriger manuellement les mappings
  - Liste des catégories non mappables avec possibilité de rejeter ou mapper vers "DIVERS"
  - Export du fichier de mapping validé (JSON)
- Bouton "Importer" qui appelle l'endpoint d'exécution
- Affichage du rapport d'import (succès/échecs, statistiques)

**Estimation** : 5 points  
**Prérequis** : B47-P2

---

### Story B47-P4 : Template CSV Offline & Documentation
**Objectif** : Générer le template CSV offline et documenter son utilisation

**Critères d'acceptation** :
- Script de génération du template vierge `scripts/generate-offline-template.py`
- Template CSV avec en-têtes : `date`, `category`, `poids_kg`, `destination`, `notes`
- Endpoint API `GET /api/v1/admin/templates/reception-offline.csv`
- Documentation dans `docs/guides/template-offline-reception.md` :
  - Structure du template
  - Règles de saisie (dates, catégories, destinations)
  - Processus d'import après saisie offline
- Tests d'intégration : import d'un CSV généré depuis le template

**Estimation** : 3 points  
**Prérequis** : B47-P1

---

## 7. Risques

1. **Mapping incorrect des catégories** → données corrompues en base
   - *Mitigation* : Validation manuelle obligatoire via interface web, logs détaillés, test sur échantillon avant import complet

2. **Dates orphelines mal réparties** → historique inexact
   - *Mitigation* : Répartition uniforme documentée, possibilité de corriger manuellement le CSV nettoyé

3. **Performance lors de l'import** → timeout ou lenteur
   - *Mitigation* : Import en batch par jour, transactions par ticket, indicateur de progression

4. **Conflits avec données existantes** → doublons
   - *Mitigation* : Vérification des dates avant import, possibilité de filtrer par période

**Rollback Plan :**
- Import dans une table temporaire d'abord (optionnel)
- Possibilité de supprimer les tickets créés par date via API admin
- Export de sauvegarde avant import (déjà en place via B46)

---

## 8. Compatibilité

- [x] Existing APIs remain unchanged (nouveaux endpoints uniquement)
- [x] Database schema changes are backward compatible (aucun changement de schéma)
- [x] UI changes follow existing patterns (nouvelle page admin)
- [x] Performance impact is minimal (import en batch, pas de charge sur les APIs existantes)

---

## 9. Dépendances

- **B46 (Import BDD)** : Les mécanismes de backup automatique sont déjà en place
- **Système de réception existant** : Utilisation des modèles `PosteReception`, `TicketDepot`, `LigneDepot`
- **Système de catégories** : Utilisation de `CategoryService` pour le mapping

---

## 10. Definition of Done

- [ ] Script de nettoyage produit un CSV valide conforme au template
- [ ] Service d'import avec fuzzy matching fonctionnel
- [ ] Interface web de validation/correction opérationnelle
- [ ] Import testé sur échantillon avec validation utilisateur
- [ ] Template CSV offline généré et documenté
- [ ] Tests unitaires et d'intégration passent
- [ ] Documentation utilisateur créée
- [ ] Aucune régression sur les fonctionnalités de réception existantes
- [ ] Code review validé
- [ ] Déploiement en staging validé

---

## 11. Notes Techniques

### Mapping des Catégories
- **Fuzzy Matching** : Utilisation de `python-Levenshtein` ou `fuzzywuzzy` avec seuil de confiance (ex: 80%)
- **Fallback manuel** : Interface web pour corriger les mappings non fiables
- **Catégories non mappables** : Option de rejet ou mapping vers catégorie "DIVERS" (si existe)

### Structure d'Import
- **Par jour** : Un `PosteReception` par jour (ou réutilisation si existe)
- **Par jour** : Un `TicketDepot` par jour avec `benevole_user_id` = utilisateur admin qui importe
- **Par ligne** : Une `LigneDepot` par ligne du CSV avec mapping validé

### Destination par Défaut
- Valeur par défaut : `MAGASIN` (configurable dans le service)
- Possibilité d'ajouter une colonne `destination` dans le CSV legacy si disponible

---

## 12. Handoff Story Manager

"Veuillez développer les user stories détaillées pour cet epic brownfield. Considérations clés :

- Système existant : Recyclic (Python/FastAPI + React/TypeScript + PostgreSQL)
- Points d'intégration : `ReceptionService`, `CategoryService`, modèles `PosteReception`/`TicketDepot`/`LigneDepot`
- Patterns existants : Services avec repositories, endpoints REST, pages admin React
- Exigences de compatibilité : Aucun changement de schéma DB, nouveaux endpoints uniquement
- Chaque story doit inclure la vérification que les fonctionnalités de réception existantes restent intactes

L'epic doit maintenir l'intégrité du système tout en permettant l'import des données historiques et la création d'un template offline."

