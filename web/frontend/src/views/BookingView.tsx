import { CalendarPlus, ChevronRight, Clock, Stethoscope } from 'lucide-react';
import { useMemo, useState } from 'react';
import { departments, doctors, slots } from '../data/placeholders';

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function BookingView() {
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? 0);
  const availableDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.departmentId === departmentId),
    [departmentId],
  );
  const [doctorId, setDoctorId] = useState(availableDoctors[0]?.id ?? 0);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(101);

  const selectedDepartment = departments.find((department) => department.id === departmentId);
  const visibleDoctors = availableDoctors.length > 0 ? availableDoctors : doctors;
  const selectedDoctor = visibleDoctors.find((doctor) => doctor.id === doctorId) ?? visibleDoctors[0];
  const visibleSlots = slots.filter((slot) => slot.doctorId === selectedDoctor?.id);

  function handleDepartmentChange(nextDepartmentId: number) {
    const nextDoctor = doctors.find((doctor) => doctor.departmentId === nextDepartmentId);
    setDepartmentId(nextDepartmentId);
    setDoctorId(nextDoctor?.id ?? 0);
    setSelectedSlotId(null);
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
              <input type="date" defaultValue="2026-06-17" />
            </label>
            <div className="slot-grid">
              {visibleSlots.map((slot) => (
                <button
                  className={`slot-button${slot.id === selectedSlotId ? ' selected' : ''}`}
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlotId(slot.id)}
                >
                  <Clock size={15} aria-hidden="true" />
                  <span>{formatTime(slot.startDatetime)}</span>
                </button>
              ))}
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
            <dt>Status</dt>
            <dd>{selectedSlotId ? 'Ready to request' : 'Select a slot'}</dd>
          </div>
        </dl>
        <button className="primary-action" type="button" disabled={!selectedSlotId}>
          <CalendarPlus size={18} aria-hidden="true" />
          Request appointment
        </button>
      </aside>
    </section>
  );
}
