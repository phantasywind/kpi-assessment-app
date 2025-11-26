from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/kpis", tags=["KPIs"])


@router.post("/", response_model=schemas.Kpi, status_code=status.HTTP_201_CREATED)
def create_kpi(kpi: schemas.KpiCreate, db: Session = Depends(get_db)):
    db_kpi = models.Kpi(**kpi.model_dump())
    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    return db_kpi


@router.get("/", response_model=List[schemas.Kpi])
def list_kpis(db: Session = Depends(get_db)):
    return db.query(models.Kpi).all()


@router.get("/{kpi_id}", response_model=schemas.Kpi)
def get_kpi(kpi_id: int, db: Session = Depends(get_db)):
    kpi = db.query(models.Kpi).get(kpi_id)
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    return kpi


@router.put("/{kpi_id}", response_model=schemas.Kpi)
def update_kpi(kpi_id: int, kpi: schemas.KpiUpdate, db: Session = Depends(get_db)):
    db_kpi = db.query(models.Kpi).get(kpi_id)
    if not db_kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    for key, value in kpi.model_dump().items():
        setattr(db_kpi, key, value)
    db.commit()
    db.refresh(db_kpi)
    return db_kpi


@router.delete("/{kpi_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kpi(kpi_id: int, db: Session = Depends(get_db)):
    db_kpi = db.query(models.Kpi).get(kpi_id)
    if not db_kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    db.delete(db_kpi)
    db.commit()
    return None
