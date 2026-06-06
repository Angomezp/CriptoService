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

    __tablename__ = "precios_criptomonedas"

    __table_args__ = (
        UniqueConstraint( "simbolo", "fecha_hora", name="uq_precio_criptomoneda"),
        Index( "idx_precio_simbolo", "simbolo" ),
        Index( "idx_precio_simbolo_fecha", "simbolo", "fecha_hora" )
    )

    id = Column( BigInteger, primary_key=True, autoincrement=True )

    simbolo = Column( String(20), nullable=False )

    fecha_hora = Column(TIMESTAMP, nullable=False)

    precio = Column( Numeric(20, 8), nullable=False )

    capitalizacion_mercado = Column( Numeric(30, 2), nullable=True )

    volumen = Column( Numeric(30, 2), nullable=True )