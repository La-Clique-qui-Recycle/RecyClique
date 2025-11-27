"""
Service for live reception statistics aggregation.
"""
from __future__ import annotations

from typing import Optional
from datetime import datetime, timezone, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from prometheus_client import Counter, Histogram

from recyclic_api.models.ticket_depot import TicketDepot, TicketDepotStatus
from recyclic_api.models.ligne_depot import LigneDepot
from recyclic_api.models.sale import Sale
from recyclic_api.models.sale_item import SaleItem

# Prometheus metrics - créées au niveau du module pour éviter les duplications
_stats_requests = Counter(
    'reception_live_stats_requests_total',
    'Total number of live stats requests'
)
_stats_duration = Histogram(
    'reception_live_stats_duration_seconds',
    'Time spent calculating live stats'
)
_stats_errors = Counter(
    'reception_live_stats_errors_total',
    'Total number of errors during stats calculation'
)


class ReceptionLiveStatsService:
    """
    Service for calculating live reception statistics.
    Provides real-time aggregation of reception KPIs for the admin dashboard.
    """

    def __init__(self, db: Session) -> None:
        self.db = db
        # Les métriques Prometheus sont définies au niveau du module pour éviter les duplications

    async def get_live_stats(self, site_id: Optional[str] = None) -> dict:
        """
        Calculate live reception statistics for the admin dashboard.

        Args:
            site_id: Optional site filter (for future multi-site support)

        Returns:
            Dict containing:
            - tickets_open: Count of currently open tickets
            - tickets_closed_24h: Count of tickets closed in last 24h
            - turnover_eur: Total sales amount in EUR for last 24h
            - donations_eur: Total donations in EUR for last 24h
            - weight_in: Total weight received in kg (open + closed in 24h)
            - weight_out: Total weight sold in kg (sales in last 24h)

        Raises:
            ValueError: If site_id format is invalid
            RuntimeError: If database query fails
        """
        # Input validation
        if site_id is not None and not isinstance(site_id, str):
            raise ValueError("site_id must be a string or None")

        with _stats_duration.time():
            try:
                _stats_requests.inc()

                # Calculate time threshold (24 hours ago)
                threshold_24h = datetime.now(timezone.utc) - timedelta(hours=24)

                # 1. Count open tickets
                tickets_open = self._count_open_tickets(site_id)

                # 2. Count tickets closed in last 24h
                tickets_closed_24h = self._count_closed_tickets_24h(site_id, threshold_24h)

                # 3. Count items/lines received (from closed tickets in 24h)
                items_received = self._count_items_received_24h(site_id, threshold_24h)

                # 4. Calculate turnover (sales in last 24h)
                turnover_eur = self._calculate_turnover_24h(site_id, threshold_24h)

                # 5. Calculate donations (from sales in last 24h)
                donations_eur = self._calculate_donations_24h(site_id, threshold_24h)

                # 6. Calculate weight received (open tickets + closed in 24h)
                weight_in = self._calculate_weight_in(site_id, threshold_24h)

                # 7. Calculate weight sold (from sales in last 24h)
                weight_out = self._calculate_weight_out(site_id, threshold_24h)

                return {
                    "tickets_open": tickets_open,
                    "tickets_closed_24h": tickets_closed_24h,
                    "items_received": items_received,
                    "turnover_eur": float(turnover_eur),
                    "donations_eur": float(donations_eur),
                    "weight_in": float(weight_in),
                    "weight_out": float(weight_out),
                }

            except Exception as e:
                _stats_errors.inc()
                # Re-raise with more context for debugging
                raise RuntimeError(f"Failed to calculate live reception stats: {str(e)}") from e

    def _count_open_tickets(self, site_id: Optional[str]) -> int:
        """Count currently open tickets."""
        query = self.db.query(func.count(TicketDepot.id)).filter(
            TicketDepot.status == TicketDepotStatus.OPENED.value
        )

        # Note: site filtering not implemented yet as tickets don't have direct site relationship
        # This will be added when multi-site support is implemented

        return query.scalar() or 0

    def _count_closed_tickets_24h(self, site_id: Optional[str], threshold: datetime) -> int:
        """Count tickets closed within the last 24 hours."""
        query = self.db.query(func.count(TicketDepot.id)).filter(
            and_(
                TicketDepot.status == TicketDepotStatus.CLOSED.value,
                TicketDepot.closed_at.isnot(None),
                TicketDepot.closed_at >= threshold
            )
        )

        return query.scalar() or 0

    def _count_items_received_24h(self, site_id: Optional[str], threshold: datetime) -> int:
        """Count items/lines received from tickets closed in the last 24 hours."""
        query = self.db.query(func.count(LigneDepot.id)).join(
            TicketDepot, LigneDepot.ticket_id == TicketDepot.id
        ).filter(
            and_(
                TicketDepot.status == TicketDepotStatus.CLOSED.value,
                TicketDepot.closed_at.isnot(None),
                TicketDepot.closed_at >= threshold
            )
        )

        return query.scalar() or 0

    def _calculate_turnover_24h(self, site_id: Optional[str], threshold: datetime) -> Decimal:
        """Calculate total sales amount in EUR for the last 24 hours."""
        query = self.db.query(func.coalesce(func.sum(Sale.total_amount), 0)).filter(
            Sale.created_at >= threshold
        )

        # Note: For now, we calculate all sales in the last 24h
        # In the future, this could be filtered by site if sales are linked to sites

        return Decimal(str(query.scalar() or 0))

    def _calculate_donations_24h(self, site_id: Optional[str], threshold: datetime) -> Decimal:
        """Calculate total donations in EUR for the last 24 hours."""
        query = self.db.query(func.coalesce(func.sum(Sale.donation), 0)).filter(
            and_(
                Sale.created_at >= threshold,
                Sale.donation.isnot(None)
            )
        )

        return Decimal(str(query.scalar() or 0))

    def _calculate_weight_in(self, site_id: Optional[str], threshold: datetime) -> Decimal:
        """Calculate total weight received in kg (open tickets + closed in 24h)."""
        # Get weight from open tickets
        open_weight_query = self.db.query(func.coalesce(func.sum(LigneDepot.poids_kg), 0)).join(
            TicketDepot, LigneDepot.ticket_id == TicketDepot.id
        ).filter(TicketDepot.status == TicketDepotStatus.OPENED.value)

        # Get weight from tickets closed in last 24h
        closed_weight_query = self.db.query(func.coalesce(func.sum(LigneDepot.poids_kg), 0)).join(
            TicketDepot, LigneDepot.ticket_id == TicketDepot.id
        ).filter(
            and_(
                TicketDepot.status == TicketDepotStatus.CLOSED.value,
                TicketDepot.closed_at.isnot(None),
                TicketDepot.closed_at >= threshold
            )
        )

        open_weight = Decimal(str(open_weight_query.scalar() or 0))
        closed_weight = Decimal(str(closed_weight_query.scalar() or 0))

        return open_weight + closed_weight

    def _calculate_weight_out(self, site_id: Optional[str], threshold: datetime) -> Decimal:
        """Calculate total weight sold in kg from sales in the last 24 hours."""
        query = self.db.query(func.coalesce(func.sum(SaleItem.weight), 0)).join(
            Sale, SaleItem.sale_id == Sale.id
        ).filter(Sale.created_at >= threshold)

        return Decimal(str(query.scalar() or 0))
