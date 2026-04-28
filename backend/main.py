import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from typing import List

from app.models import (
    ProfessionalModel, CreateProfessionalRequest, UnavailabilityModel,
    CreateUnavailabilityRequest, GenerateScheduleRequest, ScheduleResponse,
    FullStatisticsResponse
)
from app.dependencies import deps

app = FastAPI(title="Shift Scheduler API")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}

# Professional CRUD endpoints
@app.get("/api/professionals", response_model=List[ProfessionalModel])
async def get_professionals():
    return deps.professional_repository.get_all()

@app.post("/api/professionals", response_model=ProfessionalModel)
async def create_professional(request: CreateProfessionalRequest):
    return deps.professional_repository.create(request.name, request.role)

@app.put("/api/professionals/{professional_id}", response_model=ProfessionalModel)
async def update_professional(professional_id: str, request: CreateProfessionalRequest):
    professional = deps.professional_repository.update(
        professional_id, 
        name=request.name, 
        role=request.role
    )
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
    return professional

@app.delete("/api/professionals/{professional_id}")
async def delete_professional(professional_id: str):
    # Remove associated unavailabilities first
    deps.unavailability_repository.delete_by_professional_id(professional_id)

    if not deps.professional_repository.delete(professional_id):
        raise HTTPException(status_code=404, detail="Professional not found")

    return {"message": "Professional deleted"}

# Unavailability CRUD endpoints
@app.get("/api/unavailabilities", response_model=List[UnavailabilityModel])
async def get_unavailabilities():
    return deps.unavailability_repository.get_all()

@app.post("/api/unavailabilities", response_model=UnavailabilityModel)
async def create_unavailability(request: CreateUnavailabilityRequest):
    if not deps.professional_repository.get_by_id(request.professional_id):
        raise HTTPException(status_code=404, detail="Professional not found")

    unavailability = deps.unavailability_repository.create(
        request.professional_id, request.date, request.shift_type
    )
    if not unavailability:
        # Since we checked the professional above, None implies it already exists
        raise HTTPException(status_code=400, detail="Unavailability already registered for this shift")
    return unavailability

@app.delete("/api/unavailabilities/{unavailability_id}")
async def delete_unavailability(unavailability_id: str):
    if not deps.unavailability_repository.delete(unavailability_id):
        raise HTTPException(status_code=404, detail="Unavailability not found")
    return {"message": "Unavailability deleted"}

@app.post("/api/schedule/generate", response_model=ScheduleResponse)
async def generate_schedule(request: GenerateScheduleRequest):
    try:
        return deps.schedule_service.generate_schedule(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/schedule/export")
async def export_schedule():
    csv_content = deps.schedule_service.export_schedule_csv()
    # Using utf-8-sig (BOM) is critical for Excel to render Á, É, Í etc. correctly
    return Response(
        content=csv_content.encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": "attachment; filename=escalas_hba.csv"}
    )

@app.get("/api/schedule/statistics", response_model=FullStatisticsResponse)
async def get_statistics():
    return deps.schedule_service.get_statistics()