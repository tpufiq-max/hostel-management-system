package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.RoomDTO;
import com.hostel.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RoomDTO>>> getAllRooms(@PageableDefault(size = 10) @NonNull Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getAllRooms(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomDTO>> getRoomById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getRoomById(id)));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<RoomDTO>>> getAvailableRooms() {
        return ResponseEntity.ok(ApiResponse.success(roomService.getAvailableRooms()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomDTO>> createRoom(@Valid @RequestBody RoomDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Room created successfully", roomService.createRoom(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomDTO>> updateRoom(@PathVariable @NonNull Long id, @RequestBody RoomDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Room updated successfully", roomService.updateRoom(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable @NonNull Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Room deleted successfully", null));
    }
}
