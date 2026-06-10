import type { Request } from 'express';

import { ValidationError } from '../config/http_errors.js';

export function getBearerToken( req: Request ): string {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new ValidationError( 'Authorization header requerido' );
    }
    if ( !authHeader.startsWith('Bearer ') ) {
        throw new ValidationError( 'Formato Bearer inválido' );
    }

    const token = authHeader.split(' ')[1];

    if (!token) { 
        throw new ValidationError( 'Token no encontrado' );
    }

    return token;
}