import enum
from sqlalchemy import Boolean, Column, Date, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class DirectionEnum(str, enum.Enum):
    higher = "HigherIsBetter"
    lower = "LowerIsBetter"


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    parent_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    is_active = Column(Boolean, default=True)

    parent_department = relationship("Department", remote_side=[id])
    employees = relationship("Employee", back_populates="department")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    title = Column(String, nullable=True)
    hire_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)

    department = relationship("Department", back_populates="employees")
    kpi_values = relationship("KpiValue", back_populates="employee")


class Kpi(Base):
    __tablename__ = "kpis"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    unit = Column(String, nullable=True)
    direction = Column(Enum(DirectionEnum), nullable=False, default=DirectionEnum.higher)
    default_weight = Column(Float, nullable=True)

    values = relationship("KpiValue", back_populates="kpi")


class Period(Base):
    __tablename__ = "periods"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    label = Column(String, nullable=True)

    kpi_values = relationship("KpiValue", back_populates="period")


class KpiValue(Base):
    __tablename__ = "kpi_values"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    kpi_id = Column(Integer, ForeignKey("kpis.id"), nullable=False)
    period_id = Column(Integer, ForeignKey("periods.id"), nullable=False)
    target_value = Column(Float, nullable=True)
    actual_value = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    score = Column(Float, nullable=True)
    comment = Column(String, nullable=True)
    status = Column(String, nullable=True)

    employee = relationship("Employee", back_populates="kpi_values")
    kpi = relationship("Kpi", back_populates="values")
    period = relationship("Period", back_populates="kpi_values")
