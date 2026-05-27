package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.StudentDTO;
import com.hostel.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin-only CRUD for the student roster.
 *
 * Path-based authorization is enforced in {@link com.hostel.config.SecurityConfig}
 * (anything under /api/students/** requires ADMIN or WARDEN). The class-level
 * {@code @PreAuthorize} below is a defense-in-depth duplicate so the rule is
 * also visible at the call site.
 *
 * Students do NOT use these endpoints — they read their own record via
 * /api/me/student which only returns the caller's data.
 */
@RestController
@RequestMapping("/api/students")
@PreAuthorize("hasAnyRole('ADMIN','WARDEN')")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<StudentDTO>>> getAllStudents(
            @PageableDefault(size = 10) @NonNull Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getAllStudents(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDTO>> getStudentById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudentById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<StudentDTO>>> searchStudents(
            @RequestParam String query,
            @PageableDefault(size = 10) @NonNull Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(studentService.searchStudents(query, pageable)));
    }

    /**
     * Create a student. Side effect: a linked User account with role=STUDENT
     * is created automatically so the student can log in. The temporary
     * password (returned in {@code data.tempPassword}) is the lower-cased
     * roll number; the student should change it on first login.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<StudentDTO>> createStudent(@Valid @RequestBody StudentDTO dto) {
        StudentDTO created = studentService.createStudent(dto);
        return ResponseEntity.ok(ApiResponse.success(
                "Student created. Login: " + created.getEmail()
                        + (created.getTempPassword() != null ? " / " + created.getTempPassword() : ""),
                created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDTO>> updateStudent(@PathVariable @NonNull Long id, @RequestBody StudentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", studentService.updateStudent(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable @NonNull Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted (login revoked)", null));
    }
}
