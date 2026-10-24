import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students.jsx';
import Performance from './pages/Performance.jsx';
import Risk from './pages/Risk.jsx';
import Interventions from './pages/Interventions.jsx';
import './index.css';

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/students', label: 'Student Management' },
  { to: '/performance', label: 'Performance Analytics' },
  { to: '/risk', label: 'Risk Classification' },
  { to: '/interventions', label: 'Intervention Tracking' },
];

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-logo">SA</span>
            <div>
              <div className="brand-title">Student Success</div>
              <div className="brand-sub">Analytics Dashboard</div>
            </div>
          </div>
          <nav className="nav">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className="nav-link">
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/risk" element={<Risk />} />
            <Route path="/interventions" element={<Interventions />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
