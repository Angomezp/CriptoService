import { beforeEach, describe, expect, it } from 'vitest';

import { mockAxios, resetAxiosMocks } from '../../mocks/axios.mocks.js';
import { samplePrediction } from '../../fixtures/prediction.fixture.js';

import {
    predict,
    predictHour,
} from '../../../../services/prediction.service.js';

describe('Prediction Service', () => {
    beforeEach(() => {
        resetAxiosMocks();
    });

    it('predict should return prediction data', async () => {
        mockAxios.post.mockResolvedValue({ data: samplePrediction });

        const res = await predict('btc');

        expect(res).toEqual(samplePrediction);
        expect(mockAxios.post).toHaveBeenCalledTimes(1);
        const call = mockAxios.post.mock.calls[0] as any[];
        const [url, body] = call;
        expect(url).toContain('/models/predict');
        expect(body.symbol).toBe('BTC');
    });

    it('predict should throw ValidationError when symbol empty', async () => {
        await expect(predict('')).rejects.toMatchObject({
            message: 'Symbol is required',
        });
    });

    it('predict should throw ML_SERVICE_ERROR on axios error', async () => {
        const error = {
            response: { status: 502, data: { detail: 'Bad gateway' } },
        };
        mockAxios.post.mockRejectedValue(error);
        mockAxios.isAxiosError.mockReturnValue(true);

        await expect(predict('BTC')).rejects.toMatchObject({
            code: 'ML_SERVICE_ERROR',
            statusCode: 502,
        });
    });

    it('predictHour should return prediction for hour', async () => {
        mockAxios.post.mockResolvedValue({ data: samplePrediction });

        const res = await predictHour('btc', 3);

        expect(res).toEqual(samplePrediction);
        expect(mockAxios.post).toHaveBeenCalledTimes(1);
        const call = mockAxios.post.mock.calls[0] as any[];
        const [url, body] = call;
        expect(url).toContain('/models/predict/hour');
        expect(body.symbol).toBe('BTC');
        expect(body.hour).toBe(3);
    });

    it('predictHour should validate hour integer and range', async () => {
        await expect(predictHour('BTC', 0)).rejects.toMatchObject({
            message: 'Hour must be between 1 and 24',
        });
        await expect(predictHour('BTC', 25)).rejects.toMatchObject({
            message: 'Hour must be between 1 and 24',
        });
        await expect(predictHour('BTC', 2.5 as any)).rejects.toMatchObject({
            message: 'Hour must be an integer',
        });
    });

    it('predictHour should throw ML_SERVICE_ERROR on axios error', async () => {
        const error = {
            response: { status: 500, data: { detail: 'Internal' } },
        };
        mockAxios.post.mockRejectedValue(error);
        mockAxios.isAxiosError.mockReturnValue(true);

        await expect(predictHour('BTC', 2)).rejects.toMatchObject({
            code: 'ML_SERVICE_ERROR',
            statusCode: 500,
        });
    });
});
