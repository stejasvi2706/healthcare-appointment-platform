# Healthcare Appointment Platform

An event-driven healthcare appointment management platform built using Spring Boot, Kafka, Python, PostgreSQL, React, and Docker.

## Overview

This project demonstrates a production-style appointment booking workflow with:

* JWT-based authentication and authorization
* Appointment scheduling and management
* Kafka-based asynchronous event processing
* Python worker service for notification processing
* PostgreSQL persistence
* Dockerized deployment
* Swagger API documentation

## Features

### Authentication

* Register user
* Login user
* JWT-based authorization

### Appointment Management

* Fetch available slots
* Create appointment
* Cancel appointment
* Fetch user appointments

### Event Processing

* Appointment events published to Kafka
* Python worker consumes events
* Appointment status updated asynchronously
* Event history maintained for auditability

## Technology Stack

### Backend

* Java 21
* Spring Boot 3
* Spring Security
* Spring Data JPA
* PostgreSQL
* Kafka

### Frontend

* React
* Vite
* Axios

### Worker

* Python
* Kafka Consumer

### Infrastructure

* Docker
* Docker Compose

## Repository Structure

```text
web/
  backend/
  frontend/
worker/
broker/
database/
docs/
```

## Local Docker Stack

The project includes a Docker Compose stack for local end-to-end development.

Services:

* `postgres` - PostgreSQL database on port `5432`
* `kafka` - single-node Kafka broker, exposed to the host on port `9094`
* `kafka-init` - creates the `appointment.events` topic
* `backend` - Spring Boot API on port `8080`
* `worker` - Python Kafka consumer that updates PostgreSQL directly
* `frontend` - Nginx-served React build on port `5173`

Run from the repository root:

```bash
docker compose up --build
```

Then open:

```text
Frontend: http://localhost:5173
Backend health: http://localhost:8080/api/health
Swagger UI: http://localhost:8080/swagger-ui.html
```

Stop the stack:

```bash
docker compose down
```

Reset local data:

```bash
docker compose down -v
```

### Verified Local Flow

The Docker stack has been verified end to end:

```text
Register/login -> create appointment -> backend publishes Kafka event -> worker updates PostgreSQL -> appointment becomes CONFIRMED
```

The worker also writes correlated audit rows for:

```text
CREATED -> PROCESSING -> CONFIRMED
```

## Documentation

* docs/architecture.md
* docs/database-design.md
* docs/api-design.md
* docs/implementation-roadmap.md

## Future Enhancements

* Booking by preferred appointment time
* Automatic doctor assignment
* Department-based search
* Notification channels (Email/SMS)
* Kubernetes deployment
* CI/CD pipelines
