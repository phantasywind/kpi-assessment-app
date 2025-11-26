# KPI Assessment App

This repository contains a FastAPI backend (SQLite + SQLAlchemy) and a React (Vite) frontend for a KPI assessment system.

## Backend

### Setup
1. Create and activate a virtual environment (optional):
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

### Run
```bash
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

- Health check: `GET /health`
- Interactive docs: `http://localhost:8000/docs`

## Frontend

### Setup
Install Node dependencies inside the `frontend` directory:
```bash
cd frontend
npm install
```

### Run
```bash
npm run dev -- --host --port 5173
```

Visit `http://localhost:5173` to access the UI. The frontend expects the backend at `http://localhost:8000` by default (configurable via `VITE_API_BASE_URL`).

## Project Status
- Backend FastAPI app with CRUD for departments, employees, KPIs, periods, KPI values, and summary endpoint. Period labels default to `YYYY-MM` when not provided.
- React frontend with navigation, CRUD forms for departments/employees/KPIs/periods, and a KPI entry page that reads/writes KPI values via the API.
