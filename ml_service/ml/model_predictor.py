from pathlib import Path
import joblib
import pandas as pd

from ml_service.exceptions.app_exception import AppException


class ModelPredictor:

    def load_model( self,
        model_path: str
    ):
        try:
            if not Path(model_path).exists():
                raise AppException( f"Model not found: {model_path}" )

            return joblib.load( model_path )

        except AppException:
            raise

        except Exception as e:
            raise AppException( f"Error loading model: {str(e)}" )

    def predict( self,
        model_path: str,
        features: pd.DataFrame
    ):

        try:
            model = self.load_model( model_path )
            return model.predict( features )

        except AppException:
            raise

        except Exception as e:
            raise AppException( f"Error making prediction: {str(e)}" )