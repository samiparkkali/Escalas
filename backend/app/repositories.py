from typing import Dict, List, Optional
from uuid import uuid4
from .models import ProfessionalModel, UnavailabilityModel

class ProfessionalRepository:
    def __init__(self):
        self._professionals: Dict[str, ProfessionalModel] = {}

    def get_all(self) -> List[ProfessionalModel]:
        return list(self._professionals.values())

    def get_by_id(self, professional_id: str) -> Optional[ProfessionalModel]:
        return self._professionals.get(professional_id)

    def create(self, name: str) -> ProfessionalModel:
        professional_id = str(uuid4())
        professional = ProfessionalModel(
            id=professional_id,
            name=name,
            is_active=True
        )
        self._professionals[professional_id] = professional
        return professional

    def update(self, professional_id: str, name: str) -> Optional[ProfessionalModel]:
        if professional_id not in self._professionals:
            return None

        professional = self._professionals[professional_id]
        professional.name = name
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
        return [u for u in self._unavailabilities.values() if u.professional_id == professional_id]

    def create(self, professional_id: str, date: str, shift_type: str) -> Optional[UnavailabilityModel]:
        professional = self._professional_repository.get_by_id(professional_id)
        if not professional:
            return None

        unavailability_id = str(uuid4())
        unavailability = UnavailabilityModel(
            id=unavailability_id,
            professional_id=professional_id,
            date=date,
            shift_type=shift_type,
            professional_name=professional.name
        )
        self._unavailabilities[unavailability_id] = unavailability
        return unavailability

    def delete(self, unavailability_id: str) -> bool:
        if unavailability_id not in self._unavailabilities:
            return False

        del self._unavailabilities[unavailability_id]
        return True

    def delete_by_professional_id(self, professional_id: str):
        """Delete all unavailabilities for a professional"""
        unavailabilities_to_remove = [
            uid for uid, u in self._unavailabilities.items()
            if u.professional_id == professional_id
        ]
        for uid in unavailabilities_to_remove:
            del self._unavailabilities[uid]