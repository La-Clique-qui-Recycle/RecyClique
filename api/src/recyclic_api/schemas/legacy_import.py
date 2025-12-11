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
    # Statistiques LLM enrichies (B47-P6)
    llm_attempted: bool = False
    llm_model_used: Optional[str] = None
    llm_batches_total: int = 0
    llm_batches_succeeded: int = 0
    llm_batches_failed: int = 0
    llm_mapped_categories: int = 0
    llm_unmapped_after_llm: int = 0
    llm_last_error: Optional[str] = None
    llm_avg_confidence: Optional[float] = None
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


class LLMModelInfo(BaseModel):
    """Informations sur un modèle LLM OpenRouter disponible pour l'import legacy."""

    id: str
    name: str
    provider: Optional[str] = None
    is_free: bool = False
    context_length: Optional[int] = None
    pricing: Optional[Dict[str, str]] = None


class LLMModelsResponse(BaseModel):
    """Réponse de l'endpoint listant les modèles LLM OpenRouter."""

    models: List[LLMModelInfo]
    error: Optional[str] = None
    default_model_id: Optional[str] = None
