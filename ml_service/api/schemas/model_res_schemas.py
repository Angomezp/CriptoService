from pydantic import BaseModel


class PredictionItemResponse( BaseModel ):

    prediction_hour: int

    predicted_price: float

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
