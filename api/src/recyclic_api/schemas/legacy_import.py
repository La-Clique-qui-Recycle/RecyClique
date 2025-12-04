"""
Schémas Pydantic pour l'import de données legacy.
"""

from pydantic import BaseModel, field_validator
from typing import Dict, List, Optional


class CategoryMapping(BaseModel):
    """Mapping d'une catégorie avec score de confiance."""
    category_id: str
    category_name: str
    confidence: float

    @field_validator('confidence')
    @classmethod
    def validate_confidence(cls, v):
        if not 0 <= v <= 100:
            raise ValueError('confidence doit être entre 0 et 100')
        return v


class CategoryMappingRequest(BaseModel):
    """Structure du fichier JSON de mapping."""
    mappings: Dict[str, CategoryMapping]
    unmapped: List[str] = []


class LegacyImportStatistics(BaseModel):
    """Statistiques de l'analyse d'import."""
    total_lines: int
    valid_lines: int
    error_lines: int
    unique_categories: int
    mapped_categories: int
    unmapped_categories: int
    llm_mapped_categories: int = 0
    llm_provider_used: Optional[str] = None


class LegacyImportAnalyzeResponse(BaseModel):
    """Réponse de l'endpoint analyze."""
    mappings: Dict[str, CategoryMapping]
    unmapped: List[str]
    statistics: LegacyImportStatistics
    errors: List[str]


class ImportReport(BaseModel):
    """Rapport d'import avec statistiques."""
    postes_created: int
    postes_reused: int
    tickets_created: int
    lignes_imported: int
    errors: List[str]
    total_errors: int


class LegacyImportExecuteResponse(BaseModel):
    """Réponse de l'endpoint execute."""
    report: ImportReport
    message: str = "Import terminé avec succès"

