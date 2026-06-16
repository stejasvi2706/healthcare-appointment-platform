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
├── backend/
└── frontend/

worker/

broker/

database/

docs/
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
