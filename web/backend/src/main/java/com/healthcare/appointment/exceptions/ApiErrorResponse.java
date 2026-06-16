package com.healthcare.appointment.exceptions;

import java.time.Instant;

public record ApiErrorResponse(
        String error,
        String message,
        Instant timestamp
) {
}
