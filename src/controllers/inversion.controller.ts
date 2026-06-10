import type { Request, Response } from 'express';
import InversionService from '../services/inversion.service.js';
import { AppError } from '../config/http_errors.js';

const inversionService = new InversionService();

export const crearInversion = async (req: Request, res: Response) => {
    const body = req.body;

    if (
        !body ||
        !body.nombrePortafolio ||
        !body.criptomoneda ||
        !body.cantidad
    ) {
        return res.status(400).json({
            message: 'Datos incompletos',
        });
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No autorizado',
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
            inversion,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
                details: error.details,
            });
        }

        return res.status(500).json({
            message: 'Error del servidor al crear la inversión',
        });
    }
};

export const obtenerInversiones = async (req: Request, res: Response) => {
    const nombrePortafolio = req.body.nombrePortafolio as string;

    if (!nombrePortafolio) {
        return res.status(400).json({
            message: 'nombrePortafolio es requerido',
        });
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No autorizado',
            });
        }

        const token = authHeader.split(' ')[1]!;

        const inversiones = await inversionService.getInversiones(
            nombrePortafolio,
            token
        );

        return res.status(200).json({
            message: 'Inversiones obtenidas exitosamente',
            inversiones,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
                details: error.details,
            });
        }

        return res.status(500).json({
            message: 'Error del servidor al obtener las inversiones',
        });
    }
};

export const obtenerInversion = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No autorizado',
            });
        }

        const token = authHeader.split(' ')[1]!;

        const idInversion = Number(req.params.idInversion);

        if (isNaN(idInversion)) {
            return res.status(400).json({
                message: 'ID de inversión inválido',
            });
        }

        const inversion = await inversionService.getInversionById(
            idInversion,
            token
        );

        return res.status(200).json({
            inversion,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
                details: error.details,
            });
        }

        return res.status(500).json({
            message: 'Error del servidor al obtener la inversión',
        });
    }
};
