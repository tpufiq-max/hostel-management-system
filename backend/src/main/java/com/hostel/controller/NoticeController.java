package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.NoticeDTO;
import com.hostel.service.NoticeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NoticeDTO>>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.list(category, priority, active, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<NoticeDTO>> create(@Valid @RequestBody NoticeDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Notice published", noticeService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<NoticeDTO>> update(@PathVariable Long id, @RequestBody NoticeDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Notice updated", noticeService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        noticeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Notice deleted", null));
    }
}
