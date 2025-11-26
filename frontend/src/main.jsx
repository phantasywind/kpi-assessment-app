import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import DepartmentsPage from './pages/DepartmentsPage'
import EmployeesPage from './pages/EmployeesPage'
import PeriodsPage from './pages/PeriodsPage'
import KpisPage from './pages/KpisPage'
import KpiEntryPage from './pages/KpiEntryPage'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App>
        <Routes>
          <Route path="/" element={<DepartmentsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/periods" element={<PeriodsPage />} />
          <Route path="/kpis" element={<KpisPage />} />
          <Route path="/kpi-entry" element={<KpiEntryPage />} />
        </Routes>
      </App>
    </BrowserRouter>
  </React.StrictMode>
)
