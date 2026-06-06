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
                    .filter( CryptoPrice.simbolo == symbol )
                    .order_by( CryptoPrice.fecha_hora.desc() )
                    .first()
            )

            last_date = last_record.fecha_hora if last_record else None

            entities = []

            for _, row in dataframe.iterrows():

                if (last_date is not None and row["fecha_hora"] <= last_date ):
                    continue

                entities.append(
                    CryptoPrice(
                        simbolo = symbol,
                        fecha_hora = row["fecha_hora"],
                        precio = row["precio"],
                        capitalizacion_mercado = row["capitalizacion_mercado"],
                        volumen = row["volumen"]
                    )
                )

            if entities:
                session.bulk_save_objects( entities )

            session.commit()
            return len(entities)

        except SQLAlchemyError as e:
            session.rollback()

            raise DatabaseException( f"Error guardando precios: {str(e)}")

        finally:
            session.close()

    def find_by_symbol( self,
        symbol: str
    ) -> list[CryptoPrice]:

        session = Database.get_session()
        try:
            return (
                session.query( CryptoPrice )
                    .filter( CryptoPrice.simbolo == symbol )
                    .order_by( CryptoPrice.fecha_hora.asc() )
                    .all()
            )

        except SQLAlchemyError as e:
            raise DatabaseException( f"Error consultando histórico: {str(e)}" )

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
                    .filter( CryptoPrice.simbolo == symbol )
                    .order_by( CryptoPrice.fecha_hora.desc() )
                    .limit(limit)
                    .all()
            )
            return pd.DataFrame([
                {
                    "fecha_hora": record.fecha_hora,
                    "precio": float(record.precio),
                    "capitalizacion_mercado": float(record.capitalizacion_mercado) if record.capitalizacion_mercado is not None else None, 
                    "volumen": float(record.volumen) if record.volumen is not None else None
                }
                for record in records
            ])


        except SQLAlchemyError as e:
            raise DatabaseException( f"Error consultando registros: {str(e)}" )

        finally:
            session.close()

    def get_training_data( self,
        symbol: str
    ) -> pd.DataFrame:

        session = Database.get_session()

        try:
            records = (
                session.query(CryptoPrice)
                    .filter( CryptoPrice.simbolo == symbol )
                    .order_by( CryptoPrice.fecha_hora.asc() )
                    .all()
            )

            data = [
                {
                    "fecha_hora": record.fecha_hora,
                    "precio": float(record.precio),
                    "capitalizacion_mercado":  float(record.capitalizacion_mercado) if record.capitalizacion_mercado is not None else None,
                    "volumen": float(record.volumen) if record.volumen is not None else None
                }
                for record in records
            ]

            return pd.DataFrame(data)

        except SQLAlchemyError as e:
            raise DatabaseException( f"Error obteniendo datos de entrenamiento: {str(e)}"  )

        finally:
            session.close()