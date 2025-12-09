"""
Service for statistics and analytics aggregation.
"""
from __future__ import annotations

from typing import Optional, List, Dict, Any
from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from fastapi import HTTPException, status

from recyclic_api.models.ligne_depot import LigneDepot
from recyclic_api.models.ticket_depot import TicketDepot
from recyclic_api.models.category import Category
from recyclic_api.schemas.stats import ReceptionSummaryStats, CategoryStats


class StatsService:
    """Service for generating statistics and analytics."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def _validate_date_range(self, start_date: Optional[datetime], end_date: Optional[datetime]) -> None:
        """
        Validate that start_date is not after end_date.

        Args:
            start_date: Start date to validate
            end_date: End date to validate

        Raises:
            HTTPException: If start_date is after end_date
        """
        if start_date and end_date and start_date > end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="start_date cannot be after end_date"
            )

    def get_reception_summary(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> ReceptionSummaryStats:
        """
        Get summary statistics for reception data.

        Story B48-P1: Cette méthode NE FILTRE PAS sur `Category.deleted_at` pour conserver
        les données historiques complètes. Les catégories archivées doivent rester incluses
        dans les statistiques pour la comptabilité et les déclarations éco-organismes.

        Args:
            start_date: Optional start date filter (inclusive)
            end_date: Optional end date filter (inclusive)

        Returns:
            ReceptionSummaryStats with aggregated data

        Raises:
            HTTPException: If start_date is after end_date
        """
        # Validate date range
        self._validate_date_range(start_date, end_date)
        # Build base query
        # Story B48-P1: Ne PAS filtrer Category.deleted_at - conserver toutes les catégories pour stats historiques
        # Story B48-P3: Exclure is_exit=true pour weight_in (poids reçu, pas sorti)
        from sqlalchemy import or_
        query = self.db.query(
            func.coalesce(func.sum(LigneDepot.poids_kg), 0).label('total_weight'),
            func.count(LigneDepot.id).label('total_items'),
            func.count(func.distinct(LigneDepot.category_id)).label('unique_categories')
        ).join(
            TicketDepot,
            LigneDepot.ticket_id == TicketDepot.id
        ).filter(
            # Story B48-P3: Exclure les sorties (is_exit=true), inclure is_exit IS NULL pour rétrocompatibilité
            or_(LigneDepot.is_exit == False, LigneDepot.is_exit.is_(None))
        )

        # Apply date filters if provided
        filters = []
        if start_date:
            # Rendre la date consciente du fuseau horaire (UTC)
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
            filters.append(TicketDepot.created_at >= start_date)
        if end_date:
            # Rendre la date consciente du fuseau horaire (UTC)
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
            filters.append(TicketDepot.created_at <= end_date)

        if filters:
            query = query.filter(and_(*filters))

        # Execute query
        result = query.one()

        return ReceptionSummaryStats(
            total_weight=Decimal(str(result.total_weight)),
            total_items=result.total_items,
            unique_categories=result.unique_categories
        )

    def get_reception_by_category(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[CategoryStats]:
        """
        Get reception statistics grouped by category.

        Story B48-P1: Cette méthode NE FILTRE PAS sur `Category.deleted_at` pour conserver
        les données historiques complètes. Les catégories archivées doivent rester visibles
        dans les statistiques pour :
        - La comptabilité (traçabilité des transactions passées)
        - Les déclarations éco-organismes (mapping des catégories historiques)
        - L'intégrité des données (pas de perte d'information dans les rapports)

        Seules les APIs opérationnelles (caisse/réception) filtrent `deleted_at IS NULL`
        pour masquer les catégories archivées des sélecteurs.

        Args:
            start_date: Optional start date filter (inclusive)
            end_date: Optional end date filter (inclusive)

        Returns:
            List of CategoryStats, sorted by total_weight descending

        Raises:
            HTTPException: If start_date is after end_date
        """
        # Validate date range
        self._validate_date_range(start_date, end_date)
        # Build base query
        # Story B48-P1: Ne PAS filtrer Category.deleted_at - conserver toutes les catégories pour stats historiques
        query = self.db.query(
            Category.name.label('category_name'),
            func.coalesce(func.sum(LigneDepot.poids_kg), 0).label('total_weight'),
            func.count(LigneDepot.id).label('total_items')
        ).join(
            LigneDepot,
            Category.id == LigneDepot.category_id
        ).join(
            TicketDepot,
            LigneDepot.ticket_id == TicketDepot.id
        )

        # Apply date filters if provided
        filters = []
        if start_date:
            # Rendre la date consciente du fuseau horaire (UTC)
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
            filters.append(TicketDepot.created_at >= start_date)
        if end_date:
            # Rendre la date consciente du fuseau horaire (UTC)
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
            filters.append(TicketDepot.created_at <= end_date)

        if filters:
            query = query.filter(and_(*filters))

        # Group by category and order by weight
        query = query.group_by(Category.name).order_by(func.sum(LigneDepot.poids_kg).desc())

        # Execute query
        results = query.all()

        return [
            CategoryStats(
                category_name=row.category_name,
                total_weight=Decimal(str(row.total_weight)),
                total_items=row.total_items
            )
            for row in results
        ]
