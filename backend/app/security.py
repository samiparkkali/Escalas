from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt

ALGORITHM = "HS256"
MIN_PASSWORD_LENGTH = 8
# bcrypt only uses the first 72 bytes of a password.
MAX_PASSWORD_BYTES = 72

# Compared against when the username does not exist, so a failed login
# takes the same time whether or not the user exists.
_DUMMY_HASH = bcrypt.hashpw(b"not-a-real-password", bcrypt.gensalt()).decode()


def validate_new_password(password: str) -> None:
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")
    if len(password.encode("utf-8")) > MAX_PASSWORD_BYTES:
        raise ValueError(f"Password must be at most {MAX_PASSWORD_BYTES} bytes.")


def hash_password(password: str) -> str:
    validate_new_password(password)
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: Optional[str]) -> bool:
    encoded = password.encode("utf-8")
    if password_hash is None or len(encoded) > MAX_PASSWORD_BYTES:
        bcrypt.checkpw(b"x", _DUMMY_HASH.encode())
        return False
    return bcrypt.checkpw(encoded, password_hash.encode())


def create_access_token(user_id: str, secret_key: str, ttl_minutes: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": user_id, "iat": now, "exp": now + timedelta(minutes=ttl_minutes)}
    return jwt.encode(payload, secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str, secret_key: str) -> Optional[str]:
    """Returns the user id, or None when the token is invalid or expired."""
    try:
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM], options={"require": ["sub", "exp"]})
    except jwt.PyJWTError:
        return None
    return payload.get("sub")
