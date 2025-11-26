import React, { useEffect, useMemo, useState } from 'react'
import api from '../apiClient'

const KpiEntryPage = () => {
  const [employees, setEmployees] = useState([])
  const [periods, setPeriods] = useState([])
  const [kpis, setKpis] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [values, setValues] = useState([])
  const [newValue, setNewValue] = useState({ kpi_id: '', target_value: '', weight: '' })
  const [summary, setSummary] = useState(null)

  const loadReferences = async () => {
    try {
      const [empRes, periodRes, kpiRes] = await Promise.all([
        api.get('/employees/'),
        api.get('/periods/'),
        api.get('/kpis/')
      ])
      setEmployees(empRes.data)
      setPeriods(periodRes.data)
      setKpis(kpiRes.data)
    } catch (err) {
      console.error('Failed to load references', err)
    }
  }

  useEffect(() => {
    loadReferences()
  }, [])

  const kpiById = useMemo(
    () => Object.fromEntries(kpis.map((kpi) => [kpi.id, kpi])),
    [kpis]
  )

  const loadValues = async (employeeId, periodId) => {
    if (!employeeId || !periodId) return
    try {
      const { data } = await api.get(`/kpi-values/employee/${employeeId}/period/${periodId}`)
      setValues(data.values)
      const summaryRes = await api.get(`/kpi-values/employee/${employeeId}/period/${periodId}/summary`)
      setSummary(summaryRes.data.weighted_score)
    } catch (err) {
      console.error('Failed to load KPI values', err)
    }
  }

  const deleteValue = async (id) => {
    if (!window.confirm('Delete this KPI value?')) return
    try {
      await api.delete(`/kpi-values/${id}`)
      loadValues(selectedEmployee, selectedPeriod)
    } catch (err) {
      console.error('Delete KPI value failed', err)
    }
  }

  const handleSelectionChange = (employeeId, periodId) => {
    setSelectedEmployee(employeeId)
    setSelectedPeriod(periodId)
    loadValues(employeeId, periodId)
  }

  const handleFieldChange = (id, field, value) => {
    setValues((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)))
  }

  const saveValue = async (value) => {
    try {
      await api.put(`/kpi-values/${value.id}`, {
        target_value: value.target_value,
        actual_value: value.actual_value,
        weight: value.weight,
        score: value.score,
        comment: value.comment,
        status: value.status
      })
      loadValues(selectedEmployee, selectedPeriod)
    } catch (err) {
      console.error('Update failed', err)
    }
  }

  const addValue = async (e) => {
    e.preventDefault()
    if (!selectedEmployee || !selectedPeriod || !newValue.kpi_id) return
    try {
      await api.post('/kpi-values/', {
        employee_id: Number(selectedEmployee),
        period_id: Number(selectedPeriod),
        kpi_id: Number(newValue.kpi_id),
        target_value: newValue.target_value ? Number(newValue.target_value) : null,
        weight: newValue.weight ? Number(newValue.weight) : null
      })
      setNewValue({ kpi_id: '', target_value: '', weight: '' })
      loadValues(selectedEmployee, selectedPeriod)
    } catch (err) {
      console.error('Create KPI value failed', err)
    }
  }

  return (
    <div>
      <h2>KPI Entry</h2>
      <div className="card form-grid">
        <select value={selectedEmployee} onChange={(e) => handleSelectionChange(e.target.value, selectedPeriod)}>
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
        <select value={selectedPeriod} onChange={(e) => handleSelectionChange(selectedEmployee, e.target.value)}>
          <option value="">Select Period</option>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label || `${p.year}-${p.month}`}
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee && selectedPeriod && (
        <>
          <form className="card form-grid" onSubmit={addValue}>
            <h3>Add KPI</h3>
            <select
              required
              value={newValue.kpi_id}
              onChange={(e) => setNewValue({ ...newValue, kpi_id: e.target.value })}
            >
              <option value="">Select KPI</option>
              {kpis.map((kpi) => (
                <option key={kpi.id} value={kpi.id}>
                  {kpi.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Target"
              value={newValue.target_value}
              onChange={(e) => setNewValue({ ...newValue, target_value: e.target.value })}
            />
            <input
              type="number"
              placeholder="Weight"
              value={newValue.weight}
              onChange={(e) => setNewValue({ ...newValue, weight: e.target.value })}
            />
            <button type="submit">Add</button>
          </form>

          <div className="card">
            <div>
              <strong>Employee:</strong> {employees.find((e) => e.id === Number(selectedEmployee))?.name || 'N/A'}
            </div>
            <div>
              <strong>Period:</strong>{' '}
              {periods.find((p) => p.id === Number(selectedPeriod))?.label || 'N/A'}
            </div>
            <div>
              <strong>Weighted Score:</strong> {summary ?? 'N/A'}
            </div>
          </div>

          {values.length === 0 && <div className="card">No KPI values yet for this employee/period.</div>}

          {values.map((val) => {
            const kpi = kpiById[val.kpi_id]
            return (
              <div key={val.id} className="card form-grid">
                <div>
                  <strong>{kpi?.name || `KPI ${val.kpi_id}`}</strong>
                  {kpi?.category ? ` (${kpi.category})` : ''}
                </div>
                <input
                  type="number"
                  placeholder="Target"
                  value={val.target_value || ''}
                  onChange={(e) => handleFieldChange(val.id, 'target_value', Number(e.target.value))}
                />
                <input
                  type="number"
                  placeholder="Actual"
                  value={val.actual_value || ''}
                  onChange={(e) => handleFieldChange(val.id, 'actual_value', Number(e.target.value))}
                />
                <input
                  type="number"
                  placeholder="Weight"
                  value={val.weight || ''}
                  onChange={(e) => handleFieldChange(val.id, 'weight', Number(e.target.value))}
                />
                <input
                  type="number"
                  placeholder="Score"
                  value={val.score || ''}
                  onChange={(e) => handleFieldChange(val.id, 'score', Number(e.target.value))}
                />
                <textarea
                  placeholder="Comment"
                  value={val.comment || ''}
                  onChange={(e) => handleFieldChange(val.id, 'comment', e.target.value)}
                />
                <input
                  placeholder="Status"
                  value={val.status || ''}
                  onChange={(e) => handleFieldChange(val.id, 'status', e.target.value)}
                />
                <div className="actions">
                  <button type="button" onClick={() => saveValue(val)}>Save</button>
                  <button type="button" className="danger" onClick={() => deleteValue(val.id)}>
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default KpiEntryPage
