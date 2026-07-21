import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite file lives under ./data so it can be mounted as a Docker volume
# for persistence across container restarts.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/uptime.db")

# check_same_thread=False is required for SQLite because APScheduler runs
# checks on a background thread separate from the FastAPI request thread.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()