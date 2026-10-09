"""
Test suite for ML food classifier, image validation, and scan recording.
"""

import io
import base64
from PIL import Image


def create_test_image_bytes():
    img = Image.new("RGB", (224, 224), color=(255, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_supported_classes(client):
    res = client.get("/api/classes")
    assert res.status_code == 200
    data = res.json()
    assert "classes" in data
    assert len(data["classes"]) == 59
    assert "apple" in data["classes"]


def test_predict_multipart_image(client):
    img_bytes = create_test_image_bytes()
    files = {"file": ("test_apple.jpg", img_bytes, "image/jpeg")}
    data = {"top_k": "5"}

    res = client.post("/api/food/predict", files=files, data=data)
    assert res.status_code == 200
    payload = res.json()
    assert payload["success"] is True
    assert "predicted_label" in payload
    assert "confidence" in payload
    assert "freshness_score" in payload
    assert len(payload["top_k"]) <= 5


def test_predict_base64_json(client):
    img_bytes = create_test_image_bytes()
    b64_str = base64.b64encode(img_bytes).decode("utf-8")

    res = client.post("/api/predict", json={"image": b64_str, "top_k": 3})
    assert res.status_code == 200
    payload = res.json()
    assert payload["success"] is True
    assert payload["isLiveModel"] is True


def test_predict_invalid_image(client):
    res = client.post("/api/food/predict", files={"file": ("corrupted.txt", b"not an image", "text/plain")})
    assert res.status_code == 400
    assert "Invalid image file format" in res.json()["detail"]


def test_scans_lifecycle(client):
    headers = {"X-User-Id": "usr-1"}
    scan_payload = {
        "food_name": "apple",
        "display_name": "Honeycrisp Apple Batch",
        "confidence": 98.5,
        "freshness_score": 95,
        "category": "Fresh Produce"
    }

    create_res = client.post("/api/scans", json=scan_payload, headers=headers)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["user_id"] == "usr-1"
    assert created["food_name"] == "apple"

    list_res = client.get("/api/scans", headers=headers)
    assert list_res.status_code == 200
    scans = list_res.json()
    assert any(s["id"] == created["id"] for s in scans)
