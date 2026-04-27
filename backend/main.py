import sys
sys.path.append('../src')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from io import StringIO
from typing import List

from app.models import (
    ProfessionalModel, CreateProfessionalRequest, UnavailabilityModel,
    CreateUnavailabilityRequest, GenerateScheduleRequest, ScheduleResponse,
    StatisticsResponse
)
from app.dependencies import deps

app = FastAPI(title="Shift Scheduler API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Professional CRUD endpoints
@app.get("/api/professionals", response_model=List[ProfessionalModel])
async def get_professionals():
    return deps.professional_repository.get_all()

@app.post("/api/professionals", response_model=ProfessionalModel)
async def create_professional(request: CreateProfessionalRequest):
    return deps.professional_repository.create(request.name, request.role)

@app.put("/api/professionals/{professional_id}", response_model=ProfessionalModel)
async def update_professional(professional_id: str, request: CreateProfessionalRequest):
    professional = deps.professional_repository.update(professional_id, request.name)
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
    unavailability = deps.unavailability_repository.create(
        request.professional_id, request.date, request.shift_type
    )
    if not unavailability:
        raise HTTPException(status_code=404, detail="Professional not found")
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
    return StreamingResponse(
        StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=schedule.csv"}
    )

@app.get("/api/schedule/statistics", response_model=List[StatisticsResponse])
async def get_statistics():
    return deps.schedule_service.get_statistics()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)