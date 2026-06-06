from pprint import pprint

from ml_service.ml.feature_helper import (
    FeatureHelper
)

from ml_service.ml.model_trainer import (
    ModelTrainer
)

from ml_service.repositories.crypto_price_repository import (
    CryptoPriceRepository
)

from ml_service.services.prediction_service import (
    PredictionService
)


def test_historical_data():

    print("\n=== HISTORICAL DATA ===")

    repository = CryptoPriceRepository()

    df = repository.get_training_data(
        "BTC"
    )

    print(f"Registros: {len(df)}")

    print(df.head())

    if df.empty:
        raise Exception(
            "No se encontraron datos históricos"
        )

    return df


def test_features(df):

    print("\n=== FEATURE ENGINEERING ===")

    feature_helper = FeatureHelper()

    dataset = (
        feature_helper.build_dataset(df)
    )

    print(
        f"Dataset generado: {dataset.shape}"
    )

    print(
        dataset.head()
    )

    X, y = (
        feature_helper.split_features_targets(
            dataset
        )
    )

    print(
        f"X shape: {X.shape}"
    )

    print(
        f"y shape: {y.shape}"
    )

    if X.empty:
        raise Exception(
            "Features vacías"
        )

    if y.empty:
        raise Exception(
            "Targets vacíos"
        )

    return dataset


def test_training():

    print("\n=== MODEL TRAINING ===")

    trainer = ModelTrainer()

    result = trainer.train(
        "BTC"
    )

    pprint(result)

    return result


def test_prediction():

    print("\n=== PREDICTION ===")

    service = PredictionService()

    result = service.predict(
        "BTC"
    )

    pprint(result)

    predictions = (
        result["predicciones"]
    )

    print(
        f"Predicciones generadas: {len(predictions)}"
    )

    if len(predictions) != 24:

        raise Exception(
            "El modelo no devolvió 24 horizontes"
        )

    return result


def main():

    print(
        "\n=================================="
    )

    print(
        "CRYPTO ML PIPELINE TEST"
    )

    print(
        "=================================="
    )

    historical_df = (
        test_historical_data()
    )

    test_features(
        historical_df
    )

    test_training()

    test_prediction()

    print(
        "\n=================================="
    )

    print(
        "PIPELINE OK"
    )

    print(
        "=================================="
    )


if __name__ == "__main__":

    try:

        main()

    except Exception as e:

        print(
            "\nERROR:"
        )

        print(e)