import axios from 'axios';
import { env } from '../config/env.js';
import { AppError, ValidationError } from '../config/http_errors.js';

function handleAxiosError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        throw new AppError(
            error.response?.data?.detail ?? 'ML Service Error',
            error.response?.status ?? 500,
            'ML_SERVICE_ERROR'
        );
    }
    throw error;
}

export async function predict(symbol: string) {
    if (!symbol?.trim()) {
        throw new ValidationError('Symbol is required');
    }
    try {
        const response = await axios.post(
            `${env.mlServiceUrl}/models/predict`,
            {
                symbol: symbol.toUpperCase(),
            },
            {
                headers: {
                    'X-API-Key': env.mlApiKey,
                },
            }
        );
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
}

export async function predictHour(symbol: string, hour: number) {
    if (!symbol?.trim()) {
        throw new ValidationError('Symbol is required');
    }

    if (!Number.isInteger(hour)) {
        throw new ValidationError('Hour must be an integer');
    }
    if (hour < 1 || hour > 24) {
        throw new ValidationError('Hour must be between 1 and 24');
    }
    try {
        const response = await axios.post(
            `${env.mlServiceUrl}/models/predict/hour`,
            {
                symbol: symbol.toUpperCase(),
                hour,
            },
            {
                headers: {
                    'X-API-Key': env.mlApiKey,
                },
            }
        );
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
}
