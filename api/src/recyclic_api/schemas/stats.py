"""
Schemas for statistics endpoints.
"""
from pydantic import BaseModel, Field
from typing import List
from decimal import Decimal


class ReceptionSummaryStats(BaseModel):
    """Summary statistics for reception data."""

    total_weight: Decimal = Field(
        ...,
        description="Total weight in kg",
        ge=0
    )
    total_items: int = Field(
        ...,
        description="Total number of items",
        ge=0
    )
    unique_categories: int = Field(
        ...,
        description="Number of unique categories",
        ge=0
    )

    class Config:
        json_schema_extra = {
            "example": {
                "total_weight": 1250.75,
                "total_items": 342,
                "unique_categories": 15
            }
        }


class CategoryStats(BaseModel):
    """Statistics for a single category."""

    category_name: str = Field(
        ...,
        description="Name of the category"
    )
    total_weight: Decimal = Field(
        ...,
        description="Total weight in kg for this category",
        ge=0
    )
    total_items: int = Field(
        ...,
        description="Total number of items for this category",
        ge=0
    )

    class Config:
        json_schema_extra = {
            "example": {
                "category_name": "Écrans",
                "total_weight": 350.5,
                "total_items": 80
            }
        }


class ReceptionLiveStatsResponse(BaseModel):
    """Live reception statistics for admin dashboard."""

    tickets_open: int = Field(
        ...,
        description="Number of currently open reception tickets",
        ge=0
    )
    tickets_closed_24h: int = Field(
        ...,
        description="Number of tickets closed in the last 24 hours",
        ge=0
    )
    turnover_eur: float = Field(
        ...,
        description="Total sales turnover in EUR for the last 24 hours",
        ge=0
    )
    donations_eur: float = Field(
        ...,
        description="Total donations collected in EUR for the last 24 hours",
        ge=0
    )
    weight_in: float = Field(
        ...,
        description="Total weight received in kg (open tickets + closed in last 24h)",
        ge=0
    )
    weight_out: float = Field(
        ...,
        description="Total weight sold in kg from sales in the last 24 hours",
        ge=0
    )

    class Config:
        json_schema_extra = {
            "example": {
                "tickets_open": 5,
                "tickets_closed_24h": 23,
                "turnover_eur": 1247.50,
                "donations_eur": 45.80,
                "weight_in": 1250.75,
                "weight_out": 890.25
            }
        }
