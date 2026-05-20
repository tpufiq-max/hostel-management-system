package com.hostel.security;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

/**
 * LoginAttemptService — in-memory brute-force protection.
 *
 * After MAX_ATTEMPTS failed login attempts within BLOCK_DURATION_MINUTES
 * for the same email, further attempts are rejected until the block expires.
 *
 * For multi-instance deployments, replace ConcurrentHashMap with Redis.
 */
@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int BLOCK_DURATION_MINUTES = 15;

    private final ConcurrentHashMap<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

    /**
     * Check if the given email is currently blocked.
     */
    public boolean isBlocked(String email) {
        AttemptRecord record = attempts.get(normalizeKey(email));
        if (record == null) return false;

        // If block has expired, remove it
        if (record.blockedUntil != null && LocalDateTime.now().isAfter(record.blockedUntil)) {
            attempts.remove(normalizeKey(email));
            return false;
        }

        return record.blockedUntil != null && LocalDateTime.now().isBefore(record.blockedUntil);
    }

    /**
     * Returns remaining block time in minutes, or 0 if not blocked.
     */
    public long getBlockMinutesRemaining(String email) {
        AttemptRecord record = attempts.get(normalizeKey(email));
        if (record == null || record.blockedUntil == null) return 0;
        if (LocalDateTime.now().isAfter(record.blockedUntil)) return 0;

        return java.time.Duration.between(LocalDateTime.now(), record.blockedUntil).toMinutes() + 1;
    }

    /**
     * Record a failed login attempt. Returns true if account is now blocked.
     */
    public boolean recordFailedAttempt(String email) {
        String key = normalizeKey(email);
        AttemptRecord record = attempts.compute(key, (k, existing) -> {
            if (existing == null) {
                return new AttemptRecord(1, LocalDateTime.now(), null);
            }

            // Reset if the window has expired (older than BLOCK_DURATION_MINUTES)
            if (existing.firstAttemptAt.plusMinutes(BLOCK_DURATION_MINUTES).isBefore(LocalDateTime.now())) {
                return new AttemptRecord(1, LocalDateTime.now(), null);
            }

            int newCount = existing.count + 1;
            LocalDateTime blockedUntil = null;

            if (newCount >= MAX_ATTEMPTS) {
                blockedUntil = LocalDateTime.now().plusMinutes(BLOCK_DURATION_MINUTES);
            }

            return new AttemptRecord(newCount, existing.firstAttemptAt, blockedUntil);
        });

        return record.blockedUntil != null;
    }

    /**
     * Clear attempts on successful login.
     */
    public void clearAttempts(String email) {
        attempts.remove(normalizeKey(email));
    }

    private String normalizeKey(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    /**
     * Internal record tracking attempt state per email.
     */
    private static class AttemptRecord {
        final int count;
        final LocalDateTime firstAttemptAt;
        final LocalDateTime blockedUntil;

        AttemptRecord(int count, LocalDateTime firstAttemptAt, LocalDateTime blockedUntil) {
            this.count = count;
            this.firstAttemptAt = firstAttemptAt;
            this.blockedUntil = blockedUntil;
        }
    }
}
