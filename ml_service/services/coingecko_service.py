import requests
import pandas as pd

from ml_service.config.env import config

from ml_service.exceptions.external_service_exception import ExternalServiceException

class CoinGeckoService:

    def __init__(self):
        self.api_key = config.COINGECKO_API_KEY
        self.BASE_URL = config.COINGECKO_API_URL
        self.timeout = 10
        self.coin_decimal_precision = 8

    def get_market_chart( self,
        coin_id: str,
        return_currency: str = "usd",
        days: int = 100,
        interval: str = "hourly",
    ) -> pd.DataFrame:

        url = f"{self.BASE_URL}/coins/{coin_id}/market_chart"

        params = {
            "vs_currency": return_currency,
            "days": days,
            "interval": interval,
            "precision": self.coin_decimal_precision
        }

        headers = {}

        if self.api_key:
            headers["x-cg-demo-api-key"] = self.api_key

        try:
            response = requests.get(
                url=url,
                params=params,
                headers=headers,
                timeout=self.timeout
            )

            response.raise_for_status()

            data = response.json()

            return self._make_dataframe(data)

        except requests.Timeout as e:
            raise ExternalServiceException( f"Waiting time exceeded when connecting to CoinGecko: {str(e)}" )
        
        except requests.HTTPError as e:
            raise ExternalServiceException( f"HTTP error when connecting to CoinGecko: {str(e)}" )
        
        except requests.RequestException as e:
            raise ExternalServiceException( f"Error when connecting to CoinGecko: {str(e)}" )


    def _make_dataframe(self, 
        data: dict
    ) -> pd.DataFrame:

        if not data.get("prices") or not data.get("market_caps") or not data.get("total_volumes"):
            raise ExternalServiceException( "The response from CoinGecko does not contain the expected fields." )
        
        prices = data["prices"]
        market_caps = data["market_caps"]
        total_volumes = data["total_volumes"]

        rows = []

        for price_data, market_cap_data, volume_data in zip( prices, market_caps, total_volumes ):
            
            price_timestamp, price = price_data
            _, market_cap = market_cap_data
            _, volume_24h = volume_data

            rows.append({
                "time_stamp": pd.to_datetime( price_timestamp, unit="ms" ),
                "price": price,
                "market_cap": market_cap,
                "volume_24h": volume_24h
            })
        df = pd.DataFrame(rows)

        return df.sort_values( by="time_stamp" ).reset_index( drop=True )




