# Backend

Spring Boot REST API for the healthcare appointment platform.

## Stack

- Java 21
- Spring Boot 3
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- Spring Kafka
- OpenAPI / Swagger UI

## Responsibilities

- Register and authenticate users
- Validate JWTs for appointment APIs
- Serve catalogue APIs for departments, doctors, and slots
- Create, cancel, and list appointments
- Enforce appointment ownership
- Write appointment audit logs
- Publish appointment lifecycle events to Kafka
- Attach correlation IDs to logs, event logs, and Kafka events

## Package Structure

```text
com.healthcare.appointment
  config
  controllers
  dtos
  entities
  events
  exceptions
  repositories
  services
```

## Main Endpoints

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login and return JWT |
| GET | `/api/departments` | No | Fetch departments |
| GET | `/api/departments/{departmentId}/doctors` | No | Fetch doctors |
| GET | `/api/doctors/{doctorId}/slots?date=YYYY-MM-DD` | No | Fetch available slots |
| GET | `/api/appointments` | Yes | Fetch current user's appointments |
| POST | `/api/appointments` | Yes | Create appointment |
| DELETE | `/api/appointments/{appointmentId}` | Yes | Cancel appointment |
| GET | `/api/appointments/{appointmentId}/events` | Yes | Fetch appointment processing timeline |

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

## Booking Rules

- A slot can have only one active appointment.
- A user cannot hold overlapping active appointments, even with different doctors.
- Active statuses are `CREATED`, `PROCESSING`, and `CONFIRMED`.
- Cancelled and failed appointments remain as history.

The service layer performs early validation for clear API errors. PostgreSQL constraints are the final protection against concurrent requests.

## Database

Flyway migrations live in:

```text
src/main/resources/db/migration
```

Important migrations:

| Migration | Purpose |
| --- | --- |
| `V1__create_core_schema.sql` | Core schema and active-slot unique index |
| `V2__seed_departments_doctors_slots.sql` | Initial catalogue and slots |
| `V3__add_event_idempotency.sql` | `processed_events` and event IDs |
| `V4__add_correlation_id_to_event_logs.sql` | Correlation IDs in audit logs |
| `V5__prevent_overlapping_user_appointments.sql` | Exclusion constraint for overlapping appointments |

## Kafka

The backend publishes events to:

```text
appointment.events
```

Supported event types:

```text
APPOINTMENT_CREATED
APPOINTMENT_CANCELLED
```

Events include:

- `eventId` for idempotency
- `correlationId` for tracing
- `appointmentId`
- `userId`
- `eventType`
- `timestamp`

Events are published after the database transaction commits.

## Run Locally

Recommended full stack:

```bash
docker compose up --build backend
```

Standalone backend:

```bash
mvn spring-boot:run
```

Useful environment variables:

```text
DB_URL=jdbc:postgresql://localhost:5432/healthcare_appointments
DB_USERNAME=healthcare
DB_PASSWORD=healthcare
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
APPOINTMENT_EVENTS_TOPIC=appointment.events
JWT_SECRET=local-development-jwt-secret-change-before-production
JWT_TTL_SECONDS=86400
SERVER_PORT=8080
```

## Test

```bash
mvn test
```

## Interview Notes

- Controllers expose HTTP endpoints and delegate business decisions to services.
- Services enforce workflow rules and publish events.
- Repositories isolate persistence access.
- DTOs keep API payloads separate from JPA entities.
- Flyway owns schema evolution.
- `eventId` solves duplicate Kafka delivery; `correlationId` links one user workflow across logs and audit rows.

## Known Limitations

- No refresh-token flow.
- No role-based authorization.
- Kafka publishing does not use a transactional outbox.
- No automated integration tests against real Kafka/PostgreSQL.
- Notification delivery is simulated by the worker audit event.
