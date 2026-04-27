from typing import List, Optional, Dict
from datetime import datetime, date
from uuid import UUID

from .models import (
    GenerateScheduleRequest, AssignmentResponse, UnassignedShiftResponse,
    ScheduleResponse, StatisticsResponse, ProfessionalModel, UnavailabilityModel,
)

class ScheduleService:
    def __init__(self):
        self._current_schedule: Optional[Dict] = None

    def generate_schedule(self, request: GenerateScheduleRequest) -> ScheduleResponse:
        try:
            # Convert request data to domain objects
            professionals = [
                ProfessionalModel.create(UUID(p.id), p.name)
                for p in request.professionals
            ]

            unavailabilities = [
                UnavailabilityModel.create(
                    professional_id=UUID(u.professional_id),
                    date=date.fromisoformat(u.date),
                    shift_type=ShiftType(u.shift_type)
                )
                for u in request.unavailabilities
            ]

            scheduler = Scheduler(professionals, unavailabilities)

            requirements = ShiftRequirements(
                morning_weekday=request.config.morning_weekday,
                night_weekday=request.config.night_weekday,
                morning_weekend=request.config.morning_weekend,
                night_weekend=request.config.night_weekend
            )

            start_date = datetime.fromisoformat(request.config.start_date)
            end_date = datetime.fromisoformat(request.config.end_date)

            shifts = scheduler.generate_shifts(start_date, end_date, requirements)

            result = scheduler.assign_shifts(shifts, strategy="balanced")

            # Convert to response format
            assignments = [
                AssignmentResponse(
                    professional_name=next(p.name for p in request.professionals if p.id == str(a.professional_id)),
                    shift_date=next(s.date.date().isoformat() for s in shifts if s.id == a.shift_id),
                    shift_type=next(s.shift_type.value for s in shifts if s.id == a.shift_id)
                )
                for a in result.assignments
            ]

            unassigned_shifts = [
                UnassignedShiftResponse(
                    date=s.date.date().isoformat(),
                    shift_type=s.shift_type.value,
                    required_staff=s.required_staff
                )
                for s in result.unassigned_shifts
            ]

            # Store the current schedule (convert to dicts for simplicity)
            assignments_dicts = [a.model_dump() for a in assignments]
            unassigned_dicts = [u.model_dump() for u in unassigned_shifts]
            professionals_dicts = [p.model_dump() for p in request.professionals]

            self._current_schedule = {
                "assignments": assignments_dicts,
                "unassigned_shifts": unassigned_dicts,
                "professionals": professionals_dicts,
                "shifts": shifts,
                "result": result
            }

            return ScheduleResponse(
                assignments=assignments,
                unassigned_shifts=unassigned_shifts,
                success=result.success,
                message=result.message
            )

        except Exception as e:
            raise Exception(f"Failed to generate schedule: {str(e)}")

    def get_statistics(self) -> List[StatisticsResponse]:
        if not self._current_schedule:
            return []

        professionals = self._current_schedule["professionals"]
        assignments = self._current_schedule["assignments"]

        statistics = []
        for professional in professionals:
            morning_count = sum(
                1 for a in assignments
                if a["professional_name"] == professional["name"] and a["shift_type"] == "morning"
            )
            night_count = sum(
                1 for a in assignments
                if a["professional_name"] == professional["name"] and a["shift_type"] == "night"
            )
            total_count = morning_count + night_count

            statistics.append(StatisticsResponse(
                name=professional["name"],
                morning=morning_count,
                night=night_count,
                total=total_count
            ))

        return statistics

    def export_schedule_csv(self) -> str:
        if not self._current_schedule:
            return "No schedule generated yet\n"

        # Create exporter and generate CSV
        professionals = [
            Professional.create(UUID(p["id"]), p["name"])
            for p in self._current_schedule["professionals"]
        ]

        shifts = self._current_schedule["shifts"]
        assignments = self._current_schedule["result"].assignments

        exporter = ScheduleExporter(professionals, shifts, assignments)
        return exporter.export_to_csv()