"""
FoodLoop AI - Pytest Configuration & Test Fixtures
Provides an isolated SQLite test database and FastAPI TestClient.
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Import models & app
import app.database as database_module
from app.database import Base, get_db, seed_database_if_empty
from app.main import app

# Create in-memory SQLite database with StaticPool to share connection
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Also override database_module engine and SessionLocal during tests
database_module.engine = engine
database_module.SessionLocal = TestingSessionLocal


@pytest.fixture(scope="function")
def db_session():
    """Create fresh tables for each test function and seed data."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database_if_empty(db)
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Override get_db dependency to use the isolated test database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
