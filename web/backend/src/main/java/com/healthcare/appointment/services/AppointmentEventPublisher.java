package com.healthcare.appointment.services;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.healthcare.appointment.entities.Appointment;
import com.healthcare.appointment.entities.AppointmentEventType;
import com.healthcare.appointment.events.AppointmentEvent;

@Service
public class AppointmentEventPublisher {

    private final KafkaTemplate<String, AppointmentEvent> kafkaTemplate;
    private final String appointmentEventsTopic;

    public AppointmentEventPublisher(
            KafkaTemplate<String, AppointmentEvent> kafkaTemplate,
            @Value("${app.kafka.topics.appointment-events}") String appointmentEventsTopic
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.appointmentEventsTopic = appointmentEventsTopic;
    }

    public UUID publishAfterCommit(Appointment appointment, AppointmentEventType eventType) {
        UUID eventId = UUID.randomUUID();
        AppointmentEvent event = new AppointmentEvent(
                eventId,
                CorrelationContext.get(),
                appointment.getId(),
                appointment.getUser().getId(),
                eventType,
                Instant.now()
        );

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    publish(event);
                }
            });
        } else {
            publish(event);
        }

        return eventId;
    }

    private void publish(AppointmentEvent event) {
        kafkaTemplate.send(
                appointmentEventsTopic,
                event.appointmentId().toString(),
                event
        );
    }
}
