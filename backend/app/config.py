import os
from dataclasses import dataclass
from pathlib import Path

DEV_ENVIRONMENTS = {"development", "test"}
DEV_SECRET_KEY = "development-only-secret-key-do-not-use-in-production"
MIN_SECRET_KEY_LENGTH = 32
DEFAULT_SQLITE_PATH = Path(__file__).resolve().parent.parent / "escalas.db"


@dataclass(frozen=True)
class Settings:
    app_env: str
    database_url: str
    secret_key: str
    cors_origins: tuple[str, ...]
    token_ttl_minutes: int


def normalize_database_url(url: str) -> str:
    # Some hosts still hand out the legacy postgres:// scheme, which SQLAlchemy rejects.
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://") :]
    return url


def load_settings() -> Settings:
    app_env = os.getenv("APP_ENV", "production").strip().lower()

    secret_key = os.getenv("SECRET_KEY", "")
    if not secret_key:
        if app_env not in DEV_ENVIRONMENTS:
            raise RuntimeError("SECRET_KEY is not set. Set it, or set APP_ENV=development for local use.")
        secret_key = DEV_SECRET_KEY
    elif len(secret_key) < MIN_SECRET_KEY_LENGTH:
        raise RuntimeError(f"SECRET_KEY must be at least {MIN_SECRET_KEY_LENGTH} characters.")

    database_url = normalize_database_url(os.getenv("DATABASE_URL") or f"sqlite:///{DEFAULT_SQLITE_PATH}")

    origins = tuple(
        origin.strip().rstrip("/")
        for origin in os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")
        if origin.strip()
    )

    return Settings(
        app_env=app_env,
        database_url=database_url,
        secret_key=secret_key,
        cors_origins=origins,
        token_ttl_minutes=int(os.getenv("TOKEN_TTL_MINUTES", "720")),
    )
