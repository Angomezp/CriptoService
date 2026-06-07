import pandas as pd
from sqlalchemy.exc import SQLAlchemyError

from ml_service.config.database import Database

from ml_service.exceptions.database_exception import DatabaseException

from ml_service.entities.crypto_price_entity import CryptoPrice


class CryptoPriceRepository:

    def save_prices( self,
        symbol: str,
        dataframe: pd.DataFrame
    ) -> int:

        session = Database.get_session()

        try:
            last_record = (
                session.query( CryptoPrice )
                    .filter( CryptoPrice.symbol == symbol )
                    .order_by( CryptoPrice.time_stamp.desc() )
                    .first()
            )

            last_date = last_record.time_stamp if last_record else None

            entities = []

            for _, row in dataframe.iterrows():

                if (last_date is not None and row["time_stamp"] <= last_date ):
                    continue

                entities.append(
                    CryptoPrice(
                        symbol = symbol,
                        time_stamp = row["time_stamp"],
                        price = row["price"],
                        market_cap = row["market_cap"],
                        volume_24h = row["volume_24h"]
                    )
                )

            if entities:
                session.bulk_save_objects( entities )

            session.commit()
            return len(entities)

        except SQLAlchemyError as e:
            session.rollback()

            raise DatabaseException( f"Error saving prices: {str(e)}")

        finally:
            session.close()

    def find_by_symbol( self,
        symbol: str
    ) -> list[CryptoPrice]:

        session = Database.get_session()
        try:
            return (
                session.query( CryptoPrice )
                    .filter( CryptoPrice.symbol == symbol )
                    .order_by( CryptoPrice.time_stamp.asc() )
                    .all()
            )

        except SQLAlchemyError as e:
            raise DatabaseException( f"Error consulting historical data: {str(e)}" )

        finally:
            session.close()

    def find_last_records( self,
        symbol: str,
        limit: int = 50
    ) -> pd.DataFrame:

        session = Database.get_session()
        try:
            records = (
                session.query(CryptoPrice)
                    .filter( CryptoPrice.symbol == symbol )
                    .order_by( CryptoPrice.time_stamp.desc() )
                    .limit(limit)
                    .all()
            )
            return pd.DataFrame([
                {
                    "timestamp": record.time_stamp,
                    "price": float(record.price),
                    "market_cap": float(record.market_cap) if record.market_cap is not None else None, 
                    "volume_24h": float(record.volume_24h) if record.volume_24h is not None else None
                }
                for record in records
            ])


        except SQLAlchemyError as e:
            raise DatabaseException( f"Error consulting records: {str(e)}" )

        finally:
            session.close()

    def get_training_data( self,
        symbol: str
    ) -> pd.DataFrame:

        session = Database.get_session()

        try:
            records = (
                session.query(CryptoPrice)
                    .filter( CryptoPrice.symbol == symbol )
                    .order_by( CryptoPrice.time_stamp.asc() )
                    .all()
            )

            data = [
                {
                    "timestamp": record.time_stamp,
                    "price": float(record.price),
                    "market_cap":  float(record.market_cap) if record.market_cap is not None else None,
                    "volume_24h": float(record.volume_24h) if record.volume_24h is not None else None
                }
                for record in records
            ]

            return pd.DataFrame(data)

        except SQLAlchemyError as e:
            raise DatabaseException( f"Error consulting training data: {str(e)}"  )

        finally:
            session.close()