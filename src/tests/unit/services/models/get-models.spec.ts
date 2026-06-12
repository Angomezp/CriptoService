import { vi } from 'vitest';

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        isAxiosError: vi.fn(),
    },
}));

import { beforeEach, describe, expect, it } from 'vitest';
import axios from 'axios';

import { getModels } from '../../../../services/models.service.js';
import { resetMocks } from './model.mocks.js';

const mockAxios = axios as any;
describe('getModels', () => {
    beforeEach(() => {
        resetMocks();
    });

    it('should return models', async () => {
        const models = [
            {
                id: 1,
                symbol: 'BTC'
            },
            {
                id: 2,
                symbol: 'ETH'
            }
        ];

        mockAxios.get.mockResolvedValue({
            data: models
        });

        const result = await getModels();

        expect(result).toEqual(models);

        expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should throw ML_SERVICE_ERROR on axios error', async () => {
        mockAxios.get.mockRejectedValue({
            response: {
                status: 500,
                data: {
                    detail: 'Service unavailable'
                }
            }
        });

        mockAxios.isAxiosError.mockReturnValue(true);

        await expect(
            getModels()
        ).rejects.toMatchObject({
            code: 'ML_SERVICE_ERROR',
            statusCode: 500,
            message: 'Service unavailable'
        });
    });

    it('should rethrow unknown error', async () => {
        const error = new Error('Unknown');

        mockAxios.get.mockRejectedValue(error);

        mockAxios.isAxiosError.mockReturnValue(false);

        await expect(
            getModels()
        ).rejects.toThrow('Unknown');
    });
});