from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.post("/", response_model=schemas.Department, status_code=status.HTTP_201_CREATED)
def create_department(department: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    db_department = models.Department(**department.dict())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department


@router.get("/", response_model=List[schemas.Department])
def list_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).all()


@router.get("/{department_id}", response_model=schemas.Department)
def get_department(department_id: int, db: Session = Depends(get_db)):
    department = db.query(models.Department).get(department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.put("/{department_id}", response_model=schemas.Department)
def update_department(department_id: int, department: schemas.DepartmentUpdate, db: Session = Depends(get_db)):
    db_department = db.query(models.Department).get(department_id)
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
    for key, value in department.dict().items():
        setattr(db_department, key, value)
    db.commit()
    db.refresh(db_department)
    return db_department


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(department_id: int, db: Session = Depends(get_db)):
    db_department = db.query(models.Department).get(department_id)
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(db_department)
    db.commit()
    return None
