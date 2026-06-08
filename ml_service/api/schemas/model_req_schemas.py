from pydantic import BaseModel


class TrainRequest(BaseModel):

    symbol: str
    coin_gecko_id: str

class PredictRequest(BaseModel):

    symbol: str

class PredictHourRequest(BaseModel):

    symbol: str
    hour: int
