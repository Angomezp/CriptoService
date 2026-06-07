from pydantic import BaseModel
from datetime import datetime

class PredictionItemResponse( BaseModel ):

    prediction_hour: int

    estimated_price: float

    percentage_variation: float


class PredictionResponse( BaseModel ):

    symbol: str
    current_price: float
    model: str
    version: str

    predictions: list[PredictionItemResponse]

class PredictionHourResponse( BaseModel ):

    symbol: str
    current_price: float
    model: str
    version: str

    prediction: PredictionItemResponse

class TrainResponse( BaseModel ):

    trained: bool

    message: str

    symbol: str

    last_training: datetime | None = None 

    new_records: int | None = None

    hours_since_training: float | None = None

    observations: int | None = None

    mae: float | None = None

    rmse: float | None = None

    model_path: str | None = None

class ModelResponse( BaseModel ):

    id: int

    model_name: str

    symbol: str

    model_algorithm: str

    model_version: str

    mae: float

    rmse: float

    observations: int

    active: bool

    model_path: str

    training_date: datetime