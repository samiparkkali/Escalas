from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import normalize_database_url


class Base(DeclarativeBase):
    pass


def make_engine(database_url: str) -> Engine:
    database_url = normalize_database_url(database_url)
    if database_url.startswith("sqlite"):
        engine = create_engine(database_url, connect_args={"check_same_thread": False})

        @event.listens_for(engine, "connect")
        def _enable_foreign_keys(dbapi_connection, _record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

        return engine
    return create_engine(database_url, pool_pre_ping=True)


def make_sessionmaker(engine: Engine) -> sessionmaker:
    return sessionmaker(bind=engine, expire_on_commit=False)


def create_tables(engine: Engine) -> None:
    from . import orm  # noqa: F401  registers the tables on Base.metadata

    Base.metadata.create_all(bind=engine)
