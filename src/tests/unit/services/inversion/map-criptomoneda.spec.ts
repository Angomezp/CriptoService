import { beforeEach, describe, expect, it } from 'vitest';

import InversionService from '../../../../services/inversion.service.js';

describe('InversionService - mapcriptomoneda', () => {
    let inversionService: InversionService;

    beforeEach(() => {
        inversionService = new InversionService();
    });

    it('should map BTC to bitcoin', () => {
        const result = inversionService.mapcriptomoneda('BTC');

        expect(result).toBe('bitcoin');
    });

    it('should map ETH to ethereum', () => {
        const result = inversionService.mapcriptomoneda('ETH');

        expect(result).toBe('ethereum');
    });

    it('should map SOL to solana', () => {
        const result = inversionService.mapcriptomoneda('SOL');

        expect(result).toBe('solana');
    });

    it('should lowercase unknown cryptocurrencies', () => {
        const result = inversionService.mapcriptomoneda('DOGE');

        expect(result).toBe('doge');
    });

    it('should lowercase XRP', () => {
        const result = inversionService.mapcriptomoneda('XRP');

        expect(result).toBe('xrp');
    });

    it('should lowercase mixed case values', () => {
        const result = inversionService.mapcriptomoneda('DoGe');

        expect(result).toBe('doge');
    });
});
