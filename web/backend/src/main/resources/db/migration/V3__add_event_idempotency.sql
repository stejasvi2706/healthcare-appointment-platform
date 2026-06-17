ALTER TABLE appointment_event_logs
ADD COLUMN event_id UUID;

CREATE INDEX idx_appointment_event_logs_event_id
ON appointment_event_logs(event_id);

CREATE TABLE processed_events (
    event_id UUID PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    appointment_id BIGINT NOT NULL REFERENCES appointments(id),
    processed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_processed_events_appointment_id
ON processed_events(appointment_id);
