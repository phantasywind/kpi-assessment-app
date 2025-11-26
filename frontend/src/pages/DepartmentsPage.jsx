import React, { useEffect, useState } from 'react'
import api from '../apiClient'

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ name: '', parent_department_id: '', is_active: true })
  const [editingId, setEditingId] = useState(null)

  const loadDepartments = async () => {
    try {
      const { data } = await api.get('/departments/')
      setDepartments(data)
    } catch (err) {
      console.error('Failed to load departments', err)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      parent_department_id: form.parent_department_id ? Number(form.parent_department_id) : null
    }
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, payload)
      } else {
        await api.post('/departments/', payload)
      }
      setForm({ name: '', parent_department_id: '', is_active: true })
      setEditingId(null)
      loadDepartments()
    } catch (err) {
      console.error('Save failed', err)
    }
  }

  const startEdit = (dept) => {
    setEditingId(dept.id)
    setForm({
      name: dept.name,
      parent_department_id: dept.parent_department_id || '',
      is_active: dept.is_active
    })
  }

  return (
    <div>
      <h2>Departments</h2>
      <form className="card form-grid" onSubmit={handleSubmit}>
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Parent Department ID"
          value={form.parent_department_id}
          onChange={(e) => setForm({ ...form, parent_department_id: e.target.value })}
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

      {departments.map((dept) => (
        <div key={dept.id} className="card">
          <strong>{dept.name}</strong>
          <div>Parent ID: {dept.parent_department_id || 'N/A'}</div>
          <div>Status: {dept.is_active ? 'Active' : 'Inactive'}</div>
          <button onClick={() => startEdit(dept)}>Edit</button>
        </div>
      ))}
    </div>
  )
}

export default DepartmentsPage
