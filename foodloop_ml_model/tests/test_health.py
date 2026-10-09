"""
Test suite for backend health endpoint and frontend static serving.
"""

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "num_classes" in data
    assert "version" in data


def test_frontend_routes(client):
    routes = ["/", "/dashboard", "/admin", "/scanner", "/donate", "/marketplace"]
    for route in routes:
        res = client.get(route)
        assert res.status_code == 200
        assert "FoodLoop AI" in res.text


def test_static_js_store(client):
    res = client.get("/js/foodloop-store.js")
    assert res.status_code == 200
    assert "FoodLoopStore" in res.text
