from datetime import datetime, timedelta

from ml_service.services.coingecko_service import CoinGeckoService

from ml_service.ml.model_trainer import ModelTrainer

from ml_service.repositories.crypto_price_repository import CryptoPriceRepository
from ml_service.repositories.model_metadata_repository import ModelMetadataRepository

from ml_service.exceptions.app_exception import AppException


class TrainingService:

    def __init__(self):

        self.coingecko_service = CoinGeckoService()

        self.crypto_repository = CryptoPriceRepository()

        self.model_trainer = ModelTrainer()

        self.model_repository = ModelMetadataRepository()

        self.training_cooldown = timedelta(days=1)
    
    def train_model( self,
        symbol: str,
        coin_gecko_id: str
    ):
        try:

            latest_model = self.model_repository.get_latest_active_model(symbol)

            if latest_model:

                hours_since_training = datetime.now() - latest_model.fecha_entrenamiento
            
                if hours_since_training < self.training_cooldown:

                    return {
                        "trained": False,
                        "message": f"El modelo de {symbol} ya fue entrenado recientemente",
                        "last_training": latest_model.fecha_entrenamiento
                    }

            historical_data = self.coingecko_service.get_market_chart( coin_gecko_id )

            inserted = self.crypto_repository.save_prices( symbol, historical_data )

            training_result = self.model_trainer.train( symbol )

            return {
                "trained": True,
                "symbol": symbol,
                "new_records": inserted,
                "training": training_result
            }

        except AppException:
            raise

        except Exception as e:

            raise AppException(
                f"Error entrenando modelo para {symbol}: {str(e)}"
            )