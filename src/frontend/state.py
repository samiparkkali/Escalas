import reflex as rx
from datetime import datetime, date
from uuid import uuid4
from typing import List, Dict
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from domain.entities import Professional, ShiftType
from domain.scheduler import Scheduler, ShiftRequirements, Unavailability
from domain.exporter import ScheduleExporter


class State(rx.State):
    professionals: List[Dict] = []
    professional_name: str = ""
    
    selected_professional_id: str = ""
    unavailability_year: int = datetime.now().year
    unavailability_month: int = datetime.now().month
    unavailability_day: int = 1
    unavailability_shift_type: str = "morning"
    unavailabilities: List[Dict] = []
    
    schedule_start_year: int = datetime.now().year
    schedule_start_month: int = datetime.now().month
    schedule_start_day: int = 1
    schedule_end_year: int = datetime.now().year
    schedule_end_month: int = datetime.now().month
    schedule_end_day: int = 31
    
    morning_weekday: int = 1
    night_weekday: int = 1
    morning_weekend: int = 1
    night_weekend: int = 1
    
    assignments: List[Dict] = []
    unassigned_shifts: List[Dict] = []
    schedule_message: str = ""
    summary_statistics: List[Dict] = []
    csv_content: str = ""
    download_url: str = ""
    
    def add_professional(self):
        if self.professional_name.strip():
            prof_id = str(uuid4())
            self.professionals.append({
                "id": prof_id,
                "name": self.professional_name.strip()
            })
            self.professional_name = ""
    
    def remove_professional(self, prof_id: str):
        self.professionals = [p for p in self.professionals if p["id"] != prof_id]
        self.unavailabilities = [u for u in self.unavailabilities if u["professional_id"] != prof_id]
    
    def set_selected_professional_by_name(self, name: str):
        for p in self.professionals:
            if p["name"] == name:
                self.selected_professional_id = p["id"]
                return
        self.selected_professional_id = ""

    def add_unavailability(self):
        if self.selected_professional_id:
            try:
                unavail_date = date(
                    self.unavailability_year,
                    self.unavailability_month,
                    self.unavailability_day
                )
                
                prof_name = next(
                    (p["name"] for p in self.professionals if p["id"] == self.selected_professional_id),
                    "Unknown"
                )
                
                self.unavailabilities.append({
                    "professional_id": self.selected_professional_id,
                    "professional_name": prof_name,
                    "date": unavail_date.isoformat(),
                    "shift_type": self.unavailability_shift_type
                })
            except ValueError:
                pass
    
    def remove_unavailability(self, index: int):
        if 0 <= index < len(self.unavailabilities):
            self.unavailabilities.pop(index)

    def set_unavailability_year(self, value: str):
        try:
            self.unavailability_year = int(value)
        except (ValueError, TypeError):
            pass

    def set_unavailability_month(self, value: str):
        try:
            self.unavailability_month = int(value)
        except (ValueError, TypeError):
            pass

    def set_unavailability_day(self, value: str):
        try:
            self.unavailability_day = int(value)
        except (ValueError, TypeError):
            pass

    def set_schedule_start_year(self, value: str):
        try:
            self.schedule_start_year = int(value)
        except (ValueError, TypeError):
            pass

    def set_schedule_start_month(self, value: str):
        try:
            self.schedule_start_month = int(value)
        except (ValueError, TypeError):
            pass

    def set_schedule_start_day(self, value: str):
        try:
            self.schedule_start_day = int(value)
        except (ValueError, TypeError):
            pass

    def set_schedule_end_year(self, value: str):
        try:
            self.schedule_end_year = int(value)
        except (ValueError, TypeError):
            pass

    def set_schedule_end_month(self, value: str):
        try:
            self.schedule_end_month = int(value)
        except (ValueError, TypeError):
            pass

    def set_schedule_end_day(self, value: str):
        try:
            self.schedule_end_day = int(value)
        except (ValueError, TypeError):
            pass

    def set_morning_weekday(self, value: str):
        try:
            self.morning_weekday = int(value)
        except (ValueError, TypeError):
            pass

    def set_night_weekday(self, value: str):
        try:
            self.night_weekday = int(value)
        except (ValueError, TypeError):
            pass

    def set_morning_weekend(self, value: str):
        try:
            self.morning_weekend = int(value)
        except (ValueError, TypeError):
            pass

    def set_night_weekend(self, value: str):
        try:
            self.night_weekend = int(value)
        except (ValueError, TypeError):
            pass
    
    def clear_schedule(self):
        self.assignments = []
        self.unassigned_shifts = []
        self.summary_statistics = []
        self.schedule_message = ""
        self.download_url = ""

    def generate_schedule(self):
        self.clear_schedule()
        if not self.professionals:
            self.schedule_message = "Please add professionals first"
            return
        
        try:
            start_date = datetime(
                self.schedule_start_year,
                self.schedule_start_month,
                self.schedule_start_day
            )
            end_date = datetime(
                self.schedule_end_year,
                self.schedule_end_month,
                self.schedule_end_day
            )
            
            professionals_objs = [
                Professional.create(prof["id"], prof["name"])
                for prof in self.professionals
            ]
            
            unavailability_objs = [
                Unavailability.create(
                    professional_id=u["professional_id"],
                    date=date.fromisoformat(u["date"]),
                    shift_type=ShiftType(u["shift_type"])
                )
                for u in self.unavailabilities
            ]
            
            scheduler = Scheduler(professionals_objs, unavailability_objs)
            
            requirements = ShiftRequirements(
                morning_weekday=self.morning_weekday,
                night_weekday=self.night_weekday,
                morning_weekend=self.morning_weekend,
                night_weekend=self.night_weekend
            )
            
            shifts = scheduler.generate_shifts(start_date, end_date, requirements)
            
            result = scheduler.assign_shifts(shifts, strategy="balanced")
            
            self.assignments = [
                {
                    "professional_name": next(p["name"] for p in self.professionals if p["id"] == str(a.professional_id)),
                    "shift_date": next(s.date.date().isoformat() for s in shifts if s.id == a.shift_id),
                    "shift_type": next(s.shift_type.value for s in shifts if s.id == a.shift_id)
                }
                for a in result.assignments
            ]
            
            self.unassigned_shifts = [
                {
                    "date": s.date.date().isoformat(),
                    "shift_type": s.shift_type.value,
                    "required_staff": s.required_staff
                }
                for s in result.unassigned_shifts
            ]
            
            self.schedule_message = result.message
            
            exporter = ScheduleExporter(professionals_objs, shifts, result.assignments)
            
            self.csv_content = exporter.export_to_csv()
            
            self.download_url = f"data:text/csv;charset=utf-8,{self.csv_content}"

            self.summary_statistics = []
            for professional in professionals_objs:
                morning_count = sum(
                    1 for a in self.assignments
                    if a["professional_name"] == professional.name and a["shift_type"] == "morning"
                )
                night_count = sum(
                    1 for a in self.assignments
                    if a["professional_name"] == professional.name and a["shift_type"] == "night"
                )
                total_count = morning_count + night_count
                
                self.summary_statistics.append({
                    "name": professional.name,
                    "morning": morning_count,
                    "night": night_count,
                    "total": total_count
                })
            
        except Exception as e:
            self.schedule_message = f"Error: {str(e)}"
    
    @rx.var
    def professional_names(self) -> list[str]:
        return [p["name"] for p in self.professionals]