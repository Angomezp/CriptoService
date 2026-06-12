import type { Request, Response } from 'express';
import PortafolioService from '../services/portafolio.service.js';
import { AppError } from '../config/http_errors.js';
import { getBearerToken } from '../handlers/bearer.handler.js';

const portafolioService = new PortafolioService();

export const crearPortafolio = async (req: Request, res: Response) => {
    const { nombrePortafolio } = req.body;

    if (!nombrePortafolio) {
        throw new AppError(
            'Nombre del portafolio es requerido',
            400,
            'VALIDATION_ERROR'
        );
    }
    const token = getBearerToken(req);

    const portafolio = await portafolioService.createPortafolio(
        token,
        nombrePortafolio
    );
    res.status(201).json({
        message: 'Portafolio creado exitosamente',
        portafolio,
    });
};

export const obtenerPortafolios = async (req: Request, res: Response) => {
    const token = getBearerToken(req);
    const portafolios = await portafolioService.getPortafolios(token);

    return res.status(200).json({
        portafolios,
    });
};
