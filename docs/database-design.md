# Database Design

## User

```sql
id
name
email
password_hash

created_at
updated_at
```

## Department

```sql
id
name

created_at
updated_at
```

Examples:

* Cardiology
* Dermatology
* Neurology
* Orthopedics
* General Medicine

## Doctor

```sql
id
department_id

name
specialization

created_at
updated_at
```

## Appointment Slot

```sql
id
doctor_id

start_datetime
end_datetime

created_at
updated_at
```

Slots are pre-generated.

Each slot belongs to exactly one doctor.

## Appointment

```sql
id

user_id
slot_id

start_datetime
end_datetime

status

created_at
updated_at
```

Status Values:

* CREATED
* PROCESSING
* CONFIRMED
* CANCELLED
* FAILED

## Appointment Event Log

```sql
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

## Relationships

```text
Department
    │
    ▼
Doctor
    │
    ▼
AppointmentSlot
    │
    ▼
Appointment
    │
    ▼
AppointmentEventLog

User
 │
 ▼
Appointment
```

## Duplicate Booking Prevention

The system prevents duplicate bookings using a database-level constraint.

Example PostgreSQL partial unique index:

```sql
CREATE UNIQUE INDEX uk_active_slot
ON appointment(slot_id)
WHERE status IN (
    'CREATED',
    'PROCESSING',
    'CONFIRMED'
);
```

This guarantees:

* One active appointment per slot
* Concurrent-safe booking
* Historical appointments retained
* Slot reusability after cancellation

The system also prevents one user from holding overlapping active appointments across different doctors. PostgreSQL stores the selected slot time window on `appointments` and enforces this with an exclusion constraint:

```sql
EXCLUDE USING gist (
    user_id WITH =,
    tstzrange(start_datetime, end_datetime, '[)') WITH &&
)
WHERE status IN (
    'CREATED',
    'PROCESSING',
    'CONFIRMED'
);
```

## Concurrency Strategy

Booking operations must execute within a transaction.

Database constraints remain the source of truth.

No distributed locking is required for Version 1. The service layer performs early validation for better error messages, while PostgreSQL constraints protect concurrent requests.
