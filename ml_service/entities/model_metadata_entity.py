from sqlalchemy import (
    Column,
    Index,
    Integer,
    String,
    Numeric,
    Boolean,
    TIMESTAMP,
    func
)

from ml_service.config.database import Base


class ModelMetadata(Base):

    __tablename__ = "modelos"

    __table_args__ = (
        Index( "idx_modelo_activo", "activo" ),
    )

    id = Column( Integer, primary_key=True, autoincrement=True )

    nombre = Column( String(100), nullable=False )

    algoritmo = Column( String(50), nullable=False )

    version = Column( String(20), nullable=False )

    mae = Column( Numeric(15, 6), nullable=True )

    rmse = Column( Numeric(15, 6), nullable=True )

    observaciones = Column( Integer, nullable=True )

    activo = Column( Boolean , nullable=False, default = False )

    ruta_modelo = Column( String(255), nullable=False )

    simbolo = Column( String(20), nullable=False )

    fecha_entrenamiento = Column( TIMESTAMP, nullable=False, server_default=func.now() )

