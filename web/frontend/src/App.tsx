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
import { useMemo, useState } from 'react';
import { BookingView } from './views/BookingView';
import { AppointmentsView } from './views/AppointmentsView';
import { AuthView } from './views/AuthView';
import {
  appointments as initialAppointments,
  departments,
  doctors,
  slots,
} from './data/placeholders';
import type { Appointment, AuthSession } from './types/domain';

const navigation = [
  { to: '/', label: 'Book', icon: CalendarDays },
  { to: '/appointments', label: 'Appointments', icon: CalendarCheck },
  { to: '/auth', label: 'Access', icon: LogIn },
];

function App() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [session, setSession] = useState<AuthSession | null>(() => {
    const token = window.localStorage.getItem('authToken');
    const email = window.localStorage.getItem('authEmail');
    const name = window.localStorage.getItem('authName');

    return token && email && name ? { token, email, name } : null;
  });

  const stats = useMemo(
    () => ({
      confirmed: appointments.filter((appointment) => appointment.status === 'CONFIRMED').length,
      processing: appointments.filter((appointment) => appointment.status === 'PROCESSING').length,
      departments: departments.length,
    }),
    [appointments],
  );

  function handleCreateAppointment(slotId: number) {
    const slot = slots.find((item) => item.id === slotId);
    const doctor = slot ? doctors.find((item) => item.id === slot.doctorId) : undefined;
    const department = doctor
      ? departments.find((item) => item.id === doctor.departmentId)
      : undefined;

    if (!slot || !doctor || !department) {
      return;
    }

    const appointment: Appointment = {
      id: Date.now(),
      slotId,
      status: 'CREATED',
      departmentName: department.name,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      startDatetime: slot.startDatetime,
      endDatetime: slot.endDatetime,
    };

    setAppointments((current) => [appointment, ...current]);
  }

  function handleCancelAppointment(appointmentId: number) {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: 'CANCELLED' }
          : appointment,
      ),
    );
  }

  function handleAuth(sessionPayload: AuthSession) {
    window.localStorage.setItem('authToken', sessionPayload.token);
    window.localStorage.setItem('authEmail', sessionPayload.email);
    window.localStorage.setItem('authName', sessionPayload.name);
    setSession(sessionPayload);
  }

  function handleLogout() {
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('authEmail');
    window.localStorage.removeItem('authName');
    setSession(null);
  }

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
          <strong>Mock mode</strong>
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
              <span>{stats.confirmed} confirmed</span>
            </div>
            <div>
              <Clock3 size={18} aria-hidden="true" />
              <span>{stats.processing} processing</span>
            </div>
            <div>
              <Users size={18} aria-hidden="true" />
              <span>{stats.departments} departments</span>
            </div>
          </div>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <BookingView
                appointments={appointments}
                departments={departments}
                doctors={doctors}
                slots={slots}
                onCreateAppointment={handleCreateAppointment}
              />
            }
          />
          <Route
            path="/appointments"
            element={
              <AppointmentsView
                appointments={appointments}
                onCancelAppointment={handleCancelAppointment}
              />
            }
          />
          <Route
            path="/auth"
            element={
              <AuthView
                session={session}
                onAuthenticate={handleAuth}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="*"
            element={
              <BookingView
                appointments={appointments}
                departments={departments}
                doctors={doctors}
                slots={slots}
                onCreateAppointment={handleCreateAppointment}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
