package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.FeeDTO;
import com.hostel.service.FeeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Fees", description = "Fee records, payment status, and per-student fee history")
@RestController
@RequestMapping("/api/fees")
public class FeeController {

    private final FeeService feeService;

    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeeDTO>>> getAllFees(@PageableDefault(size = 10) @NonNull Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(feeService.getAllFees(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FeeDTO>> getFeeById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(feeService.getFeeById(id)));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<FeeDTO>>> getStudentFees(@PathVariable @NonNull Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(feeService.getStudentFees(studentId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<FeeDTO>> createFee(@Valid @RequestBody FeeDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Fee record created", feeService.createFee(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<FeeDTO>> updateFee(@PathVariable @NonNull Long id, @RequestBody FeeDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Fee updated", feeService.updateFee(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFee(@PathVariable @NonNull Long id) {
        feeService.deleteFee(id);
        return ResponseEntity.ok(ApiResponse.success("Fee deleted", null));
    }
}
