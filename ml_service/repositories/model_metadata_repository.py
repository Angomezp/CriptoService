from sqlalchemy.exc import SQLAlchemyError

from ml_service.config.database import Database

from ml_service.exceptions.database_exception import DatabaseException

from ml_service.entities.model_metadata_entity import ModelMetadata



class ModelMetadataRepository:

    def save( self,
        model_metadata: ModelMetadata
    ) -> ModelMetadata:
        
        session = Database.get_session()

        try:
            session.add(model_metadata)

            session.commit()

            session.refresh(model_metadata)

            return model_metadata

        except SQLAlchemyError as e:

            session.rollback()

            raise DatabaseException( f"Error guardando metadata del modelo: {str(e)}" )

        finally:

            session.close()

    def get_active_models( self ) -> list[ModelMetadata] | None:

        session = Database.get_session()

        try:

            return ( 
                session.query(ModelMetadata)
                    .filter( ModelMetadata.activo.is_(True) )
                    .order_by( ModelMetadata.fecha_entrenamiento.desc() )
                    .all()
            )

        except SQLAlchemyError as e:

            raise DatabaseException( f"Error consultando modelos activos: {str(e)}" )

        finally:

            session.close()

    def get_by_id( self,
        model_id: int
    ) -> ModelMetadata | None:

        session = Database.get_session()

        try:

            return (
                session.query(ModelMetadata)
                    .filter(  ModelMetadata.id == model_id )
                    .first()
            )

        except SQLAlchemyError as e:

            raise DatabaseException( f"Error consultando modelo: {str(e)}" )

        finally:

            session.close()

    def get_all_models( self ) -> list[ModelMetadata]:

        session = Database.get_session()

        try:

            return (
                session.query(ModelMetadata)
                    .order_by( ModelMetadata.fecha_entrenamiento.desc() )
                    .all()
            )

        except SQLAlchemyError as e:

            raise DatabaseException( f"Error consultando modelos: {str(e)}" )

        finally:

            session.close()
    
    def get_latest_active_model( self,
        symbol: str
    ) -> ModelMetadata | None:
        session = Database.get_session()

        try:
            return (
                session.query(ModelMetadata)
                    .filter( ModelMetadata.activo.is_(True) & str.lower(ModelMetadata.simbolo) == str.lower(symbol) )
                    .order_by( ModelMetadata.fecha_entrenamiento.desc() )
                    .first()
            )

        except SQLAlchemyError as e:

            raise DatabaseException( f"Error consultando modelo activo: {str(e)}" )

        finally:

            session.close()