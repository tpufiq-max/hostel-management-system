package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.VisitorDTO;
import com.hostel.service.VisitorService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Visitors", description = "Visitor management")
@RestController
@RequestMapping("/api/visitors")
public class VisitorController {

    private final VisitorService visitorService;

    public VisitorController(VisitorService visitorService) {
        this.visitorService = visitorService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VisitorDTO>>> getAllVisitors(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10) @NonNull Pageable pageable) {
        Page<VisitorDTO> result;
        if (status != null) {
            result = visitorService.getVisitorsByStatus(status, pageable);
        } else {
            result = visitorService.getAllVisitors(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VisitorDTO>> getVisitorById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(visitorService.getVisitorById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<VisitorDTO>> createVisitor(@Valid @RequestBody VisitorDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Visitor checked in successfully", visitorService.createVisitor(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<VisitorDTO>> updateVisitor(@PathVariable @NonNull Long id, @RequestBody VisitorDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Visitor updated successfully", visitorService.updateVisitor(id, dto)));
    }

    @PutMapping("/{id}/checkout")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<VisitorDTO>> checkoutVisitor(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success("Visitor checked out successfully", visitorService.checkoutVisitor(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVisitor(@PathVariable @NonNull Long id) {
        visitorService.deleteVisitor(id);
        return ResponseEntity.ok(ApiResponse.success("Visitor deleted successfully", null));
    }
}
