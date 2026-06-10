import portafolioRepository from '../repositories/portafolio.repository.js';
import { verificarToken } from '../security/jwt.handler.js'; 
import { AppError } from '../config/http_errors.js';
import UserRepository from '../repositories/user.repository.js';


export default class PortafolioService {

    private portafolioRepo = new portafolioRepository();
    private userRepo = new UserRepository();

    async createPortafolio(jwtToken: string, nombrePortafolio: string) {
        const payload = verificarToken(jwtToken);
        if (!payload) {throw new AppError('Token inválido', 401, 'INVALID_TOKEN');
        }
        const user = await this.userRepo.findById(payload.userId);
        if (!user) {throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
        }
        return await this.portafolioRepo.savePortafolio(payload.userId, nombrePortafolio);
    }

    async getPortafolios(jwtToken: string) {
        const payload = verificarToken(jwtToken);
        if (!payload) {throw new AppError('Token inválido', 401, 'INVALID_TOKEN');
        }
        const user = await this.userRepo.findById(payload.userId);
        if (!user) {throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
        }
        return await this.portafolioRepo.findAllByUserId(payload.userId);
    }

}