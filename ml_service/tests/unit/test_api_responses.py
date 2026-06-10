from unittest.mock import MagicMock

import pytest

from fastapi.testclient import TestClient

from ml_service.main import app
from ml_service.api.routes.models_routes import models_controller
from ml_service.api.security.api_key import validate_api_key
from ml_service.exceptions.app_exception import AppException


client = TestClient(app)


@pytest.fixture(autouse=True)
def mock_service():

    app.dependency_overrides[
        validate_api_key
    ] = lambda: None

    models_controller.service = MagicMock()

    yield models_controller.service

    app.dependency_overrides.clear()


def test_train_api(mock_service):

    mock_service.train_model.return_value = {
        "trained": True,
        "symbol": "BTC",
        "message": "Model trained correctly",
        "new_records": 100,
        "last_training": "2025-01-01T00:00:00",
        "observations": 100,
        "mae": 0.1,
        "rmse": 0.2,
        "model_path": "model.joblib"
    }

    response = client.post(
        "/models/train",
        json={
            "symbol": "BTC",
            "coin_gecko_id": "bitcoin"
        }
    )

    assert response.status_code == 200
    assert response.json()["symbol"] == "BTC"


def test_train_api_with_partial_params(mock_service):

    mock_service.train_model.return_value = {
        "trained": True,
        "symbol": "BTC",
        "message": "Model trained correctly",
        "new_records": 100,
        "last_training": "2025-01-01T00:00:00",
        "observations": 100,
        "mae": 0.1,
        "rmse": 0.2,
        "model_path": "model.joblib"
    }

    response = client.post(
        "/models/train",
        json={
            "symbol": "BTC",
            "coin_gecko_id": "bitcoin",
            "model_params": {
                "n_estimators": 500
            }
        }
    )

    assert response.status_code == 200
    assert response.json()["symbol"] == "BTC"


def test_train_api_with_all_params(mock_service):

    mock_service.train_model.return_value = {
        "trained": True,
        "symbol": "BTC",
        "message": "Model trained correctly",
        "new_records": 100,
        "last_training": "2025-01-01T00:00:00",
        "observations": 100,
        "mae": 0.1,
        "rmse": 0.2,
        "model_path": "model.joblib"
    }

    response = client.post(
        "/models/train",
        json={
            "symbol": "BTC",
            "coin_gecko_id": "bitcoin",
            "model_params": {
                "n_estimators": 500,
                "max_depth": 8,
                "learning_rate": 0.05,
                "objective": "reg:squarederror",
                "random_state": 42,
                "n_jobs": -1
            }
        }
    )

    assert response.status_code == 200
    assert response.json()["symbol"] == "BTC"


def test_train_api_passes_params_to_service(mock_service):

    mock_service.train_model.return_value = {
        "trained": True,
        "symbol": "BTC",
        "message": "Model trained correctly",
        "new_records": 100,
        "last_training": "2025-01-01T00:00:00",
        "observations": 100,
        "mae": 0.1,
        "rmse": 0.2,
        "model_path": "model.joblib"
    }

    response = client.post(
        "/models/train",
        json={
            "symbol": "BTC",
            "coin_gecko_id": "bitcoin",
            "model_params": {
                "n_estimators": 500,
                "learning_rate": 0.05
            }
        }
    )

    assert response.status_code == 200

    mock_service.train_model.assert_called_once_with(
        symbol="BTC",
        coin_gecko_id="bitcoin",
        model_params={
            "n_estimators": 500,
            "learning_rate": 0.05
        }
    )


def test_train_api_invalid_payload():

    response = client.post(
        "/models/train",
        json={
            "symbol": ""
        }
    )

    assert response.status_code == 422


def test_train_api_missing_fields():

    response = client.post(
        "/models/train",
        json={
            "symbol": "BTC"
        }
    )

    assert response.status_code == 422


def test_train_api_invalid_n_estimators():

    response = client.post(
        "/models/train",
        json={
            "symbol": "BTC",
            "coin_gecko_id": "bitcoin",
            "model_params": {
                "n_estimators": "abc"
            }
        }
    )

    assert response.status_code == 422


def test_train_api_invalid_max_depth():

    response = client.post(
        "/models/train",
        json={
            "symbol": "BTC",
            "coin_gecko_id": "bitcoin",
            "model_params": {
                "max_depth": "invalid"
            }
        }
    )

    assert response.status_code == 422


def test_train_api_invalid_learning_rate():

    response = client.post(
        "/models/train",
        json={
            "symbol": "BTC",
            "coin_gecko_id": "bitcoin",
            "model_params": {
                "learning_rate": "invalid"
            }
        }
    )

    assert response.status_code == 422



