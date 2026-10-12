from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()
    assert data["app"] == "EVORA"
    assert data["version"] == "1.2.0"
    assert data["health_check"] == "/api/health"
    assert data["dynamic_data_enabled"] is True


def test_health_endpoint():
    response = client.get("/api/health")

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict)
