from datetime import datetime, timedelta

import pandas as pd

from ml_service.ml.feature_helper import FeatureHelper

def build_dataframe():

    rows = []

    start = datetime(2025, 1, 1)

    for i in range(50):

        rows.append({
            "timestamp": start + timedelta(hours=i),
            "price": 100 + i,
            "volume_24h": 1000 + i * 10
        })

    return pd.DataFrame(rows)

def test_build_dataset():

    helper = FeatureHelper()

    df = build_dataframe()

    dataset = helper.build_dataset(df)

    assert not dataset.empty

def test_build_dataset_creates_targets():

    helper = FeatureHelper()

    df = build_dataframe()

    dataset = helper.build_dataset(df)

    for horizon in range(1, 25):

        assert f"target_{horizon}h" in dataset.columns

def test_build_dataset_creates_features():

    helper = FeatureHelper()

    df = build_dataframe()

    dataset = helper.build_dataset(df)

    for feature in helper.FEATURE_COLUMNS:

        assert feature in dataset.columns


def test_split_features_targets():

    helper = FeatureHelper()

    dataset = helper.build_dataset( build_dataframe() )

    X, y = helper.split_features_targets( dataset )

    assert len(X.columns) == len( helper.FEATURE_COLUMNS )

    assert y.shape[1] == 24

def test_build_prediction_features():

    helper = FeatureHelper()

    df = build_dataframe()

    features = helper.build_prediction_features( df )

    assert len(features) == 1

def test_prediction_features_columns():

    helper = FeatureHelper()

    df = build_dataframe()

    features = helper.build_prediction_features( df )

    assert list(features.columns) == ( helper.FEATURE_COLUMNS )