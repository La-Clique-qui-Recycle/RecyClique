"""
Endpoints pour l'import de données legacy depuis CSV.
"""

import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from recyclic_api.core.database import get_db
from recyclic_api.core.auth import require_role_strict
from recyclic_api.models.user import User, UserRole
from recyclic_api.services.legacy_import_service import LegacyImportService
from recyclic_api.schemas.legacy_import import (
    LegacyImportAnalyzeResponse,
    LegacyImportExecuteResponse,
    CategoryMappingRequest,
    ImportReport
)

router = APIRouter(tags=["admin"])
logger = logging.getLogger(__name__)


@router.post(
    "/import/legacy/analyze",
    response_model=LegacyImportAnalyzeResponse,
    summary="Analyser un CSV legacy pour import",
    description="Analyse un CSV nettoyé et propose des mappings de catégories via fuzzy matching. Nécessite ADMIN ou SUPER_ADMIN.",
)
async def analyze_legacy_import(
    file: UploadFile = File(..., description="Fichier CSV nettoyé à analyser"),
    confidence_threshold: Optional[float] = Form(None, description="Seuil de confiance pour le fuzzy matching (0-100, défaut: 80)"),
    current_user: User = Depends(require_role_strict([UserRole.ADMIN, UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Analyse un CSV legacy et propose des mappings de catégories.
    
    Le CSV doit contenir les colonnes suivantes:
    - date: Date de la ligne (format: YYYY-MM-DD, DD/MM/YYYY, etc.)
    - category: Nom de la catégorie (non normalisé)
    - poids_kg: Poids en kilogrammes
    - destination: Destination (MAGASIN, RECYCLAGE, DECHETERIE)
    - notes: Notes optionnelles
    
    Retourne:
    - mappings: Dictionnaire des mappings proposés avec scores de confiance
    - unmapped: Liste des catégories non mappables (score < seuil)
    - statistics: Statistiques de l'analyse
    - errors: Liste des erreurs de validation
    """
    # Validation du format de fichier
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format non supporté: fournir un fichier .csv"
        )
    
    # Validation du seuil de confiance
    if confidence_threshold is not None:
        if not 0 <= confidence_threshold <= 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="confidence_threshold doit être entre 0 et 100"
            )
    
    try:
        # Lire le contenu du fichier
        content = await file.read()
        
        # Créer le service et analyser
        service = LegacyImportService(db)
        result = service.analyze(content, confidence_threshold=confidence_threshold)
        
        return LegacyImportAnalyzeResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse du CSV legacy: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'analyse: {str(e)}"
        )


@router.post(
    "/import/legacy/execute",
    response_model=LegacyImportExecuteResponse,
    summary="Exécuter l'import legacy avec mapping validé",
    description="Importe le CSV avec le fichier de mapping validé. Crée les postes, tickets et lignes en base. Nécessite ADMIN ou SUPER_ADMIN.",
)
async def execute_legacy_import(
    csv_file: UploadFile = File(..., description="Fichier CSV nettoyé à importer"),
    mapping_file: UploadFile = File(..., description="Fichier JSON de mapping validé"),
    current_user: User = Depends(require_role_strict([UserRole.ADMIN, UserRole.SUPER_ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Exécute l'import du CSV avec le mapping validé.
    
    Le fichier de mapping doit avoir la structure:
    {
        "mappings": {
            "Vaisselle": {"category_id": "uuid", "category_name": "Vaisselle", "confidence": 100},
            "DEEE": {"category_id": "uuid", "category_name": "DEEE", "confidence": 85}
        },
        "unmapped": ["D3E", "EEE PAM"]
    }
    
    Le processus:
    1. Valide le CSV et le mapping
    2. Crée un PosteReception par jour (ou réutilise s'il existe)
    3. Crée un TicketDepot par jour
    4. Crée les LigneDepot avec les catégories mappées
    
    Transaction: tout ou rien (rollback en cas d'erreur).
    """
    # Validation des formats de fichiers
    if not csv_file.filename or not csv_file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier CSV doit être un fichier .csv"
        )
    
    if not mapping_file.filename or not mapping_file.filename.lower().endswith(".json"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier de mapping doit être un fichier .json"
        )
    
    try:
        # Lire les fichiers
        csv_content = await csv_file.read()
        mapping_content = await mapping_file.read()
        
        # Parser le JSON de mapping
        try:
            mapping_json = json.loads(mapping_content.decode("utf-8"))
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Fichier de mapping JSON invalide: {str(e)}"
            )
        
        # Valider la structure du mapping
        try:
            mapping_request = CategoryMappingRequest(**mapping_json)
            mapping_dict = mapping_request.model_dump()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Structure de mapping invalide: {str(e)}"
            )
        
        # Créer le service et exécuter l'import
        service = LegacyImportService(db)
        report_dict = service.execute(
            file_bytes=csv_content,
            mapping_json=mapping_dict,
            admin_user_id=current_user.id
        )
        
        report = ImportReport(**report_dict)
        
        # Message de succès
        message = "Import terminé avec succès"
        if report.total_errors > 0:
            message = f"Import terminé avec {report.total_errors} erreur(s)"
        
        logger.info(
            f"Import legacy exécuté par {current_user.username}: "
            f"{report.postes_created} postes créés, {report.postes_reused} réutilisés, "
            f"{report.tickets_created} tickets, {report.lignes_imported} lignes"
        )
        
        return LegacyImportExecuteResponse(
            report=report,
            message=message
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'import legacy: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'import: {str(e)}"
        )

