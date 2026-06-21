# Healthcare Appointment Platform

Event-driven healthcare appointment management platform built with Spring Boot, Python, Kafka, PostgreSQL, React, and Docker.

## What This Project Demonstrates

- User registration and JWT login
- Appointment slot browsing, booking, cancellation, and history
- Kafka-based asynchronous appointment processing
- Python worker that consumes appointment events and updates PostgreSQL
- Appointment processing timeline visible in the UI
- Database-level duplicate and overlapping booking protection
- Swagger/OpenAPI documentation
- Docker Compose orchestration for the full stack

## Architecture

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

The backend owns HTTP APIs, authentication, validation, database writes, and Kafka event publishing. The worker owns asynchronous event consumption, idempotent processing, status updates, and notification audit logging.

## Services

| Service | Purpose | Local URL |
| --- | --- | --- |
| Frontend | React UI served by Nginx | http://localhost:5173 |
| Backend | Spring Boot REST API | http://localhost:8080 |
| Swagger UI | API documentation | http://localhost:8080/swagger-ui.html |
| PostgreSQL | Application database | localhost:5432 |
| Kafka | Appointment event broker | localhost:9094 |
| Worker | Python Kafka consumer | Runs in Docker Compose |

## Run The Full Stack

From the repository root:

```bash
docker compose up --build
```

Open:

```text
http://localhost:5173
```

Stop services:

```bash
docker compose down
```

Reset local data:

```bash
docker compose down -v
```

## Verified Workflow

```text
Register/login
    -> fetch departments/doctors/slots
    -> create appointment
    -> backend writes CREATED appointment and publishes Kafka event
    -> worker consumes event
    -> worker updates appointment to PROCESSING and CONFIRMED
    -> worker records NOTIFICATION_PROCESSED audit event
    -> frontend polling displays the final status and processing timeline
```

## Main API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/departments` | Fetch departments |
| GET | `/api/departments/{departmentId}/doctors` | Fetch doctors |
| GET | `/api/doctors/{doctorId}/slots?date=YYYY-MM-DD` | Fetch available slots |
| GET | `/api/appointments` | Fetch current user's appointments |
| POST | `/api/appointments` | Create appointment |
| DELETE | `/api/appointments/{appointmentId}` | Cancel appointment |
| GET | `/api/appointments/{appointmentId}/events` | Fetch processing timeline |

Appointment APIs require:

```text
Authorization: Bearer <jwt>
```

## Important Documentation

- [Architecture](docs/architecture.md)
- [Database Design](docs/database-design.md)
- [API Design](docs/api-design.md)
- [Implementation Roadmap](docs/implementation-roadmap.md)
- [Submission Checklist](docs/submission-checklist.md)
- [Demo Commands](docs/demo-commands.md)
- [Project Context](docs/project-context.md)
- [Backend README](web/backend/README.md)
- [Frontend README](web/frontend/README.md)
- [Worker README](worker/README.md)

## Tests

Backend:

```bash
cd web/backend
mvn test
```

Frontend:

```bash
cd web/frontend
npm run build
npm run lint
```

Worker:

```bash
cd worker
python -m unittest discover -s tests
```

## Known Limitations

- Notification delivery is simulated through a `NOTIFICATION_PROCESSED` audit event. No real email/SMS provider is integrated.
- Kafka publishing is after database commit, but not a full transactional outbox.
- JWT refresh tokens and role-based authorization are not implemented.
- Frontend polling is fixed interval, not server push.
- Integration tests against real Kafka/PostgreSQL are not part of the automated test suite.
