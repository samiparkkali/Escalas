# Shift Scheduler

A full-stack application for generating and managing work schedules.

## Architecture

- **Backend**: Python FastAPI
- **Frontend**: React with Material-UI
- **Domain Logic**: Python classes for scheduling logic

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The backend will run on http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:5173

## Core Concepts

The application is built around a few key ideas:

*   **Professionals**: The people who will be assigned to shifts.
*   **Shifts**: Defined periods of work, categorized as 'morning' or 'night', with specific dates and staffing requirements.
*   **Assignments**: The link between a professional and a specific shift.

## Features

*   **Manage Professionals**: Add or remove professionals from the roster.
*   **Set Unavailability**: Mark dates and shift types when a professional is unavailable to work.
*   **Configure Schedule**:
    *   Define the start and end dates for the schedule period.
    *   Specify the number of staff required for morning and night shifts on both weekdays and weekends.
*   **Generate & Download**: Automatically generate a schedule based on the provided constraints and download it as a CSV file.
*   **View Statistics**: See a summary table of how many morning, night, and total shifts are assigned to each professional.
*   **Track Assignments**: View lists of all assigned shifts and any shifts that could not be filled.

## API Endpoints

- `POST /api/schedule/generate` - Generate a schedule
- `GET /api/schedule/export` - Export schedule as CSV
- `GET /api/schedule/statistics` - Get schedule statistics