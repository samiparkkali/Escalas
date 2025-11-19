import csv
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional
from io import StringIO
from uuid import UUID

from .entities import Professional, Shift, Assignment, ShiftType


class ScheduleExporter:
    def __init__(self, professionals: List[Professional], shifts: List[Shift], assignments: List[Assignment]):
        self.professionals = professionals
        self.shifts = shifts
        self.assignments = assignments
        self._build_assignment_index()
    
    def _build_assignment_index(self):
        self.assignment_index: Dict[tuple[date, ShiftType], List[Assignment]] = {}
        
        shift_map = {shift.id: shift for shift in self.shifts}
        
        for assignment in self.assignments:
            shift = shift_map.get(assignment.shift_id)
            if shift:
                key = (shift.date.date(), shift.shift_type)
                if key not in self.assignment_index:
                    self.assignment_index[key] = []
                self.assignment_index[key].append(assignment)
    
    def export_to_csv(self, output_path: Optional[str] = None) -> str:
        if not self.shifts:
            return ""
        
        dates = sorted(set(shift.date.date() for shift in self.shifts))
        
        csv_buffer = StringIO()
        writer = csv.writer(csv_buffer, delimiter=';')
        
        header = ["Professional ID", "Professional Name"]
        for current_date in dates:
            date_str = current_date.strftime("%Y-%m-%d")
            header.append(f"{date_str} Morning")
            header.append(f"{date_str} Night")
        writer.writerow(header)
        
        for professional in self.professionals:
            row = [str(professional.id), professional.name]
            
            for current_date in dates:
                morning_key = (current_date, ShiftType.MORNING)
                night_key = (current_date, ShiftType.NIGHT)
                
                morning_assignments = self.assignment_index.get(morning_key, [])
                morning_assigned = "X" if any(a.professional_id == professional.id for a in morning_assignments) else ""
                
                night_assignments = self.assignment_index.get(night_key, [])
                night_assigned = "X" if any(a.professional_id == professional.id for a in night_assignments) else ""
                
                row.append(morning_assigned)
                row.append(night_assigned)
            
            writer.writerow(row)
        
        csv_content = csv_buffer.getvalue()
        
        if output_path:
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                f.write(csv_content)
        
        return csv_content
    
    def export_shift_view_csv(self, output_path: Optional[str] = None) -> str:
        if not self.shifts:
            return ""
        
        csv_buffer = StringIO()
        writer = csv.writer(csv_buffer, delimiter=';')
        
        writer.writerow(["Date", "Shift Type", "Required Staff", "Assigned Staff", "Assigned Professionals"])
        
        sorted_shifts = sorted(self.shifts, key=lambda s: (s.date, s.shift_type.value))
        
        for shift in sorted_shifts:
            key = (shift.date.date(), shift.shift_type)
            assignments = self.assignment_index.get(key, [])
            
            assigned_prof_ids = [a.professional_id for a in assignments]
            prof_map = {p.id: p for p in self.professionals}
            assigned_names = [prof_map[pid].name for pid in assigned_prof_ids if pid in prof_map]
            
            writer.writerow([
                shift.date.strftime("%Y-%m-%d"),
                shift.shift_type.value,
                shift.required_staff,
                len(assigned_names),
                ", ".join(assigned_names) if assigned_names else "Unassigned"
            ])
        
        csv_content = csv_buffer.getvalue()
        
        if output_path:
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                f.write(csv_content)
        
        return csv_content
    
    def export_summary_statistics(self, output_path: Optional[str] = None) -> str:
        csv_buffer = StringIO()
        writer = csv.writer(csv_buffer, delimiter=';')
        
        writer.writerow(["Professional ID", "Professional Name", "Total Morning Shifts", "Total Night Shifts", "Total Shifts"])
        
        for professional in self.professionals:
            morning_count = sum(
                1 for key, assignments in self.assignment_index.items()
                if key[1] == ShiftType.MORNING and any(a.professional_id == professional.id for a in assignments)
            )
            night_count = sum(
                1 for key, assignments in self.assignment_index.items()
                if key[1] == ShiftType.NIGHT and any(a.professional_id == professional.id for a in assignments)
            )
            total_count = morning_count + night_count
            
            writer.writerow([
                str(professional.id),
                professional.name,
                morning_count,
                night_count,
                total_count
            ])
        
        csv_content = csv_buffer.getvalue()
        
        if output_path:
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                f.write(csv_content)
        
        return csv_content