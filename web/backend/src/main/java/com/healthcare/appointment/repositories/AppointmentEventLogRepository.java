package com.healthcare.appointment.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.healthcare.appointment.entities.AppointmentEventLog;

public interface AppointmentEventLogRepository extends JpaRepository<AppointmentEventLog, Long> {

    List<AppointmentEventLog> findByAppointmentIdOrderByCreatedAtAsc(Long appointmentId);
}
