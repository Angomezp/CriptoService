import { hashear } from '../security/hashing.js';
import UserRepository, {} from '../repositories/user.repository.js';
import { AppError, ConflictError, ValidationError } from '../config/http.errors.js';

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
            const user = await this.userRepo.createUser({ NombreCompleto: nombre, Correo: correo, PasswordHash: hashedPassword });

            return { nombre: user.NombreCompleto, correo: user.Correo };
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al registrar el usuario', 500, 'REGISTER_ERROR', {
                originalMessage: (error as Error)?.message});
        }
    }

    public async login(nombre: string, password: string) {
        // Implementation for user login
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