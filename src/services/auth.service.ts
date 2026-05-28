import { hashear } from '../security/hashing.js';
import UserRepository, {} from '../repositories/user.repository.js';

export default class AuthService {

    private userRepo: UserRepository;

    constructor() {
        this.userRepo = new UserRepository();
    }

    public async register(nombre: string, correo: string, password: string) {
        const existingUser = await this.userRepo.findByEmail(correo);
        if (existingUser) {
            throw new Error('El correo ya está registrado');
        }

        const hashedPassword = await hashear(password);
        const user = await this.userRepo.createUser({ NombreCompleto: nombre, Correo: correo, PasswordHash: hashedPassword });

        return { id: user.id_usuario, nombre: user.NombreCompleto, correo: user.Correo };
    }

    public async login(nombre: string, password: string) {
        // Implementation for user login
    }


}