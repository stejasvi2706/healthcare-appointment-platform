package com.healthcare.appointment.dtos;

import java.time.OffsetDateTime;

import com.healthcare.appointment.entities.AppointmentStatus;

public record AppointmentResponse(
        Long id,
        Long slotId,
        AppointmentStatus status,
        String departmentName,
        String doctorName,
        String specialization,
        OffsetDateTime startDatetime,
        OffsetDateTime endDatetime
) {
}
