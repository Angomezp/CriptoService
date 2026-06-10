from pydantic import BaseModel
from typing import Optional

class ModelParamsRequest(BaseModel):
    n_estimators: Optional[int] = None
    max_depth: Optional[int] = None
    learning_rate: Optional[float] = None
    objective: Optional[str] = None
    random_state: Optional[int] = None
    n_jobs: Optional[int] = None

class TrainRequest(BaseModel):

    symbol: str
    coin_gecko_id: str
    model_params: Optional[ModelParamsRequest] = None

class PredictRequest(BaseModel):

    symbol: str

class PredictHourRequest(BaseModel):

    symbol: str
    hour: int
