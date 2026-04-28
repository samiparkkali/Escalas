from dataclasses import dataclass
from datetime import date, timedelta
from typing import Dict, List, Optional
from uuid import uuid4
import csv
from io import StringIO

from .schemas import (
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
    weekday_num: int
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
    saturday: int = 0
    sunday: int = 0
    blocked_until_index: int = 0

    def sort_key(self, shift_type: ShiftType, is_weekend: bool, weekday_num: int):
        specific_day_load = 0
        if is_weekend:
            if weekday_num == 5: # Saturday
                specific_day_load = self.saturday
            elif weekday_num == 6: # Sunday
                specific_day_load = self.sunday

        shift_count = self.morning if shift_type == ShiftType.morning else self.night
        day_count = self.weekend if is_weekend else self.weekday
        return (self.total, day_count, specific_day_load, shift_count, self.professional.name)


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

        step = 2 if config.is_24h else 1
        for idx in range(0, len(shifts), step):
            current_group = shifts[idx : idx + step]

            assigned_specialists = self._assign_role(
                current_group,
                idx,
                Role.specialist,
                professional_loads,
                assignments,
            )
            assigned_interns = self._assign_role(
                current_group,
                idx,
                Role.intern,
                professional_loads,
                assignments,
            )

            for shift in current_group:
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

    def get_statistics(self) -> Dict:
        if not self._current_schedule:
            return {"professional_stats": [], "unassigned_shifts": []}

        assignments: List[AssignmentResponse] = self._current_schedule["assignments_raw"]
        stats: Dict[str, StatisticsResponse] = {}

        for assignment in assignments:
            if assignment.professional_name not in stats:
                stats[assignment.professional_name] = StatisticsResponse(
                    name=assignment.professional_name,
                    role=assignment.professional_role,
                    morning=0,
                    night=0,
                    weekday=0,
                    weekend=0,
                    total=0,
                )

            record = stats[assignment.professional_name]
            if assignment.shift_type == ShiftType.morning:
                record.morning += 1
            else:
                record.night += 1

            if assignment.shift_date.weekday() >= 5:
                record.weekend += 1
            else:
                record.weekday += 1

            record.total += 1

        return {
            "professional_stats": list(stats.values()),
            "unassigned_shifts": self._current_schedule.get("unassigned_shifts", [])
        }

    def export_schedule_csv(self) -> str:
        if not self._current_schedule:
            return "No schedule generated yet\n"

        assignments_raw: List[AssignmentResponse] = self._current_schedule.get("assignments_raw", [])
        
        # Collect all unique dates and sort them
        unique_dates = sorted(list(set(a.shift_date for a in assignments_raw)))

        # Prepare the header rows
        # Repeating the date in the first row and adding padding to shift names
        # forces Excel to widen the columns, preventing the '####' truncation.
        header_row_1 = ["Professional Name"] 
        header_row_2 = [""] # Empty cell for the professional name column

        for date_val in unique_dates:
            date_str = date_val.strftime("%d-%m-%Y")
            header_row_1.extend([date_str, date_str]) 
            header_row_2.extend(["   Morning   ", "   Night   "])

        # Group assignments by professional and then by (date, shift_type)
        professional_assignments: Dict[str, Dict[tuple, AssignmentResponse]] = {}
        for assignment in assignments_raw:
            prof_name = assignment.professional_name
            if prof_name not in professional_assignments:
                professional_assignments[prof_name] = {}
            professional_assignments[prof_name][(assignment.shift_date, assignment.shift_type)] = assignment

        # Get all professionals involved in the schedule, sorted by role and then name
        # This ensures specialists are listed before interns
        all_professionals_in_schedule = sorted(
            list(set(a.professional_name for a in assignments_raw)),
            key=lambda name: (
                # Role.specialist starts with 's', Role.intern starts with 'i'
                # We reverse the role sort to put 'specialist' first
                0 if next(p.role for p in self.professional_repository.get_all() if p.name == name) == Role.specialist else 1,
                name
            )
        )

        # Prepare data rows
        csv_rows = []
        for prof_name in all_professionals_in_schedule:
            row_data = [prof_name]
            for date_val in unique_dates:
                # Check for morning shift
                if (date_val, ShiftType.morning) in professional_assignments.get(prof_name, {}):
                    row_data.append("X")
                else:
                    row_data.append("")
                
                # Check for night shift
                if (date_val, ShiftType.night) in professional_assignments.get(prof_name, {}):
                    row_data.append("X")
                else:
                    row_data.append("")
            csv_rows.append(row_data)

        # Write to StringIO
        output = StringIO(newline='')
        # Force Excel to recognize semicolon as the delimiter immediately
        output.write("sep=;\n")
        
        writer = csv.writer(output, delimiter=';')
        
        writer.writerow(header_row_1)
        writer.writerow(header_row_2)
        writer.writerows(csv_rows)

        return output.getvalue()

    def _build_shifts(self, config) -> List[Shift]:
        shifts: List[Shift] = []
        current = config.start_date
        while current <= config.end_date:
            weekday_num = current.weekday()
            is_weekend = weekday_num >= 5
            shifts.append(
                Shift(
                    id=str(uuid4()),
                    date=current,
                    shift_type=ShiftType.morning,
                    is_weekend=is_weekend,
                    weekday_num=weekday_num,
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
                    weekday_num=weekday_num,
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
        shifts: List[Shift],
        start_idx: int,
        role: Role,
        professional_loads: Dict[str, ProfessionalLoad],
        assignments: List[AssignmentResponse],
    ) -> int:
        if not shifts:
            return 0

        # Determine requirement based on the primary shift in the group
        lead_shift = shifts[0]
        required = 0
        for s in shifts:
            req = s.required_specialists if role == Role.specialist else s.required_interns
            required = max(required, req)

        if required == 0:
            return 0

        # Filter professionals by role and check availability
        candidates = []
        for load in professional_loads.values():
            if load.professional.role == role:
                # Check if professional is in a rest period
                if load.blocked_until_index > start_idx:
                    continue

                # Must be available for ALL shifts in the group (e.g., Morning AND Night)
                is_available = True
                for s in shifts:
                    if self.unavailability_repository.is_unavailable(
                        load.professional.id, s.date, s.shift_type
                    ):
                        is_available = False
                        break

                if is_available:
                    candidates.append(load)

        # Sort by load (least shifts first) to ensure fair distribution
        candidates.sort(key=lambda load: load.sort_key(lead_shift.shift_type, lead_shift.is_weekend, lead_shift.weekday_num))

        assigned = 0
        for load in candidates[:required]:
            for s_idx, s in enumerate(shifts):
                assignments.append(
                    AssignmentResponse(
                        professional_name=load.professional.name,
                        professional_role=role,
                        shift_date=s.date,
                        shift_type=s.shift_type,
                    )
                )
                load.total += 1
                if s.shift_type == ShiftType.morning:
                    load.morning += 1
                else:
                    load.night += 1
                if s.is_weekend:
                    load.weekend += 1
                else:
                    load.weekday += 1

                if s.weekday_num == 5:
                    load.saturday += 1
                elif s.weekday_num == 6:
                    load.sunday += 1

                # Rest period: if scheduled for night, unavailable for next two shifts
                # In 24h mode, the block ends at night, ensuring a full day off after
                if s.shift_type == ShiftType.night:
                    load.blocked_until_index = start_idx + s_idx + 3

            assigned += 1

        return assigned