import { beforeEach, describe, expect, it, vi } from 'vitest';

import InversionService from '../../../../services/inversion.service.js';

describe('InversionService - getPrecio', () => {
    let inversionService: InversionService;

    beforeEach(() => {
        inversionService = new InversionService();

        vi.clearAllMocks();
    });

    it('should return cryptocurrency price', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            json: async () => ({
                bitcoin: {
                    usd: 65000,
                },
            }),
        } as Response);

        const result = await inversionService.getPrecio('bitcoin');

        expect(result).toBe(65000);

        expect(global.fetch).toHaveBeenCalledOnce();
    });

    it('should throw CRYPTO_NOT_FOUND when cryptocurrency does not exist', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            json: async () => ({}),
        } as Response);

        await expect(
            inversionService.getPrecio('unknowncoin')
        ).rejects.toMatchObject({
            code: 'CRYPTO_NOT_FOUND',
        });
    });

    it('should propagate fetch error', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        await expect(inversionService.getPrecio('bitcoin')).rejects.toThrow(
            'Network error'
        );
    });

    it('should propagate json parsing error', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            json: async () => {
                throw new Error('Invalid JSON');
            },
        } as unknown as Response);

        await expect(inversionService.getPrecio('bitcoin')).rejects.toThrow(
            'Invalid JSON'
        );
    });
});
