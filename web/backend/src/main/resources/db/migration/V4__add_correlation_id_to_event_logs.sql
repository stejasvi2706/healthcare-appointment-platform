ALTER TABLE appointment_event_logs
ADD COLUMN correlation_id VARCHAR(100);

CREATE INDEX idx_appointment_event_logs_correlation_id
ON appointment_event_logs(correlation_id);
