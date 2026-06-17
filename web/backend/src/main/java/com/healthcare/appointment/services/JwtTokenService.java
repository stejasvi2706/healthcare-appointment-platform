package com.healthcare.appointment.services;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.appointment.exceptions.BadRequestException;

@Service
public class JwtTokenService {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();
    private static final TypeReference<Map<String, Object>> CLAIMS_TYPE = new TypeReference<>() {
    };

    private final ObjectMapper objectMapper;
    private final byte[] secret;
    private final long ttlSeconds;

    public JwtTokenService(
            ObjectMapper objectMapper,
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.ttl-seconds:86400}") long ttlSeconds
    ) {
        this.objectMapper = objectMapper;
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.ttlSeconds = ttlSeconds;
    }

    public String createToken(Long userId) {
        Instant now = Instant.now();
        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", userId.toString());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", now.plusSeconds(ttlSeconds).getEpochSecond());

        String unsignedToken = encodeJson(header) + "." + encodeJson(payload);
        return unsignedToken + "." + sign(unsignedToken);
    }

    public Long extractUserIdFromAuthorizationHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            return null;
        }

        return extractUserId(authorizationHeader.substring(BEARER_PREFIX.length()));
    }

    public Long extractUserId(String token) {
        String[] parts = token.split("\\.");

        if (parts.length != 3) {
            return null;
        }

        String unsignedToken = parts[0] + "." + parts[1];
        if (!constantTimeEquals(sign(unsignedToken), parts[2])) {
            return null;
        }

        Map<String, Object> claims = decodeClaims(parts[1]);
        Number expiresAt = numberClaim(claims, "exp");

        if (expiresAt == null || Instant.now().getEpochSecond() >= expiresAt.longValue()) {
            return null;
        }

        Object subject = claims.get("sub");
        if (subject == null) {
            return null;
        }

        try {
            return Long.parseLong(subject.toString());
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String encodeJson(Map<String, Object> value) {
        try {
            return BASE64_URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (Exception exception) {
            throw new BadRequestException("Unable to create authentication token.");
        }
    }

    private Map<String, Object> decodeClaims(String encodedClaims) {
        try {
            return objectMapper.readValue(BASE64_URL_DECODER.decode(encodedClaims), CLAIMS_TYPE);
        } catch (Exception exception) {
            return Map.of();
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
            return BASE64_URL_ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new BadRequestException("Unable to sign authentication token.");
        }
    }

    private Number numberClaim(Map<String, Object> claims, String claimName) {
        Object value = claims.get(claimName);
        return value instanceof Number number ? number : null;
    }

    private boolean constantTimeEquals(String first, String second) {
        return MessageDigestUtil.constantTimeEquals(
                first.getBytes(StandardCharsets.UTF_8),
                second.getBytes(StandardCharsets.UTF_8)
        );
    }
}
