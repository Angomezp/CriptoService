from fastapi import APIRouter

from ml_service.api.controllers.models_controller import ModelsController

from ml_service.api.schemas.model_req_schemas import (
    TrainRequest, 
    PredictRequest, 
    PredictHourRequest
)

router = APIRouter()

models_controller = ModelsController()


@router.post("/train")
def train_model( request: TrainRequest ):
    return models_controller.train( request.symbol, request.coin_gecko_id )

@router.post("/predict")
def predict( request: PredictRequest ):
    return models_controller.predict(request.symbol)

@router.post("/predict/hour")
def predict_for_hour( request: PredictHourRequest ):
    return models_controller.predict_for_hour( request.symbol, request.hour )

@router.get("/")
def get_all_models():
    return models_controller.get_all_models()

@router.get("/symbol/{symbol}")
def get_models_by_symbol( symbol: str ):
    return models_controller.get_all_models(symbol)

@router.get("/active/latest/{symbol}")
def get_latest_active_model_by_symbol( symbol: str ):
    return models_controller.get_latest_active_model_by_symbol( symbol )

@router.get("/active/{symbol}")
def get_all_active_models_by_symbol( symbol: str ):
    return models_controller.get_all_active_models_by_symbol( symbol )

@router.get("/id/{model_id}")
def get_model_by_id( model_id: int ):
    return models_controller.get_model_by_id( model_id )