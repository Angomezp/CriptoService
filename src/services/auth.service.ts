import { hashear, verificar } from '../security/hashing.js';
import UserRepository from '../repositories/user.repository.js';
import { AppError, ConflictError, ValidationError } from '../config/http.errors.js';
import * as jwtHandler from '../security/jwt.handler.js';
import * as totpHandler from '../security/totp.handler.js';
import * as encryptionHandler from '../security/encryption.js';

export default class AuthService {

    private userRepo: UserRepository;

    constructor() {
        this.userRepo = new UserRepository();
    }

    public async register(nombre: string, correo: string, password: string) {
        try {
            const existingUser = await this.userRepo.findByEmail(correo);
            if (existingUser) {
                throw new ConflictError('El usuario ya está registrado');
            }
            const passwordValidation = this.isValidPassword(password);
            if (passwordValidation !== true) {
                throw new ValidationError(passwordValidation as string);
            }
            const emailValid = this.isValidEmail(correo);
            if (!emailValid) {
                throw new ValidationError('El correo no es válido');
            }

            const hashedPassword = await hashear(password);
            const user = await this.userRepo.createUser({ nombre: nombre, correo: correo, passwordHash: hashedPassword });

            return { message: 'Usuario registrado exitosamente', nombre: user.nombre, correo: user.correo };
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al registrar el usuario', 500, 'REGISTER_ERROR', {
                originalMessage: (error as Error)?.message});
        }
    }

    public async login(correo: string, password: string) {
        try {
            const user = await this.userRepo.findByEmail(correo);
            if (!user) {
                throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
            }
            const passwordValid = await verificar(password, user.passwordHash);
            if (!passwordValid) {
                throw new AppError('Contraseña incorrecta', 401, 'INVALID_PASSWORD');
            }
            
            if (user.mfaEnabled) {
                const mfaToken = jwtHandler.generarMfaToken(user.idUsuario);
                return { mfaToken: mfaToken, message: 'Contraseña correcta, ingresa el código MFA' , mfa_requerido : true};
            }

            const token = jwtHandler.generarToken(user.idUsuario);

            return { message: 'Inicio de sesión exitoso', token: token, mfa_requerido : false};

        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al iniciar sesión', 500, 'LOGIN_ERROR', {
                originalMessage: (error as Error)?.message});
        }
    }

    public async verifyMfa(mfaToken: string, codigo_totp: string) {
        try {
            const payload = jwtHandler.verificarMfaToken(mfaToken);
            if (!payload || payload.scope !== 'PRE_AUTH') {
                throw new AppError('Token MFA inválido', 401, 'INVALID_MFA_TOKEN');
            }

            const user = await this.userRepo.findById(payload.userId);
            if (!user) {
                throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
            }

            if (!user.totpSecret) {
                throw new AppError('MFA no configurado para el usuario', 400, 'MFA_NOT_CONFIGURED');
            }

            const secretoDesc = encryptionHandler.descifrar(user.totpSecret);
            const valido = await totpHandler.verificarTokenTOTP(codigo_totp, secretoDesc);
            if (!valido) {
                throw new AppError('Código MFA inválido', 401, 'INVALID_MFA_CODE');
            }

            const token = jwtHandler.generarToken(user.idUsuario);
            return token;

        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al verificar MFA', 500, 'VERIFY_MFA_ERROR', {
                originalMessage: (error as Error)?.message,
            });
        }
    }

    public async setupMfa(jwtToken: string) {
        const payload = jwtHandler.verificarToken(jwtToken);
        if (!payload) {
            throw new AppError('Token inválido', 401, 'INVALID_TOKEN');
        }
        const user = await this.userRepo.findById(payload.userId);
        if (!user) {
            throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
        }
        const totp = totpHandler.generarSecret(); 
        const TOTPSecret = encryptionHandler.cifrar(totp);
        await this.userRepo.updateMfaSecret(user.idUsuario, TOTPSecret, false);
        const uri = totpHandler.generarUriTOTP(user.correo, totp);
        const qrCode = await totpHandler.generarCodigoQR(uri);
        return { qrCode };
    }

    public async confirmMfa(jwtToken: string, codigo_totp: string) {
        const payload = jwtHandler.verificarToken(jwtToken);
        if (!payload) {
            throw new AppError('Token inválido', 401, 'INVALID_TOKEN');
        }
        const user = await this.userRepo.findById(payload.userId);
        if (!user) {
            throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
        }
        if (!user.totpSecret) {
            throw new AppError('MFA no configurado para el usuario', 400, 'MFA_NOT_CONFIGURED');
        }
        const secretoDesc = encryptionHandler.descifrar(user.totpSecret);
        const valido = await totpHandler.verificarTokenTOTP(codigo_totp, secretoDesc);
        if (!valido) {
            throw new AppError('Código MFA inválido', 401, 'INVALID_MFA_CODE');
        }
        await this.userRepo.updateMfaSecret(user.idUsuario, user.totpSecret!, true);
    }


    private isValidPassword(password: string): String | boolean {
        if (password.length < 8) {
            return "La contraseña debe tener al menos 8 caracteres";
        }
        if (!/[A-Z]/.test(password)) {
            return "La contraseña debe contener al menos una letra mayúscula";
        }

        if (!/[a-z]/.test(password)) {
            return "La contraseña debe contener al menos una letra minúscula";
        }

        if (!/[0-9]/.test(password)) {
            return "La contraseña debe contener al menos un número";
        }
        if (!/[!@#$%^&*(),.?":{}|/<>]/.test(password)) {
            return "La contraseña debe contener al menos un carácter especial";
        }
        if (/\s/.test(password)) {
            return "La contraseña no debe contener espacios";
        }
        return true; 
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

}