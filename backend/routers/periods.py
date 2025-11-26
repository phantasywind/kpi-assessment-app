from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db


def _ensure_label(year: int, month: int, label: str | None) -> str:
    cleaned = (label or "").strip()
    return cleaned or f"{year}-{month:02d}"

router = APIRouter(prefix="/periods", tags=["Periods"])


@router.post("/", response_model=schemas.Period, status_code=status.HTTP_201_CREATED)
def create_period(period: schemas.PeriodCreate, db: Session = Depends(get_db)):
    payload = period.model_dump()
    payload["label"] = _ensure_label(period.year, period.month, period.label)
    db_period = models.Period(**payload)
    db.add(db_period)
    db.commit()
    db.refresh(db_period)
    return db_period


@router.get("/", response_model=List[schemas.Period])
def list_periods(db: Session = Depends(get_db)):
    return db.query(models.Period).all()


@router.get("/{period_id}", response_model=schemas.Period)
def get_period(period_id: int, db: Session = Depends(get_db)):
    period = db.get(models.Period, period_id)
    if not period:
        raise HTTPException(status_code=404, detail="Period not found")
    return period


@router.put("/{period_id}", response_model=schemas.Period)
def update_period(period_id: int, period: schemas.PeriodUpdate, db: Session = Depends(get_db)):
    db_period = db.get(models.Period, period_id)
    if not db_period:
        raise HTTPException(status_code=404, detail="Period not found")
    for key, value in period.model_dump(exclude_unset=True).items():
        setattr(db_period, key, value)
    db_period.label = _ensure_label(db_period.year, db_period.month, db_period.label)
    db.commit()
    db.refresh(db_period)
    return db_period


@router.delete("/{period_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_period(period_id: int, db: Session = Depends(get_db)):
    db_period = db.get(models.Period, period_id)
    if not db_period:
        raise HTTPException(status_code=404, detail="Period not found")
    db.delete(db_period)
    db.commit()
    return None
