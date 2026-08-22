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
            # Test immediate connectivity
            with pg_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected successfully to PostgreSQL database.")
            return pg_engine
        except Exception as e:
            logger.warning(f"PostgreSQL connection unavailable ({e}). Falling back to local SQLite at {SQLITE_PATH}.")

    sqlite_engine = create_engine(
        FALLBACK_SQLITE_URL,
        connect_args={"check_same_thread": False},
    )
    return sqlite_engine


engine = _create_resilient_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def initialize_database():
    """Ensure all database tables and demo seed records exist."""
    from database.models import BloodBank
    from database.seed_data import seed_demo_data

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        bank_count = db.query(BloodBank).count()
        if bank_count == 0:
            logger.info("No records found in database. Auto-seeding PRAVAH demo records...")
            seed_demo_data()
    except Exception as e:
        logger.warning(f"Auto-seed check failed ({e}). Re-creating tables and seeding...")
        Base.metadata.create_all(bind=engine)
        seed_demo_data()
    finally:
        db.close()


# Auto-initialize database schema and seeds on startup
try:
    initialize_database()
except Exception as e:
    logger.error(f"Database initialization exception: {e}")


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
