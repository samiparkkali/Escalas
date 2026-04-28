# Shift Scheduler Backend

A FastAPI backend for the Shift Scheduler application, built with Clean Architecture principles.

## Architecture

The backend follows Clean Architecture with the following layers:

```
backend/
├── main.py              # FastAPI application and routes
├── app/
│   ├── __init__.py      # Package initialization
│   ├── models/          # SQLAlchemy Database models
│   ├── schemas.py       # Pydantic models (DTOs)
│   ├── services.py      # Business logic services
│   ├── repositories.py  # Data access layer
│   └── dependencies.py  # Dependency injection
└── requirements.txt     # Python dependencies
```

### Layers

- **Models**: API request/response models using Pydantic
- **Services**: Business logic and domain interactions
- **Repositories**: Data persistence (currently in-memory)
- **Dependencies**: Dependency injection container
- **Main**: HTTP routes and application setup

## API Endpoints

### Professionals
- `GET /api/professionals` - List all professionals
- `POST /api/professionals` - Create a new professional
- `PUT /api/professionals/{id}` - Update a professional
- `DELETE /api/professionals/{id}` - Delete a professional

### Unavailabilities
- `GET /api/unavailabilities` - List all unavailabilities
- `POST /api/unavailabilities` - Create an unavailability
- `DELETE /api/unavailabilities/{id}` - Delete an unavailability

### Schedule
- `POST /api/schedule/generate` - Generate a schedule
- `GET /api/schedule/export` - Export schedule as CSV
- `GET /api/schedule/statistics` - Get schedule statistics

## Running the Backend

```bash
cd backend
python main.py
```

The API will be available at `http://localhost:8000`

## Development

The backend uses:
- FastAPI for the web framework
- Pydantic for data validation
- Clean Architecture for maintainability
- In-memory storage (replace with database for production)