import { CalendarPlus, ChevronRight, Clock, Stethoscope } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type {
  Appointment,
  AppointmentSlot,
  Department,
  Doctor,
} from '../types/domain';

interface BookingViewProps {
  appointments: Appointment[];
  departments: Department[];
  doctors: Doctor[];
  slots: AppointmentSlot[];
  onCreateAppointment: (slotId: number) => Promise<boolean>;
  onLoadSlots: (doctorId: number, date: string) => Promise<void>;
  isLoadingCatalogue: boolean;
  isLoadingSlots: boolean;
  isCreatingAppointment: boolean;
  errorMessage: string;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function toDateInputValue(value: string) {
  return value.slice(0, 10);
}

function timeRangesOverlap(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
) {
  return new Date(firstStart) < new Date(secondEnd) && new Date(firstEnd) > new Date(secondStart);
}

function formatSlotWindow(slot?: AppointmentSlot) {
  if (!slot) {
    return 'No slot selected';
  }

  return `${formatTime(slot.startDatetime)} - ${formatTime(slot.endDatetime)}`;
}

export function BookingView({
  appointments,
  departments,
  doctors,
  slots,
  onCreateAppointment,
  onLoadSlots,
  isLoadingCatalogue,
  isLoadingSlots,
  isCreatingAppointment,
  errorMessage,
}: BookingViewProps) {
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? 0);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [doctorId, setDoctorId] = useState(
    doctors.find((doctor) => doctor.departmentId === departmentId)?.id ?? 0,
  );
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    if (departments.length > 0 && departmentId === 0) {
      setDepartmentId(departments[0].id);
    }
  }, [departmentId, departments]);

  const availableDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.departmentId === departmentId),
    [departmentId, doctors],
  );

  const selectedDepartment = departments.find(
    (department) => department.id === departmentId,
  );
  const visibleDoctors = availableDoctors.length > 0 ? availableDoctors : doctors;
  const selectedDoctor =
    visibleDoctors.find((doctor) => doctor.id === doctorId) ?? visibleDoctors[0];

  useEffect(() => {
    if (selectedDoctor && selectedDoctor.id !== doctorId) {
      setDoctorId(selectedDoctor.id);
    }
  }, [doctorId, selectedDoctor]);

  useEffect(() => {
    if (selectedDoctor) {
      void onLoadSlots(selectedDoctor.id, selectedDate);
    }
  }, [onLoadSlots, selectedDate, selectedDoctor]);

  const activeAppointments = appointments.filter((appointment) =>
    ['CREATED', 'PROCESSING', 'CONFIRMED'].includes(appointment.status),
  );
  const visibleSlots = slots.filter(
    (slot) =>
      slot.doctorId === selectedDoctor?.id &&
      toDateInputValue(slot.startDatetime) === selectedDate &&
      !activeAppointments.some((appointment) =>
        timeRangesOverlap(
          appointment.startDatetime,
          appointment.endDatetime,
          slot.startDatetime,
          slot.endDatetime,
        ),
      ),
  );
  const selectedSlot = visibleSlots.find((slot) => slot.id === selectedSlotId);

  function handleDepartmentChange(nextDepartmentId: number) {
    const nextDoctor = doctors.find(
      (doctor) => doctor.departmentId === nextDepartmentId,
    );

    setDepartmentId(nextDepartmentId);
    setDoctorId(nextDoctor?.id ?? 0);
    setSelectedSlotId(null);
    setConfirmationMessage('');
  }

  async function handleRequestAppointment() {
    if (!selectedSlotId) {
      return;
    }

    const success = await onCreateAppointment(selectedSlotId);

    if (success) {
      setConfirmationMessage(
        'Appointment request created. Worker confirmation will update the status shortly.',
      );
      setSelectedSlotId(null);
    }
  }

  return (
    <section className="workspace-grid" aria-label="Appointment booking">
      <div className="panel booking-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Book appointment</p>
            <h2>Select care team and slot</h2>
          </div>
          <CalendarPlus size={22} aria-hidden="true" />
        </div>

        {isLoadingCatalogue && <p className="empty-note">Loading care catalogue...</p>}
        {errorMessage && (
          <p className="error-note" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="booking-columns">
          <div className="selection-group">
            <h3>Department</h3>
            <div className="choice-list">
              {departments.map((department) => (
                <button
                  className={`choice-row${department.id === departmentId ? ' selected' : ''}`}
                  key={department.id}
                  type="button"
                  onClick={() => handleDepartmentChange(department.id)}
                >
                  <span>{department.name}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="selection-group">
            <h3>Doctor</h3>
            <div className="choice-list">
              {visibleDoctors.map((doctor) => (
                <button
                  className={`choice-row${doctor.id === selectedDoctor?.id ? ' selected' : ''}`}
                  key={doctor.id}
                  type="button"
                  onClick={() => {
                    setDoctorId(doctor.id);
                    setSelectedSlotId(null);
                    setConfirmationMessage('');
                  }}
                >
                  <span>
                    <strong>{doctor.name}</strong>
                    <small>{doctor.specialization}</small>
                  </span>
                  <Stethoscope size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="selection-group">
            <h3>Available slots</h3>
            <label className="date-field">
              <span>Date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.target.value);
                  setSelectedSlotId(null);
                  setConfirmationMessage('');
                }}
              />
            </label>
            <div className="slot-grid">
              {visibleSlots.map((slot) => (
                <button
                  className={`slot-button${slot.id === selectedSlotId ? ' selected' : ''}`}
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    setSelectedSlotId(slot.id);
                    setConfirmationMessage('');
                  }}
                >
                  <Clock size={15} aria-hidden="true" />
                  <span>{formatTime(slot.startDatetime)}</span>
                </button>
              ))}
              {visibleSlots.length === 0 && (
                <p className="empty-note">
                  {isLoadingSlots ? 'Loading slots...' : 'No available slots for this selection.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className="panel summary-panel">
        <p className="eyebrow">Selection summary</p>
        <h2>{selectedDepartment?.name ?? 'Department'}</h2>
        <dl className="summary-list">
          <div>
            <dt>Doctor</dt>
            <dd>{selectedDoctor?.name ?? 'Select a doctor'}</dd>
          </div>
          <div>
            <dt>Specialization</dt>
            <dd>{selectedDoctor?.specialization ?? 'Pending'}</dd>
          </div>
          <div>
            <dt>Slot</dt>
            <dd>{formatSlotWindow(selectedSlot)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{selectedSlotId ? 'Ready to request' : 'Select a slot'}</dd>
          </div>
        </dl>
        <button
          className="primary-action"
          type="button"
          disabled={!selectedSlotId || isCreatingAppointment}
          onClick={handleRequestAppointment}
        >
          <CalendarPlus size={18} aria-hidden="true" />
          {isCreatingAppointment ? 'Requesting...' : 'Request appointment'}
        </button>
        {confirmationMessage && (
          <p className="success-note" role="status">
            {confirmationMessage}
          </p>
        )}
      </aside>
    </section>
  );
}
