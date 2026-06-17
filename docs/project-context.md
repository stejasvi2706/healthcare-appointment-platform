# Project Context

Read this file first when returning to the project after losing conversation context.

## Assignment Summary

Build a simplified production-style healthcare appointment platform with:

- Spring Boot backend
- Python worker
- Kafka or RabbitMQ messaging
- Database integration
- JWT authentication
- Simple frontend
- Dockerized local setup
- API documentation

The expected workflow is:

```text
User books appointment
    -> backend stores appointment
    -> backend publishes event
    -> worker consumes event
    -> worker processes notification/status updates
    -> UI shows updated processing status
```

## What Was Built

The repository implements a full local stack:

- React frontend under `web/frontend`
- Spring Boot backend under `web/backend`
- Python worker under `worker`
- PostgreSQL and Kafka via `compose.yml`
- Flyway migrations for schema and constraints
- Swagger UI at `http://localhost:8080/swagger-ui.html`

## Core Workflow

1. User registers or logs in.
2. Frontend stores JWT in `localStorage`.
3. User selects department, doctor, date, and slot.
4. Backend validates JWT and appointment rules.
5. Backend stores appointment as `CREATED`.
6. Backend writes an audit log and publishes `APPOINTMENT_CREATED` to Kafka after commit.
7. Worker consumes the event.
8. Worker inserts `eventId` into `processed_events`.
9. Worker updates appointment to `PROCESSING`, then `CONFIRMED`.
10. Worker writes `NOTIFICATION_PROCESSED` audit row.
11. Frontend polling refreshes appointment status and timeline.

## Important Design Decisions

### `eventId` vs `correlationId`

- `eventId` identifies one exact Kafka message and is used for idempotency.
- `correlationId` identifies one end-to-end user workflow and is used for tracing.

Do not use `eventId` as the tracing ID because one user workflow can produce multiple events.

### Worker Updates Database Directly

The worker updates PostgreSQL directly so idempotency, status updates, and audit logging are part of one database transaction.

### Notification Is Simulated

There is no real email/SMS provider. The worker writes `NOTIFICATION_PROCESSED` to `appointment_event_logs` to demonstrate the async notification step.

### Concurrency Safety

PostgreSQL enforces:

- One active appointment per slot through a partial unique index.
- No overlapping active appointments for the same user through an exclusion constraint.

The service layer checks overlaps for friendly errors, but database constraints are the final protection.

## Key Files

| Area | Files |
| --- | --- |
| Backend app | `web/backend/src/main/java/com/healthcare/appointment` |
| Backend controllers | `web/backend/src/main/java/com/healthcare/appointment/controllers` |
| Backend services | `web/backend/src/main/java/com/healthcare/appointment/services` |
| Backend migrations | `web/backend/src/main/resources/db/migration` |
| Frontend app | `web/frontend/src` |
| Frontend API wrappers | `web/frontend/src/api/appointments.ts` |
| Frontend appointment history | `web/frontend/src/views/AppointmentsView.tsx` |
| Worker processor | `worker/appointment_worker/processor.py` |
| Worker tests | `worker/tests/test_processor.py` |
| Docker stack | `compose.yml` |

## How To Run

```bash
docker compose up --build
```

Open:

```text
http://localhost:5173
```

Swagger:

```text
http://localhost:8080/swagger-ui.html
```

## How To Verify

- Use the UI to register/login and book an appointment.
- Watch appointment status become `CONFIRMED`.
- Check the timeline for `NOTIFICATION_PROCESSED`.
- Run `docker compose logs -f worker` to see worker processing.
- Use `docs/demo-commands.md` for database and concurrency checks.

## How To Explain In Interviews

Start with the product workflow, then explain the system flow:

1. The UI lets a patient book an appointment.
2. The backend validates and persists the request.
3. PostgreSQL protects booking rules under concurrency.
4. Kafka decouples synchronous API response from async processing.
5. The worker processes the event idempotently and updates status.
6. The audit timeline makes backend/worker processing visible.

Use this phrasing:

> I treated the assignment as a small event-driven system. The backend owns request validation and event publishing, PostgreSQL owns concurrency guarantees, Kafka transports appointment events, and the Python worker performs idempotent asynchronous status and notification processing.

## Known Limitations To Mention Honestly

- Notification is simulated, not sent through an external provider.
- Kafka publishing does not use a transactional outbox.
- No dead-letter topic or retry policy.
- No refresh tokens or roles.
- Integration tests against real Kafka/PostgreSQL are not automated.

These are production-hardening items, not hidden defects.
