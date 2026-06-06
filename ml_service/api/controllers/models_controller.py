from ml_service.services.models_service import ModelsService


class ModelsController:

    def __init__(self):

        self.service = ModelsService()

    def train(self, symbol: str):

        return self.service.train_model(
            symbol=symbol,
            coin_gecko_id=symbol.lower()
        )

    def predict(self, symbol: str):

        return self.service.predict(symbol)

    def get_all_models(self, symbol: str = None):

        return self.service.get_models(symbol)

    def get_latest_active_model_by_symbol(self, symbol: str):

        return self.service.get_active_model(symbol)

    def get_all_active_models_by_symbol(self, symbol: str):

        return self.service.get_all_active_models(symbol)
    
    def get_model_by_id(self, model_id: int):

        return self.service.get_model_by_id(model_id)
    