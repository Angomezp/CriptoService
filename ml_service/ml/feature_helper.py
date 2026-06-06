import pandas as pd

from ml_service.exceptions.app_exception import AppException


class FeatureHelper:

    FEATURE_COLUMNS = [
        "precio",
        "retorno_1h",
        "retorno_6h",
        "retorno_12h",
        "retorno_24h",
        "cambio_volumen_24h",
        "sma_24",
        "hora",
        "dia_semana"
    ] 

    def build_dataset( self,
        dataframe: pd.DataFrame
    ) -> pd.DataFrame:

        try:
            required_columns = [
                "fecha_hora",
                "precio",
                "volumen"
            ]

            missing = [
                column
                for column in required_columns
                if column not in dataframe.columns
            ]

            if missing:
                raise AppException( f"Columnas faltantes: {missing}" )

            df = dataframe.copy()

            df = df.sort_values( by="fecha_hora" )

            df["fecha_hora"] = pd.to_datetime( df["fecha_hora"] )

            df["hora"] = ( df["fecha_hora"].dt.hour )

            df["dia_semana"] = ( df["fecha_hora"].dt.dayofweek )

            df["retorno_1h"] = ( df["precio"].pct_change(1) )

            df["retorno_6h"] = ( df["precio"].pct_change(6) )

            df["retorno_12h"] = ( df["precio"].pct_change(12) )

            df["retorno_24h"] = ( df["precio"].pct_change(24) )

            df["cambio_volumen_24h"] = ( df["volumen"].pct_change(24) )

            df["sma_24"] = ( df["precio"].rolling(24).mean() )

            for horizon in range(1, 25):
                df[f"target_{horizon}h"] = ( df["precio"].shift(-horizon).sub(df["precio"]).div(df["precio"]) )

            df = df.dropna()
            if df.empty:
                raise AppException( "El dataset quedó vacío después del procesamiento de features" )

            return df
        except Exception as e:

            raise AppException( f"Error construyendo dataset: {str(e)}" )
    
    def split_features_targets( self,
        dataframe: pd.DataFrame
    ):
        try:
            X = dataframe[ self.FEATURE_COLUMNS ]

            y = dataframe[ [ f"target_{i}h" for i in range(1, 25) ] ]

            return X, y
        except Exception as e:
            raise AppException( f"Error separando features y targets: {str(e)}" )
        
    
    def build_prediction_features( self,
        dataframe: pd.DataFrame
    ) -> pd.DataFrame:

        try:
            df = dataframe.copy()

            df = df.sort_values( by="fecha_hora" )

            df["fecha_hora"] = pd.to_datetime( df["fecha_hora"] ) 

            df["hora"] = ( df["fecha_hora"].dt.hour )

            df["dia_semana"] = ( df["fecha_hora"].dt.dayofweek )

            df["retorno_1h"] = ( df["precio"].pct_change(1) )

            df["retorno_6h"] = ( df["precio"].pct_change(6) )

            df["retorno_12h"] = ( df["precio"].pct_change(12) )

            df["retorno_24h"] = ( df["precio"].pct_change(24) )

            df["cambio_volumen_24h"] = ( df["volumen"].pct_change(24) )

            df["sma_24"] = ( df["precio"].rolling(24).mean())

            df = df.dropna()

            if df.empty:
                raise AppException( "El dataset quedó vacío después del procesamiento de features" )

            return df.tail(1)[  self.FEATURE_COLUMNS ]
        except Exception as e:

            raise AppException( f"Error construyendo features para predicción: {str(e)}" )