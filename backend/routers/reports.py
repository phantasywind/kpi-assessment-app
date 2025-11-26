from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/employee-summary", response_model=List[schemas.EmployeeSummary])
def employee_summary(
    period_id: int = Query(..., description="Target period id"),
    department_id: Optional[int] = Query(None, description="Optional department filter"),
    db: Session = Depends(get_db),
):
    period = db.get(models.Period, period_id)
    if not period:
        raise HTTPException(status_code=404, detail="Period not found")

    aggregation = (
        db.query(
            models.KpiValue.employee_id.label("employee_id"),
            func.sum(func.coalesce(models.KpiValue.score, 0) * func.coalesce(models.KpiValue.weight, 0)).label(
                "weighted_sum"
            ),
            func.sum(func.coalesce(models.KpiValue.weight, 0)).label("weight_total"),
            func.group_concat(func.distinct(models.KpiValue.status), ",").label("statuses"),
        )
        .filter(models.KpiValue.period_id == period_id)
        .group_by(models.KpiValue.employee_id)
        .subquery()
    )

    query = (
        db.query(
            models.Employee.id.label("employee_id"),
            models.Employee.name.label("employee_name"),
            models.Department.name.label("department_name"),
            aggregation.c.weighted_sum,
            aggregation.c.weight_total,
            aggregation.c.statuses,
        )
        .join(models.Department, models.Employee.department_id == models.Department.id, isouter=True)
        .join(aggregation, aggregation.c.employee_id == models.Employee.id, isouter=True)
    )

    if department_id is not None:
        query = query.filter(models.Employee.department_id == department_id)

    rows = query.all()
    period_label = period.label or f"{period.year:04d}-{period.month:02d}"

    summaries = []
    for row in rows:
        total_score = None
        if row.weight_total and row.weight_total != 0:
            total_score = row.weighted_sum / row.weight_total

        status = None
        if row.statuses:
            parts = [s for s in row.statuses.split(",") if s]
            if parts:
                unique_statuses = set(parts)
                status = parts[0] if len(unique_statuses) == 1 else "Mixed"

        summaries.append(
            schemas.EmployeeSummary(
                employee_id=row.employee_id,
                employee_name=row.employee_name,
                department_name=row.department_name,
                period_label=period_label,
                total_score=total_score,
                status=status,
            )
        )

    return summaries
