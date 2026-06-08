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

    __tablename__ = "models_metadata"

    __table_args__ = (
        Index( "idx_model_metadata_active", "active" ),
        Index( "idx_model_metadata_symbol_active", "symbol", "active" )
    )

    id = Column( Integer, primary_key=True, autoincrement=True )

    model_name = Column( String(100), nullable=False )

    model_algorithm = Column( String(50), nullable=False )

    model_version = Column( String(20), nullable=False )

    mae = Column( Numeric(15, 6), nullable=True )

    rmse = Column( Numeric(15, 6), nullable=True )

    observations = Column( Integer, nullable=True )

    active = Column( Boolean , nullable=False, default = False )

    model_path = Column( String(255), nullable=False )

    symbol = Column( String(20), nullable=False )

    training_date = Column( TIMESTAMP, nullable=False, server_default=func.now() )

