# Story B48-P2: Logs Transactionnels (Monitoring Bug Tickets Fantômes)

**Statut:** Ready for Development  
**Épopée:** [EPIC-B48 – Améliorations Opérationnelles v1.3.2](../epics/epic-b48-ameliorations-operationnelles-v1.3.2.md)  
**Module:** Backend API  
**Priorité:** HAUTE (sécurité/débogage)

---

## 1. Contexte

Un bug rare "tickets fantômes" a été signalé par Germaine et Olive (2-3 fois) : des items du ticket précédent traînent dans le nouveau ticket. L'équipe a débranché l'écran tactile USB pour tester si c'était hardware.

Plutôt que de lancer une investigation code lourde ("archéologie") sans reproduction fiable, on met en place une sonde de logging pour capturer l'état lors des prochaines occurrences.

---

## 2. User Story

En tant que **Développeur (Christophe)**,  
je veux **logger tous les événements transactionnels de la caisse**,  
afin que **si le bug "tickets fantômes" se reproduit, je puisse analyser les logs pour identifier la cause**.

---

## 3. Critères d'acceptation

### Backend (Logger Dédié)

1. **Logger Spécifique** :
   - Créer un logger dédié `transaction_audit` (séparé du logger principal)
   - Écriture dans un fichier rotatif séparé : `logs/transactions.log`
   - Format JSON structuré pour faciliter l'analyse
   - Rotation automatique : Taille max 10MB, 5 fichiers max (configurable)

2. **Format JSON Standardisé** :
   ```json
   {
     "timestamp": "2025-12-09T14:30:00Z",
     "event": "TICKET_OPENED",
     "user_id": "uuid",
     "session_id": "uuid",
     "cart_state": {
       "items_count": 2,
       "items": [
         {"id": "item-1", "category": "EEE", "weight": 5.5, "price": 10.0}
       ],
       "total": 20.0
     }
   }
   ```

3. **Points de Capture** :
   - **Ouverture Session Caisse** : `openSession()` - Qui ? Quand ? (Timestamp + UserID + SessionID)
   - **Création/Ouverture Ticket** : État du panier à l'ouverture (pour détecter items fantômes)
   - **Reset / Nouveau Ticket** : État du panier AVANT le reset (s'il n'était pas vide alors qu'il aurait dû)
   - **Validation Paiement** : ID Transaction, nombre d'items, montant total, état du panier juste APRES validation (devrait être vide)
   - **Anomalies détectées** : Si une action "Ajout Item" arrive alors qu'aucun ticket n'est explicitement "ouvert"

4. **Performance** :
   - Logger de façon asynchrone pour ne pas ralentir les opérations
   - Utiliser une queue ou un thread worker pour l'écriture fichier
   - Gestion d'erreurs best-effort (les erreurs de logging n'interrompent pas les opérations)

### Frontend (Interface Admin - Consultation des Logs)

5. **Consultation des Logs Transactionnels** :
   - Ajouter un endpoint API `GET /api/v1/admin/transaction-logs` pour lire les logs
   - Pagination et filtres (date, événement, user_id, session_id)
   - **Option A (Recommandée)** : Ajouter un onglet "Logs Transactionnels" dans la page `Admin/AuditLog.tsx`
   - **Option B** : Ajouter un bouton dans `Admin/HealthDashboard.tsx` qui ouvre une modal avec les logs
   - Affichage formaté des événements JSON avec syntax highlighting
   - Filtres par type d'événement (SESSION_OPENED, TICKET_OPENED, TICKET_RESET, PAYMENT_VALIDATED, ANOMALY_DETECTED)
   - Filtres par date (début/fin)
   - Recherche par user_id ou session_id
   - Export CSV optionnel des logs filtrés

---

## 4. Tâches

