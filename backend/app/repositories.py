from typing import List, Optional
from datetime import date

from sqlalchemy.orm import Session

from app.models.professional import Professional
from app.models.unavailability import Unavailability
from app.schemas import Role, ShiftType


class ProfessionalRepository:
    def get_all(
        self,
        db: Session,
        user_id: str,
    ) -> List[Professional]:
        return (
            db.query(Professional)
            .filter_by(user_id=user_id)
            .all()
        )

    def get_active(
        self,
        db: Session,
        user_id: str,
    ) -> List[Professional]:
        return (
            db.query(Professional)
            .filter_by(user_id=user_id, is_active=True)
            .all()
        )

    def get_by_id(
        self,
        db: Session,
        user_id: str,
        professional_id: str,
    ) -> Optional[Professional]:
        return (
            db.query(Professional)
            .filter_by(
                id=professional_id,
                user_id=user_id,
            )
            .first()
        )

    def get_active_by_role(
        self,
        db: Session,
        user_id: str,
        role: Role,
    ) -> List[Professional]:
        return (
            db.query(Professional)
            .filter_by(
                user_id=user_id,
                role=role,
                is_active=True,
            )
            .all()
        )

    def create(
        self,
        db: Session,
        user_id: str,
        name: str,
        role: Role,
    ) -> Professional:
        professional = Professional(
            user_id=user_id,
            name=name,
            role=role,
            is_active=True,
        )
        db.add(professional)
        db.commit()
        db.refresh(professional)
        return professional

    def update(
        self,
        db: Session,
        user_id: str,
        professional_id: str,
        name: Optional[str] = None,
        role: Optional[Role] = None,
        is_active: Optional[bool] = None,
    ) -> Optional[Professional]:
        professional = self.get_by_id(db, user_id, professional_id)
        if not professional:
            return None

        if name is not None:
            professional.name = name
        if role is not None:
            professional.role = role
        if is_active is not None:
            professional.is_active = is_active

        db.commit()
        db.refresh(professional)
        return professional

    def delete(
        self,
        db: Session,
        user_id: str,
        professional_id: str,
    ) -> bool:
        professional = self.get_by_id(db, user_id, professional_id)
        if not professional:
            return False

        db.delete(professional)
        db.commit()
        return True
    
class UnavailabilityRepository:
    def get_all(
        self,
        db: Session,
        user_id: str,
    ) -> List[Unavailability]:
        return (
            db.query(Unavailability)
            .filter_by(user_id=user_id)
            .all()
        )

    def get_by_professional_id(
        self,
        db: Session,
        user_id: str,
        professional_id: str,
    ) -> List[Unavailability]:
        return (
            db.query(Unavailability)
            .filter_by(
                user_id=user_id,
                professional_id=professional_id,
            )
            .all()
        )

    def get_for_shift(
        self,
        db: Session,
        user_id: str,
        date_value: date,
        shift_type: ShiftType,
    ) -> List[Unavailability]:
        return (
            db.query(Unavailability)
            .filter_by(
                user_id=user_id,
                date=date_value,
                shift_type=shift_type,
            )
            .all()
        )

    def is_unavailable(
        self,
        db: Session,
        user_id: str,
        professional_id: str,
        date_value: date,
        shift_type: ShiftType,
    ) -> bool:
        return (
            db.query(Unavailability)
            .filter_by(
                user_id=user_id,
                professional_id=professional_id,
                date=date_value,
                shift_type=shift_type,
            )
            .first()
            is not None
        )

    def create(
        self,
        db: Session,
        user_id: str,
        professional_id: str,
        date_value: date,
        shift_type: ShiftType,
    ) -> Optional[Unavailability]:
        if self.is_unavailable(
            db,
            user_id,
            professional_id,
            date_value,
            shift_type,
        ):
            return None

        unavailability = Unavailability(
            user_id=user_id,
            professional_id=professional_id,
            date=date_value,
            shift_type=shift_type,
        )
        db.add(unavailability)
        db.commit()
        db.refresh(unavailability)
        return unavailability

    def delete(
        self,
        db: Session,
        user_id: str,
        unavailability_id: str,
    ) -> bool:
        unavailability = (
            db.query(Unavailability)
            .filter_by(
                id=unavailability_id,
                user_id=user_id,
            )
            .first()
        )

        if not unavailability:
            return False

        db.delete(unavailability)
        db.commit()
        return True

    def delete_by_professional_id(
        self,
        db: Session,
        user_id: str,
        professional_id: str,
    ):
        (
            db.query(Unavailability)
            .filter_by(
                user_id=user_id,
                professional_id=professional_id,
            )
            .delete()
        )
        db.commit()