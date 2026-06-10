import axios from 'axios';
import { env } from '../config/env.js';
import { AppError, ValidationError } from '../config/http_errors.js';


function handleAxiosError( error: unknown ): never {
    if (axios.isAxiosError(error)) {
        throw new AppError(  error.response?.data?.detail ?? "ML Service Error", error.response?.status ?? 500, "ML_SERVICE_ERROR" );
    }
    throw error;
}


export async function getModels() {
    try {
        const response = await axios.get(
            `${env.mlServiceUrl}/models`,
            {
                headers: {
                    "X-API-Key": env.mlApiKey
                }
            }
        );
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
}

export async function getModelBySymbol( symbol: string ) {
    if (!symbol?.trim()) {
        throw new ValidationError( "Symbol is required" );
    }
    try {
        const response = await axios.get(
            `${env.mlServiceUrl}/models/symbol/${symbol.toUpperCase()}`,
            {
                headers: {
                    "X-API-Key": env.mlApiKey
                }
            }
        );
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
}   

export async function getModelById( id: number ) {
    if (!Number.isInteger(id) || id <= 0) {
        throw new ValidationError( "Invalid model ID" );
    }
    try {
        const response = await axios.get(
            `${env.mlServiceUrl}/models/id/${id}`,
            {
                headers: {
                    "X-API-Key": env.mlApiKey
                }
            }
        );
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
}   

export async function getAllActiveModels() {
    try {
        const response = await axios.get(
            `${env.mlServiceUrl}/models/active`,
            {
                headers: {
                    "X-API-Key": env.mlApiKey
                }
            }
        );
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
}

export async function getAllActiveModelsBySymbol( symbol: string ) {
    if (!symbol?.trim()) {
        throw new ValidationError( "Symbol is required" );
    }
    try {
        const response = await axios.get(
            `${env.mlServiceUrl}/models/active/${symbol.toUpperCase()}`,
            {
                headers: {
                    "X-API-Key": env.mlApiKey
                }
            }
        );
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
}