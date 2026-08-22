import os
import logging
from collections.abc import Generator
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

logger = logging.getLogger(__name__)

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
BACKEND_DIR = Path(__file__).resolve().parent.parent
SQLITE_PATH = BACKEND_DIR / "pravah.db"
FALLBACK_SQLITE_URL = f"sqlite:///{SQLITE_PATH}"


class Base(DeclarativeBase):
    pass


def _create_resilient_engine():
    """Tries PostgreSQL first; if offline or fails, falls back seamlessly to SQLite."""
    if DATABASE_URL and "postgresql" in DATABASE_URL:
        try:
            pg_engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 2})
            with pg_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected successfully to PostgreSQL database.")
            return pg_engine
        except Exception as e:
            logger.warning(f"PostgreSQL connection unavailable ({e}). Falling back to local SQLite at {SQLITE_PATH}.")

    sqlite_engine = create_engine(
        FALLBACK_SQLITE_URL,
        connect_args={"check_same_thread": False, "timeout": 30},
    )
    try:
        with sqlite_engine.connect() as conn:
            conn.execute(text("PRAGMA journal_mode=WAL;"))
            conn.execute(text("PRAGMA busy_timeout=30000;"))
    except Exception as e:
        logger.warning(f"Failed setting PRAGMA journal_mode=WAL: {e}")

    return sqlite_engine


engine = _create_resilient_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
