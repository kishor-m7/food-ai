"""
Test suite for user administration, admin stats, audit logs, and role checks.
"""

def test_admin_stats(client):
    res = client.get("/api/admin/stats", headers={"X-User-Id": "usr-admin"})
    assert res.status_code == 200
    stats = res.json()
    assert "totalUsers" in stats
    assert "activeListings" in stats
    assert "totalKgRescued" in stats


def test_list_users_admin_only(client):
    # Non-admin user denied
    unauth_res = client.get("/api/users", headers={"X-User-Id": "usr-1"})
    assert unauth_res.status_code == 403

    # Admin user allowed
    admin_res = client.get("/api/users", headers={"X-User-Id": "usr-admin"})
    assert admin_res.status_code == 200
    users = admin_res.json()
    assert len(users) >= 4


def test_user_profile_me(client):
    res = client.get("/api/users/me", headers={"X-User-Id": "usr-1"})
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["id"] == "usr-1"
    assert "stats" in data
    assert "totalKgDonated" in data["stats"]


def test_audit_logs_admin_only(client):
    res = client.get("/api/admin/logs", headers={"X-User-Id": "usr-admin"})
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
    assert len(logs) > 0
