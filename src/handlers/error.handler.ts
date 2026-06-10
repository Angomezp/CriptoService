import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../config/http_errors.js';

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    _: NextFunction
) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            code: error.code,
            message: error.message,
            details: error.details,
        });
    }

    return res.status(500).json({
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
    });
}
