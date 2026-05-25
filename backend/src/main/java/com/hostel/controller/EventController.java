package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.EventDTO;
import com.hostel.exception.BadRequestException;
import com.hostel.service.EventService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@Tag(name = "Events", description = "Event management")
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EventDTO>>> getAllEvents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @PageableDefault(size = 10) @NonNull Pageable pageable) {
        Page<EventDTO> result;
        if (status != null) {
            result = eventService.getEventsByStatus(status, pageable);
        } else if (category != null) {
            result = eventService.getEventsByCategory(category, pageable);
        } else if (startDate != null && endDate != null) {
            try {
                LocalDate start = LocalDate.parse(startDate);
                LocalDate end = LocalDate.parse(endDate);
                result = eventService.getEventsByDateRange(start, end, pageable);
            } catch (DateTimeParseException ex) {
                throw new BadRequestException("Invalid date format. Expected YYYY-MM-DD.");
            }
        } else {
            result = eventService.getAllEvents(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventDTO>> getEventById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getEventById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<EventDTO>> createEvent(@Valid @RequestBody EventDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Event created successfully", eventService.createEvent(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WARDEN')")
    public ResponseEntity<ApiResponse<EventDTO>> updateEvent(@PathVariable @NonNull Long id, @RequestBody EventDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Event updated successfully", eventService.updateEvent(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable @NonNull Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted successfully", null));
    }
}
