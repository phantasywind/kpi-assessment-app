import React, { useEffect, useState } from 'react'
import api from '../apiClient'

const KpisPage = () => {
  const [kpis, setKpis] = useState([])
  const [form, setForm] = useState({ name: '', category: '', unit: '', direction: 'HigherIsBetter', default_weight: '' })
  const [editingId, setEditingId] = useState(null)

  const loadKpis = async () => {
    try {
      const { data } = await api.get('/kpis/')
      setKpis(data)
    } catch (err) {
      console.error('Failed to load KPIs', err)
    }
  }

  useEffect(() => {
    loadKpis()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      default_weight: form.default_weight ? Number(form.default_weight) : null
    }
    try {
      if (editingId) {
        await api.put(`/kpis/${editingId}`, payload)
      } else {
        await api.post('/kpis/', payload)
      }
      setForm({ name: '', category: '', unit: '', direction: 'HigherIsBetter', default_weight: '' })
      setEditingId(null)
      loadKpis()
    } catch (err) {
      console.error('Save KPI failed', err)
    }
  }

  const startEdit = (kpi) => {
    setEditingId(kpi.id)
    setForm({
      name: kpi.name,
      category: kpi.category || '',
      unit: kpi.unit || '',
      direction: kpi.direction,
      default_weight: kpi.default_weight || ''
    })
  }

  const deleteKpi = async (id) => {
    if (!window.confirm('Delete this KPI?')) return
    try {
      await api.delete(`/kpis/${id}`)
      if (editingId === id) {
        setEditingId(null)
        setForm({ name: '', category: '', unit: '', direction: 'HigherIsBetter', default_weight: '' })
      }
      loadKpis()
    } catch (err) {
      console.error('Delete KPI failed', err)
    }
  }

  return (
    <div>
      <h2>KPIs</h2>
      <form className="card form-grid" onSubmit={handleSubmit}>
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          placeholder="Unit"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />
        <select
          value={form.direction}
          onChange={(e) => setForm({ ...form, direction: e.target.value })}
        >
          <option value="HigherIsBetter">Higher is better</option>
          <option value="LowerIsBetter">Lower is better</option>
        </select>
        <input
          type="number"
          placeholder="Default Weight"
          value={form.default_weight}
          onChange={(e) => setForm({ ...form, default_weight: e.target.value })}
        />
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
      </form>

      {kpis.map((kpi) => (
        <div key={kpi.id} className="card">
          <strong>{kpi.name}</strong>
          <div>Category: {kpi.category || 'N/A'}</div>
          <div>Unit: {kpi.unit || 'N/A'}</div>
          <div>Direction: {kpi.direction}</div>
          <div>Default Weight: {kpi.default_weight ?? 'N/A'}</div>
          <div className="actions">
            <button onClick={() => startEdit(kpi)}>Edit</button>
            <button className="danger" onClick={() => deleteKpi(kpi.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default KpisPage
