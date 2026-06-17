package com.healthcare.appointment.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.kafka.core.KafkaTemplate;

import com.healthcare.appointment.entities.AppUser;
import com.healthcare.appointment.entities.Appointment;
import com.healthcare.appointment.entities.AppointmentEventType;
import com.healthcare.appointment.events.AppointmentEvent;

class AppointmentEventPublisherTest {

    @AfterEach
    void clearCorrelationContext() {
        CorrelationContext.clear();
    }

    @Test
    @SuppressWarnings("unchecked")
    void publishAfterCommitSendsAppointmentEventWhenNoTransactionIsActive() {
        KafkaTemplate<String, AppointmentEvent> kafkaTemplate = mock(KafkaTemplate.class);
        AppointmentEventPublisher publisher = new AppointmentEventPublisher(
                kafkaTemplate,
                "appointment.events"
        );
        AppUser user = mock(AppUser.class);
        Appointment appointment = mock(Appointment.class);

        when(user.getId()).thenReturn(456L);
        when(appointment.getId()).thenReturn(123L);
        when(appointment.getUser()).thenReturn(user);
        CorrelationContext.set("correlation-123");

        var eventId = publisher.publishAfterCommit(
                appointment,
                AppointmentEventType.APPOINTMENT_CREATED
        );

        ArgumentCaptor<AppointmentEvent> eventCaptor = ArgumentCaptor.forClass(AppointmentEvent.class);
        verify(kafkaTemplate).send(
                eq("appointment.events"),
                eq("123"),
                eventCaptor.capture()
        );

        AppointmentEvent event = eventCaptor.getValue();
        assertThat(event.eventId()).isEqualTo(eventId);
        assertThat(event.correlationId()).isEqualTo("correlation-123");
        assertThat(event.appointmentId()).isEqualTo(123L);
        assertThat(event.userId()).isEqualTo(456L);
        assertThat(event.eventType()).isEqualTo(AppointmentEventType.APPOINTMENT_CREATED);
        assertThat(event.timestamp()).isNotNull();
    }
}
