package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.NoticeDTO;
import com.hostel.service.NoticeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Notices", description = "Notice management")
@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NoticeDTO>>> getAllNotices(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 10) @NonNull Pageable pageable) {
        Page<NoticeDTO> result;
        if (Boolean.TRUE.equals(active)) {
            result = noticeService.getActiveNotices(pageable);
        } else if (category != null) {
            result = noticeService.getNoticesByCategory(category, pageable);
        } else {
            result = noticeService.getAllNotices(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeDTO>> getNoticeById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.getNoticeById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<NoticeDTO>> createNotice(@Valid @RequestBody NoticeDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Notice created successfully", noticeService.createNotice(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<NoticeDTO>> updateNotice(@PathVariable @NonNull Long id, @RequestBody NoticeDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Notice updated successfully", noticeService.updateNotice(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteNotice(@PathVariable @NonNull Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok(ApiResponse.success("Notice deleted successfully", null));
    }
}
