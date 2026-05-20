package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.ComplaintDTO;
import com.hostel.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ComplaintDTO>>> getAllComplaints(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getAllComplaints(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintDTO>> getComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getComplaintById(id)));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<ComplaintDTO>>> getStudentComplaints(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getStudentComplaints(studentId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ComplaintDTO>> createComplaint(@Valid @RequestBody ComplaintDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Complaint submitted", complaintService.createComplaint(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<ComplaintDTO>> updateComplaint(@PathVariable Long id, @RequestBody ComplaintDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Complaint updated", complaintService.updateComplaint(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.ok(ApiResponse.success("Complaint deleted", null));
    }
}
