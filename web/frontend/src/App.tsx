import {
  Activity,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogIn,
  Stethoscope,
  Users,
} from 'lucide-react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { BookingView } from './views/BookingView';
import { AppointmentsView } from './views/AppointmentsView';
import { AuthView } from './views/AuthView';

const navigation = [
  { to: '/', label: 'Book', icon: CalendarDays },
  { to: '/appointments', label: 'Appointments', icon: CalendarCheck },
  { to: '/auth', label: 'Access', icon: LogIn },
];

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark">
            <Stethoscope size={22} aria-hidden="true" />
          </span>
          <div>
            <strong>CareFlow</strong>
            <span>Appointment operations</span>
          </div>
        </div>

        <nav className="nav-list">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="system-status">
          <div>
            <Activity size={18} aria-hidden="true" />
            <span>Backend API</span>
          </div>
          <strong>Pending integration</strong>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Healthcare scheduling</p>
            <h1>Appointment workspace</h1>
          </div>
          <div className="quick-stats" aria-label="Appointment status summary">
            <div>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>3 confirmed</span>
            </div>
            <div>
              <Clock3 size={18} aria-hidden="true" />
              <span>2 processing</span>
            </div>
            <div>
              <Users size={18} aria-hidden="true" />
              <span>5 departments</span>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<BookingView />} />
          <Route path="/appointments" element={<AppointmentsView />} />
          <Route path="/auth" element={<AuthView />} />
          <Route path="*" element={<BookingView />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
