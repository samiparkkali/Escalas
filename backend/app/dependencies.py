from typing import Iterator

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .config import Settings
from .orm import User
from .repositories import (
    ProfessionalRepository,
    ScheduleRepository,
    UnavailabilityRepository,
    UserRepository,
)
from .security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_db(request: Request) -> Iterator[Session]:
    with request.app.state.sessionmaker() as db:
        yield db


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized
    user_id = decode_access_token(credentials.credentials, settings.secret_key)
    user = UserRepository(db).get_by_id(user_id) if user_id else None
    if user is None:
        raise unauthorized
    return user


def get_professionals(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> ProfessionalRepository:
    return ProfessionalRepository(db, user.id)


def get_unavailabilities(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> UnavailabilityRepository:
    return UnavailabilityRepository(db, user.id)


def get_schedules(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> ScheduleRepository:
    return ScheduleRepository(db, user.id)
