import os

os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-long-enough-123")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.config import Settings  # noqa: E402
from app.db import create_tables, make_engine, make_sessionmaker  # noqa: E402
from app.main import create_app  # noqa: E402
from app.repositories import UserRepository  # noqa: E402
from app.security import hash_password  # noqa: E402

PASSWORD = "test-password-1"


def make_settings(database_url: str) -> Settings:
    return Settings(
        app_env="test",
        database_url=database_url,
        secret_key="test-secret-key-that-is-long-enough-123",
        cors_origins=("http://localhost:5173",),
        token_ttl_minutes=60,
    )


def add_user(database_url: str, username: str) -> None:
    engine = make_engine(database_url)
    create_tables(engine)
    with make_sessionmaker(engine)() as db:
        UserRepository(db).create(username, hash_password(PASSWORD))
    engine.dispose()


def login(client: TestClient, username: str) -> None:
    response = client.post("/api/auth/login", json={"username": username, "password": PASSWORD})
    assert response.status_code == 200, response.text
    client.headers["Authorization"] = f"Bearer {response.json()['access_token']}"


@pytest.fixture
def database_url(tmp_path):
    """A fresh SQLite file per test, or TEST_DATABASE_URL (e.g. Postgres) emptied first."""
    url = os.getenv("TEST_DATABASE_URL")
    if not url:
        return f"sqlite:///{tmp_path / 'test.db'}"
    from app import orm  # noqa: F401
    from app.db import Base

    engine = make_engine(url)
    Base.metadata.drop_all(engine)
    engine.dispose()
    return url


@pytest.fixture
def anonymous(database_url):
    with TestClient(create_app(make_settings(database_url))) as client:
        yield client


@pytest.fixture
def client(database_url, anonymous):
    add_user(database_url, "scheduler.one")
    with TestClient(anonymous.app) as authed:
        login(authed, "scheduler.one")
        yield authed


@pytest.fixture
def other_client(database_url, client):
    add_user(database_url, "scheduler.two")
    with TestClient(client.app) as authed:
        login(authed, "scheduler.two")
        yield authed
