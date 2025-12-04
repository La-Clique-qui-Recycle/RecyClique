"""
Service d'import de données legacy depuis CSV avec fuzzy matching des catégories.

Ce service permet d'importer des données historiques depuis un CSV nettoyé (B47-P1)
en proposant automatiquement des mappings de catégories via fuzzy matching.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID
from datetime import datetime, date, timezone
import csv
import io
import json
from decimal import Decimal, InvalidOperation

from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from fastapi import HTTPException, status

from recyclic_api.services.category_service import CategoryService
from recyclic_api.services.reception_service import ReceptionService
from recyclic_api.services.llm_category_mapping_client import (
    LLMCategoryMappingClient,
    CategoryMappingLike,
)
from recyclic_api.services.llm_openrouter_client import OpenRouterCategoryMappingClient
from recyclic_api.models.legacy_category_mapping_cache import LegacyCategoryMappingCache
from recyclic_api.models.poste_reception import PosteReception, PosteReceptionStatus
from recyclic_api.models.ticket_depot import TicketDepot, TicketDepotStatus
from recyclic_api.models.ligne_depot import LigneDepot, Destination as DBLigneDestination
from recyclic_api.models.category import Category
from recyclic_api.core.config import settings
import logging

logger = logging.getLogger(__name__)

try:
    # La fonction `levenshtein_ratio` DOIT toujours retourner une valeur normalisée entre 0 et 1.
    # Le service se charge ensuite de convertir en pourcentage (0-100).
    from Levenshtein import ratio as _levenshtein_ratio

    def levenshtein_ratio(s1: str, s2: str) -> float:
        """Retourne un score de similarité normalisé entre 0 et 1."""
        return _levenshtein_ratio(s1, s2)

except ImportError:
    # Fallback si python-Levenshtein n'est pas disponible
    try:
        from difflib import SequenceMatcher

        def levenshtein_ratio(s1: str, s2: str) -> float:
            """Retourne un score de similarité normalisé entre 0 et 1."""
            return SequenceMatcher(None, s1, s2).ratio()

    except ImportError:
        raise ImportError("python-Levenshtein ou difflib requis pour le fuzzy matching")


class LegacyImportService:
    """Service d'import de données legacy avec fuzzy matching des catégories."""

    REQUIRED_HEADERS = ["date", "category", "poids_kg", "destination", "notes"]
    DEFAULT_CONFIDENCE_THRESHOLD = 80.0  # Seuil de confiance par défaut (80%)

    def __init__(self, db: Session, llm_client: Optional[LLMCategoryMappingClient] = None):
        self.db = db
        self.category_service = CategoryService(db)
        self.reception_service = ReceptionService(db)
        self._categories_cache: Optional[List[Dict[str, Any]]] = None
        self._llm_client = llm_client or self._build_default_llm_client()

    # ---------- LLM & Cache Utilities ----------

    def _build_default_llm_client(self) -> Optional[LLMCategoryMappingClient]:
        """
        Construit un client LLM par défaut en fonction de la configuration.

        Si aucun provider n'est configuré, retourne None et le comportement
        de `analyze` reste purement fuzzy (fallback désactivé).
        """
        provider = (settings.LEGACY_IMPORT_LLM_PROVIDER or "").strip().lower()
        if provider != "openrouter":
            return None

        return OpenRouterCategoryMappingClient()

    def _get_cached_mapping(self, source_name: str) -> Optional[CategoryMappingLike]:
        """
        Récupère un mapping depuis le cache persistant si disponible.

        Cette méthode est best-effort : en cas d'erreur DB, elle journalise
        l'erreur et retourne None sans interrompre l'analyse.
        """
        try:
            normalized = self._normalize_string(source_name)
            cached = (
                self.db.query(LegacyCategoryMappingCache)
                .filter(LegacyCategoryMappingCache.source_name_normalized == normalized)
                .first()
            )
            if not cached:
                return None

            return {
                "category_id": str(cached.target_category_id),
                "provider": cached.provider,
                "confidence": float(cached.confidence),
            }
        except Exception as exc:  # noqa: BLE001
            # Important : rollback pour sortir la session de l'état "transaction aborted"
            try:
                self.db.rollback()
            except Exception:
                # On ignore les erreurs de rollback, l'objectif est de ne pas bloquer l'analyse
                pass

            logger.error(
                "Erreur lors de la lecture du cache legacy_category_mapping_cache: %s",
                exc,
                exc_info=True,
            )
            return None

    def _store_mapping_in_cache(
        self,
        source_name: str,
        target_category_id: UUID,
        provider: str,
        confidence: float,
    ) -> None:
        """
        Stocke un mapping dans le cache persistant.

        Best-effort : toute erreur de persistance est loggée mais ne doit pas
        interrompre l'analyse.
        """
        try:
            normalized = self._normalize_string(source_name)
            cached = (
                self.db.query(LegacyCategoryMappingCache)
                .filter(LegacyCategoryMappingCache.source_name_normalized == normalized)
                .first()
            )

            if cached:
                cached.target_category_id = target_category_id
                cached.provider = provider
                cached.confidence = confidence
            else:
                cached = LegacyCategoryMappingCache(
                    source_name_normalized=normalized,
                    target_category_id=target_category_id,
                    provider=provider,
                    confidence=confidence,
                )
                self.db.add(cached)

            # Ne pas commit ici : le commit global est géré à un niveau supérieur.
            self.db.flush()
        except Exception as exc:  # noqa: BLE001
            # Important : rollback pour éviter de laisser la session dans un état invalide
            try:
                self.db.rollback()
            except Exception:
                pass

            logger.error(
                "Erreur lors de l'écriture dans le cache legacy_category_mapping_cache: %s",
                exc,
                exc_info=True,
            )

    # ---------- Utilities ----------

    @staticmethod
    def _normalize_string(s: str) -> str:
        """Normalise une chaîne pour le matching (lowercase, strip)."""
        return s.strip().lower()

    @staticmethod
    def _parse_date(date_str: str) -> Optional[date]:
        """Parse une date depuis une chaîne (formats courants)."""
        if not date_str or not date_str.strip():
            return None
        
        date_str = date_str.strip()
        formats = ["%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
        
        return None

    @staticmethod
    def _parse_float(value: str) -> Optional[float]:
        """Parse un float depuis une chaîne (gère virgule/point)."""
        if not value or not value.strip():
            return None
        
        s = value.strip().replace(",", ".").replace(" ", "")
        try:
            return float(s)
        except ValueError:
            return None

    def _load_categories(self) -> List[Dict[str, Any]]:
        """Charge toutes les catégories actives depuis la base."""
        if self._categories_cache is None:
            # Charger directement depuis la base (synchrone)
            categories = self.db.query(Category).filter(Category.is_active == True).all()
            self._categories_cache = [
                {
                    "id": str(cat.id),
                    "name": cat.name,
                    "normalized_name": self._normalize_string(cat.name)
                }
                for cat in categories
            ]
        return self._categories_cache

    def _fuzzy_match_category(
        self, 
        category_name: str, 
        confidence_threshold: float = None
    ) -> Optional[Dict[str, Any]]:
        """
        Trouve la meilleure correspondance pour une catégorie via fuzzy matching.
        
        Args:
            category_name: Nom de la catégorie à matcher
            confidence_threshold: Seuil de confiance (défaut: DEFAULT_CONFIDENCE_THRESHOLD)
        
        Returns:
            Dict avec category_id, category_name, confidence si match trouvé, None sinon
        """
        if confidence_threshold is None:
            confidence_threshold = self.DEFAULT_CONFIDENCE_THRESHOLD
        
        normalized_input = self._normalize_string(category_name)
        categories = self._load_categories()
        
        if not categories:
            return None
        
        best_match = None
        best_score = 0.0
        
        for cat in categories:
            # `levenshtein_ratio` retourne un score normalisé entre 0 et 1,
            # que l'on convertit ici en pourcentage (0-100).
            score = levenshtein_ratio(normalized_input, cat["normalized_name"]) * 100

            if score > best_score:
                best_score = score
                best_match = {
                    "category_id": cat["id"],
                    "category_name": cat["name"],
                    "confidence": round(best_score, 2)
                }
        
        # Retourner seulement si le score dépasse le seuil
        if best_match and best_match["confidence"] >= confidence_threshold:
            return best_match
        
        return None

    def _generate_mapping(
        self,
        unique_categories: List[str],
        confidence_threshold: float | None = None,
    ) -> Dict[str, Any]:
        """
        Génère un mapping de catégories avec fuzzy matching en tenant compte du cache.

        La logique est la suivante :
        - si un mapping est présent dans le cache, il est utilisé directement ;
        - sinon, on tente un fuzzy matching ;
        - en cas de succès du fuzzy, on peut stocker le résultat dans le cache
          avec le provider "fuzzy" pour réutilisation future ;
        - sinon, la catégorie est considérée comme `unmapped`.
        """
        mappings: Dict[str, Dict[str, Any]] = {}
        unmapped: List[str] = []

        for cat_name in unique_categories:
            # 1) Vérifier le cache
            cached = self._get_cached_mapping(cat_name)
            if cached:
                mappings[cat_name] = {
                    "category_id": cached["category_id"],
                    "category_name": self._find_category_name_by_id(cached["category_id"]),
                    "confidence": round(float(cached["confidence"]), 2),
                }
                continue

            # 2) Fuzzy matching standard
            match = self._fuzzy_match_category(cat_name, confidence_threshold)
            if match:
                mappings[cat_name] = match

                # Best-effort : stocker aussi ce mapping dans le cache
                try:
                    self._store_mapping_in_cache(
                        source_name=cat_name,
                        target_category_id=UUID(match["category_id"]),
                        provider="fuzzy",
                        confidence=float(match["confidence"]),
                    )
                except Exception:
                    # Toute erreur est déjà loggée en interne
                    pass
            else:
                unmapped.append(cat_name)

        return {
            "mappings": mappings,
            "unmapped": unmapped,
        }

    def _find_category_name_by_id(self, category_id_str: str) -> str:
        """
        Récupère le nom de catégorie à partir de son ID.

        Utilise le cache local de catégories si possible pour éviter des requêtes
        répétées en base.
        """
        categories = self._load_categories()
        for cat in categories:
            if cat["id"] == category_id_str:
                return cat["name"]
        # Fallback : requête directe si non trouvé dans le cache (cas rare)
        try:
            cat_obj = self.db.query(Category).filter(Category.id == UUID(category_id_str)).first()
            if cat_obj:
                return cat_obj.name
        except Exception:
            pass
        return category_id_str

    # ---------- Analyze ----------

    def analyze(self, file_bytes: bytes, confidence_threshold: float | None = None) -> Dict[str, Any]:
        """
        Analyse le CSV et propose des mappings de catégories.
        
        Args:
            file_bytes: Contenu du fichier CSV
            confidence_threshold: Seuil de confiance pour le matching (défaut: 80%)
        
        Returns:
            Dict avec mappings proposés, catégories non mappables, et statistiques
        """
        if confidence_threshold is None:
            confidence_threshold = self.DEFAULT_CONFIDENCE_THRESHOLD
        
        # Décoder le CSV
        try:
            text = file_bytes.decode("utf-8", errors="replace")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erreur lors du décodage du CSV: {str(e)}"
            )
        
        reader = csv.DictReader(io.StringIO(text))
        
        # Valider les en-têtes
        headers = [h.strip() for h in (reader.fieldnames or [])]
        missing = [h for h in self.REQUIRED_HEADERS if h not in headers]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Colonnes manquantes: {', '.join(missing)}. Colonnes requises: {', '.join(self.REQUIRED_HEADERS)}"
            )
        
        # Parser les lignes et collecter les catégories uniques
        rows = []
        errors = []
        unique_categories = set()
        total_lines = 0
        
        for idx, raw in enumerate(reader, start=2):  # start=2 car ligne 1 = en-têtes
            total_lines += 1
            
            date_str = raw.get("date", "").strip()
            category = raw.get("category", "").strip()
            poids_str = raw.get("poids_kg", "").strip()
            destination = raw.get("destination", "").strip()
            notes = raw.get("notes", "").strip()
            
            # Validation basique
            if not date_str:
                errors.append(f"L{idx}: Date manquante")
                continue
            
            if not category:
                errors.append(f"L{idx}: Catégorie manquante")
                continue
            
            if not poids_str:
                errors.append(f"L{idx}: Poids manquant")
                continue
            
            # Parser la date
            parsed_date = self._parse_date(date_str)
            if not parsed_date:
                errors.append(f"L{idx}: Date invalide: {date_str}")
                continue
            
            # Parser le poids
            poids = self._parse_float(poids_str)
            if poids is None or poids <= 0:
                errors.append(f"L{idx}: Poids invalide (doit être > 0): {poids_str}")
                continue
            
            # Collecter la catégorie
            if category:
                unique_categories.add(category)
            
            rows.append({
                "date": parsed_date,
                "category": category,
                "poids_kg": poids,
                "destination": destination if destination else "MAGASIN",
                "notes": notes if notes else None
            })
        
        # Générer le mapping (fuzzy + cache)
        mapping_result = self._generate_mapping(list(unique_categories), confidence_threshold)

        mappings = mapping_result["mappings"]
        unmapped = mapping_result["unmapped"]

        llm_mapped_count = 0
        llm_provider_used: Optional[str] = None

        # Fallback LLM optionnel si des catégories restent unmapped
        if unmapped and self._llm_client is not None:
            try:
                # Travail uniquement sur les catégories uniques déjà collectées
                known_categories = [c["name"] for c in self._load_categories()]

                batch_size = settings.LEGACY_IMPORT_LLM_BATCH_SIZE or 20
                batch_size = max(1, batch_size)

                remaining_unmapped: List[str] = []

                logger.info(
                    "LegacyImport analyze: %d catégories unmapped avant LLM (provider=%s, batch_size=%d)",
                    len(unmapped),
                    self._llm_client.provider_name,
                    batch_size,
                )

                for i in range(0, len(unmapped), batch_size):
                    batch = unmapped[i : i + batch_size]
                    suggestions = self._llm_client.suggest_mappings(batch, known_categories)

                    if suggestions:
                        llm_provider_used = self._llm_client.provider_name

                    logger.debug(
                        "LegacyImport analyze: appel LLM pour batch de %d catégories (exemples=%s)",
                        len(batch),
                        batch[:5],
                    )

                    for source_name in batch:
                        suggestion = suggestions.get(source_name)
                        if not suggestion:
                            remaining_unmapped.append(source_name)
                            continue

                        target_name = suggestion.get("target_name")
                        confidence = float(suggestion.get("confidence", 0.0))

                        # Clamp du score dans [0, 100]
                        if confidence < 0:
                            confidence = 0.0
                        if confidence > 100:
                            confidence = 100.0

                        # Retrouver la catégorie cible correspondante
                        target = next(
                            (c for c in self._load_categories() if c["name"] == target_name),
                            None,
                        )
                        if not target:
                            remaining_unmapped.append(source_name)
                            continue

                        mappings[source_name] = {
                            "category_id": target["id"],
                            "category_name": target["name"],
                            "confidence": round(confidence, 2),
                        }
                        llm_mapped_count += 1

                        # Stocker dans le cache pour réutilisation future
                        try:
                            self._store_mapping_in_cache(
                                source_name=source_name,
                                target_category_id=UUID(target["id"]),
                                provider=self._llm_client.provider_name,
                                confidence=confidence,
                            )
                        except Exception:
                            # Toute erreur est déjà loggée en interne
                            pass

                logger.info(
                    "LegacyImport analyze: %d catégories mappées par LLM, %d restantes unmapped",
                    llm_mapped_count,
                    len(remaining_unmapped),
                )

                unmapped = remaining_unmapped

            except Exception as exc:  # noqa: BLE001
                # Best-effort : logguer mais ne pas casser l'analyse
                logger.error(
                    "Erreur lors du fallback LLM dans LegacyImportService.analyze: %s",
                    exc,
                    exc_info=True,
                )
                # On conserve simplement la liste `unmapped` issue du fuzzy+cache
        elif unmapped and self._llm_client is None:
            logger.info(
                "LegacyImport analyze: %d catégories unmapped mais aucun client LLM configuré (provider ou modèle absent).",
                len(unmapped),
            )

        return {
            "mappings": mappings,
            "unmapped": unmapped,
            "statistics": {
                "total_lines": total_lines,
                "valid_lines": len(rows),
                "error_lines": len(errors),
                "unique_categories": len(unique_categories),
                "mapped_categories": len(mappings),
                "unmapped_categories": len(unmapped),
                "llm_mapped_categories": llm_mapped_count,
                "llm_provider_used": llm_provider_used,
            },
            "errors": errors
        }

    # ---------- Execute ----------

    def _get_or_create_poste_for_date(
        self, 
        date_obj: date, 
        admin_user_id: UUID
    ) -> Tuple[PosteReception, bool]:
        """
        Récupère ou crée un poste de réception pour une date donnée.
        
        Args:
            date_obj: Date du poste
            admin_user_id: ID de l'utilisateur admin qui importe
        
        Returns:
            Tuple (PosteReception, bool): (poste, is_new) où is_new=True si créé, False si existant
        """
        # Convertir la date en datetime (début de journée en UTC)
        opened_at = datetime.combine(date_obj, datetime.min.time()).replace(tzinfo=timezone.utc)
        
        # Chercher un poste existant pour cette date (même jour, même utilisateur)
        # On cherche un poste ouvert à cette date (ouverture le même jour)
        start_of_day = opened_at
        end_of_day = datetime.combine(date_obj, datetime.max.time()).replace(tzinfo=timezone.utc)
        
        existing_poste = (
            self.db.query(PosteReception)
            .filter(
                and_(
                    PosteReception.opened_at >= start_of_day,
                    PosteReception.opened_at <= end_of_day,
                    PosteReception.opened_by_user_id == admin_user_id
                )
            )
            .first()
        )
        
        if existing_poste:
            return existing_poste, False
        
        # Créer un nouveau poste
        new_poste = self.reception_service.open_poste(
            opened_by_user_id=admin_user_id,
            opened_at=opened_at
        )
        return new_poste, True

    def execute(
        self, 
        file_bytes: bytes, 
        mapping_json: Dict[str, Any],
        admin_user_id: UUID
    ) -> Dict[str, Any]:
        """
        Exécute l'import du CSV avec le mapping validé.
        
        Args:
            file_bytes: Contenu du fichier CSV
            mapping_json: Fichier de mapping validé (structure: {mappings: {...}, unmapped: [...]})
            admin_user_id: ID de l'utilisateur admin qui importe
        
        Returns:
            Rapport d'import avec statistiques
        """
        # Valider le mapping
        if "mappings" not in mapping_json:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Structure de mapping invalide: 'mappings' manquant"
            )
        
        mappings = mapping_json["mappings"]
        unmapped = mapping_json.get("unmapped", [])
        
        # Valider que tous les category_id existent en base
        category_ids = [m["category_id"] for m in mappings.values() if "category_id" in m]
        for cat_id_str in category_ids:
            try:
                cat_id = UUID(cat_id_str)
                cat = self.db.query(Category).filter(Category.id == cat_id, Category.is_active == True).first()
                if not cat:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"category_id invalide ou catégorie inactive: {cat_id_str}"
                    )
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Format UUID invalide: {cat_id_str}"
                )
        
        # Décoder et parser le CSV
        try:
            text = file_bytes.decode("utf-8", errors="replace")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erreur lors du décodage du CSV: {str(e)}"
            )
        
        reader = csv.DictReader(io.StringIO(text))
        
        # Valider les en-têtes
        headers = [h.strip() for h in (reader.fieldnames or [])]
        missing = [h for h in self.REQUIRED_HEADERS if h not in headers]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Colonnes manquantes: {', '.join(missing)}"
            )
        
        # Statistiques
        postes_created = 0
        postes_reused = 0
        tickets_created = 0
        lignes_imported = 0
        errors = []
        
        # Groupement par date pour créer un poste/ticket par jour
        rows_by_date: Dict[date, List[Dict[str, Any]]] = {}
        
        # Parser toutes les lignes
        for idx, raw in enumerate(reader, start=2):
            date_str = raw.get("date", "").strip()
            category = raw.get("category", "").strip()
            poids_str = raw.get("poids_kg", "").strip()
            destination = raw.get("destination", "").strip()
            notes = raw.get("notes", "").strip()
            
            # Validation
            parsed_date = self._parse_date(date_str)
            if not parsed_date:
                errors.append(f"L{idx}: Date invalide: {date_str}")
                continue
            
            if not category:
                errors.append(f"L{idx}: Catégorie manquante")
                continue
            
            # Vérifier que la catégorie est mappée
            if category not in mappings:
                if category in unmapped:
                    errors.append(f"L{idx}: Catégorie non mappée: {category}")
                else:
                    errors.append(f"L{idx}: Catégorie absente du mapping: {category}")
                continue
            
            poids = self._parse_float(poids_str)
            if poids is None or poids <= 0:
                errors.append(f"L{idx}: Poids invalide (doit être > 0): {poids_str}")
                continue
            
            # Grouper par date
            if parsed_date not in rows_by_date:
                rows_by_date[parsed_date] = []
            
            rows_by_date[parsed_date].append({
                "category": category,
                "category_id": UUID(mappings[category]["category_id"]),
                "poids_kg": poids,
                "destination": destination if destination else "MAGASIN",
                "notes": notes if notes else None
            })
        
        # Transaction: tout ou rien
        try:
            # Créer postes et tickets par date
            for date_obj, rows in rows_by_date.items():
                # Récupérer ou créer le poste pour cette date
                poste, is_new = self._get_or_create_poste_for_date(date_obj, admin_user_id)
                if is_new:
                    postes_created += 1
                else:
                    postes_reused += 1
                
                # Créer un ticket pour cette date
                ticket = self.reception_service.create_ticket(
                    poste_id=poste.id,
                    benevole_user_id=admin_user_id
                )
                tickets_created += 1
                
                # Créer les lignes
                for row in rows:
                    try:
                        # create_ligne accepte une string pour destination et la convertit en enum
                        ligne = self.reception_service.create_ligne(
                            ticket_id=ticket.id,
                            category_id=row["category_id"],
                            poids_kg=row["poids_kg"],
                            destination=row["destination"],
                            notes=row["notes"]
                        )
                        lignes_imported += 1
                    except Exception as e:
                        errors.append(f"Ligne {row}: Erreur lors de la création: {str(e)}")
            
            # Commit final
            self.db.commit()
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur lors de l'import: {str(e)}"
            )
        
        return {
            "postes_created": postes_created,
            "postes_reused": postes_reused,
            "tickets_created": tickets_created,
            "lignes_imported": lignes_imported,
            "errors": errors,
            "total_errors": len(errors)
        }

