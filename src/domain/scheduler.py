from dataclasses import dataclass
from datetime import datetime, timedelta, date
from typing import List, Dict, Optional, Set
from uuid import UUID
import random

from .entities import Professional, Shift, Assignment, ShiftType


@dataclass
class ShiftRequirements:
    morning_weekday: int
    night_weekday: int
    morning_weekend: int
    night_weekend: int


@dataclass
class ScheduleResult:
    assignments: List[Assignment]
    unassigned_shifts: List[Shift]
    success: bool
    message: str


@dataclass
class Unavailability:
    professional_id: UUID
    date: date
    shift_type: ShiftType
    reason: Optional[str] = None
    
    @staticmethod
    def create(
        professional_id: UUID,
        date: date,
        shift_type: ShiftType,
        reason: Optional[str] = None
    ) -> 'Unavailability':
        return Unavailability(
            professional_id=professional_id,
            date=date,
            shift_type=shift_type,
            reason=reason
        )


class Scheduler:
    def __init__(self, professionals: List[Professional], unavailabilities: Optional[List[Unavailability]] = None):
        self.professionals = [p for p in professionals if p.is_active]
        self.assignment_history: Dict[UUID, List[Assignment]] = {}
        self.unavailabilities = unavailabilities or []
        self._build_unavailability_index()
    
    def _build_unavailability_index(self):
        self.unavailability_index: Dict[tuple[date, ShiftType], Set[UUID]] = {}
        for unavail in self.unavailabilities:
            key = (unavail.date, unavail.shift_type)
            if key not in self.unavailability_index:
                self.unavailability_index[key] = set()
            self.unavailability_index[key].add(unavail.professional_id)
    
    def add_unavailability(self, unavailability: Unavailability):
        self.unavailabilities.append(unavailability)
        key = (unavailability.date, unavailability.shift_type)
        if key not in self.unavailability_index:
            self.unavailability_index[key] = set()
        self.unavailability_index[key].add(unavailability.professional_id)
    
    def remove_unavailability(self, professional_id: UUID, date: date, shift_type: ShiftType):
        self.unavailabilities = [
            u for u in self.unavailabilities
            if not (u.professional_id == professional_id and u.date == date and u.shift_type == shift_type)
        ]
        self._build_unavailability_index()
    
    def is_available(self, professional_id: UUID, shift_date: date, shift_type: ShiftType) -> bool:
        key = (shift_date, shift_type)
        unavailable_professionals = self.unavailability_index.get(key, set())
        return professional_id not in unavailable_professionals
    
    def get_unavailabilities_for_professional(self, professional_id: UUID) -> List[Unavailability]:
        return [u for u in self.unavailabilities if u.professional_id == professional_id]
    
    def get_unavailabilities_for_date(self, date: date) -> List[Unavailability]:
        return [u for u in self.unavailabilities if u.date == date]
    
    def generate_shifts(
        self,
        start_date: datetime,
        end_date: datetime,
        requirements: ShiftRequirements,
        morning_start: str = "08:00",
        morning_end: str = "20:00",
        night_start: str = "20:00",
        night_end: str = "08:00"
    ) -> List[Shift]:
        shifts = []
        current_date = start_date
        
        while current_date <= end_date:
            is_weekend = current_date.weekday() >= 5
            
            morning_staff = requirements.morning_weekend if is_weekend else requirements.morning_weekday
            night_staff = requirements.night_weekend if is_weekend else requirements.night_weekday
            
            if morning_staff > 0:
                shifts.append(Shift.create(
                    shift_type=ShiftType.MORNING,
                    date=current_date,
                    start_time=datetime.strptime(morning_start, "%H:%M").time(),
                    end_time=datetime.strptime(morning_end, "%H:%M").time(),
                    required_staff=morning_staff
                ))
            
            if night_staff > 0:
                shifts.append(Shift.create(
                    shift_type=ShiftType.NIGHT,
                    date=current_date,
                    start_time=datetime.strptime(night_start, "%H:%M").time(),
                    end_time=datetime.strptime(night_end, "%H:%M").time(),
                    required_staff=night_staff
                ))
            
            current_date += timedelta(days=1)
        
        return shifts
    
    def assign_shifts(
        self,
        shifts: List[Shift],
        strategy: str = "balanced"
    ) -> ScheduleResult:
        if not self.professionals:
            return ScheduleResult(
                assignments=[],
                unassigned_shifts=shifts,
                success=False,
                message="No active professionals available"
            )

        assignments = []
        unassigned_shifts = []
        assignment_counts = {
            p.id: {"MORNING": 0, "NIGHT": 0, "total": 0} for p in self.professionals
        }

        random.shuffle(shifts)
        shifts.sort(key=lambda s: (s.date, s.shift_type.value))

        for shift in shifts:
            assigned_to_this_shift = []
            
            for _ in range(shift.required_staff):
                professional = self._select_professional(
                    assignment_counts,
                    shift,
                    assigned_to_this_shift,
                    strategy
                )
                
                if professional:
                    assignment = Assignment.create(
                        professional_id=professional.id,
                        shift_id=shift.id
                    )
                    assignments.append(assignment)
                    assigned_to_this_shift.append(professional.id)
                    assignment_counts[professional.id][shift.shift_type.name] += 1
                    assignment_counts[professional.id]["total"] += 1
                else:
                    if shift not in unassigned_shifts:
                        unassigned_shifts.append(shift)
                    break
        
        success = not unassigned_shifts
        message = f"Successfully assigned {len(assignments)} shifts."
        if not success:
            unassigned_count = sum(s.required_staff - len([a for a in assignments if a.shift_id == s.id]) for s in unassigned_shifts)
            message += f" {unassigned_count} staff positions on {len(unassigned_shifts)} shifts could not be filled."
        
        return ScheduleResult(
            assignments=assignments,
            unassigned_shifts=unassigned_shifts,
            success=success,
            message=message
        )
    
    def _select_professional(
        self,
        assignment_counts: Dict[UUID, Dict[str, int]],
        shift: Shift,
        already_assigned: List[UUID],
        strategy: str
    ) -> Optional[Professional]:
        available = [
            p for p in self.professionals
            if p.id not in already_assigned
            and self.is_available(p.id, shift.date.date(), shift.shift_type)
        ]
        
        if not available:
            return None
        
        if strategy == "balanced":
            if not available:
                return None
            
            available.sort(key=lambda p: (
                assignment_counts[p.id][shift.shift_type.name],
                assignment_counts[p.id]["total"]
            ))
            
            best_prof = available[0]
            min_shift_type_count = assignment_counts[best_prof.id][shift.shift_type.name]
            min_total_count = assignment_counts[best_prof.id]["total"]
            
            best_candidates = [
                p for p in available 
                if assignment_counts[p.id][shift.shift_type.name] == min_shift_type_count
                and assignment_counts[p.id]["total"] == min_total_count
            ]
            
            return random.choice(best_candidates)

        elif strategy == "random":
            return random.choice(available)
        else:
            available.sort(key=lambda p: assignment_counts[p.id]["total"])
            return available[0]
    
    def get_professional_workload(
        self,
        assignments: List[Assignment]
    ) -> Dict[UUID, int]:
        workload = {p.id: 0 for p in self.professionals}
        for assignment in assignments:
            if assignment.professional_id in workload:
                workload[assignment.professional_id] += 1
        return workload
    
    def validate_schedule(
        self,
        shifts: List[Shift],
        assignments: List[Assignment]
    ) -> tuple[bool, List[str]]:
        errors = []
        
        assignments_by_shift = {}
        for assignment in assignments:
            if assignment.shift_id not in assignments_by_shift:
                assignments_by_shift[assignment.shift_id] = []
            assignments_by_shift[assignment.shift_id].append(assignment)
        
        for shift in shifts:
            assigned = len(assignments_by_shift.get(shift.id, []))
            if assigned < shift.required_staff:
                errors.append(
                    f"Shift {shift.id} on {shift.date.date()} "
                    f"({shift.shift_type.value}) requires {shift.required_staff} "
                    f"but only has {assigned} assigned"
                )
            
            for assignment in assignments_by_shift.get(shift.id, []):
                if not self.is_available(assignment.professional_id, shift.date.date(), shift.shift_type):
                    errors.append(
                        f"Professional {assignment.professional_id} is unavailable for shift "
                        f"{shift.id} on {shift.date.date()} ({shift.shift_type.value})"
                    )
        
        return len(errors) == 0, errors