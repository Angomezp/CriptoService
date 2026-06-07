import pandas as pd

from ml_service.exceptions.app_exception import AppException


class FeatureHelper:

    FEATURE_COLUMNS = [
        "price",
        "1h_return",
        "6h_return",
        "12h_return",
        "24h_return",
        "24h_volume_change",
        "sma_24",
        "hour",
        "day_of_week"
    ] 

    def build_dataset( self,
        dataframe: pd.DataFrame
    ) -> pd.DataFrame:

        try:
            required_columns = [
                "timestamp",
                "price",
                "volume_24h"
            ]

            missing = [
                column
                for column in required_columns
                if column not in dataframe.columns
            ]

            if missing:
                raise AppException( f"Missing columns: {missing}" )

            df = dataframe.copy()

            df = df.sort_values( by="timestamp" )

            df["timestamp"] = pd.to_datetime( df["timestamp"] )

            df["hour"] = df["timestamp"].dt.hour 

            df["day_of_week"] = df["timestamp"].dt.dayofweek 

            df["1h_return"] = df["price"].pct_change(1) 

            df["6h_return"] = df["price"].pct_change(6) 

            df["12h_return"] = df["price"].pct_change(12) 

            df["24h_return"] = df["price"].pct_change(24) 

            df["24h_volume_change"] = df["volume_24h"].pct_change(24) 

            df["sma_24"] = df["price"].rolling(24).mean() 

            for horizon in range(1, 25):
                df[f"target_{horizon}h"] = df["price"].shift(-horizon).sub(df["price"]).div(df["price"]) 

            df = df.dropna()

            if df.empty:
                raise AppException( "The dataset is empty after feature processing" )

            return df
        
        except Exception as e:
            raise AppException( f"Error building dataset: {str(e)}" )
    
    def split_features_targets( self,
        dataframe: pd.DataFrame
    ):
        try:
            X = dataframe[ self.FEATURE_COLUMNS ]
            y = dataframe[ [ f"target_{i}h" for i in range(1, 25) ] ]

            return X, y
        
        except Exception as e:
            raise AppException( f"Error separating features and targets: {str(e)}" )
        
    
    def build_prediction_features( self,
        dataframe: pd.DataFrame
    ) -> pd.DataFrame:

        try:
            df = dataframe.copy()

            df = df.sort_values( by="timestamp" )

            df["timestamp"] = pd.to_datetime( df["timestamp"] ) 

            df["hour"] = df["timestamp"].dt.hour 

            df["day_of_week"] = df["timestamp"].dt.dayofweek 

            df["1h_return"] = df["price"].pct_change(1) 

            df["6h_return"] = df["price"].pct_change(6) 

            df["12h_return"] = df["price"].pct_change(12) 

            df["24h_return"] = df["price"].pct_change(24) 

            df["24h_volume_change"] = df["volume_24h"].pct_change(24) 

            df["sma_24"] = df["price"].rolling(24).mean()

            df = df.dropna()

            if df.empty:
                raise AppException( "The dataset is empty after feature processing" )

            return df.tail(1)[ self.FEATURE_COLUMNS ]
        
        except Exception as e:
            raise AppException( f"Error building prediction features: {str(e)}" )