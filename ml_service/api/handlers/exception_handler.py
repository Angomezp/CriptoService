from fastapi import Request
from fastapi.responses import JSONResponse

from ml_service.exceptions.app_exception import AppException
from ml_service.exceptions.database_exception import DatabaseException
from ml_service.exceptions.external_service_exception import ExternalServiceException



async def app_exception_handler(
    request: Request,
    exc: AppException
):

    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": str(exc),
            "type": exc.__class__.__name__
        }
    )

async def database_exception_handler(
    request: Request,
    exc: DatabaseException
):

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": str(exc),
            "type": exc.__class__.__name__
        }
    )

async def external_service_exception_handler(
    request: Request,
    exc: ExternalServiceException
):

    return JSONResponse(
        status_code=502,
        content={
            "success": False,
            "error": str(exc),
            "type": exc.__class__.__name__
        }
    )

async def generic_exception_handler(
    request: Request,
    exc: Exception
):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": str(exc),
            "type": exc.__class__.__name__
        }
    )