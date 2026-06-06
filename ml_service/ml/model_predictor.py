from pathlib import Path
import joblib

from ml_service.exceptions.app_exception import AppException


class ModelPredictor:

    def load_model( self,
        model_path: str
    ):
        try:
            if not Path(model_path).exists():

                raise AppException( f"No existe el modelo: {model_path}" )

            return joblib.load( model_path )

        except AppException:
            raise

        except Exception as e:
            raise AppException( f"Error cargando modelo: {str(e)}" )

    def predict( self,
        model_path: str,
        features
    ):

        try:
            model = self.load_model( model_path )
            return model.predict( features )

        except AppException:
            raise

        except Exception as e:
            raise AppException( f"Error realizando predicción: {str(e)}" )