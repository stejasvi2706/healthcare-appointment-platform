import { Ban, BellRing, CalendarClock, ClipboardList } from 'lucide-react';
import type {
  Appointment,
  AppointmentEventLog,
  AppointmentEventType,
  AppointmentStatus,
} from '../types/domain';

interface AppointmentsViewProps {
  appointments: Appointment[];
  appointmentEvents: Record<number, AppointmentEventLog[]>;
  onCancelAppointment: (appointmentId: number) => Promise<void>;
  isLoading: boolean;
  errorMessage: string;
}

const statusLabels: Record<AppointmentStatus, string> = {
  CREATED: 'Created',
  PROCESSING: 'Processing',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

const eventLabels: Record<AppointmentEventType, string> = {
  APPOINTMENT_CREATED: 'Appointment requested',
  APPOINTMENT_CANCELLED: 'Appointment cancelled',
  STATUS_UPDATED: 'Status updated',
  NOTIFICATION_PROCESSED: 'Notification processed',
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

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value));
}

function describeEvent(event: AppointmentEventLog) {
  if (event.eventType === 'STATUS_UPDATED' && event.oldStatus) {
    return `${statusLabels[event.oldStatus]} to ${statusLabels[event.newStatus]}`;
  }

  return event.message ?? statusLabels[event.newStatus];
}

export function AppointmentsView({
  appointments,
  appointmentEvents,
  onCancelAppointment,
  isLoading,
  errorMessage,
}: AppointmentsViewProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">My appointments</p>
          <h2>Appointment history</h2>
        </div>
        <ClipboardList size={22} aria-hidden="true" />
      </div>

      {isLoading && <p className="empty-note">Loading appointments...</p>}
      {errorMessage && (
        <p className="error-note" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="appointment-list">
        {appointments.length === 0 && (
          <div className="empty-state">
            <ClipboardList size={28} aria-hidden="true" />
            <h3>No appointments yet</h3>
            <p>Requested appointments will appear here.</p>
          </div>
        )}

        {appointments.map((appointment) => (
          <article className="appointment-row" key={appointment.id}>
            <div className="appointment-main">
              <span className={`status-pill ${appointment.status.toLowerCase()}`}>
                {statusLabels[appointment.status]}
              </span>
              <h3>{appointment.departmentName}</h3>
              <p>
                {appointment.doctorName} - {appointment.specialization}
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
              disabled={!['CREATED', 'PROCESSING', 'CONFIRMED'].includes(appointment.status)}
              onClick={() => onCancelAppointment(appointment.id)}
            >
              <Ban size={18} aria-hidden="true" />
            </button>
            <div className="appointment-timeline" aria-label={`Processing timeline for appointment ${appointment.id}`}>
              {(appointmentEvents[appointment.id] ?? []).length > 0 ? (
                appointmentEvents[appointment.id].map((event) => (
                  <div className="timeline-step" key={event.id}>
                    <span className="timeline-marker">
                      <BellRing size={13} aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{eventLabels[event.eventType]}</strong>
                      <span>{describeEvent(event)}</span>
                    </div>
                    <time dateTime={event.createdAt}>{formatEventTime(event.createdAt)}</time>
                  </div>
                ))
              ) : (
                <p className="empty-note">Processing timeline will appear here.</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
