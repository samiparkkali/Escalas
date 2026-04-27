from enum import Enum
from datetime import date
from typing import List
from pydantic import BaseModel


class Role(str, Enum):
    specialist = "specialist"
    intern = "intern"


class ShiftType(str, Enum):
    morning = "morning"
    night = "night"


class ProfessionalModel(BaseModel):
    id: str
    name: str
    role: Role
    is_active: bool = True


class CreateProfessionalRequest(BaseModel):
    name: str
    role: Role


class UnavailabilityModel(BaseModel):
    id: str
    professional_id: str
    date: date
    shift_type: ShiftType


class CreateUnavailabilityRequest(BaseModel):
    professional_id: str
    date: date
    shift_type: ShiftType


class ScheduleConfigModel(BaseModel):
    start_date: date
    end_date: date

    morning_weekday_specialist: int
    night_weekday_specialist: int
    morning_weekend_specialist: int
    night_weekend_specialist: int

    morning_weekday_intern: int
    night_weekday_intern: int
    morning_weekend_intern: int
    night_weekend_intern: int


class GenerateScheduleRequest(BaseModel):
    config: ScheduleConfigModel


class AssignmentResponse(BaseModel):
    professional_name: str
    professional_role: Role
    shift_date: date
    shift_type: ShiftType


class UnassignedShiftResponse(BaseModel):
    date: date
    shift_type: ShiftType
    required_specialists: int
    required_interns: int


class ScheduleResponse(BaseModel):
    assignments: List[AssignmentResponse]
    unassigned_shifts: List[UnassignedShiftResponse]
    success: bool
    message: str


class StatisticsResponse(BaseModel):
    name: str
    role: Role
    morning: int
    night: int
    total: int