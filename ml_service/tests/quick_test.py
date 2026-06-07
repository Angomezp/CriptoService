from ml_service.services.models_service import ModelsService

def main():

    service = ModelsService()

    symbol = "BTC"

    print("\n=== TRAINING TEST ===")

    training_result = service.train_model(
        symbol=symbol,
        coin_gecko_id="bitcoin"
    )

    print(training_result)

    print("\n=== ACTIVE MODEL TEST ===")

    active_model = service.get_active_model(symbol)

    print(f"ID: {active_model.id}")
    print(f"Model: {active_model.model_name}")
    print(f"Path: {active_model.model_path}")

    print("\n=== PREDICTION TEST ===")

    prediction_result = service.predict(symbol)

    print(
        f"Predictions generated: "
        f"{len(prediction_result['predicciones'])}"
    )

    print(
        prediction_result["predicciones"][:3]
    )

    print("\n=== MODELS TEST ===")

    models = service.get_models(symbol)

    print(
        f"Models found: {len(models)}"
    )

    print("\n=== SUCCESS ===")


if __name__ == "__main__":
    main()