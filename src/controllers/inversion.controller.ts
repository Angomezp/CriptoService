import type { Request, Response } from 'express';
import InversionService from '../services/inversion.service.js';
import { AppError } from '../config/http_errors.js';
import { getBearerToken } from '../handlers/bearer.handler.js';

const inversionService = new InversionService();

export const crearInversion = async (req: Request, res: Response) => {
    const { nombrePortafolio, criptomoneda, cantidad } = req.body;

    if (!nombrePortafolio || !criptomoneda || !cantidad) {
        throw new AppError('Datos incompletos', 400, 'VALIDATION_ERROR');
    }

    const token = getBearerToken(req);

    const inversion = await inversionService.createInversion(
        nombrePortafolio,
        criptomoneda,
        cantidad,
        token
    );

    return res.status(201).json({
        message: 'Inversión creada exitosamente',
        inversion,
    });
};

export const obtenerInversiones = async (req: Request, res: Response) => {
    const { nombrePortafolio } = req.body;

    if (!nombrePortafolio) {
        throw new AppError(
            'Nombre del portafolio es requerido',
            400,
            'VALIDATION_ERROR'
        );
    }

    const token = getBearerToken(req);

    const inversiones = await inversionService.getInversiones(
        nombrePortafolio,
        token
    );

    return res.status(200).json({
        message: 'Inversiones obtenidas exitosamente',
        inversiones,
    });
};

export const obtenerInversion = async (req: Request, res: Response) => {
    const idInversion = Number(req.params.idInversion);

    if (!idInversion || isNaN(idInversion)) {
        throw new AppError('ID de inversión inválido', 400, 'VALIDATION_ERROR');
    }

    const token = getBearerToken(req);

    const inversion = await inversionService.getInversionById(
        idInversion,
        token
    );

    return res.status(200).json({
        inversion,
    });
};
