package com.healthcare.appointment.services;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcare.appointment.dtos.LoginRequest;
import com.healthcare.appointment.dtos.LoginResponse;
import com.healthcare.appointment.dtos.RegisterRequest;
import com.healthcare.appointment.entities.AppUser;
import com.healthcare.appointment.exceptions.BadRequestException;
import com.healthcare.appointment.repositories.AppUserRepository;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (appUserRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered.");
        }

        AppUser user = new AppUser(
                request.name(),
                email,
                passwordEncoder.encode(request.password())
        );
        appUserRepository.save(user);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }

        return new LoginResponse(MockTokenService.createToken(user.getId()));
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required.");
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }
}
