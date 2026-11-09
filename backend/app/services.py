"""Schedule generation, statistics and CSV export.

Rules enforced by the generator:
- Each shift needs a configured number of specialists and interns, with
  separate values for weekday and weekend mornings and nights.
- A professional is never assigned twice to the same shift and is never
  assigned to a shift they marked as unavailable.
- Only active professionals are scheduled.
- Rest: after a night shift a professional is not scheduled for the next two
  shifts (the next morning and the next night).
- 24h mode: the same people cover the morning and the night of a day, the
  head count is the larger of the two requirements, they must be available
  for both shifts, and they get the following day off.
- Fairness: candidates are picked by fewest total shifts, then fewest
  weekday/weekend shifts of the same kind, then fewest Saturdays or Sundays,
  then fewest shifts of the same type, then by name.
- Shifts that cannot be fully staffed are reported with the missing count.
"""

import csv
from dataclasses import dataclass
from datetime import date, timedelta
from io import StringIO
from typing import Dict, Iterable, List, Set, Tuple

from .schemas import (
    AssignmentResponse,
    Role,
    ScheduleConfigModel,
    ShiftType,
    StatisticsResponse,
    UnassignedShiftResponse,
)

SATURDAY = 5
SUNDAY = 6


@dataclass(frozen=True)
class Candidate:
    id: str
    name: str
    role: Role


@dataclass
class Shift:
    date: date
    shift_type: ShiftType
    is_weekend: bool
    weekday_num: int
    required_specialists: int
    required_interns: int

    def required(self, role: Role) -> int:
        return self.required_specialists if role == Role.specialist else self.required_interns


@dataclass
class ProfessionalLoad:
    professional: Candidate
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
        if weekday_num == SATURDAY:
            specific_day_load = self.saturday
        elif weekday_num == SUNDAY:
            specific_day_load = self.sunday

        shift_count = self.morning if shift_type == ShiftType.morning else self.night
        day_count = self.weekend if is_weekend else self.weekday
        return (self.total, day_count, specific_day_load, shift_count, self.professional.name)

    def record(self, shift: Shift) -> None:
        self.total += 1
        if shift.shift_type == ShiftType.morning:
            self.morning += 1
        else:
            self.night += 1
        if shift.is_weekend:
            self.weekend += 1
        else:
            self.weekday += 1
        if shift.weekday_num == SATURDAY:
            self.saturday += 1
        elif shift.weekday_num == SUNDAY:
            self.sunday += 1


@dataclass
class GeneratedSchedule:
    assignments: List[AssignmentResponse]
    unassigned_shifts: List[UnassignedShiftResponse]


def build_shifts(config: ScheduleConfigModel) -> List[Shift]:
    shifts: List[Shift] = []
    current = config.start_date
    while current <= config.end_date:
        weekday_num = current.weekday()
        is_weekend = weekday_num >= SATURDAY
        for shift_type in (ShiftType.morning, ShiftType.night):
            prefix = f"{shift_type.value}_{'weekend' if is_weekend else 'weekday'}"
            shifts.append(
                Shift(
                    date=current,
                    shift_type=shift_type,
                    is_weekend=is_weekend,
                    weekday_num=weekday_num,
                    required_specialists=getattr(config, f"{prefix}_specialist"),
                    required_interns=getattr(config, f"{prefix}_intern"),
                )
            )
        current += timedelta(days=1)
    return shifts


def generate_schedule(
    config: ScheduleConfigModel,
    professionals: Iterable[Candidate],
    unavailable: Set[Tuple[str, date, ShiftType]],
) -> GeneratedSchedule:
    shifts = build_shifts(config)
    loads: Dict[str, ProfessionalLoad] = {p.id: ProfessionalLoad(professional=p) for p in professionals}

    assignments: List[AssignmentResponse] = []
    unassigned: List[UnassignedShiftResponse] = []

    step = 2 if config.is_24h else 1
    for idx in range(0, len(shifts), step):
        group = shifts[idx : idx + step]
        assigned = {
            role: _assign_role(group, idx, role, loads, unavailable, assignments)
            for role in (Role.specialist, Role.intern)
        }
        for shift in group:
            missing_specialists = max(0, shift.required_specialists - assigned[Role.specialist])
            missing_interns = max(0, shift.required_interns - assigned[Role.intern])
            if missing_specialists or missing_interns:
                unassigned.append(
                    UnassignedShiftResponse(
                        date=shift.date,
                        shift_type=shift.shift_type,
                        required_specialists=missing_specialists,
                        required_interns=missing_interns,
                    )
                )

    return GeneratedSchedule(assignments=assignments, unassigned_shifts=unassigned)


