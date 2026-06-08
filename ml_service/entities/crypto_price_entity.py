from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Numeric,
    TIMESTAMP,
    UniqueConstraint,
    Index
)

from ml_service.config.database import Base


class CryptoPrice(Base):

    __tablename__ = "crypto_prices"

    __table_args__ = (
        UniqueConstraint( "symbol", "time_stamp", name="uq_precio_criptomoneda"),
        Index( "idx_price_symbol", "symbol" ),
        Index( "idx_price_symbol_time_stamp", "symbol", "time_stamp" )
    )

    id = Column( BigInteger, primary_key=True, autoincrement=True )

    symbol = Column( String(20), nullable=False )

    time_stamp = Column(TIMESTAMP, nullable=False)

    price = Column( Numeric(20, 8), nullable=False )

    market_cap = Column( Numeric(30, 2), nullable=True )

    volume_24h = Column( Numeric(30, 2), nullable=True )