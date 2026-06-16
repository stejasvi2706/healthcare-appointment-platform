package com.healthcare.appointment.services;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcare.appointment.dtos.AppointmentResponse;
import com.healthcare.appointment.dtos.CreateAppointmentRequest;
import com.healthcare.appointment.entities.AppUser;
import com.healthcare.appointment.entities.Appointment;
import com.healthcare.appointment.entities.AppointmentEventLog;
import com.healthcare.appointment.entities.AppointmentEventType;
import com.healthcare.appointment.entities.AppointmentSlot;
import com.healthcare.appointment.entities.AppointmentStatus;
import com.healthcare.appointment.exceptions.BadRequestException;
import com.healthcare.appointment.exceptions.NotFoundException;
import com.healthcare.appointment.repositories.AppointmentEventLogRepository;
import com.healthcare.appointment.repositories.AppointmentRepository;
import com.healthcare.appointment.repositories.AppointmentSlotRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;
    private final AppointmentEventLogRepository eventLogRepository;
    private final AppointmentMapper appointmentMapper;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            AppointmentSlotRepository appointmentSlotRepository,
            AppointmentEventLogRepository eventLogRepository,
            AppointmentMapper appointmentMapper
    ) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentSlotRepository = appointmentSlotRepository;
        this.eventLogRepository = eventLogRepository;
        this.appointmentMapper = appointmentMapper;
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointments(AppUser user) {
        return appointmentRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(appointmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public AppointmentResponse createAppointment(AppUser user, CreateAppointmentRequest request) {
        if (request.slotId() == null) {
            throw new BadRequestException("Slot id is required.");
        }

        AppointmentSlot slot = appointmentSlotRepository.findById(request.slotId())
                .orElseThrow(() -> new NotFoundException("Appointment slot not found."));
        Appointment appointment = new Appointment(user, slot, AppointmentStatus.CREATED);

        try {
            Appointment saved = appointmentRepository.saveAndFlush(appointment);
            eventLogRepository.save(new AppointmentEventLog(
                    saved,
                    AppointmentEventType.APPOINTMENT_CREATED,
                    null,
                    AppointmentStatus.CREATED,
                    "Appointment request created."
            ));
            return appointmentMapper.toResponse(saved);
        } catch (DataIntegrityViolationException exception) {
            throw new BadRequestException("Slot is no longer available.");
        }
    }

    @Transactional
    public void cancelAppointment(AppUser user, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found."));

        if (!appointment.getUser().getId().equals(user.getId())) {
            throw new NotFoundException("Appointment not found.");
        }

        AppointmentStatus oldStatus = appointment.getStatus();

        if (oldStatus == AppointmentStatus.CANCELLED) {
            return;
        }

        if (oldStatus == AppointmentStatus.FAILED) {
            throw new BadRequestException("Failed appointments cannot be cancelled.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        eventLogRepository.save(new AppointmentEventLog(
                appointment,
                AppointmentEventType.APPOINTMENT_CANCELLED,
                oldStatus,
                AppointmentStatus.CANCELLED,
                "Appointment cancelled by user."
        ));
    }
}
