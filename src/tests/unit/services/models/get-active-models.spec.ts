import { beforeEach, describe, expect, it } from 'vitest';

import { mockAxios, resetMocks } from './model.mocks.js';
import { getAllActiveModels } from '../../../../services/models.service.js';

describe('getAllActiveModels', () => {
    beforeEach(() => {
        resetMocks();
    });

    it('should return active models', async () => {
        const models = [
            {
                id: 1,
                symbol: 'BTC',
                active: true,
            },
            {
                id: 2,
                symbol: 'ETH',
                active: true,
            },
        ];

        mockAxios.get.mockResolvedValue({
            data: models,
        });

        const result = await getAllActiveModels();

        expect(result).toEqual(models);

        expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should throw ML_SERVICE_ERROR on axios error', async () => {
        const error = {
            response: {
                status: 500,
                data: {
                    detail: 'Service unavailable',
                },
            },
        };

        mockAxios.get.mockRejectedValue(error);
        mockAxios.isAxiosError.mockReturnValue(true);

        await expect(getAllActiveModels()).rejects.toMatchObject({
            code: 'ML_SERVICE_ERROR',
            statusCode: 500,
        });
    });

    it('should rethrow unknown error', async () => {
        const error = new Error('Unknown');

        mockAxios.get.mockRejectedValue(error);
        mockAxios.isAxiosError.mockReturnValue(false);

        await expect(getAllActiveModels()).rejects.toThrow('Unknown');
    });
});
