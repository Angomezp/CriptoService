from pathlib import Path
from unittest.mock import MagicMock

import pandas as pd
import pytest
import joblib

from ml_service.ml.model_predictor import ModelPredictor
from ml_service.exceptions.app_exception import AppException


@pytest.fixture
def predictor():

    return ModelPredictor()


def test_load_model_not_found( predictor ):

    with pytest.raises( AppException ):
        predictor.load_model( "fake_model.joblib" )


def test_load_model_success(
    predictor,
    monkeypatch
):

    monkeypatch.setattr( Path, "exists", lambda self: True )

    fake_model = MagicMock()

    monkeypatch.setattr( joblib, "load", lambda path: fake_model )

    model = predictor.load_model( "model.joblib" )

    assert model == fake_model


def test_load_model_joblib_error(
    predictor,
    monkeypatch
):

    monkeypatch.setattr( Path, "exists", lambda self: True )

    def raise_error( path ):
        raise Exception( "load failed" )

    monkeypatch.setattr( joblib, "load", raise_error )

    with pytest.raises( AppException ):
        predictor.load_model( "model.joblib" )

def test_predict_success(
    predictor,
    monkeypatch
):

    fake_model = MagicMock()

    fake_model.predict.return_value = [
        [1.0, 2.0, 3.0]
    ]

    monkeypatch.setattr( predictor, "load_model",  lambda _: fake_model )

    features = pd.DataFrame(
        {
            "feature_1": [1],
            "feature_2": [2]
        }
    )

    result = predictor.predict( "model.joblib", features )

    assert result is not None

    assert len(result[0]) == 3


def test_predict_error(
    predictor,
    monkeypatch
):

    fake_model = MagicMock()

    fake_model.predict.side_effect = Exception( "prediction failed" ) 

    monkeypatch.setattr( predictor, "load_model", lambda _: fake_model )

    features = pd.DataFrame(
        {
            "feature_1": [1]
        }
    )

    with pytest.raises( AppException ):
        predictor.predict( "model.joblib", features )