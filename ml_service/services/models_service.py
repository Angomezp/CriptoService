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

                hours_since_training = datetime.now() - latest_model.training_date
            
                if hours_since_training < self.training_cooldown:

                    return {
                        "trained": False,
                        "message": f"El modelo de {symbol} ya fue entrenado recientemente",
                        "last_training": latest_model.training_date,
                        "hours_since_training": round(hours_since_training.total_seconds() / 3600, 3)
                    }

            historical_data = self.coingecko.get_market_chart( coin_gecko_id )

            inserted = self.crypto_repo.save_prices( symbol, historical_data )

            training_result = self.trainer.train( symbol, model_params )

            self.model_repo.deactivate_models_by_symbol( symbol )

            metadata = ModelMetadata(
                model_name=f"{symbol} Predictor",
                model_algorithm="XGBoost",
                model_version="1.0",
                model_path=training_result["model_path"],
                mae=training_result["mae"],
                rmse=training_result["rmse"],
                observations=training_result["observations"],
                active=True,
                training_date=training_result["training_date"],
                symbol=symbol
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
            raise AppException( f"Error training model for {symbol}: {str(e)}" )
    
    def predict( self,
        symbol: str
    ) -> dict:
        
        try:
            metadata = self.model_repo.get_latest_active_model(symbol)

            if metadata is None:
                raise AppException(f"There is no active model for {symbol}")

            historical_df = self.crypto_repo.find_last_records(symbol=symbol,limit=50)
        
            if historical_df.empty:
                raise AppException(f"No data available for {symbol}")

            X = self.features_helper.build_prediction_features(historical_df)

            if X.empty:
                raise AppException("Not possible to build features for prediction")

            predictions = self.predictor.predict(metadata.model_path,X)[0]

            current_price = float(historical_df.iloc[-1]["price"])

            prediction_results = []

            for hour, prediction in enumerate(predictions,start=1):

                prediction = float(prediction)

                prediction_results.append({
                    "hour": hour,
                    "percentage_change": round(prediction * 100,4),
                    "estimated_price": round(current_price * (1 + prediction),7)
                })

            return {
                "symbol": symbol,
                "current_price": current_price,
                "model": metadata.model_name,
                "version": metadata.model_version,
                "predicciones": prediction_results
            }

        except AppException:
            raise

        except Exception as e:
            raise AppException(f"Error generating prediction: {str(e)}")
        
    def predict_hour( self,
        symbol: str,
        hour: int
    ):
        if hour < 1 or hour > 24:
            raise AppException( "The hour must be between 1 and 24" )
        
        prediction_data = self.predict(symbol)

        return {
            "symbol": symbol,
            "current_price": prediction_data["current_price"],
            "prediction": prediction_data["predictions"][hour-1],
            "model": prediction_data["model"],
            "version": prediction_data["version"]
        }

    def get_models(self, symbol: str | None = None):
        return self.model_repo.get_all_models(symbol)
    
    def get_active_model(self, symbol: str):
        return self.model_repo.get_latest_active_model(symbol)
    
    def get_all_active_models(self, symbol: str):
        return self.model_repo.get_all_active_models(symbol)
    
    def get_model_by_id(self, model_id: int):
        return self.model_repo.get_by_id(model_id)
    