package com.hostel.controller;

import com.hostel.dto.AllocationDTO;
import com.hostel.dto.ApiResponse;
import com.hostel.service.AllocationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/allocation")
public class AllocationController {

    private final AllocationService allocationService;

    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    /** GET /api/allocation — all students with a room assigned, paginated */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AllocationDTO>>> list(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(allocationService.listAllocations(pageable)));
    }

    /**
     * POST /api/allocation
     * Body: { "studentId": 1, "roomId": 3 }
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<AllocationDTO>> allocate(
            @RequestBody Map<String, Long> body) {
        Long studentId = body.get("studentId");
        Long roomId    = body.get("roomId");
        if (studentId == null || roomId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Both studentId and roomId are required."));
        }
        return ResponseEntity.ok(
                ApiResponse.success("Room allocated", allocationService.allocate(studentId, roomId)));
    }

    /**
     * DELETE /api/allocation/{studentId}
     * Removes the student from their current room.
     */
    @DeleteMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<Void>> deallocate(@PathVariable Long studentId) {
        allocationService.deallocate(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student deallocated", null));
    }
}
