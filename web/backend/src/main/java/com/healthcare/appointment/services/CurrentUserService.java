package com.healthcare.appointment.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcare.appointment.entities.AppUser;
import com.healthcare.appointment.repositories.AppUserRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class CurrentUserService {

    private static final String DEMO_EMAIL = "patient@example.com";

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public CurrentUserService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AppUser resolveUser(HttpServletRequest request) {
        Long userId = MockTokenService.extractUserId(request.getHeader("Authorization"));

        if (userId != null) {
            return appUserRepository.findById(userId).orElseGet(this::demoUser);
        }

        return demoUser();
    }

    private AppUser demoUser() {
        return appUserRepository.findByEmail(DEMO_EMAIL)
                .orElseGet(() -> appUserRepository.save(new AppUser(
                        "Patient Demo",
                        DEMO_EMAIL,
                        passwordEncoder.encode("password123")
                )));
    }
}
