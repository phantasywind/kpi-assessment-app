import React, { useEffect, useState } from 'react'
import api from '../apiClient'

const KpiSummaryPage = () => {
  const [periods, setPeriods] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [periodRes, deptRes] = await Promise.all([
          api.get('/periods/'),
          api.get('/departments/')
        ])
        setPeriods(periodRes.data)
        setDepartments(deptRes.data)
      } catch (err) {
        console.error('Failed to load lookup data', err)
      }
    }

    loadLookups()
  }, [])

  const loadSummary = async () => {
    if (!selectedPeriod) return
    setLoading(true)
    try {
      const params = { period_id: Number(selectedPeriod) }
      if (selectedDepartment) {
        params.department_id = Number(selectedDepartment)
      }
      const { data } = await api.get('/reports/employee-summary', { params })
      setSummaries(data)
    } catch (err) {
      console.error('Failed to load KPI summary', err)
      setSummaries([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>KPI Summary</h2>
      <div className="card form-grid">
        <div>
          <label>Period</label>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} required>
            <option value="">Select period</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label || `${p.year}-${String(p.month).padStart(2, '0')}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Department</label>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="">All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={loadSummary} disabled={!selectedPeriod || loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {summaries.length === 0 ? (
        <div className="card">No KPI summary data. Please adjust filters and search.</div>
      ) : (
        <div className="card">
          <table className="full-width">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Period</th>
                <th>Total Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((item) => (
                <tr key={item.employee_id}>
                  <td>{item.employee_name}</td>
                  <td>{item.department_name || '—'}</td>
                  <td>{item.period_label}</td>
                  <td>{item.total_score !== null && item.total_score !== undefined ? item.total_score.toFixed(2) : '—'}</td>
                  <td>{item.status || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default KpiSummaryPage
