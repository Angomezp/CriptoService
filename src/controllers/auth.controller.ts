import type { Request, Response } from 'express';
import AuthService  from '../services/auth.service.js';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
    if (!req.body.nombre || !req.body.password || !req.body.correo) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }
    try {
        const validRegister = await authService.register(req.body.nombre, req.body.correo, req.body.password);
        if (!validRegister) {
            return res.status(400).json({ message: 'Registro fallido' });
        }
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Error del servidor al registrar usuario', error: errorMessage });
    }
};

export const login = async (req: Request, res: Response) => {
    if (!req.body.nombre || !req.body.password) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }
    try {
        const user = await authService.login(req.body.nombre, req.body.password);
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(401).json({ message: 'Credenciales inválidas', error: errorMessage });
    }
};
