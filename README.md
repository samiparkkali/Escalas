# Shift Scheduler

A full-stack application designed for efficient and intelligent healthcare shift management. This system provides an intuitive interface for managing professional rosters, tracking unavailabilities, and generating complex, fair, and optimized shift schedules.

## Architecture

- **Backend**: Python FastAPI
- **Frontend**: React 18 with Vite, featuring a custom "Teal & Orange" design system.
- **Database**: SQLAlchemy ORM for robust data persistence.
- **Domain Logic**: Python classes implementing a sophisticated scheduling algorithm.

## Setup

### Backend

```bash
cd backend # Navigate to the backend directory
pip install -r requirements.txt # Install Python dependencies
python main.py # Start the FastAPI server
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