package com.healthcare.appointment.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.healthcare.appointment.entities.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByUserIdOrderByCreatedAtDesc(Long userId);
}
