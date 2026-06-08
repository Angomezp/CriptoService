from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from ml_service.config.env import config


class Database:

    _engine = None
    _session_factory = None

    @classmethod
    def get_engine(cls):

        if cls._engine is None:

            connection_string = (
                f"postgresql+psycopg2://"
                f"{config.DB_USER}:"
                f"{config.DB_PASSWORD}@"
                f"{config.DB_HOST}:"
                f"{config.DB_PORT}/"
                f"{config.DB_NAME}"
            )

            cls._engine = create_engine(
                connection_string,
                pool_pre_ping=True
            )

        return cls._engine

    @classmethod
    def get_session_factory(cls):

        if cls._session_factory is None:

            cls._session_factory = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=cls.get_engine()
            )

        return cls._session_factory

    @classmethod
    def get_session(cls):

        return cls.get_session_factory()()


Base = declarative_base()