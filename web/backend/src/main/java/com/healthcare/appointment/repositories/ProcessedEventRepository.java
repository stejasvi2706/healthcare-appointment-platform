package com.healthcare.appointment.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.healthcare.appointment.entities.ProcessedEvent;

public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, UUID> {
}
