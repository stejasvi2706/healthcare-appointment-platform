package com.healthcare.appointment.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.healthcare.appointment.entities.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);
}
