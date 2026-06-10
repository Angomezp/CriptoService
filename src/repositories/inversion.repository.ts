import { Database } from '../config/database.js';
import { Inversion } from '../entities/inversion.entity.js';

export default class InversionRepository {
    private inversionRepo = Database.getInstance().getRepository(Inversion);

    async saveInversion(
        idPortafolio: number,
        criptomoneda: string,
        cantidad: number,
        costoInicial: number
    ): Promise<Inversion> {
        const newInversion = this.inversionRepo.create({
            idPortafolio,
            criptomoneda,
            cantidad,
            costoInicial,
        });
        return await this.inversionRepo.save(newInversion);
    }

    async findByPortafolio(idPortafolio: number): Promise<Inversion[]> {
        return await this.inversionRepo.find({ where: { idPortafolio } });
    }

    async findById(idInversion: number): Promise<Inversion | null> {
        return await this.inversionRepo.findOne({ where: { idInversion } });
    }

    async existsByIdAndUser(
        idInversion: number,
        idUsuario: number
    ): Promise<boolean> {
        const inversion = await this.inversionRepo.findOne({
            where: { idInversion, portafolio: { idUsuario } },
            relations: { portafolio: true },
        });
        return !!inversion;
    }
}
