# Backend

Spring Boot backend for the Healthcare Appointment Platform.

## Current Scope

This backend is a functional API shell built with:

- Java 21
- Spring Boot 3
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- Spring Kafka producer scaffold
- OpenAPI / Swagger UI

It currently implements the database-backed REST API foundation for departments, doctors, slots, appointments, and mock-token authentication.

Real JWT validation and the Python worker integration are intentionally not implemented yet.

It also includes request correlation support. Every HTTP request receives an `X-Correlation-Id` response header. If the client sends `X-Correlation-Id`, the backend reuses it; otherwise it generates one.

## What Works Today

The backend currently supports:

- Health check
  - `GET /api/health`

- Mock account access
  - `POST /api/auth/register`
  - `POST /api/auth/login`

- Catalogue APIs
  - `GET /api/departments`
  - `GET /api/departments/{departmentId}/doctors`
  - `GET /api/doctors/{doctorId}/slots?date=YYYY-MM-DD`

- Appointment APIs
  - `GET /api/appointments`
  - `POST /api/appointments`
  - `DELETE /api/appointments/{appointmentId}`

The appointment APIs write to PostgreSQL using JPA repositories and rely on the database partial unique index to prevent duplicate active bookings for the same slot.

Appointment create and cancel operations also publish Kafka events after the database transaction commits.

## Design Intent

This branch is meant to make the backend demonstrable while keeping the architecture honest.

The backend now has real controllers, services, DTOs, repositories, entities, and migrations. It does not fake the database layer.

At the same time, authentication is deliberately temporary:

- `POST /api/auth/login` returns a mock token shaped like `mock-user-{id}`.
- Appointment APIs can resolve that token if sent as `Authorization: Bearer mock-user-{id}`.
- If no token is supplied, appointment APIs use a local demo user.

This lets frontend and backend workflows be exercised before the final JWT security implementation is added.

## Folder Structure

```text
web/backend/
+-- src/main/java/com/healthcare/appointment/
|   +-- config/
|   +-- controllers/
|   +-- dtos/
|   +-- entities/
|   +-- exceptions/
|   +-- repositories/
|   +-- services/
|   +-- HealthcareAppointmentApplication.java
+-- src/main/resources/
|   +-- application.yml
|   +-- db/migration/
+-- src/test/
+-- pom.xml
+-- README.md
```

## Important Files

`config/SecurityConfig.java`

Configures stateless security, exposes health/docs and current API shell endpoints, and provides a BCrypt password encoder.

The broad endpoint permits are temporary. They should be tightened when real JWT validation is implemented.

`config/CorrelationIdFilter.java`

Reads or generates `X-Correlation-Id`, stores it in logging MDC, returns it in response headers, and makes it available to services through `CorrelationContext`.

`controllers/AuthController.java`

Exposes register and login endpoints. Login currently returns a mock token, not a signed JWT.

`controllers/CatalogueController.java`

Exposes department, doctor, and available slot read APIs.

`controllers/AppointmentController.java`

Exposes appointment list, create, and cancel APIs. It resolves the current user through `CurrentUserService`.

`services/AuthService.java`

Handles registration, password hashing, and mock-token login.

`services/AppointmentService.java`

Handles database-backed appointment creation, cancellation, event log creation, and appointment event publishing.

`services/AppointmentEventPublisher.java`

Builds appointment event payloads and publishes them to Kafka after the surrounding database transaction commits.

`services/CatalogueService.java`

Handles read operations for departments, doctors, and available slots.

`services/CurrentUserService.java`

Temporary bridge for mock authentication. It resolves a mock token if present, otherwise creates/uses a demo user.

`services/MockTokenService.java`

Small internal utility for generating and parsing mock tokens. This should be replaced by real JWT support.

`services/CorrelationContext.java`

Thread-local request context for the current correlation ID. It keeps service code independent from servlet APIs while still allowing audit logs and future Kafka events to include the request lineage.

`events/AppointmentEvent.java`

Kafka event payload for appointment lifecycle messages. It carries both `eventId` and `correlationId`.

`exceptions/RestExceptionHandler.java`

Returns consistent JSON error responses for known API exceptions.

`db/migration/V1__create_core_schema.sql`

Creates the core tables, constraints, indexes, and active-slot partial unique index.

`db/migration/V2__seed_departments_doctors_slots.sql`

Seeds initial departments, doctors, and pre-generated appointment slots.

`db/migration/V3__add_event_idempotency.sql`

Adds the `processed_events` table and optional `appointment_event_logs.event_id` column. This prepares the backend and worker for at-least-once Kafka delivery.

`db/migration/V4__add_correlation_id_to_event_logs.sql`

Adds optional `appointment_event_logs.correlation_id`. This lets audit records be grouped by the user workflow that produced them.

## How To Run

From `web/backend`:

```bash
mvn spring-boot:run
```

