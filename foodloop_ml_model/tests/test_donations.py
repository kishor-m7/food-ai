"""
Test suite for donation listings, claim requests, duplicate checks, and authorization.
"""

def test_list_and_get_donations(client):
    res = client.get("/api/donations")
    assert res.status_code == 200
    listings = res.json()
    assert len(listings) >= 4

    single_res = client.get("/api/donations/LST-101")
    assert single_res.status_code == 200
    assert single_res.json()["title"] == "Crisp Honeycrisp Apples & Bananas"


def test_create_donation_listing(client):
    headers = {"X-User-Id": "usr-1"}
    payload = {
        "title": "Fresh Tomatoes Batch",
        "food_name": "tomato",
        "quantity": 12.5,
        "quantity_unit": "kg",
        "pickup_address": "GreenBite Central",
        "pickup_window": "Today 3pm-6pm"
    }

    res = client.post("/api/donations", json=payload, headers=headers)
    assert res.status_code == 201
    created = res.json()
    assert created["donor_id"] == "usr-1"
    assert created["quantity"] == 12.5
    assert created["category"] == "Fresh Produce"


def test_update_and_delete_donation_authorization(client):
    # Donor usr-1 updates their listing
    res = client.patch("/api/donations/LST-101", json={"notes": "Updated notes"}, headers={"X-User-Id": "usr-1"})
    assert res.status_code == 200
    assert res.json()["notes"] == "Updated notes"

    # User usr-2 attempts to update usr-1's listing -> Forbidden
    unauth_res = client.patch("/api/donations/LST-101", json={"notes": "Hack"}, headers={"X-User-Id": "usr-2"})
    assert unauth_res.status_code == 403

    # Admin usr-admin can update or delete any listing
    admin_delete = client.delete("/api/donations/LST-101", headers={"X-User-Id": "usr-admin"})
    assert admin_delete.status_code == 204


def test_claim_request_lifecycle_and_constraints(client):
    # LST-102 belongs to usr-3
    
    # 1. Rule: User cannot request their own listing
    self_req = client.post(
        "/api/donations/LST-102/requests",
        json={"purpose": "Self request"},
        headers={"X-User-Id": "usr-3"}
    )
    assert self_req.status_code == 400
    assert "cannot request your own donation" in self_req.json()["detail"]

    # 2. Valid request by usr-2
    valid_req = client.post(
        "/api/donations/LST-102/requests",
        json={"purpose": "Community soup kitchen"},
        headers={"X-User-Id": "usr-2"}
    )
    assert valid_req.status_code == 201
    req_data = valid_req.json()
    req_id = req_data["id"]
    assert req_data["status"] == "pending"

    # 3. Rule: Prevent duplicate request
    dup_req = client.post(
        "/api/donations/LST-102/requests",
        json={"purpose": "Duplicate request"},
        headers={"X-User-Id": "usr-2"}
    )
    assert dup_req.status_code == 400
    assert "Duplicate request" in dup_req.json()["detail"]

    # 4. Donor (usr-3) approves request
    approve_res = client.patch(
        f"/api/requests/{req_id}",
        json={"action": "approve"},
        headers={"X-User-Id": "usr-3"}
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"

    # Verify listing state changed to claimed
    listing_res = client.get("/api/donations/LST-102")
    assert listing_res.json()["status"] == "claimed"
