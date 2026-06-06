from datetime import datetime, timedelta

from ml_service.entities.model_metadata_entity import ModelMetadata
from ml_service.services.coingecko_service import CoinGeckoService
from ml_service.repositories.crypto_price_repository import CryptoPriceRepository
from ml_service.repositories.model_metadata_repository import ModelMetadataRepository
from ml_service.ml.model_trainer import ModelTrainer
from ml_service.ml.model_predictor import ModelPredictor
from ml_service.ml.feature_helper import FeatureHelper
from ml_service.exceptions.app_exception import AppException

class ModelsService:

    def __init__(self):

        self.coingecko = CoinGeckoService()
        self.crypto_repo = CryptoPriceRepository()
        self.model_repo = ModelMetadataRepository()

        self.trainer = ModelTrainer()
        self.predictor = ModelPredictor()
        self.features_helper = FeatureHelper()

        self.training_cooldown = timedelta(days=1)

    def train_model( self,
        symbol: str,
        coin_gecko_id: str,
        model_params: dict | None = None
    ):
        try:

            latest_model = self.model_repo.get_latest_active_model(symbol)

            if latest_model:

                hours_since_training = datetime.now() - latest_model.fecha_entrenamiento
            
                if hours_since_training < self.training_cooldown:

                    return {
                        "trained": False,
                        "message": f"El modelo de {symbol} ya fue entrenado recientemente",
                        "last_training": latest_model.fecha_entrenamiento,
                        "hours_since_training": hours_since_training.total_seconds() / 3600
                    }

            historical_data = self.coingecko.get_market_chart( coin_gecko_id )

            inserted = self.crypto_repo.save_prices( symbol, historical_data )

            training_result = self.trainer.train( symbol, model_params )

            metadata = ModelMetadata(
                nombre=f"{symbol} Predictor",
                algoritmo="XGBoost",
                version="1.0",
                ruta_modelo=training_result["ruta_modelo"],
                mae=training_result["mae"],
                rmse=training_result["rmse"],
                observaciones=training_result["observaciones"],
                activo=True,
                fecha_entrenamiento=training_result["fecha_entrenamiento"],
                simbolo=symbol
            )
            self.model_repo.save(metadata)

            return {
                "trained": True,
                "symbol": symbol,
                "new_records": inserted,
                "training": training_result
            }

        except AppException:
            raise

        except Exception as e:
            raise AppException( f"Error entrenando modelo para {symbol}: {str(e)}" )
    
    def predict( self,
        symbol: str
    ) -> dict:
        
        try:
            metadata = self.model_repo.get_latest_active_model(symbol)

            if metadata is None:
                raise AppException(f"No existe modelo para {symbol}")

            historical_df = self.crypto_repo.find_last_records(symbol=symbol,limit=50)
        
            if historical_df.empty:
                raise AppException(f"No existen datos para {symbol}")

            X = self.features_helper.build_prediction_features(historical_df)

            if X.empty:
                raise AppException("No fue posible generar features")

            predictions = self.predictor.predict(metadata.ruta_modelo,X)[0]

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
    
    def get_models(self, symbol: str | None = None):
        return self.model_repo.get_all_models(symbol)
    
    def get_active_model(self, symbol: str):
        return self.model_repo.get_latest_active_model(symbol)
    
    def get_all_active_models(self, symbol: str):
        return self.model_repo.get_all_active_models(symbol)
    
    def get_model_by_id(self, model_id: int):
        return self.model_repo.get_by_id(model_id)
    