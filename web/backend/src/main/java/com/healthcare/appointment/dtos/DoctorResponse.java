package com.healthcare.appointment.dtos;

public record DoctorResponse(
        Long id,
        Long departmentId,
        String name,
        String specialization
) {
}
