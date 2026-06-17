# Implementation Roadmap

This document records what was implemented for the assignment and what remains as production hardening.

## Implemented Phases

### Phase 1 - Project Bootstrap

- Spring Boot backend with Java 21 and Maven
- React/Vite frontend
- Python worker
- Dockerfiles for backend, frontend, and worker
- Docker Compose for PostgreSQL, Kafka, backend, worker, and frontend

### Phase 2 - Database

- Flyway-managed PostgreSQL schema
- Users, departments, doctors, slots, appointments, event logs, and processed events
- Seeded departments, doctors, and appointment slots
- Partial unique index for active slot booking
- Exclusion constraint for same-user overlapping appointment protection

### Phase 3 - Authentication

- Register API
- Login API
- BCrypt password hashing
- HS256 JWT creation and validation
- Protected appointment APIs

### Phase 4 - Appointment APIs

- Fetch departments
- Fetch doctors by department
- Fetch available slots
- Create appointment
- Cancel appointment
- Fetch user appointments
- Fetch appointment event history

### Phase 5 - Event Processing

- Backend publishes appointment events to Kafka after transaction commit
- Python worker consumes appointment events
- Worker stores `eventId` in `processed_events` for idempotency
- Worker updates appointment status directly in PostgreSQL
- Worker writes status and notification audit events

### Phase 6 - Frontend

- Login/register screen
- Booking screen
- Appointment history screen
- Appointment status badges
- Appointment processing timeline
- Session expiry handling
- Overlapping active appointment slots hidden in the UI

### Phase 7 - Documentation

- Root setup README
- Component READMEs
- Architecture, API, database, demo, submission, and project-context docs
- Swagger/OpenAPI available from the backend

## Remaining Production Hardening

- Real notification provider integration such as email/SMS
- Transactional outbox for stronger Kafka delivery guarantees
- Dead-letter topic and retry policy for worker failures
- Refresh tokens or short-lived session renewal
- Role-based authorization
- Integration tests against real PostgreSQL and Kafka
- CI/CD pipeline
- Cloud deployment
