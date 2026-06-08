from sqlalchemy import func
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
            
            raise DatabaseException( f"Error saving model metadata: {str(e)}" )

        finally:
            session.close()

    def get_active_models( self ) -> list[ModelMetadata] | None:

        session = Database.get_session()

        try:
            return ( 
                session.query(ModelMetadata)
                    .filter( ModelMetadata.active.is_(True) )
                    .order_by( ModelMetadata.training_date.desc() )
                    .all()
            )

        except SQLAlchemyError as e:
            raise DatabaseException( f"Error consulting active models: {str(e)}" )

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
            raise DatabaseException( f"Error consulting model: {str(e)}" )

        finally:
            session.close()

    def get_all_models( self,
        symbol: str | None = None
     ) -> list[ModelMetadata]:

        session = Database.get_session()

        try:
            return (
                session.query(ModelMetadata)
                    .order_by( ModelMetadata.training_date.desc() )
                    .filter( func.lower(ModelMetadata.symbol) == func.lower(symbol) if symbol else True )
                    .all()
            )

        except SQLAlchemyError as e:
            raise DatabaseException( f"Error consulting models: {str(e)}" )
        
        finally:
            session.close()
    
    def get_latest_active_model( self,
        symbol: str
    ) -> ModelMetadata | None:
        session = Database.get_session()

        try:
            return (
                session.query(ModelMetadata)
                    .filter( ModelMetadata.active.is_(True), func.lower(ModelMetadata.symbol) == func.lower(symbol) )
                    .order_by( ModelMetadata.training_date.desc() )
                    .first()
            )

        except SQLAlchemyError as e:
            raise DatabaseException( f"Error consulting latest active model: {str(e)}" )

        finally:
            session.close()
    
    def get_all_active_models( self,
        symbol: str
    ) -> list[ModelMetadata]:

        session = Database.get_session()

        try:
            return (
                session.query(ModelMetadata)
                    .filter( ModelMetadata.active.is_(True), func.lower(ModelMetadata.symbol) == func.lower(symbol) )
                    .order_by( ModelMetadata.training_date.desc() )
                    .all()
            )

        except SQLAlchemyError as e:
            raise DatabaseException( f"Error consulting active models: {str(e)}" )

        finally:
            session.close()

    def deactivate_models_by_symbol(
        self,
        symbol: str
    ):

        session = Database.get_session()
        try:
            (
                session.query(ModelMetadata)
                    .filter( ModelMetadata.symbol == symbol )
                    .update( {"active": False} )
            )

            session.commit()

        except SQLAlchemyError as e:
            session.rollback()

            raise DatabaseException( f"Error deactivating models: {str(e)}" )

        finally:
            session.close()