import portafolioRepository from '../repositories/portafolio.repository.js';
import InversionRepository from '../repositories/inversion.repository.js';
import { verificarToken } from '../security/jwt.handler.js'; 
import { AppError, ValidationError } from '../config/http_errors.js';

export default class InversionService {

    private inversionRepo = new InversionRepository();
    private portafolioRepo = new portafolioRepository();

    async getPrecio(criptomoneda: string) {

        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${criptomoneda}&vs_currencies=usd`);

        const data = await res.json();

        if (!data[criptomoneda]) {
            throw new AppError('Criptomoneda no encontrada', 404, 'CRYPTO_NOT_FOUND');
        }

        return data[criptomoneda].usd;
    }

    async validateCantidad(cantidad: number) {
        if (cantidad <= 0) {
            throw new ValidationError('Cantidad inválida');
        }
    }

    async calcularCostoInicial(criptomoneda: string, cantidad: number) {
        const precioUnitario = await this.getPrecio(criptomoneda);
        return cantidad * precioUnitario;
    }

    mapcriptomoneda(criptomoneda: string) {
        const idMap: Record<string, string> = { BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana' };
        return idMap[criptomoneda] || criptomoneda.toLowerCase();
    }

    async createInversion( nombrePortafolio: string, criptomoneda: string, cantidad: number, jwtToken: string) 
    {   
        const payload = verificarToken(jwtToken);
        const idPortafolio = await this.portafolioRepo.findIdByUserAndName(payload.userId, nombrePortafolio);
        if (!idPortafolio) {
            throw new AppError('Portafolio no encontrado', 404, 'PORTAFOLIO_NOT_FOUND');
        }
        const cryptoNormalizada = this.mapcriptomoneda(criptomoneda);
        const costoInicial = await this.calcularCostoInicial(cryptoNormalizada, cantidad);
        return await this.inversionRepo.saveInversion(
            idPortafolio,
            cryptoNormalizada,
            cantidad,
            costoInicial
        );
    }

    async getInversiones( nombrePortafolio: string, jwtToken: string) {
        const payload = verificarToken(jwtToken);
        const idPortafolio = await this.portafolioRepo.findIdByUserAndName(payload.userId, nombrePortafolio);
        if (!idPortafolio) {
            throw new AppError('Portafolio no encontrado', 404, 'PORTAFOLIO_NOT_FOUND');
        }
        const esPropietario = await this.portafolioRepo.existsByUserAndName( payload.userId, nombrePortafolio );
        if (!esPropietario) { throw new AppError( 'No tienes acceso a este portafolio', 403, 'FORBIDDEN');}
        return await this.inversionRepo.findByPortafolio(idPortafolio);
    }

    async getInversionById( idInversion: number, jwtToken: string) {
        const payload = verificarToken(jwtToken);
        const inversion = await this.inversionRepo.findById(idInversion);
        if (!inversion) {
            throw new AppError('Inversión no encontrada', 404, 'INVERSION_NOT_FOUND');
        }
        const esPropietario = await this.inversionRepo.existsByIdAndUser( idInversion, payload.userId );
        if (!esPropietario) { throw new AppError( 'No tienes acceso a esta inversión', 403, 'FORBIDDEN');}
        return inversion;
    }
}    