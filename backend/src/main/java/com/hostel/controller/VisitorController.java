package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.VisitorDTO;
import com.hostel.service.VisitorService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visitors")
public class VisitorController {

    private final VisitorService visitorService;

    public VisitorController(VisitorService visitorService) {
        this.visitorService = visitorService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VisitorDTO>>> list(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(visitorService.list(status, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VisitorDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(visitorService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VisitorDTO>> create(@Valid @RequestBody VisitorDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Visitor checked in", visitorService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<VisitorDTO>> update(@PathVariable Long id, @RequestBody VisitorDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Visitor updated", visitorService.update(id, dto)));
    }

    @PutMapping("/{id}/checkout")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<VisitorDTO>> checkout(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Visitor checked out", visitorService.checkout(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        visitorService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Visitor deleted", null));
    }
}
