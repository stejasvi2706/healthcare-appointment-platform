# API Design

Swagger UI is available when the backend is running:

```text
http://localhost:8080/swagger-ui.html
```

## Authentication

### Register

```http
POST /api/auth/register
```

Request:

```json
{
  "name": "Patient Demo",
  "email": "patient@example.com",
  "password": "password123"
}
```

### Login

```http
POST /api/auth/login
```

Returns:

```json
{
  "token": "jwt-token"
}
```

Appointment APIs require:

```http
Authorization: Bearer <jwt-token>
```

## Catalogue APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/departments` | Fetch departments |
| GET | `/api/departments/{departmentId}/doctors` | Fetch doctors by department |
| GET | `/api/doctors/{doctorId}/slots?date=YYYY-MM-DD` | Fetch available slots |

## Appointment APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/appointments` | Fetch current user's appointments |
| POST | `/api/appointments` | Create appointment |
| DELETE | `/api/appointments/{appointmentId}` | Cancel appointment |
| GET | `/api/appointments/{appointmentId}/events` | Fetch appointment processing timeline |

Create appointment request:

```json
{
  "slotId": 1
}
```

Appointment response:

```json
{
  "id": 1,
  "slotId": 1,
  "status": "CONFIRMED",
  "departmentName": "Cardiology",
  "doctorName": "Dr. Asha Mehta",
  "specialization": "Interventional Cardiology",
  "startDatetime": "2026-06-18T09:00:00Z",
  "endDatetime": "2026-06-18T09:30:00Z"
}
```

Event history response:

```json
[
  {
    "id": 1,
    "eventType": "APPOINTMENT_CREATED",
    "eventId": "uuid",
    "correlationId": "uuid",
    "oldStatus": null,
    "newStatus": "CREATED",
    "message": "Appointment request created.",
    "createdAt": "2026-06-17T10:00:00Z"
  }
]
```

## Kafka Event Contract

Topic:

```text
appointment.events
```

Created/cancelled event payload:

```json
{
  "eventId": "uuid",
  "correlationId": "uuid-or-client-provided-id",
  "appointmentId": 123,
  "userId": 456,
  "eventType": "APPOINTMENT_CREATED",
  "timestamp": "2026-06-17T10:00:00Z"
}
```

Supported event types:

```text
APPOINTMENT_CREATED
APPOINTMENT_CANCELLED
```

The worker writes status and notification audit rows to `appointment_event_logs`.
