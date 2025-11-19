from dataclasses import dataclass
from datetime import datetime, time
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class ShiftType(Enum):
    MORNING = "morning"
    NIGHT = "night"


@dataclass
class Professional:
    id: UUID
    name: str
    is_active: bool = True
    
    @staticmethod
    def create(id: UUID, name: str) -> 'Professional':
        return Professional(
            id=id,
            name=name
        )


@dataclass
class Shift:
    id: UUID
    shift_type: ShiftType
    date: datetime
    start_time: time
    end_time: time
    required_staff: int = 1
    location: Optional[str] = None
    
    @staticmethod
    def create(
        shift_type: ShiftType,
        date: datetime,
        start_time: time,
        end_time: time,
        required_staff: int = 1,
        location: Optional[str] = None
    ) -> 'Shift':
        return Shift(
            id=uuid4(),
            shift_type=shift_type,
            date=date,
            start_time=start_time,
            end_time=end_time,
            required_staff=required_staff,
            location=location
        )


@dataclass
class Assignment:
    id: UUID
    professional_id: UUID
    shift_id: UUID
    assigned_at: datetime
    status: str = "assigned"
    notes: Optional[str] = None
    
    @staticmethod
    def create(
        professional_id: UUID,
        shift_id: UUID,
        notes: Optional[str] = None
    ) -> 'Assignment':
        return Assignment(
            id=uuid4(),
            professional_id=professional_id,
            shift_id=shift_id,
            assigned_at=datetime.now(),
            notes=notes
        )