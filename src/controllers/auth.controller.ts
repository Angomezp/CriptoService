import type { Request, Response } from 'express';
import AuthService  from '../services/auth.service.js';
import { AppError } from '../config/http.errors.js';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
    const body = req.body;
    if (!body || !body.nombre || !body.password || !body.correo) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }
    try {
        const user = await authService.register(body.nombre, body.correo, body.password);
        res.status(201).json({ message: 'Usuario registrado exitosamente', user });
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
                details: error.details,
            });
        }
        return res.status(500).json({ message: 'Error del servidor al registrar usuario' });
    }
};

export const login = async (req: Request, res: Response) => {
    const body = req.body;
    if (!body || !body.nombre || !body.password) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }
    try {
        const user = await authService.login(body.nombre, body.password);
        res.status(200).json({ message: 'Inicio de sesión exitoso', user });
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
                details: error.details,
            });
        }
        return res.status(500).json({ message: 'Error del servidor al iniciar sesión' });
    }
};
