package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.EventDTO;
import com.hostel.service.EventService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EventDTO>>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(eventService.list(status, category, pageable)));
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<EventDTO>>> listInRange(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(ApiResponse.success(eventService.listInRange(from, to)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<EventDTO>> create(@Valid @RequestBody EventDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Event created", eventService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<EventDTO>> update(@PathVariable Long id, @RequestBody EventDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Event updated", eventService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted", null));
    }
}
