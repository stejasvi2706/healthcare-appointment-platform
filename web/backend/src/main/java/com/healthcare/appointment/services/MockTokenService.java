package com.healthcare.appointment.services;

final class MockTokenService {

    private static final String TOKEN_PREFIX = "mock-user-";
    private static final String BEARER_PREFIX = "Bearer ";

    private MockTokenService() {
    }

    static String createToken(Long userId) {
        return TOKEN_PREFIX + userId;
    }

    static Long extractUserId(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            return null;
        }

        String token = authorizationHeader.substring(BEARER_PREFIX.length());

        if (!token.startsWith(TOKEN_PREFIX)) {
            return null;
        }

        try {
            return Long.parseLong(token.substring(TOKEN_PREFIX.length()));
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
