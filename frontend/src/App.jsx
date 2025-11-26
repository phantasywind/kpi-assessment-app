import React from 'react'
import { Link } from 'react-router-dom'

const App = ({ children }) => {
  return (
    <div className="app">
      <header>
        <h1>KPI Assessment</h1>
        <nav>
          <Link to="/">Departments</Link>
          <Link to="/employees">Employees</Link>
          <Link to="/periods">Periods</Link>
          <Link to="/kpis">KPIs</Link>
          <Link to="/kpi-entry">KPI Entry</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}

export default App
