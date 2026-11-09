import csv
import io

from fastapi.testclient import TestClient

from app.main import create_app

from .conftest import login, make_settings

CONFIG = {
    "start_date": "2026-12-07",
    "end_date": "2026-12-20",
    "morning_weekday_specialist": 1,
    "night_weekday_specialist": 1,
    "morning_weekend_specialist": 1,
    "night_weekend_specialist": 1,
    "morning_weekday_intern": 1,
    "night_weekday_intern": 1,
    "morning_weekend_intern": 1,
    "night_weekend_intern": 1,
}


def add(client, name, role="specialist"):
    response = client.post("/api/professionals", json={"name": name, "role": role})
    assert response.status_code == 200, response.text
    return response.json()["id"]


def roster(client):
    return [
        add(client, "Dr. Test One"),
        add(client, "Dr. Test Two"),
        add(client, "Dr. Test Three", "intern"),
        add(client, "Dr. Test Four", "intern"),
    ]


def test_professional_crud(client):
    pid = add(client, "  Dr. Test One  ")
    assert client.get("/api/professionals").json() == [
        {"id": pid, "name": "Dr. Test One", "role": "specialist", "is_active": True}
    ]
    updated = client.put(
        f"/api/professionals/{pid}", json={"name": "Dr. Test Uno", "role": "intern", "is_active": False}
    )
    assert updated.json() == {"id": pid, "name": "Dr. Test Uno", "role": "intern", "is_active": False}
    assert client.delete(f"/api/professionals/{pid}").status_code == 200
    assert client.get("/api/professionals").json() == []
    assert client.delete(f"/api/professionals/{pid}").status_code == 404


def test_professional_validation(client):
    assert client.post("/api/professionals", json={"name": "   ", "role": "specialist"}).status_code == 422
    assert client.post("/api/professionals", json={"name": "Dr. Test", "role": "nurse"}).status_code == 422


def test_unavailability_crud(client):
    pid = add(client, "Dr. Test One")
    body = {"professional_id": pid, "date": "2026-12-08", "shift_type": "night"}
    created = client.post("/api/unavailabilities", json=body)
    assert created.status_code == 200
    assert client.post("/api/unavailabilities", json=body).status_code == 400
    assert (
        client.post("/api/unavailabilities", json={**body, "professional_id": "missing"}).status_code == 404
    )
    assert [u["date"] for u in client.get("/api/unavailabilities").json()] == ["2026-12-08"]
    assert client.delete(f"/api/unavailabilities/{created.json()['id']}").status_code == 200
    assert client.get("/api/unavailabilities").json() == []


def test_deleting_a_professional_removes_their_unavailabilities(client):
    pid = add(client, "Dr. Test One")
    client.post(
        "/api/unavailabilities", json={"professional_id": pid, "date": "2026-12-08", "shift_type": "night"}
    )
    client.delete(f"/api/professionals/{pid}")
    assert client.get("/api/unavailabilities").json() == []


def test_no_schedule_yet(client):
    assert client.get("/api/schedule").json() is None
    assert client.get("/api/schedule/export").status_code == 404
    assert client.get("/api/schedule/statistics").json() == {
        "professional_stats": [],
        "unassigned_shifts": [],
    }


def test_generate_respects_unavailability_and_reports_unfilled(client):
    ids = roster(client)
    client.post(
        "/api/unavailabilities",
        json={"professional_id": ids[0], "date": "2026-12-07", "shift_type": "morning"},
    )
    config = {**CONFIG, "night_weekday_specialist": 3}
    result = client.post("/api/schedule/generate", json={"config": config}).json()
    assert not any(
        a["professional_id"] == ids[0] and a["shift_date"] == "2026-12-07" and a["shift_type"] == "morning"
        for a in result["assignments"]
    )
    # Only two specialists exist, so weekday nights are short.
    assert result["unassigned_shifts"]
    assert any(
        u["shift_type"] == "night" and u["required_specialists"] >= 1 for u in result["unassigned_shifts"]
    )
    assert result["success"] is False


def test_generate_rejects_an_overlong_period(client):
    response = client.post(
        "/api/schedule/generate",
        json={"config": {**CONFIG, "start_date": "2026-01-01", "end_date": "2027-01-02"}},
    )
    assert response.status_code == 422


