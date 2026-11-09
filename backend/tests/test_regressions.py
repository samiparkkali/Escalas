"""Regression tests for defects found on main; each failed before its fix."""
import csv
import io

CONFIG = {
    "start_date": "2026-12-01",
    "end_date": "2026-12-03",
    "morning_weekday_specialist": 1,
    "night_weekday_specialist": 1,
    "morning_weekday_intern": 0,
    "night_weekday_intern": 0,
    "morning_weekend_specialist": 1,
    "night_weekend_specialist": 1,
    "morning_weekend_intern": 0,
    "night_weekend_intern": 0,
}


def add(client, name, role="specialist"):
    response = client.post("/api/professionals", json={"name": name, "role": role})
    assert response.status_code == 200, response.text
    return response.json()["id"]


def generate(client, **overrides):
    return client.post("/api/schedule/generate", json={"config": {**CONFIG, **overrides}})


def test_statistics_keep_professionals_with_the_same_name_apart(client):
    add(client, "Dr. Test Same", "specialist")
    add(client, "Dr. Test Same", "intern")
    assert generate(client, morning_weekday_intern=1, night_weekday_intern=1).status_code == 200

    stats = client.get("/api/schedule/statistics").json()["professional_stats"]
    assert sorted(s["role"] for s in stats) == ["intern", "specialist"]


def test_export_works_after_a_scheduled_professional_is_deleted(client):
    first = add(client, "Dr. Test One")
    add(client, "Dr. Test Two")
    assert generate(client).status_code == 200
    assert client.delete(f"/api/professionals/{first}").status_code == 200

    response = client.get("/api/schedule/export")
    assert response.status_code == 200
    assert "Dr. Test One" in response.content.decode("utf-8-sig")


def test_csv_declares_a_valid_charset(client):
    add(client, "Dr. Test One")
    assert generate(client).status_code == 200

    response = client.get("/api/schedule/export")
    assert response.headers["content-type"] == "text/csv; charset=utf-8"


def test_csv_is_utf8_with_bom_and_no_sep_line(client):
    add(client, "Dra. Ána Têste")
    assert generate(client).status_code == 200

    response = client.get("/api/schedule/export")
    body = response.content
    assert body.startswith(b"\xef\xbb\xbf")
    text = body.decode("utf-8-sig")
    # Excel ignores the BOM when a "sep=" directive is present, garbling accents.
    assert not text.startswith("sep=")
    assert "Dra. Ána Têste" in text


def test_csv_lists_every_date_of_the_period(client):
    # Nobody can work the middle day, so it has no assignments at all.
    for name in ("Dr. Test One", "Dr. Test Two"):
        pid = add(client, name)
        for shift in ("morning", "night"):
            body = {"professional_id": pid, "date": "2026-12-02", "shift_type": shift}
            assert client.post("/api/unavailabilities", json=body).status_code == 200
    assert generate(client).status_code == 200

    text = client.get("/api/schedule/export").content.decode("utf-8-sig")
    rows = csv.reader(io.StringIO(text), delimiter=";")
    header = next(row for row in rows if row and row[0] == "Professional Name")
    assert header[1::2] == ["01-12-2026", "02-12-2026", "03-12-2026"]


def test_generate_rejects_an_end_date_before_the_start_date(client):
    add(client, "Dr. Test One")
    response = generate(client, start_date="2026-12-05", end_date="2026-12-01")
    assert response.status_code == 422
