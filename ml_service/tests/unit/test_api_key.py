from unittest.mock import MagicMock

import pytest

from fastapi.testclient import TestClient

from ml_service.main import app
from ml_service.api.routes.models_routes import models_controller
from ml_service.config.env import config


client = TestClient(app)

VALID_HEADERS = {
    "X-API-Key": config.ML_API_KEY
}

@pytest.fixture(autouse=True)
def mock_service():

    models_controller.service = MagicMock()

    models_controller.service.predict.return_value = {
        "symbol": "BTC",
        "current_price": 100.0,
        "model": "BTC Predictor",
        "version": "1.0",
        "predictions": [
            {
                "prediction_hour": 1,
                "estimated_price": 101.0,
                "percentage_variation": 1.0
            }
        ]
    }

    return models_controller.service


# ==========================================
# HAPPY PATHS
# ==========================================

def test_predict_with_valid_api_key():

    response = client.post(
        "/models/predict",
        headers=VALID_HEADERS,
        json={
            "symbol": "BTC"
        }
    )

    assert response.status_code == 200
    assert response.json()["symbol"] == "BTC"


def test_get_models_with_valid_api_key():

    models_controller.service.get_models.return_value = []

    response = client.get(
        "/models/",
        headers=VALID_HEADERS
    )

    assert response.status_code == 200


# ==========================================
# UNHAPPY PATHS
# ==========================================

def test_predict_without_api_key():

    response = client.post(
        "/models/predict",
        json={
            "symbol": "BTC"
        }
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "API Key required"


def test_predict_with_invalid_api_key():

    response = client.post(
        "/models/predict",
        headers={
            "X-API-Key": "invalid-key"
        },
        json={
            "symbol": "BTC"
        }
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid API Key"


def test_predict_with_empty_api_key():

    response = client.post(
        "/models/predict",
        headers={
            "X-API-Key": ""
        },
        json={
            "symbol": "BTC"
        }
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "API Key required"


def test_predict_with_whitespace_api_key():

    response = client.post(
        "/models/predict",
        headers={
            "X-API-Key": " "
        },
        json={
            "symbol": "BTC"
        }
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid API Key"


def test_get_models_without_api_key():

    response = client.get(
        "/models/"
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "API Key required"


def test_get_models_with_invalid_api_key():

    response = client.get(
        "/models/",
        headers={
            "X-API-Key": "wrong-key"
        }
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid API Key"