package com.healthcare.appointment.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.healthcare.appointment.entities.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByDepartmentIdOrderByNameAsc(Long departmentId);
}
