from datetime import date
from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from .models import DirectionEnum


class DepartmentBase(BaseModel):
    name: str
    parent_department_id: Optional[int] = None
    is_active: bool = True


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(DepartmentBase):
    pass


class Department(DepartmentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class EmployeeBase(BaseModel):
    name: str
    department_id: Optional[int] = None
    title: Optional[str] = None
    hire_date: Optional[date] = None
    is_active: bool = True


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(EmployeeBase):
    pass


class Employee(EmployeeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class KpiBase(BaseModel):
    name: str
    category: Optional[str] = None
    unit: Optional[str] = None
    direction: DirectionEnum = DirectionEnum.higher
    default_weight: Optional[float] = None


class KpiCreate(KpiBase):
    pass


class KpiUpdate(KpiBase):
    pass


class Kpi(KpiBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class PeriodBase(BaseModel):
    year: int
    month: int
    label: Optional[str] = None


class PeriodCreate(PeriodBase):
    pass


class PeriodUpdate(PeriodBase):
    pass


class Period(PeriodBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class KpiValueBase(BaseModel):
    employee_id: int
    kpi_id: int
    period_id: int
    target_value: Optional[float] = None
    actual_value: Optional[float] = None
    weight: Optional[float] = None
    score: Optional[float] = None
    comment: Optional[str] = None
    status: Optional[str] = None


class KpiValueCreate(KpiValueBase):
    pass


class KpiValueUpdate(BaseModel):
    target_value: Optional[float] = None
    actual_value: Optional[float] = None
    weight: Optional[float] = None
    score: Optional[float] = None
    comment: Optional[str] = None
    status: Optional[str] = None


class KpiValue(KpiValueBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class KpiValueListResponse(BaseModel):
    period: Period
    employee: Employee
    values: List[KpiValue]


class ScoreSummary(BaseModel):
    employee_id: int
    period_id: int
    weighted_score: Optional[float]


class EmployeeSummary(BaseModel):
    employee_id: int
    employee_name: str
    department_name: Optional[str]
    period_label: str
    total_score: Optional[float]
    status: Optional[str]
