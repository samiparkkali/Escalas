from pydantic import BaseModel
from typing import List

# API Models (DTOs)
class ProfessionalModel(BaseModel):
    id: str
    name: str
    is_active: bool = True

class CreateProfessionalRequest(BaseModel):
    name: str

class UnavailabilityModel(BaseModel):
    id: str
    professional_id: str
    date: str
    shift_type: str
    professional_name: str

class CreateUnavailabilityRequest(BaseModel):
    professional_id: str
    date: str
    shift_type: str

class ScheduleConfigModel(BaseModel):
    start_date: str
    end_date: str
    morning_weekday: int
    night_weekday: int
    morning_weekend: int
    night_weekend: int

class GenerateScheduleRequest(BaseModel):
    professionals: List[ProfessionalModel]
    unavailabilities: List[UnavailabilityModel]
    config: ScheduleConfigModel

class AssignmentResponse(BaseModel):
    professional_name: str
    shift_date: str
    shift_type: str

class UnassignedShiftResponse(BaseModel):
    date: str
    shift_type: str
    required_staff: int

class ScheduleResponse(BaseModel):
    assignments: List[AssignmentResponse]
    unassigned_shifts: List[UnassignedShiftResponse]
    success: bool
    message: str

class StatisticsResponse(BaseModel):
    name: str
    morning: int
    night: int
    total: int