def test_predict_api(mock_service):

    mock_service.predict.return_value = {
        "symbol": "BTC",
        "current_price": 100.0,
        "model": "BTC Predictor",
        "version": "1.0",
        "predictions": []
    }

    response = client.post(
        "/models/predict",
        json={
            "symbol": "BTC"
        }
    )

    assert response.status_code == 200
    assert response.json()["symbol"] == "BTC"


def test_predict_api_missing_symbol():

    response = client.post(
        "/models/predict",
        json={}
    )

    assert response.status_code == 422


def test_predict_no_active_model(mock_service):

    mock_service.predict.side_effect = AppException(
        "There is no active model"
    )

    response = client.post(
        "/models/predict",
        json={
            "symbol": "BTC"
        }
    )

    assert response.status_code == 400


def test_predict_hour_api(mock_service):

    mock_service.predict_hour.return_value = {
        "symbol": "BTC",
        "current_price": 100.0,
        "model": "BTC Predictor",
        "version": "1.0",
        "prediction": {
            "prediction_hour": 6,
            "estimated_price": 106.0,
            "percentage_variation": 6.0
        }
    }

    response = client.post(
        "/models/predict/hour",
        json={
            "symbol": "BTC",
            "hour": 6
        }
    )

    assert response.status_code == 200


def test_predict_hour_invalid_payload():

    response = client.post(
        "/models/predict/hour",
        json={
            "symbol": "BTC"
        }
    )

    assert response.status_code == 422


def test_predict_hour_invalid_range(mock_service):

    mock_service.predict_hour.side_effect = AppException(
        "The hour must be between 1 and 24"
    )

    response = client.post(
        "/models/predict/hour",
        json={
            "symbol": "BTC",
            "hour": 30
        }
    )

    assert response.status_code == 400



def test_get_models(mock_service):

    mock_service.get_models.return_value = []

    response = client.get("/models/")

    assert response.status_code == 200


def test_get_models_empty(mock_service):

    mock_service.get_models.side_effect = AppException(
        "No models found"
    )

    response = client.get("/models/")

    assert response.status_code == 400


def test_get_by_symbol(mock_service):

    mock_service.get_models.return_value = []

    response = client.get(
        "/models/symbol/BTC"
    )

    assert response.status_code == 200


def test_get_by_symbol_not_found(mock_service):

    mock_service.get_models.side_effect = AppException(
        "No models found"
    )

    response = client.get(
        "/models/symbol/BTC"
    )

    assert response.status_code == 400



def test_get_active_model_by_symbol(mock_service):

    mock_service.get_active_model_by_symbol.return_value = {
        "id": 1,
        "model_name": "BTC Predictor",
        "model_algorithm": "XGBoost",
        "model_version": "1.0",
        "mae": 0.1,
        "rmse": 0.2,
        "observations": 100,
        "active": True,
        "model_path": "model.joblib",
        "symbol": "BTC",
        "training_date": "2025-01-01T00:00:00"
    }

    response = client.get(
        "/models/active/BTC"
    )

    assert response.status_code == 200


def test_get_active_model_by_symbol_not_found(mock_service):

    mock_service.get_active_model_by_symbol.side_effect = AppException(
        "There is no active model"
    )

    response = client.get(
        "/models/active/BTC"
    )

    assert response.status_code == 400


def test_get_all_active_models(mock_service):

    mock_service.get_all_active_models.return_value = []

    response = client.get(
        "/models/active"
    )

    assert response.status_code == 200


def test_get_all_active_models_empty(mock_service):

    mock_service.get_all_active_models.side_effect = AppException(
        "No active models found"
    )

    response = client.get(
        "/models/active"
    )

    assert response.status_code == 400


def test_get_by_id(mock_service):

    mock_service.get_model_by_id.return_value = {
        "id": 1,
        "model_name": "BTC Predictor",
        "model_algorithm": "XGBoost",
        "model_version": "1.0",
        "mae": 0.1,
        "rmse": 0.2,
        "observations": 100,
        "active": True,
        "model_path": "model.joblib",
        "symbol": "BTC",
        "training_date": "2025-01-01T00:00:00"
    }

    response = client.get(
        "/models/id/1"
    )

    assert response.status_code == 200


def test_get_by_id_not_found(mock_service):

    mock_service.get_model_by_id.side_effect = AppException(
        "Model not found"
    )

    response = client.get(
        "/models/id/999"
    )

    assert response.status_code == 400