package com.healthcare.appointment.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.healthcare.appointment.entities.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByName(String name);
}
