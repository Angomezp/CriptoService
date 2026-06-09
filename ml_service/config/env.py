from dotenv import load_dotenv
import os

# Cargar las variables de entorno desde el archivo .env

load_dotenv()

class Config:
    # Configuración de la API de CoinGecko
    COINGECKO_API_URL = os.getenv("COINGECKO_API_URL")
    COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY")
    ML_SV_PORT = int(os.getenv("ML_SV_PORT"))
    ML_SV_HOST = os.getenv("ML_SV_HOST")

    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = int(os.getenv("DB_PORT"))

    MODEL_DIRECTORY = os.getenv("ML_MODELS_DIRECTORY")

    MINIMUM_DATA_POINTS = int(os.getenv("ML_MINIMUM_DATA_POINTS"))

    TRAINING_COOLDOWN_HOURS = int(os.getenv("ML_TRAINING_COOLDOWN_HOURS"))

    # Default Hyperparameters for the XGBoost model

    DEFAULT_N_ESTIMATORS = int(os.getenv("ML_DEFAULT_N_ESTIMATORS"))

    DEFAULT_MAX_DEPTH = int(os.getenv("ML_DEFAULT_MAX_DEPTH"))

    DEFAULT_LEARNING_RATE = float(os.getenv("ML_DEFAULT_LEARNING_RATE"))

    DEFAULT_RANDOM_STATE = int(os.getenv("ML_DEFAULT_RANDOM_STATE"))

    DEFAULT_N_JOBS = int(os.getenv("ML_DEFAULT_N_JOBS"))
    
    DEFAULT_OBJECTIVE = os.getenv("ML_DEFAULT_OBJECTIVE")

    ML_API_KEY = os.getenv("ML_API_KEY")


config = Config()