from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/kpi-values", tags=["KPI Values"])


@router.post("/", response_model=schemas.KpiValue, status_code=status.HTTP_201_CREATED)
def create_kpi_value(value: schemas.KpiValueCreate, db: Session = Depends(get_db)):
    db_value = models.KpiValue(**value.model_dump())
    db.add(db_value)
    db.commit()
    db.refresh(db_value)
    return db_value


@router.get("/", response_model=List[schemas.KpiValue])
def list_kpi_values(
    employee_id: Optional[int] = Query(None),
    period_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.KpiValue)
    if employee_id is not None:
        query = query.filter(models.KpiValue.employee_id == employee_id)
    if period_id is not None:
        query = query.filter(models.KpiValue.period_id == period_id)
    return query.all()


@router.put("/{value_id}", response_model=schemas.KpiValue)
def update_kpi_value(value_id: int, payload: schemas.KpiValueUpdate, db: Session = Depends(get_db)):
    db_value = db.get(models.KpiValue, value_id)
    if not db_value:
        raise HTTPException(status_code=404, detail="KPI value not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(db_value, key, value)
    db.commit()
    db.refresh(db_value)
    return db_value


@router.get("/employee/{employee_id}/period/{period_id}", response_model=schemas.KpiValueListResponse)
def get_employee_period_values(employee_id: int, period_id: int, db: Session = Depends(get_db)):
    employee = db.get(models.Employee, employee_id)
    period = db.get(models.Period, period_id)
    if not employee or not period:
        raise HTTPException(status_code=404, detail="Employee or period not found")
    values = (
        db.query(models.KpiValue)
        .filter(models.KpiValue.employee_id == employee_id, models.KpiValue.period_id == period_id)
        .all()
    )
    return schemas.KpiValueListResponse(period=period, employee=employee, values=values)


@router.get("/employee/{employee_id}/period/{period_id}/summary", response_model=schemas.ScoreSummary)
def get_score_summary(employee_id: int, period_id: int, db: Session = Depends(get_db)):
    values = (
        db.query(models.KpiValue)
        .filter(models.KpiValue.employee_id == employee_id, models.KpiValue.period_id == period_id)
        .all()
    )
    if not values:
        return schemas.ScoreSummary(employee_id=employee_id, period_id=period_id, weighted_score=None)
    total_weight = sum(v.weight for v in values if v.weight is not None)
    if not total_weight:
        return schemas.ScoreSummary(employee_id=employee_id, period_id=period_id, weighted_score=None)
    weighted_sum = sum((v.score or 0) * (v.weight or 0) for v in values)
    return schemas.ScoreSummary(
        employee_id=employee_id,
        period_id=period_id,
        weighted_score=weighted_sum / total_weight,
    )


@router.delete("/{value_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kpi_value(value_id: int, db: Session = Depends(get_db)):
    db_value = db.get(models.KpiValue, value_id)
    if not db_value:
        raise HTTPException(status_code=404, detail="KPI value not found")
    db.delete(db_value)
    db.commit()
