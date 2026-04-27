from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Dict, List, Optional
from uuid import uuid4
import csv
from io import StringIO

from .models import (
    GenerateScheduleRequest,
    AssignmentResponse,
    UnassignedShiftResponse,
    ScheduleResponse,
    StatisticsResponse,
    ProfessionalModel,
    Role,
    ShiftType,
)
from .repositories import ProfessionalRepository, UnavailabilityRepository


@dataclass
class Shift:
    id: str
    date: date
    shift_type: ShiftType
    is_weekend: bool
    required_specialists: int
    required_interns: int


@dataclass
class ProfessionalLoad:
    professional: ProfessionalModel
    total: int = 0
    morning: int = 0
    night: int = 0
    weekday: int = 0
    weekend: int = 0

    def sort_key(self, shift_type: ShiftType, is_weekend: bool):
        shift_count = self.morning if shift_type == ShiftType.morning else self.night
        day_count = self.weekend if is_weekend else self.weekday
        return (self.total, shift_count, day_count, self.professional.name)


class ScheduleService:
    def __init__(
        self,
        professional_repository: ProfessionalRepository,
        unavailability_repository: UnavailabilityRepository,
    ):
        self.professional_repository = professional_repository
        self.unavailability_repository = unavailability_repository
        self._current_schedule: Optional[Dict] = None

    def generate_schedule(self, request: GenerateScheduleRequest) -> ScheduleResponse:
        config = request.config
        shifts = self._build_shifts(config)

        specialists = self.professional_repository.get_active_by_role(Role.specialist)
        interns = self.professional_repository.get_active_by_role(Role.intern)

        professional_loads: Dict[str, ProfessionalLoad] = {
            p.id: ProfessionalLoad(professional=p)
            for p in specialists + interns
        }

        assignments: List[AssignmentResponse] = []
        unassigned_shifts: List[UnassignedShiftResponse] = []

        for shift in shifts:
            assigned_specialists = self._assign_role(
                shift,
                Role.specialist,
                professional_loads,
                assignments,
            )
            assigned_interns = self._assign_role(
                shift,
                Role.intern,
                professional_loads,
                assignments,
            )

            missing_specialists = max(0, shift.required_specialists - assigned_specialists)
            missing_interns = max(0, shift.required_interns - assigned_interns)

            if missing_specialists or missing_interns:
                unassigned_shifts.append(
                    UnassignedShiftResponse(
                        date=shift.date,
                        shift_type=shift.shift_type,
                        required_specialists=missing_specialists,
                        required_interns=missing_interns,
                    )
                )

        self._current_schedule = {
            "assignments": [a.model_dump() for a in assignments],
            "unassigned_shifts": [u.model_dump() for u in unassigned_shifts],
            "assignments_raw": assignments,
        }

        return ScheduleResponse(
            assignments=assignments,
            unassigned_shifts=unassigned_shifts,
            success=len(unassigned_shifts) == 0,
            message="Schedule generated"
            if len(unassigned_shifts) == 0
            else "Schedule generated with unfilled shifts",
        )

    def get_statistics(self) -> List[StatisticsResponse]:
        if not self._current_schedule:
            return []

        assignments: List[AssignmentResponse] = self._current_schedule["assignments_raw"]
        stats: Dict[str, StatisticsResponse] = {}

        for assignment in assignments:
            if assignment.professional_name not in stats:
                stats[assignment.professional_name] = StatisticsResponse(
                    name=assignment.professional_name,
                    role=assignment.professional_role,
                    morning=0,
                    night=0,
                    total=0,
                )

            record = stats[assignment.professional_name]
            if assignment.shift_type == ShiftType.morning:
                record.morning += 1
            else:
                record.night += 1
            record.total += 1

        return list(stats.values())

    def export_schedule_csv(self) -> str:
        if not self._current_schedule:
            return "No schedule generated yet\n"

        assignments: List[AssignmentResponse] = self._current_schedule["assignments_raw"]
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(["date", "shift_type", "role", "professional_name"])

        sorted_assignments = sorted(
            assignments,
            key=lambda item: (item.shift_date, item.shift_type, item.professional_role, item.professional_name),
        )

        for assignment in sorted_assignments:
            writer.writerow(
                [
                    assignment.shift_date.isoformat(),
                    assignment.shift_type.value,
                    assignment.professional_role.value,
                    assignment.professional_name,
                ]
            )

        return output.getvalue()

    def _build_shifts(self, config) -> List[Shift]:
        shifts: List[Shift] = []
        current = config.start_date
        while current <= config.end_date:
            is_weekend = current.weekday() >= 5
            shifts.append(
                Shift(
                    id=str(uuid4()),
                    date=current,
                    shift_type=ShiftType.morning,
                    is_weekend=is_weekend,
                    required_specialists=config.morning_weekend_specialist
                    if is_weekend
                    else config.morning_weekday_specialist,
                    required_interns=config.morning_weekend_intern
                    if is_weekend
                    else config.morning_weekday_intern,
                )
            )
            shifts.append(
                Shift(
                    id=str(uuid4()),
                    date=current,
                    shift_type=ShiftType.night,
                    is_weekend=is_weekend,
                    required_specialists=config.night_weekend_specialist
                    if is_weekend
                    else config.night_weekday_specialist,
                    required_interns=config.night_weekend_intern
                    if is_weekend
                    else config.night_weekday_intern,
                )
            )
            current += timedelta(days=1)

        return shifts

    def _assign_role(
        self,
        shift: Shift,
        role: Role,
        professional_loads: Dict[str, ProfessionalLoad],
        assignments: List[AssignmentResponse],
    ) -> int:
        required = (
            shift.required_specialists
            if role == Role.specialist
            else shift.required_interns
        )
        if required == 0:
            return 0

        candidates = [
            load
            for load in professional_loads.values()
            if load.professional.role == role
            and not self.unavailability_repository.is_unavailable(
                load.professional.id, shift.date, shift.shift_type
            )
        ]
        candidates.sort(key=lambda load: load.sort_key(shift.shift_type, shift.is_weekend))

        assigned = 0
        for load in candidates[:required]:
            assignments.append(
                AssignmentResponse(
                    professional_name=load.professional.name,
                    professional_role=role,
                    shift_date=shift.date,
                    shift_type=shift.shift_type,
                )
            )
            assigned += 1
            load.total += 1
            if shift.shift_type == ShiftType.morning:
                load.morning += 1
            else:
                load.night += 1
            if shift.is_weekend:
                load.weekend += 1
            else:
                load.weekday += 1

        return assigned