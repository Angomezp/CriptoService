import { Database } from '../config/database.js';
import { User } from '../entities/user.entity.js';

export default class UserRepository {
    private userRepo = Database.getInstance().getRepository(User);

    async createUser(user: Partial<User>): Promise<User> {
        const newUser = this.userRepo.create(user);
        return await this.userRepo.save(newUser);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepo.findOne({ where: { correo: email } });
    }

    async findById(id: number): Promise<User | null> {
        return await this.userRepo.findOne({ where: { idUsuario: id } });
    }

    async updateMfaSecret(id: number, encryptedSecret: string, enabled: boolean): Promise<User> {
        const user = await this.findById(id);
        if (!user) throw new Error('Usuario no encontrado');
        user.totpSecret = encryptedSecret;
        user.mfaEnabled = enabled;
        return await this.userRepo.save(user);
    }
    

}