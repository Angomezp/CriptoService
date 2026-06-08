import type { Request, Response } from 'express';
import PortafolioService from '../services/portafolio.service.js';
import { AppError } from '../config/http.errors.js';

const portafolioService = new PortafolioService();

export const crearPortafolio = async (req: Request, res: Response) => {
    const body = req.body;

    if (!body || !body.nombrePortafolio) {
        return res.status(400).json({message: 'Datos incompletos'});
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({message: 'No autorizado'});
        }
        const token = authHeader.split(' ')[1]!;
        const portafolio = await portafolioService.createPortafolio(token,body.nombrePortafolio);
        res.status(201).json({
            message: 'Portafolio creado exitosamente', portafolio});

    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
                details: error.details
            });
        }
        return res.status(500).json({
            message: 'Error del servidor al crear el portafolio'
        });
    }
};