- [ ] **T1 - Configuration Logger**
  - **Créer** fichier `api/src/recyclic_api/core/logging.py` (nouveau fichier)
  - Créer configuration logger `transaction_audit` avec `RotatingFileHandler`
  - Configurer rotation automatique (10MB max, 5 fichiers max) - valeurs hardcodées ou via config
  - Créer custom formatter JSON ou helper function pour formater les logs en JSON
  - Timestamp ISO 8601 UTC (`datetime.utcnow().isoformat() + 'Z'`)

- [ ] **T2 - Points de Capture Backend**
  - Logger ouverture session : `api/src/recyclic_api/services/cash_session_service.py` - méthode `open_session()` ou équivalent
  - Logger création ticket : Identifier où le ticket est créé (store frontend ou API backend)
    - Si frontend : Créer endpoint API dédié `POST /api/v1/transactions/log` ou inclure dans appels existants
    - Si backend : Logger directement dans le service/endpoint concerné
  - Logger reset ticket : `frontend/src/stores/cashSessionStore.ts` - méthode `clearCurrentSale()`
    - **Note** : Envoyer log au backend via API (endpoint dédié ou inclus dans autre appel)
  - Logger validation paiement : `api/src/recyclic_api/api/api_v1/endpoints/sales.py` - endpoint `POST /sales`
    - Logger AVANT validation (cart_state_before) et APRÈS validation (cart_state_after)
  - Logger anomalies : Détecter ajout item sans ticket ouvert
    - Vérifier état du panier avant ajout item (si panier non vide alors qu'aucun ticket ouvert)

- [ ] **T3 - Structure JSON**
  - Définir schéma JSON pour chaque type d'événement (voir formats détaillés section 6)
  - **Optionnel** : Créer classes Pydantic pour validation (recommandé pour robustesse)
  - Helper function `log_transaction_event(event_type, data)` pour formater et logger
  - Inclure contexte complet (user, session, cart state)
  - S'assurer que tous les UUIDs sont en format string

- [ ] **T4 - Performance & Robustesse**
  - Implémenter logging asynchrone : Utiliser `queue.Queue` avec thread worker dédié
    - Pattern recommandé : QueueHandler + QueueListener (logging.handlers)
    - Alternative : Thread avec queue.Queue et worker thread
  - Gestion d'erreurs best-effort : try/except autour de tous les appels de logging
  - S'assurer que les erreurs de logging n'interrompent jamais les opérations transactionnelles
  - Tests de charge : Vérifier que logs n'impactent pas les performances (< 10ms overhead)

- [ ] **T5 - API Consultation Logs (Backend)**
  - Créer endpoint `GET /api/v1/admin/transaction-logs` dans `api/src/recyclic_api/api/api_v1/endpoints/admin.py`
  - Lire fichier `logs/transactions.log` (et fichiers rotatifs si nécessaire)
  - Parser JSON ligne par ligne
  - Implémenter pagination (page, page_size)
  - Implémenter filtres : date (start_date, end_date), event_type, user_id, session_id
  - Retourner format JSON avec pagination metadata

- [ ] **T6 - Interface Admin Consultation (Frontend)**
  - **Option A** : Ajouter onglet "Logs Transactionnels" dans `frontend/src/pages/Admin/AuditLog.tsx`
    - Utiliser Tabs de Mantine pour séparer "Audit Log" et "Transaction Logs"
    - Réutiliser composants existants (Table, Pagination, Filtres)
  - **Option B** : Ajouter bouton dans `frontend/src/pages/Admin/HealthDashboard.tsx`
    - Bouton "Voir Logs Transactionnels" qui ouvre Modal avec liste des logs
  - Affichage formaté JSON avec syntax highlighting (utiliser `react-json-view` ou équivalent)
  - Filtres : Type événement, Date début/fin, User ID, Session ID
  - Export CSV optionnel

- [ ] **T7 - Tests**
  - Tests unitaires : Format JSON, rotation fichiers
  - Tests intégration : Vérifier que tous les événements sont loggés
  - Tests API : Endpoint consultation avec pagination et filtres
  - Tests performance : Vérifier que logs n'impactent pas les performances

---

## 5. Dépendances

- **Pré-requis** : Aucun (story indépendante)
- **Bloque** : Aucun (peut être développée en parallèle de P1 et P3)

---

## 6. Dev Notes

### Références Architecturales Clés

1. **Service Cash Session** : `api/src/recyclic_api/services/cash_session_service.py`
   - Méthode `open_session()` : Logger ici

2. **Store Frontend** : `frontend/src/stores/cashSessionStore.ts`
   - **Note** : Les logs frontend doivent être envoyés au backend via API dédiée ou inclus dans les appels existants
   - Méthode `openSession()` : Logger état panier ici (appel API backend pour logger)
   - Méthode `clearCurrentSale()` : Logger état panier avant reset (appel API backend)
   - Méthode `submitSale()` : Logger validation paiement (déjà loggé côté backend dans POST /sales)
   - **Alternative** : Logger uniquement côté backend si les événements frontend déclenchent des appels API

3. **API Sales** : `api/src/recyclic_api/api/api_v1/endpoints/sales.py`
   - Endpoint `POST /sales` : Logger validation paiement

4. **API Admin** : `api/src/recyclic_api/api/api_v1/endpoints/admin.py`
   - Endpoint `GET /api/v1/admin/audit-log` existe déjà (ligne 1415)
   - Ajouter endpoint `GET /api/v1/admin/transaction-logs` pour consultation des logs transactionnels
   - Pattern similaire à `/audit-log` : pagination, filtres, recherche

5. **Frontend Admin** :
   - `frontend/src/pages/Admin/AuditLog.tsx` : Page existante avec filtres et pagination
     - **Option A (Recommandée)** : Ajouter onglet "Logs Transactionnels" dans cette page
   - `frontend/src/pages/Admin/HealthDashboard.tsx` : Dashboard santé système
     - **Option B** : Ajouter bouton qui ouvre modal avec logs transactionnels

4. **Logging Python** : Utiliser `logging.handlers.RotatingFileHandler`
   - **Créer** fichier `api/src/recyclic_api/core/logging.py` (n'existe pas encore)
   - Configuration logger `transaction_audit` avec RotatingFileHandler
   - Format JSON via custom formatter ou helper function

5. **Consultation Logs** :
   - Endpoint API : `GET /api/v1/admin/transaction-logs` (à créer dans `admin.py`)
   - Lire fichiers rotatifs : `logs/transactions.log`, `logs/transactions.log.1`, etc.
   - Parser JSON ligne par ligne (une ligne = un événement JSON)
   - Pagination et filtres similaires à `/audit-log` existant

### Format JSON Détaillé

**Événement : Ouverture Session**
```json
{
  "timestamp": "2025-12-09T14:30:00Z",
  "event": "SESSION_OPENED",
  "user_id": "uuid",
  "session_id": "uuid",
  "opened_at": "2025-12-09T14:30:00Z"
}
```

**Événement : Création Ticket**
```json
{
  "timestamp": "2025-12-09T14:30:05Z",
  "event": "TICKET_OPENED",
  "user_id": "uuid",
  "session_id": "uuid",
  "cart_state": {
    "items_count": 2,
    "items": [
      {"id": "item-1", "category": "EEE", "weight": 5.5, "price": 10.0}
    ],
    "total": 20.0
  },
  "anomaly": false
}
```

**Événement : Reset Ticket**
```json
{
  "timestamp": "2025-12-09T14:35:00Z",
  "event": "TICKET_RESET",
  "user_id": "uuid",
  "session_id": "uuid",
  "cart_state_before": {
    "items_count": 2,
    "items": [...],
    "total": 20.0
  },
  "anomaly": false
}
```

**Événement : Validation Paiement**
```json
{
  "timestamp": "2025-12-09T14:40:00Z",
  "event": "PAYMENT_VALIDATED",
  "user_id": "uuid",
  "session_id": "uuid",
  "transaction_id": "uuid",
  "cart_state_before": {
    "items_count": 2,
    "items": [...],
    "total": 20.0
  },
  "cart_state_after": {
    "items_count": 0,
    "items": [],
    "total": 0.0
  },
  "payment_method": "cash",
  "amount": 20.0
}
```

**Événement : Anomalie**
```json
{
  "timestamp": "2025-12-09T14:45:00Z",
  "event": "ANOMALY_DETECTED",
  "user_id": "uuid",
  "session_id": "uuid",
  "anomaly_type": "ITEM_ADDED_WITHOUT_TICKET",
  "details": "Item added but no ticket is explicitly opened"
}
```

### Implémentation Logging Asynchrone

**Pattern Recommandé** : Utiliser `logging.handlers.QueueHandler` + `QueueListener`

```python
import logging
import queue
from logging.handlers import RotatingFileHandler, QueueHandler, QueueListener

# Créer queue et handler rotatif
log_queue = queue.Queue(-1)  # Queue illimitée
file_handler = RotatingFileHandler(
    'logs/transactions.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5
)
file_handler.setFormatter(JsonFormatter())  # Custom formatter JSON

# QueueHandler pour logger de façon asynchrone
queue_handler = QueueHandler(log_queue)

# QueueListener pour écrire dans le fichier depuis un thread séparé
queue_listener = QueueListener(log_queue, file_handler)
queue_listener.start()

# Logger transaction_audit utilise QueueHandler
transaction_logger = logging.getLogger('transaction_audit')
transaction_logger.addHandler(queue_handler)
transaction_logger.setLevel(logging.INFO)
```

**Alternative Simple** : Thread worker avec queue.Queue (si QueueHandler non disponible)

### Consultation des Logs (API + Frontend)

**Endpoint API** : `GET /api/v1/admin/transaction-logs`

**Paramètres de requête** :
- `page` : Numéro de page (défaut: 1)
- `page_size` : Taille de page (défaut: 50, max: 200)
- `start_date` : Date début (ISO 8601, optionnel)
- `end_date` : Date fin (ISO 8601, optionnel)
- `event_type` : Type d'événement (SESSION_OPENED, TICKET_OPENED, TICKET_RESET, PAYMENT_VALIDATED, ANOMALY_DETECTED, optionnel)
- `user_id` : UUID utilisateur (optionnel)
- `session_id` : UUID session (optionnel)

**Réponse** :
```json
{
  "entries": [
    {
      "timestamp": "2025-12-09T14:30:00Z",
      "event": "TICKET_OPENED",
      "user_id": "uuid",
      "session_id": "uuid",
      "cart_state": {...}
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 50,
    "total_count": 1234,
    "total_pages": 25
  }
}
```

**Implémentation Backend** :
- Lire fichiers rotatifs dans l'ordre : `transactions.log`, `transactions.log.1`, `transactions.log.2`, etc.
- Parser JSON ligne par ligne (une ligne = un événement JSON valide)
- Filtrer selon paramètres (date, event_type, user_id, session_id)
- Appliquer pagination après filtrage
- **Performance** : Lire fichiers de façon lazy (ne pas charger tout en mémoire)

**Implémentation Frontend - Option A (Recommandée)** :
- Ajouter `Tabs` dans `AuditLog.tsx` :
  - Onglet 1 : "Audit Log" (existant)
  - Onglet 2 : "Logs Transactionnels" (nouveau)
- Réutiliser composants existants : Table, Pagination, Filtres
- Affichage JSON formaté avec `react-json-view` ou `@mantine/code-highlight`

**Implémentation Frontend - Option B** :
- Ajouter bouton "Voir Logs Transactionnels" dans `HealthDashboard.tsx`
- Ouvrir Modal avec composant de consultation des logs
- Même structure que Option A mais dans une modal

### Testing

**Standards de Test** :
- Tests unitaires dans `api/tests/test_transaction_logging.py`
- Tests intégration : Vérifier que tous les événements sont loggés
- Tests performance : Vérifier que logs n'impactent pas les performances (< 10ms overhead)

**Cas de Test Requis** :
- Logger ouverture session
- Logger création ticket avec panier vide
- Logger création ticket avec panier non vide (anomalie potentielle)
- Logger reset ticket
- Logger validation paiement
- Logger anomalie (ajout item sans ticket)
- Rotation fichiers (taille max atteinte)
- Gestion erreurs (fichier non accessible)
- Test performance : Mesurer temps d'exécution avec/sans logging
- **API Consultation** : Test endpoint avec pagination
- **API Consultation** : Test filtres (date, event_type, user_id, session_id)
- **API Consultation** : Test lecture fichiers rotatifs (transactions.log.1, .2, etc.)
- **Frontend** : Test affichage logs avec filtres
- **Frontend** : Test export CSV

---

## 7. Estimation

**5-6h de développement** (ajout consultation logs : +1.5-2h)

- Configuration logger : 45min
  - Création fichier `logging.py` : 15min
  - Configuration RotatingFileHandler : 15min
  - Implémentation logging asynchrone (QueueHandler/QueueListener) : 15min
- Points de capture backend : 1.5-2h
  - Logger ouverture session : 20min
  - Logger création ticket : 30min (identifier où logger)
  - Logger reset ticket : 20min (intégration frontend → backend si nécessaire)
  - Logger validation paiement : 20min
  - Logger anomalies : 20min
- Structure JSON & helpers : 45min
  - Helper function `log_transaction_event()` : 20min
  - Formatage JSON pour chaque événement : 20min
  - Classes Pydantic optionnelles : 5min
- Performance & robustesse : 30min
  - Gestion d'erreurs try/except : 15min
  - Tests de charge : 15min
- **API Consultation Logs (Backend)** : 1h
  - Endpoint `GET /api/v1/admin/transaction-logs` : 30min
  - Parser JSON ligne par ligne : 15min
  - Pagination et filtres : 15min
- **Interface Admin Consultation (Frontend)** : 1h
  - Option A : Onglet dans AuditLog.tsx : 45min
  - Option B : Bouton + Modal dans HealthDashboard.tsx : 45min
  - Affichage formaté JSON : 15min
- Tests : 1.5h
  - Tests unitaires : 30min
  - Tests intégration : 20min
  - Tests API consultation : 20min
  - Tests performance : 10min
  - Tests frontend : 10min

---

## 8. Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-09 | 1.0 | Création story | Sarah (PO) |
| 2025-12-09 | 1.1 | Améliorations agent SM (interface consultation logs, format JSON détaillé, logging asynchrone, estimation détaillée) | SM Agent |

---

## 9. Definition of Done

- [ ] Logger dédié `transaction_audit` créé et configuré
- [ ] Fichier rotatif `logs/transactions.log` fonctionnel
- [ ] Tous les événements transactionnels sont loggés (ouverture session, création ticket, reset, validation)
- [ ] Format JSON structuré et standardisé
- [ ] Logging asynchrone (pas d'impact performance)
- [ ] Rotation automatique des fichiers (10MB, 5 fichiers max)
- [ ] Endpoint API `GET /api/v1/admin/transaction-logs` fonctionnel avec pagination et filtres
- [ ] Interface admin pour consultation des logs (onglet AuditLog ou bouton HealthDashboard)
- [ ] Affichage formaté des logs avec syntax highlighting JSON
- [ ] Tests unitaires et d'intégration passent
- [ ] Tests API consultation validés
- [ ] Tests performance validés (logs n'impactent pas les opérations)
- [ ] Code review validé

---

## 10. Notes Futures

**Script de Détection d'Anomalies (hors scope v1.3.2)** :
- Créer un script séparé (cron) qui scanne les logs
- Détecter les anomalies (panier non vide à l'ouverture, items sans ticket)
- Envoyer un email à l'admin si anomalie détectée
- Peut être développé séparément après validation des logs

