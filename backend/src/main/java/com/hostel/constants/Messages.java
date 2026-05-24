package com.hostel.constants;

/**
 * Centralized response messages so controllers and services don't drift apart
 * over time. Keep messages user-friendly — they are surfaced directly in API
 * responses and consumed by the frontend.
 */
public final class Messages {

    private Messages() {
        // utility class
    }

    // Auth
    public static final String LOGIN_SUCCESS = "Login successful";
    public static final String REGISTRATION_SUCCESS = "Registration successful";
    public static final String PASSWORD_RESET_LINK_SENT =
            "If an account with that email exists, a password reset link has been sent.";
    public static final String PASSWORD_RESET_SUCCESS = "Password reset successfully";
    public static final String PASSWORD_CHANGE_SUCCESS = "Password changed successfully";
    public static final String INVALID_CREDENTIALS = "Invalid email or password";

    // CRUD - generic templates
    public static final String CREATED = "%s created successfully";
    public static final String UPDATED = "%s updated successfully";
    public static final String DELETED = "%s deleted successfully";
    public static final String NOT_FOUND = "%s not found with id: %s";

    // Validation / business errors
    public static final String EMAIL_ALREADY_EXISTS = "Email is already registered";
    public static final String USERNAME_ALREADY_EXISTS = "Username is already taken";
    public static final String STUDENT_EMAIL_EXISTS = "Student with this email already exists";
    public static final String STUDENT_ROLL_EXISTS = "Student with this roll number already exists";
    public static final String ROOM_NUMBER_EXISTS = "Room with this number already exists";
    public static final String ATTENDANCE_ALREADY_MARKED =
            "Attendance already marked for this student on %s";

    // Generic
    public static final String UNEXPECTED_ERROR = "An unexpected error occurred";
}
