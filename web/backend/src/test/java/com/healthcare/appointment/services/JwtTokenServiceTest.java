package com.healthcare.appointment.services;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

class JwtTokenServiceTest {

    @Test
    void createTokenCanBeValidatedBackToUserId() {
        JwtTokenService jwtTokenService = new JwtTokenService(
                new ObjectMapper(),
                "test-secret-value",
                3600
        );

        String token = jwtTokenService.createToken(42L);

        assertThat(jwtTokenService.extractUserId(token)).isEqualTo(42L);
        assertThat(jwtTokenService.extractUserIdFromAuthorizationHeader("Bearer " + token)).isEqualTo(42L);
    }

    @Test
    void tamperedTokenIsRejected() {
        JwtTokenService jwtTokenService = new JwtTokenService(
                new ObjectMapper(),
                "test-secret-value",
                3600
        );

        String token = jwtTokenService.createToken(42L);

        assertThat(jwtTokenService.extractUserId(token + "tampered")).isNull();
    }
}
