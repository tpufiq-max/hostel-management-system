package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.MessMenuDTO;
import com.hostel.service.MessMenuService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Mess Menu", description = "Mess menu management")
@RestController
@RequestMapping("/api/mess")
public class MessMenuController {

    private final MessMenuService messMenuService;

    public MessMenuController(MessMenuService messMenuService) {
        this.messMenuService = messMenuService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MessMenuDTO>>> getAllMenus(
            @RequestParam(required = false) String day,
            @RequestParam(required = false) String mealType,
            @PageableDefault(size = 10) @NonNull Pageable pageable) {
        Page<MessMenuDTO> result;
        if (day != null && mealType != null) {
            result = messMenuService.getMenusByDayAndMealType(day, mealType, pageable);
        } else if (day != null) {
            result = messMenuService.getMenusByDay(day, pageable);
        } else if (mealType != null) {
            result = messMenuService.getMenusByMealType(mealType, pageable);
        } else {
            result = messMenuService.getAllMenus(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MessMenuDTO>> getMenuById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(ApiResponse.success(messMenuService.getMenuById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MessMenuDTO>> createMenu(@Valid @RequestBody MessMenuDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Menu created successfully", messMenuService.createMenu(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MessMenuDTO>> updateMenu(@PathVariable @NonNull Long id, @RequestBody MessMenuDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Menu updated successfully", messMenuService.updateMenu(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMenu(@PathVariable @NonNull Long id) {
        messMenuService.deleteMenu(id);
        return ResponseEntity.ok(ApiResponse.success("Menu deleted successfully", null));
    }
}
