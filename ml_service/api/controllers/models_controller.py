from ml_service.services.models_service import ModelsService


class ModelsController:

    def __init__(self):

        self.service = ModelsService()

    def train(self, symbol: str, coin_gecko_id: str, model_params: dict | None = None):

        return self.service.train_model( symbol=symbol, coin_gecko_id=coin_gecko_id, model_params=model_params )

    def predict(self, symbol: str):

        return self.service.predict(symbol)
    
    def predict_for_hour(self, symbol: str, hour: int):

        return self.service.predict_hour(symbol, hour)
    
    def get_all_models(self, symbol: str = None):

        return self.service.get_models(symbol)
    
    def get_all_active_models(self):

        return self.service.get_all_active_models()

    def get_active_model_by_symbol(self, symbol: str):

        return self.service.get_active_model_by_symbol(symbol)

    def get_model_by_id(self, model_id: int):

        return self.service.get_model_by_id(model_id)
    
    