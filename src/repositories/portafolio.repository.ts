import { Database } from '../config/database.js';
import { Portafolio } from '../entities/portafolio.entity.js';

export default class PortafolioRepository {

    private portafolioRepo = Database.getInstance().getRepository(Portafolio);

    async savePortafolio(idUsuario: number, nombrePortafolio: string): Promise<Portafolio> {
        const newportafolio = this.portafolioRepo.create({ idUsuario, nombrePortafolio});
        return await this.portafolioRepo.save(newportafolio);
    }

    async findIdByNombre(nombrePortafolio: string): Promise<number | null> {
    const result = await this.portafolioRepo.findOne({ select: { idPortafolio: true }, where: { nombrePortafolio }});
    return result ? result.idPortafolio : null;
}

    async findById(id: number): Promise<Portafolio | null> {
        return await this.portafolioRepo.findOne({ where: { idPortafolio: id } });
    }

    async findIdByUserAndName( idUsuario: number, nombrePortafolio: string ): Promise<number | null> {
        const portafolio = await this.portafolioRepo.findOne({ where: { idUsuario, nombrePortafolio }, select: { idPortafolio: true }});
        return portafolio ? portafolio.idPortafolio : null;
    }

    async existsByUserAndName( idUsuario: number, nombrePortafolio: string): Promise<boolean> {
        const portafolio = await this.portafolioRepo.findOne({ where: { idUsuario, nombrePortafolio }});
        return !!portafolio;
    }

    async findAllByUserId(idUsuario: number): Promise<Portafolio[]> {
        return await this.portafolioRepo.find({ where: { idUsuario } });
    }

    
}