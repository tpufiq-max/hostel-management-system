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

@RestController
@RequestMapping("/api/students")
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

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<StudentDTO>> createStudent(@Valid @RequestBody StudentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Student created successfully", studentService.createStudent(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<StudentDTO>> updateStudent(@PathVariable @NonNull Long id, @RequestBody StudentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", studentService.updateStudent(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable @NonNull Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }
}
