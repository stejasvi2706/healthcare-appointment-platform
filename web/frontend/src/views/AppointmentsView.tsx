import { Ban, CalendarClock, ClipboardList } from 'lucide-react';
import { appointments } from '../data/placeholders';
import type { AppointmentStatus } from '../types/domain';

const statusLabels: Record<AppointmentStatus, string> = {
  CREATED: 'Created',
  PROCESSING: 'Processing',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

function formatAppointmentTime(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const date = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(startDate);
  const time = `${new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(startDate)} - ${new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(endDate)}`;

  return `${date}, ${time}`;
}

export function AppointmentsView() {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">My appointments</p>
          <h2>Appointment history</h2>
        </div>
        <ClipboardList size={22} aria-hidden="true" />
      </div>

      <div className="appointment-list">
        {appointments.map((appointment) => (
          <article className="appointment-row" key={appointment.id}>
            <div className="appointment-main">
              <span className={`status-pill ${appointment.status.toLowerCase()}`}>
                {statusLabels[appointment.status]}
              </span>
              <h3>{appointment.departmentName}</h3>
              <p>
                {appointment.doctorName} · {appointment.specialization}
              </p>
            </div>
            <div className="appointment-time">
              <CalendarClock size={17} aria-hidden="true" />
              <span>
                {formatAppointmentTime(
                  appointment.startDatetime,
                  appointment.endDatetime,
                )}
              </span>
            </div>
            <button
              className="icon-action"
              type="button"
              aria-label={`Cancel appointment ${appointment.id}`}
              disabled={appointment.status !== 'CONFIRMED'}
            >
              <Ban size={18} aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
