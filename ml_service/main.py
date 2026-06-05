from ml_service.services.coingecko_service import CoinGeckoService


print(CoinGeckoService().get_market_chart(coin_id="bitcoin", days=1, interval="hourly"))