import os
import uuid
from typing import List

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.schemas import (
    ProfessionalModel,
    CreateProfessionalRequest,
    UnavailabilityModel,
    CreateUnavailabilityRequest,
    GenerateScheduleRequest,
    ScheduleResponse,
    FullStatisticsResponse,
)

from app.dependencies import deps, get_db, get_current_user_id
from app.models.user import User
from app.models.token import AuthToken


app = FastAPI(title="Shift Scheduler API")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------
# Health
# --------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# --------------------
# Auth
# --------------------
@app.post("/auth/login")
def login(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=email).first()
    if not user:
        user = User(email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    token_value = str(uuid.uuid4())
    db.add(AuthToken(token=token_value, user_id=user.id))
    db.commit()

    return {"token": token_value}


# --------------------
# Professionals
# --------------------
@app.get("/api/professionals", response_model=List[ProfessionalModel])
def get_professionals(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return deps.professional_repository.get_all(db, user_id)


@app.post("/api/professionals", response_model=ProfessionalModel)
def create_professional(
    request: CreateProfessionalRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return deps.professional_repository.create(
        db,
        user_id,
        request.name,
        request.role,
    )


@app.put("/api/professionals/{professional_id}", response_model=ProfessionalModel)
def update_professional(
    professional_id: str,
    request: CreateProfessionalRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    professional = deps.professional_repository.update(
        db,
        user_id,
        professional_id,
        request.name,
        request.role,
    )
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
    return professional


@app.delete("/api/professionals/{professional_id}")
def delete_professional(
    professional_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    deps.unavailability_repository.delete_by_professional_id(
        db,
        user_id,
        professional_id,
    )

    if not deps.professional_repository.delete(db, user_id, professional_id):
        raise HTTPException(status_code=404, detail="Professional not found")

    return {"message": "Professional deleted"}


# --------------------
# Unavailabilities
# --------------------
@app.get("/api/unavailabilities", response_model=List[UnavailabilityModel])
def get_unavailabilities(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return deps.unavailability_repository.get_all(db, user_id)


@app.post("/api/unavailabilities", response_model=UnavailabilityModel)
def create_unavailability(
    request: CreateUnavailabilityRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if not deps.professional_repository.get_by_id(
        db, user_id, request.professional_id
    ):
        raise HTTPException(status_code=404, detail="Professional not found")

    unavailability = deps.unavailability_repository.create(
        db,
        user_id,
        request.professional_id,
        request.date,
        request.shift_type,
    )

    if not unavailability:
        raise HTTPException(
            status_code=400,
            detail="Unavailability already registered for this shift",
        )

    return unavailability


@app.delete("/api/unavailabilities/{unavailability_id}")
def delete_unavailability(
    unavailability_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if not deps.unavailability_repository.delete(db, user_id, unavailability_id):
        raise HTTPException(status_code=404, detail="Unavailability not found")

    return {"message": "Unavailability deleted"}


# --------------------
# Schedule
# --------------------
@app.post("/api/schedule/generate", response_model=ScheduleResponse)
def generate_schedule(
    request: GenerateScheduleRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return deps.schedule_service.generate_schedule(db, user_id, request)


@app.get("/api/schedule/export")
def export_schedule(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    csv_content = deps.schedule_service.export_schedule_csv(db, user_id)
    return Response(
        content=csv_content.encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": "attachment; filename=escalas_hba.csv"},
    )


@app.get("/api/schedule/statistics", response_model=FullStatisticsResponse)
def get_statistics(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return deps.schedule_service.get_statistics(db, user_id)