from datetime import date
from enum import Enum
from typing import Annotated, List, Optional

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

MAX_PERIOD_DAYS = 366

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]


class Role(str, Enum):
    specialist = "specialist"
    intern = "intern"


class ShiftType(str, Enum):
    morning = "morning"
    night = "night"


class LoginRequest(BaseModel):
    username: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=64)]
    password: Annotated[str, StringConstraints(min_length=1, max_length=128)]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class UserResponse(BaseModel):
    username: str


class ProfessionalModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    role: Role
    is_active: bool = True


class CreateProfessionalRequest(BaseModel):
    name: Name
    role: Role


class UpdateProfessionalRequest(BaseModel):
    name: Name
    role: Role
    is_active: Optional[bool] = None


class UnavailabilityModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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

    is_24h: bool = Field(default=False)

    morning_weekday_specialist: int = Field(default=1, ge=0)
    night_weekday_specialist: int = Field(default=1, ge=0)
    morning_weekend_specialist: int = Field(default=1, ge=0)
    night_weekend_specialist: int = Field(default=1, ge=0)

    morning_weekday_intern: int = Field(default=2, ge=0)
    night_weekday_intern: int = Field(default=2, ge=0)
    morning_weekend_intern: int = Field(default=2, ge=0)
    night_weekend_intern: int = Field(default=2, ge=0)

    @model_validator(mode="after")
    def _check_period(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        if (self.end_date - self.start_date).days + 1 > MAX_PERIOD_DAYS:
            raise ValueError(f"the period cannot exceed {MAX_PERIOD_DAYS} days")
        return self


class GenerateScheduleRequest(BaseModel):
    config: ScheduleConfigModel


class AssignmentResponse(BaseModel):
    professional_id: str
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
    start_date: date
    end_date: date
    is_24h: bool
    assignments: List[AssignmentResponse]
    unassigned_shifts: List[UnassignedShiftResponse]
    success: bool
    message: str


class StatisticsResponse(BaseModel):
    professional_id: str
    name: str
    role: Role
    morning: int
    night: int
    weekday: int
    weekend: int
    total: int


class FullStatisticsResponse(BaseModel):
    professional_stats: List[StatisticsResponse]
    unassigned_shifts: List[UnassignedShiftResponse]
