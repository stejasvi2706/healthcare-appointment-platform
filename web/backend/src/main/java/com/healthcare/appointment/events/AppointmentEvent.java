package com.healthcare.appointment.events;

import java.time.Instant;
import java.util.UUID;

import com.healthcare.appointment.entities.AppointmentEventType;

public record AppointmentEvent(
        UUID eventId,
        String correlationId,
        Long appointmentId,
        Long userId,
        AppointmentEventType eventType,
        Instant timestamp
) {
}
