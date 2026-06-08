import portafolioRepository from '../repositories/portafolio.repository.js';
import portafolioService from './portafolio.service.js';
import InversionRepository from '../repositories/inversion.repository.js';
import { verificarToken } from '../security/jwt.handler.js'; 
import { AppError, ConflictError, ValidationError } from '../config/http.errors.js';

export default class InversionService {

    private portafolioServ = new portafolioService();
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
        const idPortafolio = await this.portafolioRepo.findIdByNombre(nombrePortafolio);
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
}