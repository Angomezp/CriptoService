from unittest.mock import MagicMock

import pytest
import pandas as pd

from ml_service.services.models_service import ModelsService
from ml_service.exceptions.app_exception import AppException

from datetime import datetime

@pytest.fixture
def service():

    service = ModelsService()

    service.coingecko = MagicMock()
    service.crypto_repo = MagicMock()
    service.model_repo = MagicMock()
    service.trainer = MagicMock()
    service.predictor = MagicMock()
    service.features_helper = MagicMock()

    return service

def test_train_model_success(service):

    service.model_repo.get_latest_active_model.return_value = None

    service.coingecko.get_market_chart.return_value = [
        {"price": 100}
    ]

    service.crypto_repo.save_prices.return_value = 100

    service.trainer.train.return_value = {
        "model_path": "model.joblib",
        "mae": 0.1,
        "rmse": 0.2,
        "observations": 100,
        "training_date": datetime.now()
    }

    result = service.train_model("BTC", "btc")

    assert result["trained"] is True
    assert result["symbol"] == "BTC"

    service.trainer.train.assert_called_once()

def test_predict_no_model(service):

    service.model_repo.get_latest_active_model.return_value = None

    with pytest.raises(AppException):
        service.predict("BTC")

def test_predict_success(service):

    service.model_repo.get_latest_active_model.return_value = MagicMock(
        model_path="model.joblib",
        model_name="BTC Model",
        model_version="1.0"
    )

    service.crypto_repo.find_last_records.return_value = pd.DataFrame(
        {
            "price": [100] * 50
        }
    )

    service.features_helper.build_prediction_features.return_value = pd.DataFrame(
        {"f1": [1]}
    )

    service.predictor.predict.return_value = [[0.01] * 24]

    result = service.predict("BTC")

    assert result["symbol"] == "BTC"
    assert len(result["predictions"]) == 24


def test_predict_hour_success(service):

    service.predict = MagicMock(return_value={
        "symbol": "BTC",
        "current_price": 100,
        "model": "BTC Model",
        "version": "1.0",
        "predictions": [
            {
                "prediction_hour": i,
                "estimated_price": 100 + i,
                "percentage_variation": i
            }
            for i in range(1, 25)
        ]
    })

    result = service.predict_hour("BTC", 6)

    assert result["symbol"] == "BTC"
    assert result["prediction"]["prediction_hour"] == 6

def test_predict_hour_invalid_low(service):

    with pytest.raises(AppException):
        service.predict_hour("BTC", 0)

def test_predict_hour_invalid_high(service):

    with pytest.raises(AppException):
        service.predict_hour("BTC", 25)

def test_predict_hour_uses_predict(service):

    service.predict = MagicMock(return_value={
        "symbol": "BTC",
        "current_price": 100,
        "model": "BTC",
        "version": "1.0",
        "predictions": [{"prediction_hour": 1}]
    })

    service.predict_hour("BTC", 1)

    service.predict.assert_called_once_with("BTC")

def test_get_models(service):

    service.model_repo.get_all_models.return_value = [
        {"symbol": "BTC"}
    ]

    result = service.get_models()

    assert len(result) == 1


def test_get_active_model(service):

    service.model_repo.get_latest_active_model.return_value = {
        "symbol": "BTC"
    }

    result = service.get_active_model("BTC")

    assert result["symbol"] == "BTC"

