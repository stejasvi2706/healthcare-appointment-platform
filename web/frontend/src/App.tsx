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
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BookingView } from './views/BookingView';
import { AppointmentsView } from './views/AppointmentsView';
import { AuthView } from './views/AuthView';
import {
  cancelAppointment,
  createAppointment,
  fetchAppointmentEvents,
  fetchAppointments,
  fetchAvailableSlots,
  fetchDepartments,
  fetchDoctorsByDepartment,
  login,
  register,
} from './api/appointments';
import type {
  Appointment,
  AppointmentEventLog,
  AppointmentSlot,
  AuthSession,
  Department,
  Doctor,
} from './types/domain';

const navigation = [
  { to: '/', label: 'Book', icon: CalendarDays },
  { to: '/appointments', label: 'Appointments', icon: CalendarCheck },
  { to: '/auth', label: 'Access', icon: LogIn },
];

const APPOINTMENT_REFRESH_INTERVAL_MS = 3000;
const SESSION_EXPIRED_MESSAGE = 'Your session expired. Please sign in again.';

function isAuthenticationError(error: unknown) {
  return (
    axios.isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403)
  );
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message;
    }

    if (error.response?.status === 400) {
      return 'Please check the details and try again.';
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      return 'Incorrect email or password.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

function deriveNameFromEmail(email: string) {
  return email.split('@')[0] || 'Patient';
}

function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentEvents, setAppointmentEvents] = useState<Record<number, AppointmentEventLog[]>>(
    {},
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [session, setSession] = useState<AuthSession | null>(() => {
    const token = window.localStorage.getItem('authToken');
    const email = window.localStorage.getItem('authEmail');
    const name = window.localStorage.getItem('authName');

    return token && email && name ? { token, email, name } : null;
  });
  const [isLoadingCatalogue, setIsLoadingCatalogue] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [appointmentError, setAppointmentError] = useState('');
  const [authError, setAuthError] = useState('');

  const clearSession = useCallback(() => {
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('authEmail');
    window.localStorage.removeItem('authName');
    setSession(null);
    setAppointments([]);
    setAppointmentEvents({});
  }, []);

  const handleSessionExpired = useCallback(() => {
    clearSession();
    setAuthError(SESSION_EXPIRED_MESSAGE);
    return SESSION_EXPIRED_MESSAGE;
  }, [clearSession]);

  const stats = useMemo(
    () => ({
      confirmed: appointments.filter((appointment) => appointment.status === 'CONFIRMED').length,
      processing: appointments.filter((appointment) => appointment.status === 'PROCESSING').length,
      departments: departments.length,
    }),
    [appointments, departments],
  );

  const loadAppointmentEvents = useCallback(
    async (appointmentList: Appointment[]) => {
      if (appointmentList.length === 0) {
        setAppointmentEvents({});
        return;
      }

      const eventEntries = await Promise.all(
        appointmentList.map(async (appointment) => [
          appointment.id,
          await fetchAppointmentEvents(appointment.id),
        ] as const),
      );

      setAppointmentEvents(Object.fromEntries(eventEntries));
    },
    [],
  );

  const loadAppointments = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!options.silent) {
        setIsLoadingAppointments(true);
      }
      setAppointmentError('');

      try {
        const appointmentList = await fetchAppointments();
        setAppointments(appointmentList);
        await loadAppointmentEvents(appointmentList);
      } catch (error) {
        if (isAuthenticationError(error)) {
          setAppointmentError(handleSessionExpired());
          return;
        }

        setAppointmentError(getErrorMessage(error));
      } finally {
        if (!options.silent) {
          setIsLoadingAppointments(false);
        }
      }
    },
    [handleSessionExpired, loadAppointmentEvents],
  );

  useEffect(() => {
    async function loadCatalogue() {
      setIsLoadingCatalogue(true);
      setBookingError('');

      try {
        const departmentList = await fetchDepartments();
        const doctorLists = await Promise.all(
          departmentList.map((department) => fetchDoctorsByDepartment(department.id)),
        );

        setDepartments(departmentList);
        setDoctors(doctorLists.flat());
      } catch (error) {
        setBookingError(getErrorMessage(error));
      } finally {
        setIsLoadingCatalogue(false);
      }
    }

    void loadCatalogue();
  }, []);

  useEffect(() => {
    if (!session) {
      return undefined;
    }

    void loadAppointments();

    const intervalId = window.setInterval(() => {
      void loadAppointments({ silent: true });
    }, APPOINTMENT_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadAppointments, session]);

  const handleLoadSlots = useCallback(async (doctorId: number, date: string) => {
    setIsLoadingSlots(true);
    setBookingError('');

    try {
      setSlots(await fetchAvailableSlots(doctorId, date));
    } catch (error) {
      setBookingError(getErrorMessage(error));
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  async function handleCreateAppointment(slotId: number) {
    setIsCreatingAppointment(true);
    setBookingError('');

    try {
      const appointment = await createAppointment({ slotId });
      setAppointments((current) => [appointment, ...current]);
      setSlots((current) => current.filter((slot) => slot.id !== slotId));
      await loadAppointments({ silent: true });
      return true;
    } catch (error) {
      if (isAuthenticationError(error)) {
        setBookingError(handleSessionExpired());
        return false;
      }

      setBookingError(getErrorMessage(error));
      return false;
    } finally {
      setIsCreatingAppointment(false);
    }
  }

  async function handleCancelAppointment(appointmentId: number) {
    setAppointmentError('');

    try {
      await cancelAppointment(appointmentId);
      await loadAppointments();
    } catch (error) {
      if (isAuthenticationError(error)) {
        setAppointmentError(handleSessionExpired());
        return;
      }

      setAppointmentError(getErrorMessage(error));
    }
  }

  function storeSession(sessionPayload: AuthSession) {
    window.localStorage.setItem('authToken', sessionPayload.token);
    window.localStorage.setItem('authEmail', sessionPayload.email);
    window.localStorage.setItem('authName', sessionPayload.name);
    setSession(sessionPayload);
  }

  async function handleAuth(payload: {
    mode: 'login' | 'register';
    name: string;
    email: string;
    password: string;
  }) {
    setIsAuthenticating(true);
    setAuthError('');

    try {
      if (payload.mode === 'register') {
        await register({
          name: payload.name,
          email: payload.email,
          password: payload.password,
        });
      }

      const response = await login({
        email: payload.email,
        password: payload.password,
      });

      storeSession({
        token: response.token,
        email: payload.email,
        name: payload.mode === 'register' ? payload.name : deriveNameFromEmail(payload.email),
      });
      await loadAppointments();
      return true;
    } catch (error) {
      setAuthError(getErrorMessage(error));
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleLogout() {
    clearSession();
    setAuthError('');
    setAppointmentError('');
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
          <strong>Live</strong>
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
                onLoadSlots={handleLoadSlots}
                isLoadingCatalogue={isLoadingCatalogue}
                isLoadingSlots={isLoadingSlots}
                isCreatingAppointment={isCreatingAppointment}
                errorMessage={bookingError}
              />
            }
          />
          <Route
            path="/appointments"
            element={
              <AppointmentsView
                appointments={appointments}
                appointmentEvents={appointmentEvents}
                onCancelAppointment={handleCancelAppointment}
                isLoading={isLoadingAppointments}
                errorMessage={appointmentError}
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
                isSubmitting={isAuthenticating}
                errorMessage={authError}
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
                onLoadSlots={handleLoadSlots}
                isLoadingCatalogue={isLoadingCatalogue}
                isLoadingSlots={isLoadingSlots}
                isCreatingAppointment={isCreatingAppointment}
                errorMessage={bookingError}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
