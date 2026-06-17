# Submission Checklist

This checklist maps the original assignment requirements to the implemented project.

## Core Requirements

| Requirement | Status | Where Implemented | How To Verify |
| --- | --- | --- | --- |
| Spring Boot backend service | Complete | `web/backend` | `docker compose up --build backend`, `GET /api/health` |
| Python worker/service | Complete | `worker` | `docker compose logs -f worker` while booking |
| Kafka/RabbitMQ event communication | Complete | Backend producer, worker consumer, `appointment.events` topic | Book appointment and observe worker logs |
| Database integration | Complete | PostgreSQL, Flyway migrations | `docker compose exec postgres psql ...` |
| Authentication and authorization | Complete | JWT login and protected appointment APIs | Login, call appointment APIs with bearer token |
| Register/Login APIs | Complete | `AuthController`, `AuthService` | Swagger or frontend auth screen |
| Create appointment | Complete | `AppointmentController`, `AppointmentService` | Book from UI or `POST /api/appointments` |
| Cancel appointment | Complete | `DELETE /api/appointments/{id}` | Cancel from appointment history |
| Fetch user appointments | Complete | `GET /api/appointments` | Appointment history screen |
| Fetch available slots | Complete | `GET /api/doctors/{id}/slots` | Booking screen |
| Proper schema design | Complete | `docs/database-design.md`, Flyway migrations | Review migrations |
| Prevent duplicate booking | Complete | `uk_active_slot` partial unique index | Try same slot twice |
| Handle concurrent requests | Complete | PostgreSQL exclusion constraint for user overlaps | See `docs/demo-commands.md` |
| Maintain logs/history | Complete | `appointment_event_logs`, timeline endpoint | `GET /api/appointments/{id}/events` |
| Store timestamps/status updates | Complete | `appointments`, `appointment_event_logs` | Query database or UI timeline |
| Publish events from Spring Boot | Complete | `AppointmentEventPublisher` | Worker receives booking events |
| Consume/process events in Python | Complete | `worker/appointment_worker/processor.py` | Worker logs and status updates |
| Event processing safety | Complete | `processed_events` idempotency table | Worker test and duplicate event behavior |
| JWT authentication | Complete | `JwtTokenService`, security filter | Login returns signed JWT |
| Validation and exception handling | Complete | Services and `RestExceptionHandler` | Invalid requests return JSON errors |
| Clean architecture/modular code | Complete | controllers/services/repositories/entities/dtos | Review backend structure |
| API documentation | Complete | Swagger UI | `http://localhost:8080/swagger-ui.html` |
| Simple frontend/UI | Complete | `web/frontend` | `http://localhost:5173` |
| Registration/Login UI | Complete | `AuthView.tsx` | `/auth` |
| Booking and management screens | Complete | `BookingView.tsx`, `AppointmentsView.tsx` | `/`, `/appointments` |
| Show event/processing status visually | Complete | Appointment timeline UI | Book appointment and watch timeline |

## Bonus Requirements

| Bonus | Status | Notes |
| --- | --- | --- |
| Dockerized deployment | Complete | Full stack in `compose.yml` |
| Performance optimization | Partial | DB constraints and indexes are in place; no load testing |
| Production-ready engineering practices | Partial | Clean boundaries, Flyway, JWT, idempotency, docs; no CI/CD/outbox/DLQ |

## Intentional Limitations

- Notification delivery is simulated as a `NOTIFICATION_PROCESSED` audit row.
- Kafka publishing is after commit but not a transactional outbox.
- Worker does not implement dead-letter handling.
- JWT refresh tokens and roles are not implemented.
- Automated integration tests against real PostgreSQL/Kafka are not included.

These are acceptable boundaries for the assignment scope and are listed as future production hardening items.
