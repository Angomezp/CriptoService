from fastapi import APIRouter

from ml_service.api.controllers.models_controller import ModelsController

router = APIRouter()

models_controller = ModelsController()

@router.post("/train/{symbol}")
def train_model(symbol: str):
    return models_controller.train(symbol)

@router.get("/predict/{symbol}")
def predict(symbol: str):
    return models_controller.predict(symbol)

@router.get("/models")
def get_all_models(symbol: str = None):
    return models_controller.get_all_models(symbol)

@router.get("/models/active/latest/{symbol}")
def get_latest_active_model_by_symbol(symbol: str):
    return models_controller.get_latest_active_model_by_symbol(symbol)

@router.get("/models/active/{symbol}")
def get_all_active_models_by_symbol(symbol: str):
    return models_controller.get_all_active_models_by_symbol(symbol)

@router.get("/model/{model_id}")
def get_model_by_id(model_id: int):
    return models_controller.get_model_by_id(model_id)



