CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id BIGSERIAL PRIMARY KEY,
    department_id BIGINT NOT NULL REFERENCES departments(id),
    name VARCHAR(150) NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctors_department_id ON doctors(department_id);

CREATE TABLE appointment_slots (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id),
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_appointment_slots_time_range CHECK (end_datetime > start_datetime),
    CONSTRAINT uk_doctor_slot_time UNIQUE (doctor_id, start_datetime, end_datetime)
);

CREATE INDEX idx_appointment_slots_doctor_start ON appointment_slots(doctor_id, start_datetime);

CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    slot_id BIGINT NOT NULL REFERENCES appointment_slots(id),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_appointments_status CHECK (status IN ('CREATED', 'PROCESSING', 'CONFIRMED', 'CANCELLED', 'FAILED'))
);

CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_slot_id ON appointments(slot_id);

CREATE UNIQUE INDEX uk_active_slot
ON appointments(slot_id)
WHERE status IN ('CREATED', 'PROCESSING', 'CONFIRMED');

CREATE TABLE appointment_event_logs (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL REFERENCES appointments(id),
    event_type VARCHAR(50) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_appointment_event_logs_old_status CHECK (
        old_status IS NULL OR old_status IN ('CREATED', 'PROCESSING', 'CONFIRMED', 'CANCELLED', 'FAILED')
    ),
    CONSTRAINT ck_appointment_event_logs_new_status CHECK (
        new_status IN ('CREATED', 'PROCESSING', 'CONFIRMED', 'CANCELLED', 'FAILED')
    )
);

CREATE INDEX idx_appointment_event_logs_appointment_id ON appointment_event_logs(appointment_id);
