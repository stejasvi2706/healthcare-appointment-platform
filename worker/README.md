# Worker

Python Kafka consumer for asynchronous appointment processing.

## Stack

- Python
- confluent-kafka
- psycopg
- PostgreSQL

## Responsibilities

- Consume appointment events from Kafka
- Parse backend `AppointmentEvent` payloads
- Insert `eventId` into `processed_events` for idempotency
- Update appointment status directly in PostgreSQL
- Write appointment event logs
- Record a simulated notification-processing audit row
- Include `correlationId` in logs and audit rows

## Processing Behavior

For `APPOINTMENT_CREATED`:

```text
CREATED -> PROCESSING -> CONFIRMED -> NOTIFICATION_PROCESSED audit row
```

For `APPOINTMENT_CANCELLED`:

```text
Record event as processed; do not mutate status
```

The backend already sets cancelled appointments to `CANCELLED`.

## Idempotency

Kafka consumers can receive the same event more than once. The worker handles this by inserting the incoming `eventId` into `processed_events` inside the same database transaction as status updates and audit log inserts.

If the insert conflicts, the event is a duplicate and side effects are skipped.

## Why The Worker Updates PostgreSQL Directly

The worker writes directly to PostgreSQL so these operations share one transaction:

- idempotency insert
- appointment status update
- appointment event log insert

This keeps duplicate handling simple and avoids adding backend HTTP retries between services.

## Project Structure

```text
worker/
  appointment_worker/
    config.py
    consumer.py
    db.py
    logging.py
    main.py
    models.py
    processor.py
  tests/
    test_processor.py
  pyproject.toml
```

## Configuration

```text
DB_URL=postgresql://healthcare:healthcare@localhost:5432/healthcare_appointments
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
APPOINTMENT_EVENTS_TOPIC=appointment.events
KAFKA_CONSUMER_GROUP=appointment-worker
```

## Run

From the repository root:

```bash
docker compose up --build worker
```

Standalone:

```bash
cd worker
python -m venv .venv
source .venv/bin/activate
pip install -e .
python -m appointment_worker.main
```

## Test

```bash
python -m unittest discover -s tests
```

## Interview Notes

- `eventId` prevents duplicate Kafka side effects.
- `correlationId` links the event back to the original user request.
- The worker locks the appointment row before applying status transitions.
- Notification delivery is simulated with a `NOTIFICATION_PROCESSED` audit event.

## Known Limitations

- Deterministic happy path: created appointments always confirm.
- No real email/SMS provider.
- No dead-letter topic or retry policy.
- No automated integration tests against real Kafka/PostgreSQL.
