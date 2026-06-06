from ml_service.exceptions.app_exception import AppException

from ml_service.repositories.crypto_price_repository import CryptoPriceRepository
from ml_service.repositories.model_metadata_repository import ModelMetadataRepository

from ml_service.ml.feature_helper import FeatureHelper

from ml_service.ml.model_predictor import ModelPredictor

class PredictionService:

    def __init__(self):

        self.crypto_repository =  CryptoPriceRepository()

        self.model_repository =  ModelMetadataRepository()
        
        self.feature_helper =  FeatureHelper()

        self.model_predictor = ModelPredictor()

    def predict( self,
        symbol: str
    ) -> dict:

        try:
            metadata = self.model_repository.get_latest_active_model(symbol)

            if metadata is None:
                raise AppException(f"No existe modelo para {symbol}")

            historical_df = self.crypto_repository.find_last_records(symbol=symbol,limit=50)
        
            if historical_df.empty:
                raise AppException(f"No existen datos para {symbol}")

            X = self.feature_helper.build_prediction_features(historical_df)

            if X.empty:
                raise AppException("No fue posible generar features")

            predictions = self.model_predictor.predict(metadata.ruta_modelo,X)[0]

            current_price = float(historical_df.iloc[-1]["precio"])

            prediction_results = []

            for hour, prediction in enumerate(predictions,start=1):

                prediction = float(prediction)

                prediction_results.append({
                    "hora": hour,
                    "variacion_porcentual": round(prediction * 100,4),
                    "precio_estimado": round(current_price * (1 + prediction),2)
                })

            return {
                "simbolo": symbol,
                "precio_actual": current_price,
                "modelo": metadata.nombre,
                "version": metadata.version,
                "predicciones": prediction_results
            }

        except AppException:
            raise

        except Exception as e:
            raise AppException(f"Error generando predicción: {str(e)}")