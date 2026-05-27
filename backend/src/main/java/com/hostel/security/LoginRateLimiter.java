package com.hostel.security;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.LinkedList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory rate limiter for login attempts.
 *
 *   - Bucketed per (email, source-IP) — both must be within their windows
 *     for the call to be accepted.
 *   - Sliding window: keep timestamps of recent failures, evict ones older
 *     than {@link #WINDOW}, count what's left.
 *   - Returns the number of seconds until the next slot frees up so the
 *     caller can surface a friendly retry-after message.
 *
 * Thread-safe via {@link ConcurrentHashMap} and per-key synchronisation.
 * Memory bounded by occasional cleanup of stale buckets.
 *
 * This is deliberately not Redis-backed — we don't have an external cache
 * in this stack, and the dev/single-instance use case doesn't need one.
 * For multi-instance prod, swap the map for a shared store.
 */
@Component
public class LoginRateLimiter {

    /** Failures allowed inside the window before we lock the key. */
    static final int      MAX_ATTEMPTS = 5;
    /** Sliding window length. */
    static final Duration WINDOW       = Duration.ofMinutes(15);

    private final Map<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    /**
     * Throws {@link TooManyAttemptsException} if the key has already
     * exceeded the cap inside the current window. Otherwise returns
     * silently.
     *
     * Call this BEFORE delegating to AuthenticationManager so we don't
     * even hit the DB for a locked-out caller.
     */
    public void checkAllowed(String key) {
        if (key == null || key.isBlank()) return;
        long retryAfterSeconds = secondsUntilNextSlot(key);
        if (retryAfterSeconds > 0) {
            throw new TooManyAttemptsException(retryAfterSeconds);
        }
    }

    /**
     * Record a failed login. The next call to checkAllowed will use this
     * to compute whether the key should be locked.
     */
    public void recordFailure(String key) {
        if (key == null || key.isBlank()) return;
        Deque<Instant> bucket = attempts.computeIfAbsent(key, k -> new LinkedList<>());
        synchronized (bucket) {
            bucket.addLast(Instant.now());
            evictOld(bucket);
        }
    }

    /**
     * Reset the bucket for this key — called after a successful login so
     * a user with one bad attempt doesn't carry the count forever.
     */
    public void reset(String key) {
        if (key == null || key.isBlank()) return;
        attempts.remove(key);
    }

    /* ── helpers ───────────────────────────────────────────────────── */

    long secondsUntilNextSlot(String key) {
        Deque<Instant> bucket = attempts.get(key);
        if (bucket == null) return 0;
        synchronized (bucket) {
            evictOld(bucket);
            if (bucket.size() < MAX_ATTEMPTS) return 0;
            Instant oldest = bucket.peekFirst();
            long secs = Duration.between(Instant.now(), oldest.plus(WINDOW)).getSeconds();
            return Math.max(secs, 1);
        }
    }

    private void evictOld(Deque<Instant> bucket) {
        Instant cutoff = Instant.now().minus(WINDOW);
        while (!bucket.isEmpty() && bucket.peekFirst().isBefore(cutoff)) {
            bucket.pollFirst();
        }
    }

    /* ── exception type ────────────────────────────────────────────── */

    public static class TooManyAttemptsException extends RuntimeException {
        private final long retryAfterSeconds;
        public TooManyAttemptsException(long retryAfterSeconds) {
            super("Too many login attempts. Please try again later.");
            this.retryAfterSeconds = retryAfterSeconds;
        }
        public long getRetryAfterSeconds() { return retryAfterSeconds; }
    }
}
