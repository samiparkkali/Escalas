from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models.token import AuthToken
from app.repositories import ProfessionalRepository, UnavailabilityRepository
from app.services import ScheduleService


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user_id(
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing auth token")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")

    token_value = authorization.replace("Bearer ", "")
    token = db.query(AuthToken).filter_by(token=token_value).first()

    if not token:
        raise HTTPException(status_code=401, detail="Invalid auth token")

    return token.user_id


class Deps:
    def __init__(self):
        self.professional_repository = ProfessionalRepository()
        self.unavailability_repository = UnavailabilityRepository()
        self.schedule_service = ScheduleService(
            self.professional_repository,
            self.unavailability_repository,
        )


deps = Deps()