# Database Design

PostgreSQL is the source of truth for users, catalogue data, appointments, audit logs, and worker idempotency.

## Tables

### `users`

```text
id
name
email
password_hash
created_at
updated_at
```

`email` is unique.

### `departments`

```text
id
name
created_at
updated_at
```

Seeded examples include Cardiology, Dermatology, Neurology, Orthopedics, and General Medicine.

### `doctors`

```text
id
department_id
name
specialization
created_at
updated_at
```

Each doctor belongs to one department.

### `appointment_slots`

```text
id
doctor_id
start_datetime
end_datetime
created_at
updated_at
```

Slots are pre-generated and belong to one doctor.

### `appointments`

```text
id
user_id
slot_id
start_datetime
end_datetime
status
created_at
updated_at
```

`start_datetime` and `end_datetime` are copied from the selected slot by a database trigger. They allow PostgreSQL to enforce same-user overlap protection directly on the appointment table.

Valid statuses:

```text
CREATED
PROCESSING
CONFIRMED
CANCELLED
FAILED
```

### `appointment_event_logs`

```text
id
appointment_id
event_type
event_id
correlation_id
old_status
new_status
message
created_at
```

This table stores the appointment audit timeline shown in the frontend.

### `processed_events`

```text
event_id
event_type
appointment_id
processed_at
```

The worker inserts `eventId` here before applying side effects. Duplicate Kafka deliveries conflict on `event_id` and are skipped.

## Booking Constraints

### One Active Appointment Per Slot

```sql
CREATE UNIQUE INDEX uk_active_slot
ON appointments(slot_id)
WHERE status IN ('CREATED', 'PROCESSING', 'CONFIRMED');
```

This prevents two active appointments from using the same doctor slot.

### No Overlapping Active Appointments Per User

```sql
ALTER TABLE appointments
ADD CONSTRAINT ex_active_user_appointment_overlap
EXCLUDE USING gist (
    user_id WITH =,
    tstzrange(start_datetime, end_datetime, '[)') WITH &&
)
WHERE (status IN ('CREATED', 'PROCESSING', 'CONFIRMED'));
```

This prevents one user from holding overlapping active appointments across different doctors, even under concurrent requests.

## Concurrency Strategy

The service layer checks for overlap before insert to return a friendly error. PostgreSQL constraints remain the final source of truth for race conditions.

No distributed lock is required for the current design.

## Flyway Migrations

| Migration | Purpose |
| --- | --- |
| `V1__create_core_schema.sql` | Core tables, indexes, status checks, active slot unique index |
| `V2__seed_departments_doctors_slots.sql` | Seed departments, doctors, and appointment slots |
| `V3__add_event_idempotency.sql` | Add `event_id` to logs and create `processed_events` |
| `V4__add_correlation_id_to_event_logs.sql` | Add `correlation_id` to event logs |
| `V5__prevent_overlapping_user_appointments.sql` | Add user overlap exclusion constraint |
