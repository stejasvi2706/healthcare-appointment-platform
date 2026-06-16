package com.healthcare.appointment.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.appointment.dtos.AppointmentSlotResponse;
import com.healthcare.appointment.dtos.DepartmentResponse;
import com.healthcare.appointment.dtos.DoctorResponse;
import com.healthcare.appointment.services.CatalogueService;

@RestController
@RequestMapping("/api")
public class CatalogueController {

    private final CatalogueService catalogueService;

    public CatalogueController(CatalogueService catalogueService) {
        this.catalogueService = catalogueService;
    }

    @GetMapping("/departments")
    public List<DepartmentResponse> getDepartments() {
        return catalogueService.getDepartments();
    }

    @GetMapping("/departments/{departmentId}/doctors")
    public List<DoctorResponse> getDoctorsByDepartment(@PathVariable Long departmentId) {
        return catalogueService.getDoctorsByDepartment(departmentId);
    }

    @GetMapping("/doctors/{doctorId}/slots")
    public List<AppointmentSlotResponse> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return catalogueService.getAvailableSlots(doctorId, date);
    }
}
