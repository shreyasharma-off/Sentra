from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.sql import func
import uuid
from app.database import Base  # Adjust import based on your base database setup


class PromptLogModel(Base):
    __tablename__ = "runtime_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    app_id = Column(String, nullable=True)
    event_type = Column(String, nullable=False, default="PROMPT_SCAN")
    severity = Column(String, nullable=False, default="LOW")
    action_taken = Column(String, nullable=False, default="LOGGED")
    latency_ms = Column(Float, default=0.0)
    payload_snapshot = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
