package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.MaintenanceRequestDTO;
import com.hostel.service.MaintenanceRequestService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Maintenance Requests", description = "Maintenance request management")
@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceRequestController {

    private final MaintenanceRequestService maintenanceRequestService;

    public MaintenanceRequestController(MaintenanceRequestService maintenanceRequestService) {
        this.maintenanceRequestService = maintenanceRequestService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MaintenanceRequestDTO>>> getAllRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10) @NonNull Pageable pageable) {
        Page<MaintenanceRequestDTO> result;
        if (status != null) {
            result = maintenanceRequestService.getRequestsByStatus(status, pageable);
        } else if (priority != null) {
            result = maintenanceRequestService.getRequestsByPriority(priority, pageable);
        } else if (category != null) {
            result = maintenanceRequestService.getRequestsByCategory(category, pageable);
        } else {
            result = maintenanceRequestService.getAllRequests(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceRequestDTO>> getRequestById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceRequestService.getRequestById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<MaintenanceRequestDTO>> createRequest(@Valid @RequestBody MaintenanceRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Maintenance request created successfully", maintenanceRequestService.createRequest(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<MaintenanceRequestDTO>> updateRequest(@PathVariable @NonNull Long id, @RequestBody MaintenanceRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Maintenance request updated successfully", maintenanceRequestService.updateRequest(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRequest(@PathVariable @NonNull Long id) {
        maintenanceRequestService.deleteRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Maintenance request deleted successfully", null));
    }
}
