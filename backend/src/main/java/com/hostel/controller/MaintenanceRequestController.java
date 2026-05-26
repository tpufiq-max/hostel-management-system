package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.MaintenanceRequestDTO;
import com.hostel.service.MaintenanceRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceRequestController {

    private final MaintenanceRequestService maintenanceService;

    public MaintenanceRequestController(MaintenanceRequestService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MaintenanceRequestDTO>>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.list(status, priority, category, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceRequestDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MaintenanceRequestDTO>> create(@Valid @RequestBody MaintenanceRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Maintenance request created", maintenanceService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<MaintenanceRequestDTO>> update(@PathVariable Long id, @RequestBody MaintenanceRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Maintenance request updated", maintenanceService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        maintenanceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Maintenance request deleted", null));
    }
}
