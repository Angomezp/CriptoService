from pathlib import Path
import joblib
from datetime import datetime

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error
)

from sklearn.model_selection import train_test_split

from sklearn.multioutput import MultiOutputRegressor
from xgboost import XGBRegressor

from ml_service.repositories.crypto_price_repository import CryptoPriceRepository

from ml_service.ml.feature_helper import FeatureHelper

from ml_service.exceptions.app_exception import AppException

from ml_service.config.env import config


class ModelTrainer:

    def __init__(self):

        self.crypto_repository =  CryptoPriceRepository() 

        self.feature_helper =  FeatureHelper()

        self.minimum_data_points = config.MINIMUM_DATA_POINTS

    def train( self,
        symbol: str,
        model_params: dict | None = None
    ) -> dict:

        try:
            historical_df = self.crypto_repository.get_training_data( symbol )

            if historical_df.empty:
                raise AppException( f"No historical data found for {symbol}" )
            
            if len(historical_df) < self.minimum_data_points:
                raise AppException( f"Not enough data to train a model for {symbol}. At least {self.minimum_data_points} records are required." )

            dataset = self.feature_helper.build_dataset( historical_df )

            if dataset.empty:
                raise AppException( "The dataset is empty after feature processing" )

            X, y =  self.feature_helper.split_features_targets( dataset ) 

            X_train, X_test, y_train, y_test = train_test_split( X, y, test_size=0.2, shuffle=False ) 

            default_params = {
                "n_estimators": config.DEFAULT_N_ESTIMATORS,
                "max_depth": config.DEFAULT_MAX_DEPTH,
                "learning_rate": config.DEFAULT_LEARNING_RATE,
                "objective": config.DEFAULT_OBJECTIVE,
                "random_state": config.DEFAULT_RANDOM_STATE,
                "n_jobs": config.DEFAULT_N_JOBS
            }

            if model_params is not None:
                default_params.update(
                    {
                        k: v
                        for k, v in model_params.items()
                        if v is not None
                    }
                )

            model = MultiOutputRegressor(
                XGBRegressor(
                    n_estimators = default_params["n_estimators"],
                    max_depth = default_params["max_depth"],
                    learning_rate = default_params["learning_rate"],
                    objective = default_params["objective"],
                    random_state = default_params["random_state"],
                    n_jobs = default_params["n_jobs"]
                )
            )

            model.fit( X_train, y_train )

            predictions = model.predict( X_test )

            mae = float( mean_absolute_error( y_test, predictions ) )

            rmse = float( mean_squared_error( y_test, predictions ) ** 0.5 )

            Path( config.MODEL_DIRECTORY ).mkdir( exist_ok=True, parents=True )

            training_date = datetime.now()

            file_date = training_date.strftime( "%Y-%m-%d_%H-%M-%S" )

            model_path =  f"{config.MODEL_DIRECTORY}/{symbol.lower()}_{file_date}_predictor.joblib" 

            joblib.dump( model, model_path )

            if not Path(model_path).exists():
                raise AppException( "Not possible to save the trained model" )


            return {
                "symbol": symbol,
                "observations": len(dataset),
                "mae": mae,
                "rmse": rmse,
                "model_path": model_path,
                "training_date": training_date,

            }
        
        except AppException as e:
            raise e
        except Exception as e:
            raise AppException( f"Error during training for {symbol}: {str(e)}" )