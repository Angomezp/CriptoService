import type { Request, Response } from 'express';
import InversionService from '../services/inversion.service.js';
import { AppError } from '../config/http.errors.js';

const inversionService = new InversionService();

export const crearInversion = async (req: Request, res: Response) => {
    const body = req.body;

    if (!body || !body.nombrePortafolio || !body.criptomoneda || !body.cantidad) {
        return res.status(400).json({
            message: 'Datos incompletos'
        });
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No autorizado'
            });
        }

        const token = authHeader.split(' ')[1]!;

        const inversion = await inversionService.createInversion(
            body.nombrePortafolio,
            body.criptomoneda,
            body.cantidad,
            token
        );

        return res.status(201).json({
            message: 'Inversión creada exitosamente',
            inversion
        });

    } catch (error: any) {

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
                details: error.details
            });
        }

        return res.status(500).json({
            message: 'Error del servidor al crear la inversión'
        });
    }
};