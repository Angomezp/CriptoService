from fastapi import FastAPI
import uvicorn

from  ml_service.config.env import config
from ml_service.api.routes.models_routes import router as models_router

from ml_service.api.handlers.exception_handler import (
    app_exception_handler,
    database_exception_handler,
    external_service_exception_handler,
    generic_exception_handler
)

from ml_service.exceptions.app_exception import AppException
from ml_service.exceptions.database_exception import DatabaseException
from ml_service.exceptions.external_service_exception import ExternalServiceException


app = FastAPI(
    title="Cripto Service API",
    description="API for training and predicting cryptocurrency prices using machine learning models.",
    version="1.0.0"
)

app.include_router(models_router, prefix="/models", tags=["Models"])

app.add_exception_handler(
    AppException,
    app_exception_handler
)

app.add_exception_handler(
    DatabaseException,
    database_exception_handler
)

app.add_exception_handler(
    ExternalServiceException,
    external_service_exception_handler
)

app.add_exception_handler(
    Exception,
    generic_exception_handler
)


if __name__ == "__main__":
    uvicorn.run("ml_service.api.main:app", host=config.ML_SV_HOST, port=config.ML_SV_PORT, reload=True)