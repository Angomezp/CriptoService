import type { Request, Response } from 'express';
import AuthService  from '../services/auth.service.js';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
    const body = req.body;
    if (!body || !body.nombre || !body.password || !body.correo) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }
    try {
        const validRegister = await authService.register(body.nombre, body.correo, body.password);
        if (!validRegister) {
            return res.status(400).json({ message: 'Registro fallido' });
        }
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error del servidor al registrar usuario', error });
    }
};

export const login = async (req: Request, res: Response) => {
    const body = req.body;
    if (!body || !body.nombre || !body.password) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }
    try {
        const user = await authService.login(body.nombre, body.password);
        res.status(200).json({ message: 'Login successful', user });
    } catch (error: any) {
        res.status(401).json({ message: 'Credenciales inválidas', error });
    }
};
