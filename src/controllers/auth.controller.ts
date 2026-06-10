import type { Request, Response } from 'express';
import AuthService from '../services/auth.service.js';
import { ValidationError } from '../config/http_errors.js';
import { getBearerToken } from '../handlers/bearer.handler.js';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
    const { nombre, correo, password } = req.body;
    if (!nombre || !correo || !password) {
        throw new ValidationError('Datos incompletos');
    }
    const user = await authService.register(nombre, correo, password);
    res.status(201).json({ message: user.message, user });
};

export const login = async (req: Request, res: Response) => {
    const { correo, password } = req.body;
    if (!correo || !password) {
        throw new ValidationError('Datos incompletos');
    }
    const user = await authService.login(correo, password);
    if (user.mfaToken) {
        return res
            .status(200)
            .json({
                message: user.message,
                mfaToken: user.mfaToken,
                mfa_requerido: user.mfa_requerido,
            });
    }
    return res
        .status(200)
        .json({
            message: user.message,
            token: user.token,
            mfa_requerido: user.mfa_requerido,
        });
};

export const verifyMfa = async (req: Request, res: Response) => {
    const token = getBearerToken(req);
    const jwt = await authService.verifyMfa(token, req.body.codigo_totp);
    return res
        .status(200)
        .json({ message: 'MFA verificado exitosamente', token: jwt });
};

export const setupMfa = async (req: Request, res: Response) => {
    const token = getBearerToken(req);
    const result = await authService.setupMfa(token);
    return res
        .status(200)
        .json({
            message:
                'Escanea el QR con Google Authenticator y confirma el código.',
            qrCode: result.qrCode,
        });
};

export const confirmMfa = async (req: Request, res: Response) => {
    const token = getBearerToken(req);
    const { codigoTOTP } = req.body;

    if (!codigoTOTP) {
        throw new ValidationError('Código TOTP es requerido');
    }

    if (codigoTOTP.length !== 6 || !/^\d+$/.test(codigoTOTP)) {
        throw new ValidationError('Código TOTP inválido.');
    }

    await authService.confirmMfa(token, codigoTOTP);
    return res.status(200).json({ message: 'MFA configurado exitosamente' });
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { correo } = req.body;
    if (!correo) {
        throw new ValidationError('Correo es requerido');
    }

    const result = await authService.solicitarRecuperacion(correo);
    res.status(200).json({ message: result.message });
};

export const resetPassword = async (req: Request, res: Response) => {
    const { idToken, token, nuevaPassword } = req.body;
    if (!idToken || !token || !nuevaPassword) {
        throw new ValidationError('Datos incompletos');
    }

    const result = await authService.restablecerPassword(
        Number(idToken),
        token,
        nuevaPassword
    );
    res.status(200).json({ message: result.message });
};
