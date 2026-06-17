# Demo Commands

Use these commands for a video demo, screenshots, or interview walkthrough.

## Start Fresh

```bash
docker compose down -v
docker compose up --build
```

Open:

```text
Frontend: http://localhost:5173
Swagger UI: http://localhost:8080/swagger-ui.html
```

## Watch Worker Logs

```bash
docker compose logs -f worker
```

Book an appointment in the UI. The worker logs should show appointment status updates and notification processing.

## Inspect Appointment Event Logs

```bash
docker compose exec postgres psql -U healthcare -d healthcare_appointments
```

```sql
SELECT
    appointment_id,
    event_type,
    old_status,
    new_status,
    correlation_id,
    created_at
FROM appointment_event_logs
ORDER BY created_at DESC
LIMIT 20;
```

Expected event sequence for a successful booking:

```text
APPOINTMENT_CREATED
STATUS_UPDATED          CREATED -> PROCESSING
STATUS_UPDATED          PROCESSING -> CONFIRMED
NOTIFICATION_PROCESSED  CONFIRMED -> CONFIRMED
```

## Verify Flyway Migrations

```bash
docker compose exec postgres psql -U healthcare -d healthcare_appointments \
  -c "select version, description, success from flyway_schema_history order by installed_rank;"
```

Expected latest migration:

```text
5 | prevent overlapping user appointments | t
```

## Verify Overlap Constraint Exists

```bash
docker compose exec postgres psql -U healthcare -d healthcare_appointments \
  -c "select conname, contype from pg_constraint where conname = 'ex_active_user_appointment_overlap';"
```

Expected:

```text
ex_active_user_appointment_overlap | x
```

## Demonstrate Concurrency Safety

After booking one appointment in the UI, get an appointment ID:

```bash
docker compose exec postgres psql -U healthcare -d healthcare_appointments \
  -c "select id, user_id, slot_id, start_datetime, end_datetime, status from appointments order by id desc limit 5;"
```

Replace `11` below with a real appointment ID from the output:

```bash
docker compose exec -T postgres psql -U healthcare -d healthcare_appointments -c \
'DO $$
DECLARE
    target_user BIGINT;
    overlapping_slot BIGINT;
BEGIN
    SELECT a.user_id INTO target_user
    FROM appointments a
    WHERE a.id = 11;

    SELECT s.id INTO overlapping_slot
    FROM appointment_slots s
    JOIN appointments a ON a.id = 11
    WHERE s.doctor_id <> (
        SELECT doctor_id
        FROM appointment_slots
        WHERE id = a.slot_id
    )
      AND s.start_datetime = a.start_datetime
      AND s.end_datetime = a.end_datetime
    LIMIT 1;

    BEGIN
        INSERT INTO appointments (user_id, slot_id, status)
        VALUES (target_user, overlapping_slot, ''CREATED'');
        RAISE EXCEPTION ''Overlap constraint did not block insert'';
    EXCEPTION WHEN exclusion_violation THEN
        RAISE NOTICE ''Overlap constraint blocked insert as expected'';
    END;
END $$;'
```

Expected:

```text
NOTICE:  Overlap constraint blocked insert as expected
```

## Screenshots To Capture

- Docker services running
- Swagger UI
- Login/register screen
- Booking screen with slots
- Appointment history showing `CONFIRMED`
- Processing timeline showing `NOTIFICATION_PROCESSED`
- Worker logs or database audit query
