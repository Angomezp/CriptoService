import { Database } from '../config/database.js';
import { Inversion } from '../entities/inversion.entity.js';

export default class InversionRepository {

    private inversionRepo =
        Database.getInstance().getRepository(Inversion);

    async saveInversion( idPortafolio: number, criptomoneda: string, cantidad: number, costoInicial: number): Promise<Inversion> {
        const newInversion = this.inversionRepo.create({ idPortafolio, criptomoneda, cantidad, costoInicial});
        return await this.inversionRepo.save(newInversion);
    }
    
}