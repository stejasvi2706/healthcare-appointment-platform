package com.healthcare.appointment.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.appointment.dtos.AppointmentResponse;
import com.healthcare.appointment.dtos.CreateAppointmentRequest;
import com.healthcare.appointment.entities.AppUser;
import com.healthcare.appointment.services.AppointmentService;
import com.healthcare.appointment.services.CurrentUserService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final CurrentUserService currentUserService;

    public AppointmentController(
            AppointmentService appointmentService,
            CurrentUserService currentUserService
    ) {
        this.appointmentService = appointmentService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<AppointmentResponse> getAppointments(HttpServletRequest request) {
        AppUser user = currentUserService.resolveUser(request);
        return appointmentService.getAppointments(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse createAppointment(
            @RequestBody CreateAppointmentRequest createAppointmentRequest,
            HttpServletRequest request
    ) {
        AppUser user = currentUserService.resolveUser(request);
        return appointmentService.createAppointment(user, createAppointmentRequest);
    }

    @DeleteMapping("/{appointmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelAppointment(
            @PathVariable Long appointmentId,
            HttpServletRequest request
    ) {
        AppUser user = currentUserService.resolveUser(request);
        appointmentService.cancelAppointment(user, appointmentId);
    }
}
