package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.MessMenuDTO;
import com.hostel.service.MessMenuService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mess")
public class MessMenuController {

    private final MessMenuService messMenuService;

    public MessMenuController(MessMenuService messMenuService) {
        this.messMenuService = messMenuService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MessMenuDTO>>> list(
            @RequestParam(required = false) String day,
            @RequestParam(required = false) String mealType,
            @PageableDefault(size = 30) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(messMenuService.list(day, mealType, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MessMenuDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(messMenuService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<MessMenuDTO>> create(@Valid @RequestBody MessMenuDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Mess menu added", messMenuService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<MessMenuDTO>> update(@PathVariable Long id, @RequestBody MessMenuDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Mess menu updated", messMenuService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        messMenuService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Mess menu deleted", null));
    }
}
