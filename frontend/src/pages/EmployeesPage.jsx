import React, { useEffect, useState } from 'react'
import api from '../apiClient'

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [filterDept, setFilterDept] = useState('')
  const [form, setForm] = useState({ name: '', department_id: '', title: '', hire_date: '', is_active: true })
  const [editingId, setEditingId] = useState(null)

  const loadDepartments = async () => {
    try {
      const { data } = await api.get('/departments/')
      setDepartments(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadEmployees = async (deptId) => {
    const params = deptId ? { department_id: deptId } : {}
    try {
      const { data } = await api.get('/employees/', { params })
      setEmployees(data)
    } catch (err) {
      console.error('Failed to load employees', err)
    }
  }

  useEffect(() => {
    loadDepartments()
    loadEmployees()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      department_id: form.department_id ? Number(form.department_id) : null,
      hire_date: form.hire_date || null
    }
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, payload)
      } else {
        await api.post('/employees/', payload)
      }
      setForm({ name: '', department_id: '', title: '', hire_date: '', is_active: true })
      setEditingId(null)
      loadEmployees(filterDept)
    } catch (err) {
      console.error('Save employee failed', err)
    }
  }

  const startEdit = (emp) => {
    setEditingId(emp.id)
    setForm({
      name: emp.name,
      department_id: emp.department_id || '',
      title: emp.title || '',
      hire_date: emp.hire_date || '',
      is_active: emp.is_active
    })
  }

  const applyFilter = (deptId) => {
    setFilterDept(deptId)
    loadEmployees(deptId)
  }

  return (
    <div>
      <h2>Employees</h2>

      <div className="card">
        <label>Filter by Department:</label>
        <select value={filterDept} onChange={(e) => applyFilter(e.target.value)}>
          <option value="">All</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          value={form.department_id}
          onChange={(e) => setForm({ ...form, department_id: e.target.value })}
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="date"
          value={form.hire_date}
          onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Active
        </label>
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
      </form>

      {employees.map((emp) => (
        <div key={emp.id} className="card">
          <div>
            <strong>{emp.name}</strong> - {emp.title || 'No title'}
          </div>
          <div>Department: {emp.department_id || 'None'}</div>
          <div>Hire Date: {emp.hire_date || 'N/A'}</div>
          <div>Status: {emp.is_active ? 'Active' : 'Inactive'}</div>
          <button onClick={() => startEdit(emp)}>Edit</button>
        </div>
      ))}
    </div>
  )
}

export default EmployeesPage
