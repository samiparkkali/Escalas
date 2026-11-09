import uuid
from datetime import date, datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Professional(Base):
    __tablename__ = "professionals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Unavailability(Base):
    __tablename__ = "unavailabilities"
    __table_args__ = (UniqueConstraint("professional_id", "date", "shift_type"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    professional_id: Mapped[str] = mapped_column(
        ForeignKey("professionals.id", ondelete="CASCADE"), index=True
    )
    date: Mapped[date] = mapped_column(Date)
    shift_type: Mapped[str] = mapped_column(String(10))


class Schedule(Base):
    __tablename__ = "schedules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    is_24h: Mapped[bool] = mapped_column(Boolean, default=False)
    config: Mapped[dict] = mapped_column(JSON)

    assignments: Mapped[list["ScheduleAssignment"]] = relationship(
        cascade="all, delete-orphan", order_by="ScheduleAssignment.position"
    )
    unfilled_shifts: Mapped[list["UnfilledShift"]] = relationship(
        cascade="all, delete-orphan", order_by="UnfilledShift.position"
    )


class ScheduleAssignment(Base):
    """A stored assignment keeps a copy of the professional's name and role,
    so the schedule stays readable after the professional is edited or deleted."""

    __tablename__ = "schedule_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    schedule_id: Mapped[str] = mapped_column(ForeignKey("schedules.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    professional_id: Mapped[str] = mapped_column(String(36))
    professional_name: Mapped[str] = mapped_column(String(120))
    professional_role: Mapped[str] = mapped_column(String(20))
    shift_date: Mapped[date] = mapped_column(Date)
    shift_type: Mapped[str] = mapped_column(String(10))


class UnfilledShift(Base):
    __tablename__ = "unfilled_shifts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    schedule_id: Mapped[str] = mapped_column(ForeignKey("schedules.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    date: Mapped[date] = mapped_column(Date)
    shift_type: Mapped[str] = mapped_column(String(10))
    missing_specialists: Mapped[int] = mapped_column(Integer)
    missing_interns: Mapped[int] = mapped_column(Integer)
