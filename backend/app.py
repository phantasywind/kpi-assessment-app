from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import departments, employees, kpis, periods, kpi_values

Base.metadata.create_all(bind=engine)

app = FastAPI(title="KPI Assessment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
    ,
    allow_headers=["*"],
)

app.include_router(departments.router)
app.include_router(employees.router)
app.include_router(kpis.router)
app.include_router(periods.router)
app.include_router(kpi_values.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
