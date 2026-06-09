import type { Request, Response } from 'express';
import AuthService  from '../services/auth.service.js';
import { AppError, ValidationError } from '../config/http_errors.js';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
    const body = req.body;
    if (!body || !body.nombre || !body.password || !body.correo) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }
    try {
        const user = await authService.register(body.nombre, body.correo, body.password);
        res.status(201).json({ message: user.message, user });
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
    if (!body || !body.correo || !body.password) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }
    try {
        const user = await authService.login(body.correo, body.password);

        if (user.mfaToken) {
            return res.status(200).json({ message: user.message, mfaToken: user.mfaToken, mfa_requerido: user.mfa_requerido });
        }
        res.status(200).json({ message: user.message, token: user.token, mfa_requerido: user.mfa_requerido });

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

export const verifyMfa = async (req: Request, res: Response) => {
    const authHeaders = req.headers.authorization;
    const body = req.body;
    if (!authHeaders || !authHeaders.startsWith('Bearer ') || !body || !body.codigo_totp) {
        return res.status(400).json({ message: 'Datos incompletos o mal formato de token' });
    }
    try {
        const token = await authService.verifyMfa(authHeaders.split(' ')[1]!, body.codigo_totp);
        res.status(200).json({ message: 'MFA verificado exitosamente', token });
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
                details: error.details,
            });
        }   
        return res.status(500).json({ message: 'Error del servidor al verificar MFA' });
    }

};

export const setupMfa = async (req: Request, res: Response) => {
    const authHeaders = req.headers.authorization;
    if (!authHeaders || !authHeaders.startsWith('Bearer ')) {
        return res.status(400).json({ message: 'No autorizado o mal formato de token' });
    }
    try {
        const token = authHeaders.split(' ')[1]!;
        const result = await authService.setupMfa(token);
        res.status(200).json({ message: 'Escanea el QR con Google Authenticator y confirma el código.', qrCode: result.qrCode });
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
                details: error.details,
            });
        }
        return res.status(500).json({ message: 'Error del servidor al configurar MFA' });
    }
};

export const confirmMfa = async (req: Request, res: Response) => {
    const authHeaders = req.headers.authorization;
    const body = req.body;

    if (!authHeaders || !authHeaders.startsWith('Bearer ') || !body || !body.codigo_totp) {
        return res.status(400).json({ message: 'Datos incompletos o mal formato de token' });
    }

    if (body.codigo_totp.length !== 6 || !/^\d+$/.test(body.codigo_totp)) {
        return res.status(400).json({ message: 'Código TOTP inválido.' });
    }

    try {
        const token = authHeaders.split(' ')[1]!;
        await authService.confirmMfa(token, body.codigo_totp);
        res.status(200).json({ message: 'MFA configurado exitosamente' });
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
                details: error.details,
            });
        }
        return res.status(500).json({ message: 'Error del servidor al confirmar MFA' });
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    const body = req.body;
    if (!body || !body.correo) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }
    try {
        const result = await authService.solicitarRecuperacion(body.correo);
        res.status(200).json({ message: result.message });
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
                details: error.details,
            });
        }
        return res.status(500).json({ message: 'Error del servidor al procesar la solicitud' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const body = req.body;
    if (!body || !body.idToken || !body.token || !body.nuevaPassword) {
        return res.status(400).json({ message: 'Datos incompletos. Se requieren: idToken, token y nuevaPassword' });
    }
    try {
        const result = await authService.restablecerPassword(
            Number(body.idToken),
            body.token,
            body.nuevaPassword
        );
        res.status(200).json({ message: result.message });
    } catch (error: any) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
                details: error.details,
            });
        }
        return res.status(500).json({ message: 'Error del servidor al restablecer la contraseña' });
    }
};