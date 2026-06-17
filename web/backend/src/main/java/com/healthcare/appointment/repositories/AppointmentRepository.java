package com.healthcare.appointment.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.healthcare.appointment.entities.Appointment;
import com.healthcare.appointment.entities.AppointmentStatus;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("""
            SELECT COUNT(appointment) > 0
            FROM Appointment appointment
            JOIN appointment.slot slot
            WHERE appointment.user.id = :userId
              AND appointment.status IN :activeStatuses
              AND slot.startDatetime < :endDatetime
              AND slot.endDatetime > :startDatetime
            """)
    boolean existsActiveOverlapForUser(
            @Param("userId") Long userId,
            @Param("startDatetime") java.time.OffsetDateTime startDatetime,
            @Param("endDatetime") java.time.OffsetDateTime endDatetime,
            @Param("activeStatuses") List<AppointmentStatus> activeStatuses
    );
}
