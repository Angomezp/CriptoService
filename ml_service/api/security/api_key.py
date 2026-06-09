from fastapi import Header, HTTPException
from ml_service.config.env import config

async def validate_api_key(
    x_api_key: str | None = Header(default=None)
):

    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="API Key required"
        )

    if x_api_key != config.ML_API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key"
        )