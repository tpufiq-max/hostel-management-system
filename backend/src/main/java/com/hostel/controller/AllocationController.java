package com.hostel.controller;

import com.hostel.dto.AllocationDTO;
import com.hostel.dto.ApiResponse;
import com.hostel.service.AllocationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Allocations", description = "Room allocation management")
@RestController
@RequestMapping("/api/allocations")
public class AllocationController {

    private final AllocationService allocationService;

    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AllocationDTO>>> getAllAllocations(
            @PageableDefault(size = 10) @NonNull Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(allocationService.getAllAllocations(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AllocationDTO>> getAllocationById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(allocationService.getAllocationById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<AllocationDTO>> createAllocation(@Valid @RequestBody AllocationDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Allocation created", allocationService.createAllocation(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<AllocationDTO>> updateAllocation(
            @PathVariable @NonNull Long id, @RequestBody AllocationDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Allocation updated", allocationService.updateAllocation(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAllocation(@PathVariable @NonNull Long id) {
        allocationService.deleteAllocation(id);
        return ResponseEntity.ok(ApiResponse.success("Allocation deleted", null));
    }
}
