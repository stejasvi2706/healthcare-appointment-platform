package com.healthcare.appointment.services;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcare.appointment.entities.AppUser;
import com.healthcare.appointment.exceptions.NotFoundException;
import com.healthcare.appointment.repositories.AppUserRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class CurrentUserService {

    private final AppUserRepository appUserRepository;

    public CurrentUserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Transactional(readOnly = true)
    public AppUser resolveUser(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof Long userId)) {
            throw new NotFoundException("User not found.");
        }

        return appUserRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found."));
    }
}
