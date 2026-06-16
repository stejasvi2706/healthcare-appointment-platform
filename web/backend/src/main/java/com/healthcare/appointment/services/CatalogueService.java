package com.healthcare.appointment.services;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcare.appointment.dtos.AppointmentSlotResponse;
import com.healthcare.appointment.dtos.DepartmentResponse;
import com.healthcare.appointment.dtos.DoctorResponse;
import com.healthcare.appointment.entities.AppointmentSlot;
import com.healthcare.appointment.entities.Department;
import com.healthcare.appointment.entities.Doctor;
import com.healthcare.appointment.repositories.AppointmentSlotRepository;
import com.healthcare.appointment.repositories.DepartmentRepository;
import com.healthcare.appointment.repositories.DoctorRepository;

@Service
public class CatalogueService {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;

    public CatalogueService(
            DepartmentRepository departmentRepository,
            DoctorRepository doctorRepository,
            AppointmentSlotRepository appointmentSlotRepository
    ) {
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentSlotRepository = appointmentSlotRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toDepartmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getDoctorsByDepartment(Long departmentId) {
        return doctorRepository.findByDepartmentIdOrderByNameAsc(departmentId).stream()
                .map(this::toDoctorResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentSlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        return appointmentSlotRepository.findAvailableSlots(
                        doctorId,
                        date.atStartOfDay().atOffset(ZoneOffset.UTC),
                        date.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC)
                )
                .stream()
                .map(this::toSlotResponse)
                .toList();
    }

    private DepartmentResponse toDepartmentResponse(Department department) {
        return new DepartmentResponse(department.getId(), department.getName());
    }

    private DoctorResponse toDoctorResponse(Doctor doctor) {
        return new DoctorResponse(
                doctor.getId(),
                doctor.getDepartment().getId(),
                doctor.getName(),
                doctor.getSpecialization()
        );
    }

    private AppointmentSlotResponse toSlotResponse(AppointmentSlot slot) {
        return new AppointmentSlotResponse(
                slot.getId(),
                slot.getDoctor().getId(),
                slot.getStartDatetime(),
                slot.getEndDatetime()
        );
    }
}
