# Architecture Design

## System Overview

The system consists of four major components:

1. React Frontend
2. Spring Boot Backend
3. Kafka Message Broker
4. Python Worker Service

## High Level Architecture

```text
Frontend
    │
    ▼
Spring Boot Backend
    │
    ├────────► PostgreSQL
    │
    ▼
Kafka
    │
    ▼
Python Worker
    │
    ▼
PostgreSQL
```

## Component Responsibilities

### Frontend

Responsibilities:

* User authentication
* Slot browsing
* Appointment booking
* Appointment cancellation
* Appointment history viewing

### Backend

Responsibilities:

* Authentication
* Authorization
* Appointment management
* Slot retrieval
* Kafka event publishing
* Business validation

### Kafka

Responsibilities:

* Event transport
* Decoupling backend and worker service

### Python Worker

Responsibilities:

* Consume appointment events
* Process notifications
* Update appointment status
* Generate audit logs

## User Journey

### Appointment Booking

```text
Login
    ↓
Select Department
    ↓
Select Doctor
    ↓
Select Date
    ↓
Select Slot
    ↓
Book Appointment
```

### Appointment Cancellation

```text
My Appointments
    ↓
Cancel Appointment
```

## Appointment Lifecycle

```text
CREATED
    ↓
PROCESSING
    ↓
CONFIRMED
```

Failure Flow:

```text
CREATED
    ↓
PROCESSING
    ↓
FAILED
```

Cancellation Flow:

```text
CONFIRMED
    ↓
CANCELLED
```

## Event Flow

```text
Appointment Created
        ↓
Publish Kafka Event
        ↓
Kafka Topic
        ↓
Python Worker
        ↓
Process Notification
        ↓
Update Status
        ↓
Create Audit Log
```

## Extensibility Considerations

The schema is designed to support:

* Department-based filtering
* Doctor-based scheduling
* Booking by preferred time
* Automatic doctor assignment
* Multi-clinic support

without requiring major schema changes.
