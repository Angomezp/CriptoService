import { hashear, verificar } from '../security/hashing.js';
import UserRepository from '../repositories/user.repository.js';
import { AppError, ConflictError, UnauthorizedError, ValidationError } from '../config/http_errors.js';
import * as jwtHandler from '../security/jwt.handler.js';
import * as totpHandler from '../security/totp.handler.js';
import * as encryptionHandler from '../security/encryption.js';
import { env } from '../config/env.js';
import crypto from 'crypto';
import { PasswordResetToken } from '../entities/password_reset.entity.js';
import { Database } from '../config/database.js';
import { enviarCorreoRecuperacion, enviarAlertaBloqueo } from './mailer.service.js';
import { User } from '../entities/user.entity.js';


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
                throw new UnauthorizedError('Credenciales inválidas', 'INVALID_CREDENTIALS');
            }

            if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
                const minutosRestantes = Math.ceil(
                    (user.bloqueadoHasta.getTime() - Date.now()) / 60000
                );
                throw new AppError(
                    `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutosRestantes} minutos.`,
                    423,
                    'ACCOUNT_LOCKED'
                );
            }

            const passwordValid = await verificar(password, user.passwordHash);

            if (!passwordValid) {
                await this.userRepo.incrementarIntentos(user.idUsuario);
                const intentosActuales = user.intentosFallidos + 1;

                if (intentosActuales >= env.maxIntentosLogin) {
                    await this.userRepo.bloquearUsuario(user.idUsuario, env.bloqueoMinutos);

                     enviarAlertaBloqueo(user.correo, env.bloqueoMinutos, env.appUrl).catch((err) => {
                        console.error('Error enviando alerta de bloqueo:', err);
                    });

                    throw new AppError(
                        `Cuenta bloqueada por múltiples intentos fallidos. Intenta de nuevo en ${env.bloqueoMinutos} minutos.`,
                        423,
                        'ACCOUNT_LOCKED'
                    );
                }

                throw new AppError(
                    `Credenciales inválidas. Intentos restantes: ${env.maxIntentosLogin - intentosActuales}`,
                    401,
                    'INVALID_CREDENTIALS'
                );
            }

            await this.userRepo.resetearIntentos(user.idUsuario);

            if (user.mfaEnabled) {
                const mfaToken = jwtHandler.generarMfaToken(user.idUsuario);
                return {
                    mfaToken: mfaToken,
                    message: 'Contraseña correcta, ingresa el código MFA',
                    mfa_requerido: true
                };
            }

            const token = jwtHandler.generarToken(user.idUsuario);
            return { message: 'Inicio de sesión exitoso', token: token, mfa_requerido: false };

        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al iniciar sesión', 500, 'LOGIN_ERROR', {
                originalMessage: (error as Error)?.message
            });
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

    public async solicitarRecuperacion(correo: string) {
        try {
            const user = await this.userRepo.findByEmail(correo);

            if (!user) {
                return { message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' };
            }

            const token = crypto.randomBytes(32).toString('hex');

            const tokenHash = await hashear(token);

            const expiraEn = new Date(Date.now() + env.passwordResetTtlMin * 60 * 1000);

            const tokenRepo = Database.getInstance().getRepository(PasswordResetToken);
            const nuevoToken = tokenRepo.create({
                usuario: user,
                tokenHash: tokenHash,
                expiraEn: expiraEn,
                usado: false,
            });
            const tokenGuardado = await tokenRepo.save(nuevoToken);

            const link = `${env.appUrl}/reset-password?token=${token}&id=${tokenGuardado.idToken}`;

            enviarCorreoRecuperacion(user.correo, link).catch((err) => {
                console.error('Error enviando correo de recuperación:', err);
            });

            return { message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' };

        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al procesar la solicitud', 500, 'FORGOT_PASSWORD_ERROR', {
                originalMessage: (error as Error)?.message,
            });
        }
    }

    public async restablecerPassword(idToken: number, token: string, nuevaPassword: string) {
        try {
            const tokenRepo = Database.getInstance().getRepository(PasswordResetToken);

            const registro = await tokenRepo.findOne({
                where: { idToken: idToken },
                relations: { usuario: true },
            });

            if (!registro) {
                throw new AppError('Token inválido o expirado', 400, 'INVALID_RESET_TOKEN');
            }

            if (registro.usado) {
                throw new AppError('Este enlace ya fue utilizado', 400, 'TOKEN_ALREADY_USED');
            }

            if (registro.expiraEn < new Date()) {
                throw new AppError('El enlace ha expirado', 400, 'TOKEN_EXPIRED');
            }

            const tokenValido = await verificar(token, registro.tokenHash);
            if (!tokenValido) {
                throw new AppError('Token inválido', 400, 'INVALID_RESET_TOKEN');
            }

            const validacion = this.isValidPassword(nuevaPassword);
            if (validacion !== true) {
                throw new ValidationError(validacion as string);
            }

            const usuario = registro.usuario;
            usuario.passwordHash = await hashear(nuevaPassword);

            usuario.intentosFallidos = 0;
            usuario.bloqueadoHasta = null;

            registro.usado = true;

            const userTypeOrmRepo = Database.getInstance().getRepository(User);
            await userTypeOrmRepo.save(usuario);
            await tokenRepo.save(registro);

            return { message: 'Contraseña actualizada exitosamente' };

        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al restablecer la contraseña', 500, 'RESET_PASSWORD_ERROR', {
                originalMessage: (error as Error)?.message,
            });
        }
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