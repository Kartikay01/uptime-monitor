from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class URL(Base):
    """A URL registered for monitoring."""

    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False, unique=True, index=True)
    label = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    checks = relationship(
        "Check",
        back_populates="url",
        cascade="all, delete-orphan",
        order_by="Check.checked_at.desc()",
    )


class Check(Base):
    """A single health-check result for a monitored URL."""

    __tablename__ = "checks"

    id = Column(Integer, primary_key=True, index=True)
    url_id = Column(Integer, ForeignKey("urls.id", ondelete="CASCADE"), nullable=False, index=True)
    status_code = Column(Integer, nullable=True)  # null when the request failed entirely (timeout, DNS, etc.)
    response_time_ms = Column(Float, nullable=True)
    is_up = Column(Boolean, nullable=False, default=False)
    checked_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    url = relationship("URL", back_populates="checks")