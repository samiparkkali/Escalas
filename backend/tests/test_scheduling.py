from collections import Counter
from datetime import date, timedelta

from app.schemas import Role, ScheduleConfigModel, ShiftType
from app.services import Candidate, build_shifts, generate_schedule

ZERO = {
    f"{s}_{d}_{r}": 0
    for s in ("morning", "night")
    for d in ("weekday", "weekend")
    for r in ("specialist", "intern")
}


def config(start="2026-12-07", end="2026-12-20", **staffing):
    return ScheduleConfigModel(start_date=start, end_date=end, **{**ZERO, **staffing})


def people(n, role=Role.specialist, prefix="Dr. Test"):
    return [Candidate(id=f"{role.value}-{i}", name=f"{prefix} {role.value} {i}", role=role) for i in range(n)]


def slots(result):
    return [(a.professional_id, a.shift_date, a.shift_type) for a in result.assignments]


def everyone_every_shift(role="specialist", n=1):
    return {f"{s}_{d}_{role}": n for s in ("morning", "night") for d in ("weekday", "weekend")}


def test_shifts_use_weekday_and_weekend_requirements():
    shifts = build_shifts(
        config(
            start="2026-12-11",
            end="2026-12-12",
            morning_weekday_specialist=1,
            night_weekday_specialist=2,
            morning_weekend_specialist=3,
            night_weekend_intern=4,
        )
    )
    assert [
        (s.date.isoformat(), s.shift_type.value, s.required_specialists, s.required_interns) for s in shifts
    ] == [
        ("2026-12-11", "morning", 1, 0),
        ("2026-12-11", "night", 2, 0),
        ("2026-12-12", "morning", 3, 0),
        ("2026-12-12", "night", 0, 4),
    ]


def test_nobody_is_booked_twice_on_one_shift():
    result = generate_schedule(config(**everyone_every_shift(n=3)), people(4), set())
    assert len(slots(result)) == len(set(slots(result)))


def test_each_shift_gets_exactly_the_required_roles():
    cfg = config(**everyone_every_shift("specialist", 1), **everyone_every_shift("intern", 2))
    result = generate_schedule(cfg, people(5) + people(8, Role.intern), set())
    assert result.unassigned_shifts == []
    per_shift = Counter((a.shift_date, a.shift_type, a.professional_role) for a in result.assignments)
    for shift in build_shifts(cfg):
        assert per_shift[(shift.date, shift.shift_type, Role.specialist)] == 1
        assert per_shift[(shift.date, shift.shift_type, Role.intern)] == 2


def test_unavailability_is_respected():
    team = people(3)
    unavailable = {
        (team[0].id, date(2026, 12, 7) + timedelta(days=d), t) for d in range(14) for t in ShiftType
    }
    result = generate_schedule(config(**everyone_every_shift()), team, unavailable)
    assert team[0].id not in {a.professional_id for a in result.assignments}


def test_no_shift_in_the_two_shifts_after_a_night():
    result = generate_schedule(config(**everyone_every_shift(n=2)), people(6), set())
    worked = set(slots(result))
    for pid, day, shift_type in worked:
        if shift_type == ShiftType.night:
            following = day + timedelta(days=1)
            assert (pid, following, ShiftType.morning) not in worked
            assert (pid, following, ShiftType.night) not in worked


def test_unfillable_shifts_are_reported_with_missing_counts():
    # One specialist must rest after each night, so every other day is short.
    result = generate_schedule(config(end="2026-12-09", **everyone_every_shift()), people(1), set())
    assert [
        (u.date.isoformat(), u.shift_type.value, u.required_specialists) for u in result.unassigned_shifts
    ] == [
        ("2026-12-08", "morning", 1),
        ("2026-12-08", "night", 1),
    ]


def test_inactive_professionals_are_not_passed_to_the_generator_by_the_api(client):
    pid = client.post("/api/professionals", json={"name": "Dr. Test Away", "role": "specialist"}).json()["id"]
    client.put(
        f"/api/professionals/{pid}", json={"name": "Dr. Test Away", "role": "specialist", "is_active": False}
    )
    result = client.post(
        "/api/schedule/generate",
        json={
            "config": {
                "start_date": "2026-12-07",
                "end_date": "2026-12-07",
                **ZERO,
                "morning_weekday_specialist": 1,
            }
        },
    ).json()
    assert result["assignments"] == []
    assert result["unassigned_shifts"][0]["required_specialists"] == 1


def test_load_is_spread_evenly():
    cfg = config(
        start="2026-12-01",
        end="2026-12-28",
        **everyone_every_shift("specialist", 1),
        **everyone_every_shift("intern", 1),
    )
    result = generate_schedule(cfg, people(4) + people(4, Role.intern), set())
    assert result.unassigned_shifts == []
    totals = Counter(a.professional_id for a in result.assignments)
    assert len(totals) == 8
    for role in Role:
        role_totals = [totals[p] for p in totals if p.startswith(role.value)]
        assert max(role_totals) - min(role_totals) <= 1


def test_24h_mode_covers_both_shifts_and_gives_the_next_day_off():
    cfg = config(end="2026-12-13", is_24h=True, **everyone_every_shift(n=1))
    result = generate_schedule(cfg, people(2), set())
    assert result.unassigned_shifts == []
    by_day = {}
    for a in result.assignments:
        by_day.setdefault(a.shift_date, set()).add((a.professional_id, a.shift_type))
    for day, worked in by_day.items():
        assert {pid for pid, _ in worked} and all(
            (pid, ShiftType.morning) in worked and (pid, ShiftType.night) in worked for pid, _ in worked
        )
        nxt = by_day.get(day + timedelta(days=1), set())
        assert not ({pid for pid, _ in worked} & {pid for pid, _ in nxt})


def test_24h_mode_needs_availability_for_both_shifts():
    team = people(2)
    unavailable = {(team[0].id, date(2026, 12, 7), ShiftType.night)}
    result = generate_schedule(
        config(end="2026-12-07", is_24h=True, **everyone_every_shift()), team, unavailable
    )
    assert {a.professional_id for a in result.assignments} == {team[1].id}


def test_24h_mode_staffs_by_the_larger_requirement():
    cfg = config(end="2026-12-07", is_24h=True, morning_weekday_specialist=1, night_weekday_specialist=2)
    result = generate_schedule(cfg, people(3), set())
    assert len(result.assignments) == 4
    assert result.unassigned_shifts == []
