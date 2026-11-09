from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import services
from .config import Settings, load_settings
from .db import create_tables, make_engine, make_sessionmaker
from .dependencies import (
    get_current_user,
    get_db,
    get_professionals,
    get_schedules,
    get_settings,
    get_unavailabilities,
)
from .orm import Schedule, User
from .repositories import (
    ProfessionalRepository,
    ScheduleRepository,
    UnavailabilityRepository,
    UserRepository,
)
from .schemas import (
    AssignmentResponse,
    CreateProfessionalRequest,
    CreateUnavailabilityRequest,
    FullStatisticsResponse,
    GenerateScheduleRequest,
    LoginRequest,
    ProfessionalModel,
    Role,
    ScheduleResponse,
    ShiftType,
    TokenResponse,
    UnassignedShiftResponse,
    UnavailabilityModel,
    UpdateProfessionalRequest,
    UserResponse,
)
from .security import create_access_token, verify_password


def _assignments(schedule: Schedule) -> List[AssignmentResponse]:
    return [
        AssignmentResponse(
            professional_id=a.professional_id,
            professional_name=a.professional_name,
            professional_role=Role(a.professional_role),
            shift_date=a.shift_date,
            shift_type=ShiftType(a.shift_type),
        )
        for a in schedule.assignments
    ]


def _unfilled(schedule: Schedule) -> List[UnassignedShiftResponse]:
    return [
        UnassignedShiftResponse(
            date=u.date,
            shift_type=ShiftType(u.shift_type),
            required_specialists=u.missing_specialists,
            required_interns=u.missing_interns,
        )
        for u in schedule.unfilled_shifts
    ]


def _schedule_response(schedule: Schedule) -> ScheduleResponse:
    unfilled = _unfilled(schedule)
    return ScheduleResponse(
        start_date=schedule.start_date,
        end_date=schedule.end_date,
        is_24h=schedule.is_24h,
        assignments=_assignments(schedule),
        unassigned_shifts=unfilled,
        success=not unfilled,
        message="Schedule generated" if not unfilled else "Schedule generated with unfilled shifts",
    )


def _latest_or_404(schedules: ScheduleRepository) -> Schedule:
    schedule = schedules.get_latest()
    if schedule is None:
        raise HTTPException(status_code=404, detail="No schedule generated yet")
    return schedule