def test_statistics_match_assignments(client):
    roster(client)
    result = client.post("/api/schedule/generate", json={"config": CONFIG}).json()
    stats = client.get("/api/schedule/statistics").json()
    assert sum(s["total"] for s in stats["professional_stats"]) == len(result["assignments"])
    for s in stats["professional_stats"]:
        assert s["morning"] + s["night"] == s["weekday"] + s["weekend"] == s["total"]
    assert [s["role"] for s in stats["professional_stats"]] == [
        "specialist",
        "specialist",
        "intern",
        "intern",
    ]
    assert stats["unassigned_shifts"] == result["unassigned_shifts"]


def test_csv_export_grid(client):
    add(client, "Dra. Íris Teste", "intern")
    add(client, "Dr. Zé Teste", "specialist")
    config = {
        **CONFIG,
        "end_date": "2026-12-08",
        "morning_weekday_intern": 1,
        "night_weekday_intern": 0,
        "night_weekday_specialist": 0,
    }
    client.post("/api/schedule/generate", json={"config": config})

    response = client.get("/api/schedule/export")
    assert (
        response.headers["content-disposition"] == 'attachment; filename="escalas_2026-12-07_2026-12-08.csv"'
    )
    rows = list(csv.reader(io.StringIO(response.content.decode("utf-8-sig")), delimiter=";"))
    assert rows[0] == ["Professional Name", "07-12-2026", "07-12-2026", "08-12-2026", "08-12-2026"]
    assert [c.strip() for c in rows[1]] == ["", "Morning", "Night", "Morning", "Night"]
    assert rows[2:] == [["Dr. Zé Teste", "X", "", "X", ""], ["Dra. Íris Teste", "X", "", "X", ""]]


def test_only_the_latest_schedule_is_kept(client):
    roster(client)
    client.post("/api/schedule/generate", json={"config": CONFIG})
    client.post("/api/schedule/generate", json={"config": {**CONFIG, "end_date": "2026-12-08"}})
    assert client.get("/api/schedule").json()["end_date"] == "2026-12-08"


def test_data_survives_a_restart(database_url, client):
    ids = roster(client)
    client.post(
        "/api/unavailabilities", json={"professional_id": ids[1], "date": "2026-12-09", "shift_type": "night"}
    )
    generated = client.post("/api/schedule/generate", json={"config": CONFIG}).json()
    stats = client.get("/api/schedule/statistics").json()
    export = client.get("/api/schedule/export").content

    with TestClient(create_app(make_settings(database_url))) as restarted:
        login(restarted, "scheduler.one")
        assert len(restarted.get("/api/professionals").json()) == 4
        assert len(restarted.get("/api/unavailabilities").json()) == 1
        assert restarted.get("/api/schedule").json() == generated
        assert restarted.get("/api/schedule/statistics").json() == stats
        assert restarted.get("/api/schedule/export").content == export


def test_users_only_see_their_own_data(client, other_client):
    ids = roster(client)
    unavailability = client.post(
        "/api/unavailabilities", json={"professional_id": ids[0], "date": "2026-12-09", "shift_type": "night"}
    ).json()
    client.post("/api/schedule/generate", json={"config": CONFIG})

    assert other_client.get("/api/professionals").json() == []
    assert other_client.get("/api/unavailabilities").json() == []
    assert other_client.get("/api/schedule").json() is None
    assert other_client.get("/api/schedule/export").status_code == 404
    assert other_client.get("/api/schedule/statistics").json()["professional_stats"] == []

    assert (
        other_client.put(f"/api/professionals/{ids[0]}", json={"name": "X", "role": "intern"}).status_code
        == 404
    )
    assert other_client.delete(f"/api/professionals/{ids[0]}").status_code == 404
    assert other_client.delete(f"/api/unavailabilities/{unavailability['id']}").status_code == 404
    assert (
        other_client.post(
            "/api/unavailabilities",
            json={"professional_id": ids[1], "date": "2026-12-10", "shift_type": "night"},
        ).status_code
        == 404
    )

    # The second user's schedule never uses the first user's staff.
    add(other_client, "Dr. Test Other")
    result = other_client.post("/api/schedule/generate", json={"config": CONFIG}).json()
    assert {a["professional_name"] for a in result["assignments"]} == {"Dr. Test Other"}

    assert len(client.get("/api/professionals").json()) == 4
    assert client.get("/api/schedule").json()["start_date"] == "2026-12-07"
