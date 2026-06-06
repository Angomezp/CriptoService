from fastapi import FastAPI

from ml_service.routes import (
    prediction_routes,
    training_routes
)

app = FastAPI(
    title="Crypto ML Service",
    version="1.0"
)

app.include_router(
    prediction_routes.router,
    prefix="/predictions"
)

app.include_router(
    training_routes.router,
    prefix="/training"
)