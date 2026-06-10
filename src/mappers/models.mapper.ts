import type { ModelResponseDto } from '../dtos/model_response.dto.js';

export function toModelResponse(model: any): ModelResponseDto {
    return {
        model_name: model.model_name,
        model_algorithm: model.model_algorithm,
        model_version: model.model_version,
        mae: model.mae,
        rmse: model.rmse,
        active: model.active,
        symbol: model.symbol,
        training_date: model.training_date,
    };
}

export function toModelResponseList(models: any[]) {
    return models.map(toModelResponse);
}
