# Story B48-P1: Soft Delete des Catégories

**Statut:** Ready for Development  
**Épopée:** [EPIC-B48 – Améliorations Opérationnelles v1.3.2](../epics/epic-b48-ameliorations-operationnelles-v1.3.2.md)  
**Module:** Backend API + Frontend Admin + Frontend Opérationnel  
**Priorité:** URGENT (débloque Olive)

---

## 1. Contexte

Actuellement, la suppression des catégories est destructive (Hard Delete). Cela pose problème pour l'intégrité des données historiques et empêche l'archivage propre des anciennes nomenclatures utilisées par Olivier.

Olive a renommé "Électroménager" → "EEE" et créé 4 sous-catégories. Les anciennes données (four, frigidaire, etc.) ne sont pas ventilées automatiquement. Il faut pouvoir archiver l'ancienne catégorie "Électroménager" sans perdre les données historiques qui y sont liées.

---

## 2. User Story

En tant que **Administrateur (Olive)**,  
je veux **archiver des catégories sans perdre les données historiques**,  
afin que **les anciennes nomenclatures restent disponibles pour les statistiques et les futures déclarations éco-organismes**.

---

## 3. Critères d'acceptation

### Backend (Base de Données)

1. **Migration Schema** :
   - Ajouter une colonne `deleted_at` (Timestamp, Nullable) sur la table `categories`
   - Migration Alembic additive uniquement (pas de breaking change)
   - Index sur `deleted_at` pour performance des requêtes filtrées

2. **Logique Suppression** :
   - Action "Supprimer" → `UPDATE categories SET deleted_at = NOW() WHERE id = X`
   - Ne **JAMAIS** faire de `DELETE` SQL physique si des relations existent (ventes, stocks, lignes de dépôt)
   - *Optionnel :* Autoriser le Hard Delete uniquement si aucune relation n'existe (clean de données erronées)

3. **Validation Hiérarchie** :
   - Si catégorie parente a des enfants actifs (`deleted_at IS NULL`), empêcher la désactivation
   - Message d'erreur HTTP 422 : "Impossible de désactiver cette catégorie car elle contient des sous-catégories actives. Veuillez d'abord désactiver ou transférer les sous-catégories."
   - Réponse JSON doit inclure `active_children_count` pour information
   - Options suggérées : Désactiver manuellement les enfants, transférer dans une autre catégorie, passer à la racine

4. **Filtrage APIs** :
   - APIs de création (caisse/réception) : Filtrer pour n'afficher que `deleted_at IS NULL`
   - APIs de statistiques/dashboard : Ne **PAS** filtrer (garder actives + désactivées)
   - APIs d'historique : Ne **PAS** filtrer (garder actives + désactivées)

### Frontend (Interface Admin)

5. **Liste des Catégories** :
   - Par défaut : Filtrer pour n'afficher que `deleted_at IS NULL`
   - **Nouveauté UI** : Ajouter un Toggle / Checkbox "Afficher les éléments archivés"
   - Les éléments archivés doivent être visuellement distincts (ex: grisés, icône "archive")
   - Afficher la date d'archivage (`deleted_at`) pour les éléments archivés

6. **Restauration** :
   - Bouton "Restaurer" accessible via l'édition de l'item (pas directement dans la liste)
   - Action : Remettre `deleted_at` à NULL
   - Confirmation avant restauration

### Frontend (Interface Opérationnelle - Caisse/Réception)

7. **Sélecteurs de Catégories** :
   - Filtrer catégories inactives (`deleted_at IS NULL`) dans tous les sélecteurs
   - Caisse : Sélecteur de catégories pour ajout d'articles
   - Réception : Sélecteur de catégories pour lignes de dépôt

8. **Historique des Transactions** :
   - Les catégories archivées doivent toujours s'afficher dans l'historique (jointure conservée)
   - Même si une catégorie est désactivée aujourd'hui, elle reste visible dans les transactions passées

### Frontend (Dashboard/Stats)

9. **Statistiques** :
   - Afficher toutes les catégories (actives + désactivées) pour statistiques historiques
   - Les données historiques restent accessibles et mappables pour futures déclarations éco-organismes

---

