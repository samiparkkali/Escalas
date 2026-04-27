from typing import Dict, List, Optional
from uuid import uuid4
from datetime import date

from .models import ProfessionalModel, UnavailabilityModel, Role, ShiftType


class ProfessionalRepository:
    def __init__(self):
        self._professionals: Dict[str, ProfessionalModel] = {}

    def get_all(self) -> List[ProfessionalModel]:
        return list(self._professionals.values())

    def get_active(self) -> List[ProfessionalModel]:
        return [p for p in self._professionals.values() if p.is_active]

    def get_by_id(self, professional_id: str) -> Optional[ProfessionalModel]:
        return self._professionals.get(professional_id)

    def get_active_by_role(self, role: Role) -> List[ProfessionalModel]:
        return [
            p for p in self._professionals.values()
            if p.is_active and p.role == role
        ]

    def create(self, name: str, role: Role) -> ProfessionalModel:
        professional_id = str(uuid4())
        professional = ProfessionalModel(
            id=professional_id,
            name=name,
            role=role,
            is_active=True
        )
        self._professionals[professional_id] = professional
        return professional

    def update(
        self,
        professional_id: str,
        name: Optional[str] = None,
        role: Optional[Role] = None,
        is_active: Optional[bool] = None
    ) -> Optional[ProfessionalModel]:
        professional = self._professionals.get(professional_id)
        if not professional:
            return None

        if name is not None:
            professional.name = name
        if role is not None:
            professional.role = role
        if is_active is not None:
            professional.is_active = is_active

        self._professionals[professional_id] = professional
        return professional

    def delete(self, professional_id: str) -> bool:
        if professional_id not in self._professionals:
            return False
        del self._professionals[professional_id]
        return True


class UnavailabilityRepository:
    def __init__(self, professional_repository: ProfessionalRepository):
        self._unavailabilities: Dict[str, UnavailabilityModel] = {}
        self._professional_repository = professional_repository

    def get_all(self) -> List[UnavailabilityModel]:
        return list(self._unavailabilities.values())

    def get_by_professional_id(self, professional_id: str) -> List[UnavailabilityModel]:
        return [
            u for u in self._unavailabilities.values()
            if u.professional_id == professional_id
        ]

    def get_for_shift(self, date_value: date, shift_type: ShiftType) -> List[UnavailabilityModel]:
        return [
            u for u in self._unavailabilities.values()
            if u.date == date_value and u.shift_type == shift_type
        ]

    def is_unavailable(
        self,
        professional_id: str,
        date_value: date,
        shift_type: ShiftType
    ) -> bool:
        return any(
            u.professional_id == professional_id
            and u.date == date_value
            and u.shift_type == shift_type
            for u in self._unavailabilities.values()
        )

    def create(
        self,
        professional_id: str,
        date_value: date,
        shift_type: ShiftType
    ) -> Optional[UnavailabilityModel]:
        professional = self._professional_repository.get_by_id(professional_id)
        if not professional:
            return None

        # Prevent duplicate unavailabilities
        if self.is_unavailable(professional_id, date_value, shift_type):
            return None

        unavailability_id = str(uuid4())
        unavailability = UnavailabilityModel(
            id=unavailability_id,
            professional_id=professional_id,
            date=date_value,
            shift_type=shift_type
        )
        self._unavailabilities[unavailability_id] = unavailability
        return unavailability

    def delete(self, unavailability_id: str) -> bool:
        if unavailability_id not in self._unavailabilities:
            return False
        del self._unavailabilities[unavailability_id]
        return True

    def delete_by_professional_id(self, professional_id: str):
        unavailability_ids = [
            uid for uid, u in self._unavailabilities.items()
            if u.professional_id == professional_id
        ]
        for uid in unavailability_ids:
            del self._unavailabilities[uid]