package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.mess.DailyAttendanceRow;
import com.hostel.dto.mess.MealAttendanceDTO;
import com.hostel.dto.mess.MonthlyBill;
import com.hostel.entity.MealAttendance.AttendanceStatus;
import com.hostel.entity.MealAttendance.MealType;
import com.hostel.exception.BadRequestException;
import com.hostel.service.MessAttendanceService;
import com.hostel.service.MessAttendanceService.BulkEntry;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Smart Mess Management — admin/warden endpoints.
 *
 * Paths are deliberately deeper than {@code /api/mess} (the menu controller)
 * so the more-specific SecurityConfig rule for {@code /api/mess/attendance/**},
 * {@code /api/mess/bills/**} and {@code /api/mess/revenue/**} matches first.
 */
@RestController
@RequestMapping("/api/mess")
@PreAuthorize("hasAnyRole('ADMIN','WARDEN')")
public class MessAttendanceController {

    private final MessAttendanceService service;

    public MessAttendanceController(MessAttendanceService service) {
        this.service = service;
    }

    /* ── attendance ────────────────────────────────────────────── */

    /** Daily admin grid: every active student × four meal slots for one day. */
    @GetMapping("/attendance")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<DailyAttendanceRow>>> daily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(service.getDailyAttendance(date)));
    }

    /** Bulk save from the daily grid. Body: {date, entries: [{studentId, mealType, status}]} */
    @PostMapping("/attendance")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> bulk(@RequestBody BulkRequest req) {
        if (req == null || req.date == null) {
            throw new BadRequestException("date is required");
        }
        LocalDate date;
        try {
            date = LocalDate.parse(req.date);
        } catch (Exception e) {
            throw new BadRequestException("Invalid date (expected yyyy-MM-dd): " + req.date);
        }

        List<BulkEntry> parsed = new ArrayList<>();
        if (req.entries != null) {
            for (BulkEntryRequest e : req.entries) {
                if (e == null || e.studentId == null) continue;
                parsed.add(new BulkEntry(
                        e.studentId,
                        parseEnum(MealType.class, e.mealType, "mealType"),
                        parseEnum(AttendanceStatus.class, e.status, "status")));
            }
        }
        List<MealAttendanceDTO> written = service.bulkMark(date, parsed);

        Map<String, Object> out = new HashMap<>();
        out.put("marked",  written.size());
        out.put("date",    date.toString());
        out.put("entries", written);
        return ResponseEntity.ok(ApiResponse.success("Attendance saved", out));
    }

    /* ── bills ─────────────────────────────────────────────────── */

    @GetMapping("/bills/{studentId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<MonthlyBill>> bill(
            @PathVariable Long studentId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success(
                service.calculateMonthlyBill(studentId, year, month)));
    }

    /* ── revenue (admin/warden) ────────────────────────────────── */

    @GetMapping("/revenue")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> revenue(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success(service.getMonthlyRevenue(year, month)));
    }

    /* ── helpers ───────────────────────────────────────────────── */

    private static <E extends Enum<E>> E parseEnum(Class<E> type, String value, String name) {
        if (value == null) throw new BadRequestException(name + " is required");
        try {
            return Enum.valueOf(type, value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid " + name + ": " + value);
        }
    }

    /* ── request bodies ────────────────────────────────────────── */

    public static class BulkRequest {
        public String date;            // yyyy-MM-dd
        public List<BulkEntryRequest> entries;
    }
    public static class BulkEntryRequest {
        public Long   studentId;
        public String mealType;        // BREAKFAST | LUNCH | DINNER | SPECIAL_DINNER
        public String status;          // PRESENT | ABSENT
    }
}
