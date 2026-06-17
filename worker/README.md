# Healthcare Appointment Worker

This worker consumes appointment events from Kafka and updates PostgreSQL directly.

It is intentionally small in this first implementation: the backend owns request validation and event publishing, while this worker owns asynchronous appointment state progression.

## Current Responsibilities

- Consume appointment lifecycle events from the `appointment.events` Kafka topic.
- Deserialize the backend `AppointmentEvent` payload.
- Use `eventId` for idempotency through the `processed_events` table.
- Use `correlationId` in logs and event log rows for cross-service tracing.
- Update appointment status directly in PostgreSQL.
- Write appointment event logs for worker-driven status changes.
- Record a simulated notification-processing audit row after confirming an appointment.

## Processing Behavior

For `APPOINTMENT_CREATED`, the worker currently performs a deterministic happy-path flow:

```text
CREATED -> PROCESSING -> CONFIRMED
```

Each status transition writes a `STATUS_UPDATED` row to `appointment_event_logs`.

After confirmation, the worker also writes a `NOTIFICATION_PROCESSED` row. This represents the assignment's notification step without introducing an external email or SMS provider into the local demo stack.

For `APPOINTMENT_CANCELLED`, the worker records the event as processed and does not change appointment status. The backend already marks the appointment as cancelled synchronously.

## Idempotency

Kafka consumers normally provide at-least-once delivery. That means the same event can be delivered more than once.

The worker handles this by inserting the incoming `eventId` into `processed_events` inside the same database transaction as the appointment updates. If the insert conflicts, the worker treats the event as a duplicate and skips all side effects.

This is why `eventId` is not used as the tracing ID. It identifies one event for deduplication. `correlationId` identifies the broader request/workflow across frontend, backend, Kafka, and worker logs.

The worker accepts backend event timestamps as ISO strings or numeric epoch values. The numeric path is required because Spring Kafka serializes Java `Instant` values as epoch seconds in the current backend configuration.

## Direct Database Updates

The worker updates PostgreSQL directly instead of calling backend APIs.

That gives the worker one transaction boundary for:

- idempotency insert
- appointment status updates
- appointment event log inserts

This keeps duplicate handling simple and avoids creating extra HTTP retry behavior between backend and worker.

## Project Structure

```text
worker/
  appointment_worker/
    config.py       Environment-based settings
    consumer.py     Kafka consumer adapter
    db.py           PostgreSQL connection adapter
    logging.py      Correlation-aware logging helpers
    main.py         Worker entrypoint
    models.py       AppointmentEvent model and parser
    processor.py    Idempotent appointment processing logic
  tests/
    test_processor.py
  pyproject.toml
```

## Configuration

Environment variables:

```text
DB_URL=postgresql://healthcare:healthcare@localhost:5432/healthcare_appointments
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
APPOINTMENT_EVENTS_TOPIC=appointment.events
KAFKA_CONSUMER_GROUP=appointment-worker
```

## Run

Install dependencies:

```bash
cd worker
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

Run tests:

```bash
python -m unittest discover -s tests
```

Run the worker:

```bash
python -m appointment_worker.main
```

From the repository root with Docker Compose:

```bash
docker compose up --build worker
```

The worker container connects to the Compose `postgres` and `kafka` services using internal service names.

## Interview Explanation

This worker demonstrates the consumer side of an event-driven architecture.

The backend publishes appointment events after its database transaction commits. The worker consumes those events, stores `eventId` in `processed_events` to make processing idempotent, and updates the appointment state in PostgreSQL. Because the idempotency insert and status updates happen in one database transaction, duplicate Kafka delivery does not duplicate business side effects.

The worker also carries `correlationId` through logs and audit rows. That makes it possible to trace a single booking request from frontend to backend to Kafka to the worker. The notification step is currently simulated by an audit row, which is enough to demonstrate the asynchronous processing flow without depending on third-party messaging services.

## Known Limitations

- The processing flow is deterministic and always confirms created appointments.
- Notification processing is simulated in the database audit log; there is no real notification provider integration yet.
- There is no dead-letter topic handling yet.
- Kafka topic creation is not handled here.
- There are unit tests for processing logic, but no integration tests against real Kafka/PostgreSQL yet.
