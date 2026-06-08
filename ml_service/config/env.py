from dotenv import load_dotenv
import os

# Cargar las variables de entorno desde el archivo .env

load_dotenv()

class Config:
    # Configuración de la API de CoinGecko
    COINGECKO_API_URL = os.getenv("COINGECKO_API_URL", "")
    COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY", "")
    ML_SV_PORT = int(os.getenv("ML_SV_PORT", 8000))
    ML_SV_HOST = os.getenv("ML_SV_HOST", "127.0.0.1")

    DATABASE_URL = os.getenv("DATABASE_URL", "")
    DB_USER = os.getenv("DB_USER", "")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "")
    DB_HOST = os.getenv("DB_HOST", "")
    DB_PORT = os.getenv("DB_PORT", "")

    MODEL_DIRECTORY = "ml_service/models"

    MINIMUM_DATA_POINTS = 200

    TRAINING_COOLDOWN_HOURS = 24

    # Default Hyperparameters for the XGBoost model

    DEFAULT_N_ESTIMATORS = 100

    DEFAULT_MAX_DEPTH = 4

    DEFAULT_LEARNING_RATE = 0.05

    DEFAULT_RANDOM_STATE = 42

    DEFAULT_N_JOBS = 1
    
    DEFAULT_OBJECTIVE = "reg:squarederror"


config = Config()