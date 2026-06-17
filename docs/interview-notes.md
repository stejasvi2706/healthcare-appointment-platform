# Interview Notes

Use this as a short explanation guide.

## One-Minute Summary

This is an event-driven healthcare appointment platform. A patient books an appointment through the React UI. The Spring Boot backend authenticates the user, validates booking rules, stores the appointment in PostgreSQL, and publishes a Kafka event. A Python worker consumes that event, updates the appointment status asynchronously, records notification processing, and writes audit logs that the frontend displays as a processing timeline.

## Why This Architecture

- Spring Boot is used for synchronous API workflows and business validation.
- PostgreSQL is used as the source of truth and enforces concurrency-safe booking rules.
- Kafka decouples appointment creation from asynchronous processing.
- Python worker handles background event processing and notification simulation.
- React frontend demonstrates the workflow visually.

## Key Technical Decisions

### Database Constraints For Booking Safety

The backend checks for conflicts before insert, but PostgreSQL enforces the final rules:

- Partial unique index prevents multiple active appointments for the same slot.
- Exclusion constraint prevents one user from holding overlapping active appointments.

This matters because service-level checks alone can fail under concurrent requests.

### Idempotent Worker Processing

Kafka delivery can be at least once. The worker inserts `eventId` into `processed_events` before applying side effects. If the event was already processed, the insert conflicts and the worker skips updates.

### Correlation ID For Tracing

`eventId` is unique per message. `correlationId` is shared across the request workflow. This lets logs and audit rows be grouped without confusing tracing with idempotency.

### Direct Worker Database Updates

The worker updates PostgreSQL directly so idempotency, status updates, and event logs happen in one transaction. This keeps duplicate handling simpler than calling the backend over HTTP.

### Notification Simulation

The worker writes `NOTIFICATION_PROCESSED` to the audit log. This demonstrates the async notification step without integrating an external email/SMS provider.

## Walkthrough Answer

If asked to explain the flow:

```text
Login
-> choose doctor and slot
-> backend creates appointment as CREATED
-> backend publishes APPOINTMENT_CREATED
-> worker consumes event
-> worker updates CREATED -> PROCESSING -> CONFIRMED
-> worker records NOTIFICATION_PROCESSED
-> frontend polling shows status and timeline
```

## Tradeoffs To Mention

- The project uses polling instead of WebSockets/SSE for simplicity.
- Kafka publishing is after commit, but not a full transactional outbox.
- Notifications are simulated rather than sent externally.
- JWT auth is implemented, but refresh tokens and roles are not.
- Integration tests against real Kafka/PostgreSQL would be the next quality improvement.

## Strong Points

- Clear service boundaries.
- Real database constraints for race-condition safety.
- Event-driven async workflow.
- Worker idempotency.
- Visible processing timeline.
- Dockerized local environment.
- Documentation maps requirements to implementation.
