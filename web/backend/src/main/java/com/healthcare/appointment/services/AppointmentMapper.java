package com.healthcare.appointment.services;

import org.springframework.stereotype.Component;

import com.healthcare.appointment.dtos.AppointmentResponse;
import com.healthcare.appointment.entities.Appointment;
import com.healthcare.appointment.entities.AppointmentSlot;
import com.healthcare.appointment.entities.Doctor;

@Component
public class AppointmentMapper {

    public AppointmentResponse toResponse(Appointment appointment) {
        AppointmentSlot slot = appointment.getSlot();
        Doctor doctor = slot.getDoctor();

        return new AppointmentResponse(
                appointment.getId(),
                slot.getId(),
                appointment.getStatus(),
                doctor.getDepartment().getName(),
                doctor.getName(),
                doctor.getSpecialization(),
                slot.getStartDatetime(),
                slot.getEndDatetime()
        );
    }
}
