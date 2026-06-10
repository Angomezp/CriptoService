import type { Request, Response, NextFunction } from 'express';

import { AppError } from '../config/http_errors.js';
import { verificarToken } from '../security/jwt.handler.js';

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(
            new AppError('Authorization header is missing', 401, 'UNAUTHORIZED')
        );
    }

    if (!authHeader.startsWith('Bearer ')) {
        return next(
            new AppError('Invalid authorization format', 401, 'UNAUTHORIZED')
        );
    }

    const token = authHeader.split(' ')[1];
    try {
        if (!token) {
            return next(new AppError('Token is required', 401, 'UNAUTHORIZED'));
        }
        const payload = verificarToken(token);
        if (!payload) {
            return next(
                new AppError('Invalid or expired token', 401, 'UNAUTHORIZED')
            );
        }
        next();
    } catch {
        next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
    }
};