def create_app(settings: Optional[Settings] = None) -> FastAPI:
    settings = settings or load_settings()
    engine = make_engine(settings.database_url)

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        create_tables(engine)
        yield
        engine.dispose()

    app = FastAPI(title="Escalas - Shift Scheduler API", lifespan=lifespan)
    app.state.settings = settings
    app.state.sessionmaker = make_sessionmaker(engine)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["Authorization", "Content-Type"],
        expose_headers=["Content-Disposition"],
    )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    # Auth

    @app.post("/api/auth/login", response_model=TokenResponse)
    def login(
        request: LoginRequest,
        db: Session = Depends(get_db),
        settings: Settings = Depends(get_settings),
    ):
        user = UserRepository(db).get_by_username(request.username)
        if not verify_password(request.password, user.password_hash if user else None):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        token = create_access_token(user.id, settings.secret_key, settings.token_ttl_minutes)
        return TokenResponse(access_token=token, username=user.username)

    @app.get("/api/auth/me", response_model=UserResponse)
    def me(user: User = Depends(get_current_user)):
        return UserResponse(username=user.username)

    # Professionals

    @app.get("/api/professionals", response_model=List[ProfessionalModel])
    def list_professionals(repo: ProfessionalRepository = Depends(get_professionals)):
        return repo.get_all()

    @app.post("/api/professionals", response_model=ProfessionalModel, status_code=200)
    def create_professional(
        request: CreateProfessionalRequest,
        repo: ProfessionalRepository = Depends(get_professionals),
    ):
        return repo.create(request.name, request.role)

    @app.put("/api/professionals/{professional_id}", response_model=ProfessionalModel)
    def update_professional(
        professional_id: str,
        request: UpdateProfessionalRequest,
        repo: ProfessionalRepository = Depends(get_professionals),
    ):
        professional = repo.update(professional_id, request.name, request.role, request.is_active)
        if not professional:
            raise HTTPException(status_code=404, detail="Professional not found")
        return professional

    @app.delete("/api/professionals/{professional_id}")
    def delete_professional(professional_id: str, repo: ProfessionalRepository = Depends(get_professionals)):
        if not repo.delete(professional_id):
            raise HTTPException(status_code=404, detail="Professional not found")
        return {"message": "Professional deleted"}

    # Unavailabilities

    @app.get("/api/unavailabilities", response_model=List[UnavailabilityModel])
    def list_unavailabilities(repo: UnavailabilityRepository = Depends(get_unavailabilities)):
        return repo.get_all()

    @app.post("/api/unavailabilities", response_model=UnavailabilityModel)
    def create_unavailability(
        request: CreateUnavailabilityRequest,
        professionals: ProfessionalRepository = Depends(get_professionals),
        repo: UnavailabilityRepository = Depends(get_unavailabilities),
    ):
        if not professionals.get_by_id(request.professional_id):
            raise HTTPException(status_code=404, detail="Professional not found")
        unavailability = repo.create(request.professional_id, request.date, request.shift_type)
        if not unavailability:
            raise HTTPException(status_code=400, detail="Unavailability already registered for this shift")
        return unavailability

    @app.delete("/api/unavailabilities/{unavailability_id}")
    def delete_unavailability(
        unavailability_id: str, repo: UnavailabilityRepository = Depends(get_unavailabilities)
    ):
        if not repo.delete(unavailability_id):
            raise HTTPException(status_code=404, detail="Unavailability not found")
        return {"message": "Unavailability deleted"}

    # Schedule

    @app.post("/api/schedule/generate", response_model=ScheduleResponse)
    def generate_schedule(
        request: GenerateScheduleRequest,
        professionals: ProfessionalRepository = Depends(get_professionals),
        unavailabilities: UnavailabilityRepository = Depends(get_unavailabilities),
        schedules: ScheduleRepository = Depends(get_schedules),
    ):
        candidates = [
            services.Candidate(id=p.id, name=p.name, role=Role(p.role)) for p in professionals.get_active()
        ]
        result = services.generate_schedule(request.config, candidates, unavailabilities.unavailable_slots())
        schedule = schedules.replace(
            request.config.model_dump(), result.assignments, result.unassigned_shifts
        )
        return _schedule_response(schedule)

    @app.get("/api/schedule", response_model=Optional[ScheduleResponse])
    def latest_schedule(schedules: ScheduleRepository = Depends(get_schedules)):
        """The latest schedule, or null when none has been generated."""
        schedule = schedules.get_latest()
        return _schedule_response(schedule) if schedule else None

    @app.get("/api/schedule/export")
    def export_schedule(schedules: ScheduleRepository = Depends(get_schedules)):
        schedule = _latest_or_404(schedules)
        content = services.export_csv(schedule.start_date, schedule.end_date, _assignments(schedule))
        filename = f"escalas_{schedule.start_date:%Y-%m-%d}_{schedule.end_date:%Y-%m-%d}.csv"
        # The UTF-8 BOM makes Excel read accented names correctly.
        return Response(
            content=content.encode("utf-8-sig"),
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    @app.get("/api/schedule/statistics", response_model=FullStatisticsResponse)
    def statistics(schedules: ScheduleRepository = Depends(get_schedules)):
        schedule = schedules.get_latest()
        if schedule is None:
            return FullStatisticsResponse(professional_stats=[], unassigned_shifts=[])
        return FullStatisticsResponse(
            professional_stats=services.compute_statistics(_assignments(schedule)),
            unassigned_shifts=_unfilled(schedule),
        )

    return app


app = create_app()
