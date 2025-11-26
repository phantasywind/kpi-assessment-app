import React, { useEffect, useState } from 'react'
import api from '../apiClient'

const initialForm = { year: '', month: '', label: '' }

const PeriodsPage = () => {
  const [periods, setPeriods] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)

  const loadPeriods = async () => {
    try {
      const { data } = await api.get('/periods/')
      setPeriods(data)
    } catch (err) {
      console.error('Failed to load periods', err)
    }
  }

  useEffect(() => {
    loadPeriods()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      year: Number(form.year),
      month: Number(form.month),
      label: form.label.trim() || null
    }
    try {
      if (editingId) {
        await api.put(`/periods/${editingId}`, payload)
      } else {
        await api.post('/periods/', payload)
      }
      setForm(initialForm)
      setEditingId(null)
      loadPeriods()
    } catch (err) {
      console.error('Save period failed', err)
    }
  }

  const startEdit = (period) => {
    setEditingId(period.id)
    setForm({
      year: period.year,
      month: period.month,
      label: period.label || ''
    })
  }

  return (
    <div>
      <h2>Periods</h2>
      <form className="card form-grid" onSubmit={handleSubmit}>
        <input
          required
          type="number"
          placeholder="Year"
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        />
        <input
          required
          type="number"
          placeholder="Month (1-12)"
          value={form.month}
          onChange={(e) => setForm({ ...form, month: e.target.value })}
        />
        <input
          placeholder="Label (optional)"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
      </form>

      {periods.map((period) => (
        <div key={period.id} className="card">
          <strong>{period.label || `${period.year}-${String(period.month).padStart(2, '0')}`}</strong>
          <div>
            Year: {period.year} Month: {period.month}
          </div>
          <button onClick={() => startEdit(period)}>Edit</button>
        </div>
      ))}
    </div>
  )
}

export default PeriodsPage
