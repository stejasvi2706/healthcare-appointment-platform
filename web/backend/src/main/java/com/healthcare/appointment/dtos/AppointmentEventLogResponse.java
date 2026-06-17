package com.healthcare.appointment.dtos;

import java.time.Instant;
import java.util.UUID;

import com.healthcare.appointment.entities.AppointmentEventType;
import com.healthcare.appointment.entities.AppointmentStatus;

public record AppointmentEventLogResponse(
        Long id,
        AppointmentEventType eventType,
        UUID eventId,
        String correlationId,
        AppointmentStatus oldStatus,
        AppointmentStatus newStatus,
        String message,
        Instant createdAt
) {
}
