import io
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient

from app import cli
from app.config import DEV_SECRET_KEY, load_settings, normalize_database_url
from app.main import create_app

from .conftest import PASSWORD, add_user, make_settings

PROTECTED = [
    ("get", "/api/auth/me"),
    ("get", "/api/professionals"),
    ("post", "/api/professionals"),
    ("put", "/api/professionals/x"),
    ("delete", "/api/professionals/x"),
    ("get", "/api/unavailabilities"),
    ("post", "/api/unavailabilities"),
    ("delete", "/api/unavailabilities/x"),
    ("post", "/api/schedule/generate"),
    ("get", "/api/schedule"),
    ("get", "/api/schedule/export"),
    ("get", "/api/schedule/statistics"),
]


@pytest.mark.parametrize("method,path", PROTECTED)
def test_api_routes_require_a_token(anonymous, method, path):
    assert getattr(anonymous, method)(path).status_code == 401


@pytest.mark.parametrize("method,path", PROTECTED[:2])
def test_api_routes_reject_a_forged_token(anonymous, method, path):
    forged = jwt.encode(
        {"sub": "someone", "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        "a-different-secret-key-of-enough-length",
        algorithm="HS256",
    )
    response = getattr(anonymous, method)(path, headers={"Authorization": f"Bearer {forged}"})
    assert response.status_code == 401


def test_expired_token_is_rejected(anonymous, database_url):
    add_user(database_url, "scheduler.one")
    login = anonymous.post("/api/auth/login", json={"username": "scheduler.one", "password": PASSWORD})
    user_id = jwt.decode(login.json()["access_token"], options={"verify_signature": False})["sub"]
    expired = jwt.encode(
        {"sub": user_id, "exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
        anonymous.app.state.settings.secret_key,
        algorithm="HS256",
    )
    response = anonymous.get("/api/auth/me", headers={"Authorization": f"Bearer {expired}"})
    assert response.status_code == 401


def test_health_is_public(anonymous):
    assert anonymous.get("/health").json() == {"status": "ok"}


def test_login_returns_a_token_for_the_user(client):
    assert client.get("/api/auth/me").json() == {"username": "scheduler.one"}


@pytest.mark.parametrize("username,password", [("scheduler.one", "wrong-password"), ("nobody", PASSWORD)])
def test_login_rejects_bad_credentials(anonymous, database_url, username, password):
    add_user(database_url, "scheduler.one")
    response = anonymous.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"


def test_passwords_are_stored_hashed(database_url):
    add_user(database_url, "scheduler.one")
    from sqlalchemy import text

    from app.db import make_engine

    with make_engine(database_url).connect() as conn:
        stored = conn.execute(text("select password_hash from users")).scalar_one()
    assert PASSWORD not in stored
    assert stored.startswith("$2b$")


def test_production_refuses_to_start_without_secret_key(monkeypatch):
    monkeypatch.delenv("SECRET_KEY", raising=False)
    monkeypatch.delenv("APP_ENV", raising=False)
    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        load_settings()


def test_short_secret_key_is_refused(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "too-short")
    with pytest.raises(RuntimeError, match="at least"):
        load_settings()


def test_development_uses_a_default_secret_only_when_asked(monkeypatch):
    monkeypatch.delenv("SECRET_KEY", raising=False)
    monkeypatch.setenv("APP_ENV", "development")
    monkeypatch.delenv("DATABASE_URL", raising=False)
    settings = load_settings()
    assert settings.secret_key == DEV_SECRET_KEY
    assert settings.database_url.startswith("sqlite:///")


def test_frontend_url_accepts_several_origins(monkeypatch):
    monkeypatch.setenv("APP_ENV", "development")
    monkeypatch.setenv("FRONTEND_URL", "http://localhost:5173, https://escalas.example.org/")
    assert load_settings().cors_origins == ("http://localhost:5173", "https://escalas.example.org")


def test_legacy_postgres_scheme_is_normalized():
    assert normalize_database_url("postgres://u:p@h/db") == "postgresql://u:p@h/db"
    assert normalize_database_url("postgresql://u:p@h/db") == "postgresql://u:p@h/db"


def test_cli_creates_a_user_who_can_log_in(monkeypatch, database_url, capsys):
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("DATABASE_URL", database_url)
    monkeypatch.setattr("sys.stdin", io.StringIO("a-new-password\n"))
    assert cli.main(["create-user", "first.user", "--password-stdin"]) == 0

    monkeypatch.setattr("sys.stdin", io.StringIO("a-new-password\n"))
    assert cli.main(["create-user", "first.user", "--password-stdin"]) == 1
    assert "already exists" in capsys.readouterr().err

    with TestClient(create_app(make_settings(database_url))) as client:
        response = client.post(
            "/api/auth/login", json={"username": "first.user", "password": "a-new-password"}
        )
        assert response.status_code == 200


def test_cli_rejects_a_short_password(monkeypatch, database_url):
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("DATABASE_URL", database_url)
    monkeypatch.setattr("sys.stdin", io.StringIO("short\n"))
    assert cli.main(["create-user", "first.user", "--password-stdin"]) == 1


def test_cors_allows_the_configured_frontend(anonymous):
    response = anonymous.options(
        "/api/professionals",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
