"""
Tests d'intégration pour l'endpoint llm-only (B47-P6).
"""

import pytest
from fastapi.testclient import TestClient

from recyclic_api.models.category import Category
from recyclic_api.models.user import User, UserRole, UserStatus
from recyclic_api.core.security import hash_password


def test_llm_only_requires_admin(client):
    """Test que l'endpoint require ADMIN ou SUPER_ADMIN."""
    r = client.post(
        "/api/v1/admin/import/legacy/analyze/llm-only",
        json={"unmapped_categories": ["Cat1", "Cat2"]}
    )
    
    assert r.status_code in [401, 403]


def test_llm_only_with_empty_list(admin_client, db_session):
    """Test que l'endpoint accepte une liste vide."""
    r = admin_client.post(
        "/api/v1/admin/import/legacy/analyze/llm-only",
        json={"unmapped_categories": []}
    )
    
    assert r.status_code == 200
    data = r.json()
    assert "mappings" in data
    assert "statistics" in data
    assert data["mappings"] == {}
    assert data["statistics"]["llm_attempted"] is False


def test_llm_only_with_model_override(admin_client, db_session):
    """Test la relance LLM avec override du modèle."""
    cat = Category(name="Vaisselle", is_active=True)
    db_session.add(cat)
    db_session.commit()
    
    r = admin_client.post(
        "/api/v1/admin/import/legacy/analyze/llm-only",
        json={
            "unmapped_categories": ["UnknownCategory"],
            "llm_model_id": "mistralai/mistral-7b-instruct:free"
        }
    )
    
    assert r.status_code == 200
    data = r.json()
    assert "mappings" in data
    assert "statistics" in data
    assert "llm_model_used" in data["statistics"]
    assert data["statistics"]["llm_model_used"] == "mistralai/mistral-7b-instruct:free"