def _assign_role(
    group: List[Shift],
    start_idx: int,
    role: Role,
    loads: Dict[str, ProfessionalLoad],
    unavailable: Set[Tuple[str, date, ShiftType]],
    assignments: List[AssignmentResponse],
) -> int:
    required = max(shift.required(role) for shift in group)
    if required == 0:
        return 0

    candidates = [
        load
        for load in loads.values()
        if load.professional.role == role
        and load.blocked_until_index <= start_idx
        and not any((load.professional.id, s.date, s.shift_type) in unavailable for s in group)
    ]
    lead = group[0]
    candidates.sort(key=lambda load: load.sort_key(lead.shift_type, lead.is_weekend, lead.weekday_num))

    chosen = candidates[:required]
    for load in chosen:
        for offset, shift in enumerate(group):
            assignments.append(
                AssignmentResponse(
                    professional_id=load.professional.id,
                    professional_name=load.professional.name,
                    professional_role=role,
                    shift_date=shift.date,
                    shift_type=shift.shift_type,
                )
            )
            load.record(shift)
            # After a night, skip the next two shifts; in 24h mode that is the whole next day.
            if shift.shift_type == ShiftType.night:
                load.blocked_until_index = start_idx + offset + 3
    return len(chosen)


def compute_statistics(assignments: Iterable[AssignmentResponse]) -> List[StatisticsResponse]:
    stats: Dict[str, StatisticsResponse] = {}
    for a in assignments:
        record = stats.get(a.professional_id)
        if record is None:
            record = stats[a.professional_id] = StatisticsResponse(
                professional_id=a.professional_id,
                name=a.professional_name,
                role=a.professional_role,
                morning=0,
                night=0,
                weekday=0,
                weekend=0,
                total=0,
            )
        if a.shift_type == ShiftType.morning:
            record.morning += 1
        else:
            record.night += 1
        if a.shift_date.weekday() >= SATURDAY:
            record.weekend += 1
        else:
            record.weekday += 1
        record.total += 1
    return sorted(stats.values(), key=_roster_order)


def _roster_order(item) -> tuple:
    # Specialists first, then interns; alphabetical within each role.
    return (0 if item.role == Role.specialist else 1, item.name.casefold())


def export_csv(start_date: date, end_date: date, assignments: List[AssignmentResponse]) -> str:
    """Semicolon-separated grid: one row per professional, a Morning and a Night
    column per day of the period, "X" where the professional works."""
    days = [start_date + timedelta(days=n) for n in range((end_date - start_date).days + 1)]

    header_dates = ["Professional Name"]
    header_shifts = [""]
    for day in days:
        label = day.strftime("%d-%m-%Y")
        header_dates.extend([label, label])
        # Padding widens the columns so Excel does not show the dates as "####".
        header_shifts.extend(["   Morning   ", "   Night   "])

    worked: Dict[str, Set[Tuple[date, ShiftType]]] = {}
    people: Dict[str, AssignmentResponse] = {}
    for a in assignments:
        worked.setdefault(a.professional_id, set()).add((a.shift_date, a.shift_type))
        people.setdefault(a.professional_id, a)

    output = StringIO(newline="")
    writer = csv.writer(output, delimiter=";")
    writer.writerow(header_dates)
    writer.writerow(header_shifts)
    ordered = sorted(
        people.values(),
        key=lambda a: (0 if a.professional_role == Role.specialist else 1, a.professional_name.casefold()),
    )
    for person in ordered:
        slots = worked[person.professional_id]
        row = [person.professional_name]
        for day in days:
            row.append("X" if (day, ShiftType.morning) in slots else "")
            row.append("X" if (day, ShiftType.night) in slots else "")
        writer.writerow(row)
    return output.getvalue()
