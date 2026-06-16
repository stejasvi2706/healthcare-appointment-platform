package com.healthcare.appointment.dtos;

import java.time.OffsetDateTime;

public record AppointmentSlotResponse(
        Long id,
        Long doctorId,
        OffsetDateTime startDatetime,
        OffsetDateTime endDatetime
) {
}
