package com.healthcare.appointment.services;

import java.security.MessageDigest;

final class MessageDigestUtil {

    private MessageDigestUtil() {
    }

    static boolean constantTimeEquals(byte[] first, byte[] second) {
        return MessageDigest.isEqual(first, second);
    }
}
