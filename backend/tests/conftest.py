import pytest
from fastapi.testclient import TestClient

import main
from app.dependencies import Dependencies


@pytest.fixture
def client(monkeypatch):
    fresh = Dependencies()
    monkeypatch.setattr(main, "deps", fresh)
    return TestClient(main.app)