Useful environment variables:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/healthcare_appointments
export DB_USERNAME=healthcare
export DB_PASSWORD=healthcare
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
export APPOINTMENT_EVENTS_TOPIC=appointment.events
export SERVER_PORT=8080
```

Then run:

```bash
mvn spring-boot:run
```

From the repository root with Docker Compose:

```bash
docker compose up --build backend
```

The full local stack is documented in the root `README.md`.

## How To Test

From `web/backend`:

```bash
mvn test
```

Current test coverage is intentionally light and mostly verifies the application shell. More focused controller/service tests should be added as the API contracts stabilize.

## API Examples

Register:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Patient Demo","email":"patient@example.com","password":"password123"}'
```

Login:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"password123"}'
```

Fetch departments:

```bash
curl http://localhost:8080/api/departments
```

Fetch doctors for a department:

```bash
curl http://localhost:8080/api/departments/1/doctors
```

Fetch available slots:

```bash
curl "http://localhost:8080/api/doctors/1/slots?date=2026-06-18"
```

Create appointment:

```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-user-1" \
  -d '{"slotId":1}'
```

Cancel appointment:

```bash
curl -X DELETE http://localhost:8080/api/appointments/1 \
  -H "Authorization: Bearer mock-user-1"
```

## Temporary Auth Boundary

The mock-token system exists only to make the backend usable before JWT support is implemented.

What it does:

- Lets login return a token.
- Lets appointment APIs associate requests with a user.
- Allows frontend/backend integration work to continue.

What it does not do:

- It does not cryptographically sign tokens.
- It does not validate token expiry.
- It does not implement roles.
- It does not protect endpoints in a production-ready way.

This should be replaced in the backend auth branch with JWT generation and validation.

## Worker And Kafka Boundary

Kafka publishing is wired into appointment creation and cancellation.

Currently:

- Creating an appointment stores `CREATED`.
- Cancelling an appointment stores `CANCELLED`.
- Event logs are written directly for created/cancelled actions.
- Backend publishes `APPOINTMENT_CREATED` and `APPOINTMENT_CANCELLED` after the database transaction commits.
- Published events include `eventId`, `correlationId`, `appointmentId`, `userId`, `eventType`, and `timestamp`.

Later:

- Worker should consume events.
- Worker should update async statuses such as `PROCESSING`, `CONFIRMED`, and `FAILED`.
- Worker should record consumed event IDs in `processed_events`.

This is important because Kafka consumers usually process messages at least once. If the same event is delivered twice, `processed_events.event_id` lets the worker detect the duplicate and skip side effects.

`appointment_event_logs.event_id` is optional because not every audit row comes from Kafka. Synchronous API actions can write audit rows without an event ID, while worker-driven status changes can include the Kafka event ID for traceability.

The current producer publishes after commit, which prevents publishing events for rolled-back database changes. It is not a full transactional outbox. If Kafka is unavailable after the database commit, the event can still fail to publish. A future reliability pass should add an outbox table and retry publisher if stronger delivery guarantees are required.

## Correlation And Tracing

The backend distinguishes event identity from request lineage:

- `eventId` identifies one exact Kafka event.
- `correlationId` identifies one end-to-end user workflow.

For example, one appointment request may eventually produce multiple events:

```text
APPOINTMENT_CREATED eventId=A correlationId=R
NOTIFICATION_SENT eventId=B correlationId=R
APPOINTMENT_CONFIRMED eventId=C correlationId=R
```

The event IDs are different because the messages are different. The correlation ID stays the same because they belong to the same original booking workflow.

Current backend behavior:

- Reads `X-Correlation-Id` from incoming requests.
- Generates a UUID if no correlation header is present.
- Returns `X-Correlation-Id` in every response.
- Adds `correlationId` to log lines through MDC.
- Writes `correlation_id` to appointment event logs for synchronous appointment create/cancel actions.

Kafka events include both `eventId` and `correlationId`.

## Interview Explanation

This backend was built in layers:

- Entities and Flyway migrations define the database model.
- Repositories provide persistence access.
- Services own business workflow decisions.
- Controllers expose API endpoints and map HTTP requests to services.
- DTOs keep API payloads separate from JPA entities.

Important points to explain:

- Flyway owns schema changes; Hibernate validates the schema.
- Duplicate active bookings are prevented by a PostgreSQL partial unique index.
- The service layer catches duplicate booking conflicts and returns a user-friendly error.
- Appointment lifecycle is intentionally simple until Kafka/worker status processing is implemented.
- Mock-token auth is a development bridge, not production security.
- Worker event idempotency is handled with a dedicated `processed_events` table before Kafka processing is implemented.
- `eventId` is for idempotency; `correlationId` is for tracing one workflow across frontend, backend, Kafka, and worker logs.
- Kafka events are published after the appointment transaction commits, which keeps event publishing aligned with committed database state.

## Known Limitations

- Real JWT authentication is not implemented yet.
- API endpoints are broadly permitted in `SecurityConfig` for the functional shell.
- Worker-driven status updates are not implemented yet.
- `processed_events` is schema groundwork only until the worker is implemented.
- Kafka publishing does not yet use an outbox/retry mechanism.
- Correlation IDs are not yet propagated by the frontend.
- No integration tests against PostgreSQL are present yet.
- No Docker Compose orchestration has been verified from this backend branch yet.
- Frontend dev server proxying is not configured in this backend branch.
