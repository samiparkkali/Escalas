import uuid
from datetime import date

from sqlalchemy import String, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base
from app.schemas import ShiftType

class Unavailability(Base):
    __tablename__ = "unavailabilities"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    user_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    professional_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("professionals.id"),
        nullable=False,
        index=True,
    )

    date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    shift_type: Mapped[ShiftType] = mapped_column(
        String,
        nullable=False,
    )