## 4. Tâches

- [ ] **T1 - Migration DB**
  - Créer migration Alembic pour ajouter colonne `deleted_at` sur `categories`
  - Ajouter index sur `deleted_at` pour performance
  - Tester migration up/down

- [ ] **T2 - Backend ORM & Services**
  - Mettre à jour modèle `Category` avec champ `deleted_at` (DateTime, nullable, timezone=True)
  - Modifier `CategoryService.soft_delete_category()` pour utiliser `deleted_at` au lieu de `is_active=False`
  - Ajouter validation hiérarchie (empêcher désactivation si enfants avec `deleted_at IS NULL`)
  - Modifier `CategoryRepository` pour filtrer selon `deleted_at` selon contexte
  - Ajouter méthode `restore_category()` pour remettre `deleted_at` à NULL

- [ ] **T3 - Backend APIs**
  - Modifier endpoint `DELETE /api/v1/admin/categories/{id}` pour Soft Delete
  - Modifier endpoint `GET /api/v1/categories` (opérationnel) pour filtrer `deleted_at IS NULL`
  - Modifier endpoint `GET /api/v1/admin/categories` pour accepter paramètre `include_archived`
  - Modifier endpoint `POST /api/v1/admin/categories/{id}/restore` pour restauration
  - Ne **PAS** modifier les endpoints de stats (garder toutes les catégories)

- [ ] **T4 - Frontend Admin**
  - Ajouter toggle "Afficher les éléments archivés" dans page gestion catégories
  - Style visuel pour catégories archivées (grisé, icône archive)
  - Afficher date d'archivage
  - Ajouter bouton "Restaurer" dans modal d'édition de catégorie
  - Confirmation avant restauration

- [ ] **T5 - Frontend Opérationnel**
  - Filtrer catégories inactives dans sélecteurs caisse
  - Filtrer catégories inactives dans sélecteurs réception
  - Vérifier que l'historique affiche toujours les catégories archivées

- [ ] **T6 - Tests**
  - Tests unitaires : Soft Delete, restauration, validation hiérarchie
  - Tests API : Endpoints avec/sans filtrage
  - Tests intégration : Vérifier que données historiques restent accessibles
  - Tests frontend : Toggle archivés, restauration, filtrage sélecteurs

---

## 5. Dépendances

