package com.healthcare.appointment.repositories;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.healthcare.appointment.entities.AppointmentSlot;

public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Long> {

    @Query("""
            select slot
            from AppointmentSlot slot
            where slot.doctor.id = :doctorId
              and slot.startDatetime >= :start
              and slot.startDatetime < :end
              and not exists (
                  select appointment.id
                  from Appointment appointment
                  where appointment.slot = slot
                    and appointment.status in (
                        com.healthcare.appointment.entities.AppointmentStatus.CREATED,
                        com.healthcare.appointment.entities.AppointmentStatus.PROCESSING,
                        com.healthcare.appointment.entities.AppointmentStatus.CONFIRMED
                    )
              )
            order by slot.startDatetime asc
            """)
    List<AppointmentSlot> findAvailableSlots(
            @Param("doctorId") Long doctorId,
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end
    );
}
