# API Design

## Authentication

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

Returns JWT token.

---

## Department APIs

### Fetch Departments

```http
GET /api/departments
```

---

## Doctor APIs

### Fetch Doctors By Department

```http
GET /api/departments/{departmentId}/doctors
```

---

## Slot APIs

### Fetch Available Slots

```http
GET /api/doctors/{doctorId}/slots?date=YYYY-MM-DD
```

Returns available slots for a doctor on a specific date.

---

## Appointment APIs

### Create Appointment

```http
POST /api/appointments
```

### Cancel Appointment

```http
DELETE /api/appointments/{appointmentId}
```

### Fetch User Appointments

```http
GET /api/appointments
```

Returns appointments belonging to the authenticated user.

### Fetch Appointment Event History

```http
GET /api/appointments/{appointmentId}/events
```

Returns processing/audit events for one appointment belonging to the authenticated user.

## Event Contract

### Appointment Created

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

### Appointment Cancelled

```json
{
  "eventId": "uuid",
  "correlationId": "uuid-or-client-provided-id",
  "appointmentId": 123,
  "userId": 456,
  "eventType": "APPOINTMENT_CANCELLED",
  "timestamp": "2026-06-17T10:00:00Z"
}
```
