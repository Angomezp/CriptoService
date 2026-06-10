export interface ModelResponseDto {
    model_name: string;
    model_algorithm: string;
    model_version: string;
    mae: number;
    rmse: number;
    active: boolean;
    symbol: string;
    training_date: string;
}
