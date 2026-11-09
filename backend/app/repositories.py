"""Data access, always scoped to the owning user."""

from datetime import date
from typing import List, Optional, Set, Tuple

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .orm import Professional, Schedule, ScheduleAssignment, Unavailability, UnfilledShift, User
from .schemas import AssignmentResponse, Role, ShiftType, UnassignedShiftResponse


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.get(User, user_id)

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.scalar(select(User).where(User.username == username))

    def create(self, username: str, password_hash: str) -> User:
        user = User(username=username, password_hash=password_hash)
        self.db.add(user)
        self.db.commit()
        return user


class ProfessionalRepository:
    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id

    def _query(self):
        return select(Professional).where(Professional.user_id == self.user_id)

    def get_all(self) -> List[Professional]:
        return list(self.db.scalars(self._query().order_by(Professional.name)))

    def get_active(self) -> List[Professional]:
        query = self._query().where(Professional.is_active.is_(True)).order_by(Professional.name)
        return list(self.db.scalars(query))

    def get_by_id(self, professional_id: str) -> Optional[Professional]:
        return self.db.scalar(self._query().where(Professional.id == professional_id))

    def create(self, name: str, role: Role) -> Professional:
        professional = Professional(user_id=self.user_id, name=name, role=role.value)
        self.db.add(professional)
        self.db.commit()
        return professional

    def update(
        self, professional_id: str, name: str, role: Role, is_active: Optional[bool]
    ) -> Optional[Professional]:
        professional = self.get_by_id(professional_id)
        if not professional:
            return None
        professional.name = name
        professional.role = role.value
        if is_active is not None:
            professional.is_active = is_active
        self.db.commit()
        return professional

    def delete(self, professional_id: str) -> bool:
        professional = self.get_by_id(professional_id)
        if not professional:
            return False
        self.db.execute(
            delete(Unavailability).where(
                Unavailability.user_id == self.user_id,
                Unavailability.professional_id == professional_id,
            )
        )
        self.db.delete(professional)
        self.db.commit()
        return True


class UnavailabilityRepository:
    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id

    def _query(self):
        return select(Unavailability).where(Unavailability.user_id == self.user_id)

    def get_all(self) -> List[Unavailability]:
        query = self._query().order_by(Unavailability.date, Unavailability.shift_type)
        return list(self.db.scalars(query))

    def unavailable_slots(self) -> Set[Tuple[str, date, ShiftType]]:
        return {(u.professional_id, u.date, ShiftType(u.shift_type)) for u in self.db.scalars(self._query())}

    def create(
        self, professional_id: str, date_value: date, shift_type: ShiftType
    ) -> Optional[Unavailability]:
        """Returns None when the same unavailability is already registered."""
        unavailability = Unavailability(
            user_id=self.user_id,
            professional_id=professional_id,
            date=date_value,
            shift_type=shift_type.value,
        )
        self.db.add(unavailability)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            return None
        return unavailability

    def delete(self, unavailability_id: str) -> bool:
        unavailability = self.db.scalar(self._query().where(Unavailability.id == unavailability_id))
        if not unavailability:
            return False
        self.db.delete(unavailability)
        self.db.commit()
        return True


class ScheduleRepository:
    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id

    def get_latest(self) -> Optional[Schedule]:
        query = (
            select(Schedule)
            .where(Schedule.user_id == self.user_id)
            .order_by(Schedule.created_at.desc())
            .limit(1)
        )
        return self.db.scalar(query)

    def replace(
        self,
        config: dict,
        assignments: List[AssignmentResponse],
        unfilled: List[UnassignedShiftResponse],
    ) -> Schedule:
        """Stores a new schedule; only the latest one per user is kept."""
        for old in list(self.db.scalars(select(Schedule).where(Schedule.user_id == self.user_id))):
            self.db.delete(old)

        schedule = Schedule(
            user_id=self.user_id,
            start_date=config["start_date"],
            end_date=config["end_date"],
            is_24h=config["is_24h"],
            config={k: (v.isoformat() if isinstance(v, date) else v) for k, v in config.items()},
        )
        schedule.assignments = [
            ScheduleAssignment(
                position=i,
                professional_id=a.professional_id,
                professional_name=a.professional_name,
                professional_role=a.professional_role.value,
                shift_date=a.shift_date,
                shift_type=a.shift_type.value,
            )
            for i, a in enumerate(assignments)
        ]
        schedule.unfilled_shifts = [
            UnfilledShift(
                position=i,
                date=u.date,
                shift_type=u.shift_type.value,
                missing_specialists=u.required_specialists,
                missing_interns=u.required_interns,
            )
            for i, u in enumerate(unfilled)
        ]
        self.db.add(schedule)
        self.db.commit()
        return schedule
