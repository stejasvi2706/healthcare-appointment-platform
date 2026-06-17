package com.healthcare.appointment.entities;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "processed_events")
public class ProcessedEvent {

    @Id
    @Column(name = "event_id", nullable = false, updatable = false)
    private UUID eventId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private AppointmentEventType eventType;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(name = "processed_at", nullable = false, updatable = false)
    private Instant processedAt;

    protected ProcessedEvent() {
    }

    public ProcessedEvent(UUID eventId, AppointmentEventType eventType, Long appointmentId) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.appointmentId = appointmentId;
    }

    @PrePersist
    void onCreate() {
        if (processedAt == null) {
            processedAt = Instant.now();
        }
    }

    public UUID getEventId() {
        return eventId;
    }

    public AppointmentEventType getEventType() {
        return eventType;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }
}
