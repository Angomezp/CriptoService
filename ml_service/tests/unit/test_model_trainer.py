from unittest.mock import MagicMock, patch

import pandas as pd
import pytest

from ml_service.ml.model_trainer import ModelTrainer
from ml_service.exceptions.app_exception import AppException


@pytest.fixture
def trainer():

    trainer = ModelTrainer()

    trainer.crypto_repository = MagicMock()

    trainer.feature_helper = MagicMock()

    return trainer


def test_train_without_data( trainer ):

    trainer.crypto_repository.get_training_data.return_value = pd.DataFrame()

    with pytest.raises( AppException ):
        trainer.train("BTC")


def test_train_insufficient_data( trainer ):

    trainer.crypto_repository.get_training_data.return_value = (
        pd.DataFrame(
            {
                "precio": range(
                    trainer.minimum_data_points - 1
                )
            }
        )
    )

    with pytest.raises( AppException ):
        trainer.train("BTC")


def test_train_empty_dataset( trainer ):

    historical_df = pd.DataFrame(
        {
            "precio": range(
                trainer.minimum_data_points + 10
            )
        }
    )

    trainer.crypto_repository.get_training_data.return_value = historical_df

    trainer.feature_helper.build_dataset.return_value = pd.DataFrame()

    with pytest.raises( AppException ):
        trainer.train("BTC")


@patch("ml_service.ml.model_trainer.joblib.dump")
@patch("ml_service.ml.model_trainer.Path.exists")
@patch("ml_service.ml.model_trainer.MultiOutputRegressor")
def test_train_success(
    mock_model,
    mock_exists,
    mock_dump,
    trainer
):

    historical_df = pd.DataFrame(
        {
            "precio": range(300),
            "volumen_24h": range(300)
        }
    )

    trainer.crypto_repository.get_training_data.return_value = historical_df

    dataset = pd.DataFrame(
        {
            "f1": range(300),
            "target_1h": range(300)
        }
    )

    trainer.feature_helper.build_dataset.return_value = dataset

    trainer.feature_helper.split_features_targets.return_value = (
        pd.DataFrame(
            {
                "f1": range(300)
            }
        ),
        pd.DataFrame(
            {
                "target_1h": range(300)
            }
        )
    )

    fake_model = MagicMock()
    fake_model.predict.return_value = [[1]] * 60

    mock_model.return_value = fake_model

    mock_exists.return_value = True

    result = trainer.train("BTC")

    assert result["symbol"] == "BTC"
    assert "mae" in result
    assert "rmse" in result
    assert "model_path" in result
    assert "training_date" in result

    fake_model.fit.assert_called_once()
    fake_model.predict.assert_called_once()
    mock_dump.assert_called_once()


@patch("ml_service.ml.model_trainer.joblib.dump")
@patch("ml_service.ml.model_trainer.Path.exists")
@patch("ml_service.ml.model_trainer.MultiOutputRegressor")
def test_train_model_not_saved(
    mock_model,
    mock_exists,
    mock_dump,
    trainer
):

    historical_df = pd.DataFrame(
        {
            "precio": range(300)
        }
    )

    trainer.crypto_repository.get_training_data.return_value = historical_df

    dataset = pd.DataFrame(
        {
            "f1": range(300),
            "target_1h": range(300)
        }
    )

    trainer.feature_helper.build_dataset.return_value = dataset

    trainer.feature_helper.split_features_targets.return_value = (
        pd.DataFrame({"f1": range(300)}),
        pd.DataFrame({"target_1h": range(300)})
    )

    fake_model = MagicMock()
    fake_model.predict.return_value = [[1]] * 60

    mock_model.return_value = fake_model

    mock_exists.return_value = False

    with pytest.raises( AppException ):
        trainer.train("BTC")