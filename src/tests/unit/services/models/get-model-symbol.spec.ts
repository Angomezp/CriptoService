import { vi, beforeEach, describe, expect, it } from 'vitest';

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        isAxiosError: vi.fn(),
    },
}));

import axios from 'axios';

import { getModelBySymbol } from '../../../../services/models.service.js';

const mockAxios = axios as any;

describe('getModelBySymbol', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAxios.isAxiosError.mockReturnValue(false);
    });

    it('should return model by symbol', async () => {
        const model = {
            id: 1,
            symbol: 'BTC',
        };

        mockAxios.get.mockResolvedValue({
            data: model,
        });

        const result = await getModelBySymbol('btc');

        expect(result).toEqual(model);

        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get.mock.calls[0][0]).toContain('/models/symbol/BTC');
    });

    it('should throw ValidationError when symbol is empty', async () => {
        await expect(getModelBySymbol('')).rejects.toThrow(
            'Symbol is required'
        );
    });

    it('should throw ML_SERVICE_ERROR on axios error', async () => {
        mockAxios.get.mockRejectedValue({
            response: {
                status: 404,
                data: {
                    detail: 'Model not found',
                },
            },
        });

        mockAxios.isAxiosError.mockReturnValue(true);

        await expect(getModelBySymbol('BTC')).rejects.toMatchObject({
            code: 'ML_SERVICE_ERROR',
            statusCode: 404,
        });
    });

    it('should rethrow unknown error', async () => {
        const error = new Error('Unknown');

        mockAxios.get.mockRejectedValue(error);

        mockAxios.isAxiosError.mockReturnValue(false);

        await expect(getModelBySymbol('BTC')).rejects.toThrow('Unknown');
    });
});
