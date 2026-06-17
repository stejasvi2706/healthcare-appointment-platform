# Architecture

## Components

```text
React Frontend
    |
    v
Spring Boot Backend ----> PostgreSQL
    |
    v
Kafka
    |
    v
Python Worker ---------> PostgreSQL
```

## Responsibilities

| Component | Responsibilities |
| --- | --- |
| React frontend | Login/register, slot selection, booking, cancellation, appointment history, processing timeline |
| Spring Boot backend | REST APIs, JWT authentication, validation, database writes, Kafka event publishing, Swagger docs |
| PostgreSQL | Users, doctors, slots, appointments, event logs, idempotency records, booking constraints |
| Kafka | Appointment event transport between backend and worker |
| Python worker | Kafka consumption, idempotency, status transitions, notification audit event, direct DB updates |

## Booking Flow

```text
User submits appointment request
    |
    v
Backend validates JWT and slot
    |
    v
Backend checks active overlapping appointments
    |
    v
PostgreSQL enforces slot and user-overlap constraints
    |
    v
Backend stores appointment as CREATED
    |
    v
Backend publishes APPOINTMENT_CREATED event after commit
    |
    v
Worker consumes event from Kafka
    |
    v
Worker records eventId in processed_events
    |
    v
Worker updates appointment CREATED -> PROCESSING -> CONFIRMED
    |
    v
Worker writes NOTIFICATION_PROCESSED audit event
    |
    v
Frontend polling shows updated status and timeline
```

## Cancellation Flow

```text
User cancels appointment
    |
    v
Backend validates ownership
    |
    v
Backend sets appointment to CANCELLED
    |
    v
Backend writes event log and publishes APPOINTMENT_CANCELLED
    |
    v
Worker records event as processed and skips status mutation
```

## Event Identity And Tracing

The platform uses two identifiers for different purposes:

- `eventId`: unique per Kafka event; used for worker idempotency.
- `correlationId`: shared across one user workflow; used for logs and audit traceability.

This keeps duplicate message handling separate from request tracing.

## Why The Worker Updates The Database Directly

The worker writes directly to PostgreSQL so idempotency, status updates, and audit log inserts happen in one transaction. This avoids an additional backend HTTP retry path and keeps duplicate Kafka delivery easy to reason about.

## Current Notification Design

The assignment asks for notification processing. This implementation records notification processing as a `NOTIFICATION_PROCESSED` audit event after confirmation. That demonstrates the asynchronous notification step without adding a real email/SMS provider.
