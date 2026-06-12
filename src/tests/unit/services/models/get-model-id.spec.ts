import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        isAxiosError: vi.fn(),
    },
}));

import { getModelById } from '../../../../services/models.service.js';
import axios from 'axios';

const mockAxios = axios as any;

describe('getModelById', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return model by id', async () => {
        const model = {
            id: 1,
            symbol: 'BTC',
        };

        mockAxios.get.mockResolvedValue({
            data: model,
        });

        const result = await getModelById(1);

        expect(result).toEqual(model);

        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get).toHaveBeenCalledWith(
            expect.stringContaining('/models/id/1'),
            expect.any(Object)
        );
    });

    it('should throw ValidationError when id is invalid', async () => {
        await expect(
            getModelById(0)
        ).rejects.toMatchObject({
            message: 'Invalid model ID',
        });

        expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when id is negative', async () => {
        await expect(
            getModelById(-1)
        ).rejects.toMatchObject({
            message: 'Invalid model ID',
        });

        expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when id is not integer', async () => {
        await expect(
            getModelById(1.5)
        ).rejects.toMatchObject({
            message: 'Invalid model ID',
        });

        expect(mockAxios.get).not.toHaveBeenCalled();
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

        await expect(
            getModelById(999)
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
            getModelById(1)
        ).rejects.toThrow('Unknown');
    });
});