import { beforeEach, describe, expect, it } from 'vitest';

import { mockAxios, resetMocks } from './model.mocks.js';
import { getAllActiveModelsBySymbol } from '../../../../services/models.service.js';

describe('getAllActiveModelsBySymbol', () => {
    beforeEach(() => {
        resetMocks();
    });

    it('should return active models by symbol', async () => {
        const model = {
            id: 1,
            symbol: 'BTC',
            active: true,
        };

        mockAxios.get.mockResolvedValue({
            data: model,
        });

        const result = await getAllActiveModelsBySymbol('btc');

        expect(result).toEqual(model);

        expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should throw ValidationError when symbol is empty', async () => {
        await expect(
            getAllActiveModelsBySymbol('')
        ).rejects.toMatchObject({
            message: 'Symbol is required',
        });
    });

    it('should throw ML_SERVICE_ERROR on axios error', async () => {
        const error = {
            response: {
                status: 404,
                data: {
                    detail: 'Model not found',
                },
            },
        };

        mockAxios.get.mockRejectedValue(error);
        mockAxios.isAxiosError.mockReturnValue(true);

        await expect(
            getAllActiveModelsBySymbol('BTC')
        ).rejects.toMatchObject({
            code: 'ML_SERVICE_ERROR',
            statusCode: 404,
        });
    });

    it('should rethrow unknown error', async () => {
        const error = new Error('Unknown');

        mockAxios.get.mockRejectedValue(error);
        mockAxios.isAxiosError.mockReturnValue(false);

        await expect(
            getAllActiveModelsBySymbol('BTC')
        ).rejects.toThrow('Unknown');
    });
});