- **Pré-requis** : Aucun (story de départ de l'Epic B48)
- **Bloque** : Aucun (peut être développée en parallèle de P2 et P3)

---

## 6. Dev Notes

### Références Architecturales Clés

1. **Modèle Category** : `api/src/recyclic_api/models/category.py`
   - Structure hiérarchique auto-référencée (`parent_id`)
   - Champ `is_active` existe déjà (Boolean)
   - **Décision** : Garder `is_active` ET ajouter `deleted_at` (flexibilité)
   - **Note** : `is_active=False` peut coexister avec `deleted_at IS NULL` (catégorie désactivée mais non archivée)

2. **Service Category** : `api/src/recyclic_api/services/category_service.py`
   - Méthode `soft_delete_category()` existe déjà (utilise `is_active=False`)
   - **Modification** : Remplacer par logique `deleted_at` + garder `is_active` si nécessaire
   - Ajouter validation hiérarchie avant désactivation (vérifier enfants avec `deleted_at IS NULL`)
   - Méthode `hard_delete_category()` existe mais doit rester pour nettoyage données erronées

3. **Repository Category** : `api/src/recyclic_api/repositories/category.py`
   - Méthodes de filtrage à adapter selon contexte (création vs stats)
   - **Pattern** : Utiliser `filter(Category.deleted_at.is_(None))` pour actives uniquement

4. **Frontend Admin** : `frontend/src/pages/Admin/Categories/`
   - Page gestion catégories existante
   - Ajouter toggle et style visuel pour archivés

5. **Frontend Opérationnel** :
   - Caisse : `frontend/src/pages/CashRegister/` - Sélecteurs de catégories
   - Réception : `frontend/src/pages/Reception/` - Sélecteurs de catégories

### Testing

**Standards de Test** :
- Tests unitaires dans `api/tests/test_category_soft_delete.py`
- Tests API dans `api/tests/test_categories_api.py`
- Tests frontend dans `frontend/src/test/`
- Utiliser `pytest` pour backend, `vitest` pour frontend

**Cas de Test Requis** :
- Soft Delete d'une catégorie sans enfants
- Tentative de Soft Delete d'une catégorie avec enfants actifs (doit échouer)
- Restauration d'une catégorie archivée
- Filtrage dans APIs opérationnelles (caisse/réception)
- Pas de filtrage dans APIs stats/dashboard
- Affichage catégories archivées dans historique
- Vérifier que `is_active=False` ET `deleted_at IS NULL` fonctionne (catégorie désactivée mais non archivée)

### Exemple de Migration Alembic

**Fichier** : `api/migrations/versions/XXXXX_b48_p1_add_deleted_at_to_categories.py`

```python
"""b48_p1_add_deleted_at_to_categories

Revision ID: XXXXX
Revises: [dernière_revision]
Create Date: 2025-12-09 XX:XX:XX.XXXXXX

Story B48-P1: Ajout colonne deleted_at pour Soft Delete des catégories
Ajoute la colonne deleted_at TIMESTAMP NULL à la table categories pour permettre l'archivage sans perte de données historiques.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import TIMESTAMP

# revision identifiers, used by Alembic.
revision = 'XXXXX'
down_revision = '[dernière_revision]'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Story B48-P1: Ajouter colonne deleted_at TIMESTAMP NULL à la table categories
    op.add_column('categories', sa.Column('deleted_at', TIMESTAMP(timezone=True), nullable=True))
    # Ajouter index pour performance des requêtes filtrées
    op.create_index('ix_categories_deleted_at', 'categories', ['deleted_at'])


def downgrade() -> None:
    # Story B48-P1: Supprimer index et colonne deleted_at de la table categories
    op.drop_index('ix_categories_deleted_at', table_name='categories')
    op.drop_column('categories', 'deleted_at')
```

### Format des Réponses API

**Erreur de validation hiérarchie** (ligne 42) :
```json
{
  "detail": "Impossible de désactiver cette catégorie car elle contient des sous-catégories actives. Veuillez d'abord désactiver ou transférer les sous-catégories.",
  "category_id": "uuid-de-la-categorie",
  "active_children_count": 3
}
```

**Endpoint de restauration** (ligne 99) :
- **Request** : `POST /api/v1/admin/categories/{id}/restore` (body vide)
- **Response 200** : `CategoryRead` avec `deleted_at: null`
- **Response 404** : Catégorie non trouvée
- **Response 400** : Catégorie déjà active (`deleted_at IS NULL`)

---

## 7. Estimation

**4-6h de développement**

- Migration DB : 30min
- Backend (ORM, Services, APIs) : 2-3h
  - ORM : 15min (ajout champ + index)
  - Services : 1h (soft_delete + validation hiérarchie + restore)
  - APIs : 45min (endpoints + filtrage)
- Frontend Admin : 1-1.5h
  - Toggle archivés : 30min
  - Style visuel : 20min
  - Bouton restauration : 20min
- Frontend Opérationnel : 30min
  - Filtrage sélecteurs : 20min
  - Vérification historique : 10min
- Tests : 1h
  - Unitaires : 30min
  - API : 20min
  - Frontend : 10min

---

## 8. Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-09 | 1.0 | Création story | Sarah (PO) |
| 2025-12-09 | 1.1 | Améliorations agent SM (migration exemple, format API, validation hiérarchie, estimation détaillée) | SM Agent |

---

## 9. Definition of Done

- [ ] Migration DB appliquée et testée (up/down)
- [ ] Soft Delete fonctionnel (UPDATE au lieu de DELETE)
- [ ] Validation hiérarchie opérationnelle (empêche désactivation si enfants actifs)
- [ ] Toggle "Afficher archivés" fonctionnel en Admin
- [ ] Bouton "Restaurer" accessible via édition
- [ ] Filtrage correct dans sélecteurs opérationnels
- [ ] Pas de filtrage dans stats/dashboard
- [ ] Tests unitaires et d'intégration passent
- [ ] Aucune régression sur fonctionnalités existantes
- [ ] Code review validé

