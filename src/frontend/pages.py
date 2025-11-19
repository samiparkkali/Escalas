import reflex as rx
from .state import State


def index() -> rx.Component:
    return rx.container(
        rx.vstack(
            rx.heading("Shift Scheduler", size="9"),
            
            rx.divider(),
            
            rx.heading("Add Professionals", size="7"),
            rx.hstack(
                rx.input(
                    placeholder="Professional Name",
                    value=State.professional_name,
                    on_change=State.set_professional_name,
                ),
                rx.button("Add", on_click=State.add_professional),
            ),
            
            rx.foreach(
                State.professionals,
                lambda prof: rx.hstack(
                    rx.text(prof["name"]),
                    rx.button("Remove", on_click=lambda: State.remove_professional(prof["id"]), color_scheme="red"),
                ),
            ),
            
            rx.divider(),
            
            rx.heading("Add Unavailability", size="7"),
            rx.select(
                State.professional_names,
                placeholder="Select Professional",
                on_change=State.set_selected_professional_by_name,
            ),
            rx.hstack(
                rx.input(
                    placeholder="Year",
                    type="number",
                    value=State.unavailability_year,
                    on_change=State.set_unavailability_year,
                ),
                rx.input(
                    placeholder="Month",
                    type="number",
                    value=State.unavailability_month,
                    on_change=State.set_unavailability_month,
                ),
                rx.input(
                    placeholder="Day",
                    type="number",
                    value=State.unavailability_day,
                    on_change=State.set_unavailability_day,
                ),
            ),
            rx.select(
                ["morning", "night"],
                value=State.unavailability_shift_type,
                on_change=State.set_unavailability_shift_type,
            ),
            rx.button("Add Unavailability", on_click=State.add_unavailability),
            
            rx.foreach(
                State.unavailabilities,
                lambda u, index: rx.hstack(
                    rx.text(f"{u['professional_name']} - {u['date']} - {u['shift_type']}"),
                    rx.button("Remove", on_click=lambda: State.remove_unavailability(index), color_scheme="red"),
                ),
            ),
            
            rx.divider(),
            
            rx.heading("Schedule Configuration", size="7"),
            rx.text("Start Date:"),
            rx.hstack(
                rx.input(
                    placeholder="Year",
                    type="number",
                    value=State.schedule_start_year,
                    on_change=State.set_schedule_start_year,
                ),
                rx.input(
                    placeholder="Month",
                    type="number",
                    value=State.schedule_start_month,
                    on_change=State.set_schedule_start_month,
                ),
                rx.input(
                    placeholder="Day",
                    type="number",
                    value=State.schedule_start_day,
                    on_change=State.set_schedule_start_day,
                ),
            ),
            
            rx.text("End Date:"),
            rx.hstack(
                rx.input(
                    placeholder="Year",
                    type="number",
                    value=State.schedule_end_year,
                    on_change=State.set_schedule_end_year,
                ),
                rx.input(
                    placeholder="Month",
                    type="number",
                    value=State.schedule_end_month,
                    on_change=State.set_schedule_end_month,
                ),
                rx.input(
                    placeholder="Day",
                    type="number",
                    value=State.schedule_end_day,
                    on_change=State.set_schedule_end_day,
                ),
            ),
            
            rx.text("Staff Requirements:"),
            rx.text("Weekdays"),
            rx.hstack(
                rx.text("Day Shift:", as_="label"),
                rx.input(
                    placeholder="Morning Weekday",
                    type="number",
                    value=State.morning_weekday,
                    on_change=State.set_morning_weekday,
                ),
                rx.text("Night Shift:", as_="label"),
                rx.input(
                    placeholder="Night Weekday",
                    type="number",
                    value=State.night_weekday,
                    on_change=State.set_night_weekday,
                ),
                spacing="2",
                align="center",
            ),
            rx.text("Weekends"),
            rx.hstack(
                rx.text("Day Shift:", as_="label"),
                rx.input(
                    placeholder="Morning Weekend",
                    type="number",
                    value=State.morning_weekend,
                    on_change=State.set_morning_weekend,
                ),
                rx.text("Night Shift:", as_="label"),
                rx.input(
                    placeholder="Night Weekend",
                    type="number",
                    value=State.night_weekend,
                    on_change=State.set_night_weekend,
                ),
                spacing="2",
                align="center",
            ),
            
            rx.button("Generate Schedule", on_click=State.generate_schedule),
            
            rx.cond(
                State.download_url != "",
                rx.link(
                    rx.button("Download Schedule"),
                    href=State.download_url,
                    download=f"schedule.csv",
                    is_external=True,
                )
            ),

            rx.cond(
                State.schedule_message != "",
                rx.text(State.schedule_message),
            ),
            
            rx.divider(),
            
            rx.cond(
                State.summary_statistics.length() > 0,
                rx.vstack(
                    rx.heading("Summary Statistics", size="7"),
                    rx.table.root(
                        rx.table.header(
                            rx.table.row(
                                rx.table.column_header_cell("Professional"),
                                rx.table.column_header_cell("Morning Shifts"),
                                rx.table.column_header_cell("Night Shifts"),
                                rx.table.column_header_cell("Total Shifts"),
                            ),
                        ),
                        rx.table.body(
                            rx.foreach(
                                State.summary_statistics,
                                lambda stat: rx.table.row(
                                    rx.table.cell(stat["name"]),
                                    rx.table.cell(stat["morning"]),
                                    rx.table.cell(stat["night"]),
                                    rx.table.cell(stat["total"]),
                                ),
                            ),
                        ),
                    ),
                ),
            ),
            
            rx.divider(),
            
            rx.heading("Assignments", size="7"),
            rx.foreach(
                State.assignments,
                lambda a: rx.text(f"{a['professional_name']} - {a['shift_date']} - {a['shift_type']}"),
            ),
            
            rx.cond(
                State.unassigned_shifts.length() > 0,
                rx.vstack(
                    rx.heading("Unassigned Shifts", size="6"),
                    rx.foreach(
                        State.unassigned_shifts,
                        lambda s: rx.text(f"{s['date']} - {s['shift_type']} (needs {s['required_staff']})"),
                    ),
                ),
            ),
            
            spacing="4",
            width="100%",
        ),
        padding="4",
    )

