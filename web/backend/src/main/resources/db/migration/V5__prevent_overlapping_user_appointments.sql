CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE appointments
ADD COLUMN start_datetime TIMESTAMPTZ,
ADD COLUMN end_datetime TIMESTAMPTZ;

UPDATE appointments appointment
SET start_datetime = slot.start_datetime,
    end_datetime = slot.end_datetime
FROM appointment_slots slot
WHERE appointment.slot_id = slot.id;

CREATE OR REPLACE FUNCTION sync_appointment_slot_window()
RETURNS trigger AS $$
BEGIN
    SELECT start_datetime, end_datetime
    INTO NEW.start_datetime, NEW.end_datetime
    FROM appointment_slots
    WHERE id = NEW.slot_id;

    IF NEW.start_datetime IS NULL OR NEW.end_datetime IS NULL THEN
        RAISE EXCEPTION 'Appointment slot % was not found', NEW.slot_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointments_sync_slot_window
BEFORE INSERT OR UPDATE OF slot_id ON appointments
FOR EACH ROW
EXECUTE FUNCTION sync_appointment_slot_window();

ALTER TABLE appointments
ALTER COLUMN start_datetime SET NOT NULL,
ALTER COLUMN end_datetime SET NOT NULL;

ALTER TABLE appointments
ADD CONSTRAINT ck_appointments_time_range CHECK (end_datetime > start_datetime);

ALTER TABLE appointments
ADD CONSTRAINT ex_active_user_appointment_overlap
EXCLUDE USING gist (
    user_id WITH =,
    tstzrange(start_datetime, end_datetime, '[)') WITH &&
)
WHERE (status IN ('CREATED', 'PROCESSING', 'CONFIRMED'));
