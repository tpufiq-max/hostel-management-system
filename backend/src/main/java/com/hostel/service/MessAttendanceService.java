package com.hostel.service;

import com.hostel.dto.mess.DailyAttendanceRow;
import com.hostel.dto.mess.DailyCharge;
import com.hostel.dto.mess.MealAttendanceDTO;
import com.hostel.dto.mess.MonthlyBill;
import com.hostel.entity.MealAttendance;
import com.hostel.entity.MealAttendance.AttendanceStatus;
import com.hostel.entity.MealAttendance.MealType;
import com.hostel.entity.Student;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.MealAttendanceRepository;
import com.hostel.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Smart Mess Management — attendance + billing.
 *
 * Pricing rules (per day, per student):
 *   • Among BREAKFAST / LUNCH / DINNER, count PRESENT entries:
 *       0 → ₹0    1 → ₹50    2 → ₹100    3 → ₹115
 *   • If SPECIAL_DINNER is PRESENT that day, add a flat ₹50.
 *
 * Monthly bill = sum of daily charges for that student in the month.
 */
@Service
@Transactional
public class MessAttendanceService {

    private static final Logger log = LoggerFactory.getLogger(MessAttendanceService.class);

    private final MealAttendanceRepository attendanceRepo;
    private final StudentRepository        studentRepo;

    public MessAttendanceService(MealAttendanceRepository attendanceRepo,
                                 StudentRepository        studentRepo) {
        this.attendanceRepo = attendanceRepo;
        this.studentRepo    = studentRepo;
    }

    /* ──────────────────────────────────────────────────────────── *
     *  Attendance marking
     * ──────────────────────────────────────────────────────────── */

    /**
     * Upsert one (student, date, meal) row. Idempotent: marking the same
     * combination repeatedly never creates duplicate rows — it updates the
     * existing one's status and updatedAt timestamp.
     */
    public MealAttendanceDTO markAttendance(Long studentId, LocalDate date,
                                            MealType mealType, AttendanceStatus status) {
        if (studentId == null) throw new BadRequestException("studentId is required");
        if (date == null)      throw new BadRequestException("date is required");
        if (mealType == null)  throw new BadRequestException("mealType is required");
        if (status == null)    status = AttendanceStatus.ABSENT;

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        MealAttendance existing = attendanceRepo
                .findByStudentIdAndDateAndMealType(studentId, date, mealType)
                .orElse(null);

        MealAttendance row;
        if (existing != null) {
            existing.setStatus(status);
            row = attendanceRepo.save(existing);
        } else {
            row = attendanceRepo.save(MealAttendance.builder()
                    .student(student)
                    .date(date)
                    .mealType(mealType)
                    .status(status)
                    .build());
        }
        return toDTO(row, student);
    }

    /** Bulk variant for the admin daily entry grid. Returns the rows actually written. */
    public List<MealAttendanceDTO> bulkMark(LocalDate date, List<BulkEntry> entries) {
        if (date == null)    throw new BadRequestException("date is required");
        if (entries == null) entries = List.of();

        List<MealAttendanceDTO> out = new ArrayList<>(entries.size());
        for (BulkEntry e : entries) {
            if (e == null) continue;
            out.add(markAttendance(e.studentId, date, e.mealType, e.status));
        }
        return out;
    }

    /* ──────────────────────────────────────────────────────────── *
     *  Reads
     * ──────────────────────────────────────────────────────────── */

    /** Admin grid: every active student + their meal statuses for the day. */
    @Transactional(readOnly = true)
    public List<DailyAttendanceRow> getDailyAttendance(LocalDate date) {
        if (date == null) throw new BadRequestException("date is required");

        List<Student> students = studentRepo.findByIsActiveTrue();
        students.sort(Comparator.comparing(s -> safeStr(s.getRollNumber()),
                String.CASE_INSENSITIVE_ORDER));

        // index existing rows by (studentId, mealType)
        Map<Long, Map<MealType, AttendanceStatus>> byStudent = new HashMap<>();
        for (MealAttendance r : attendanceRepo.findByDate(date)) {
            byStudent
                .computeIfAbsent(r.getStudent() != null ? r.getStudent().getId() : null,
                                 k -> new HashMap<>())
                .put(r.getMealType(), r.getStatus());
        }

        List<DailyAttendanceRow> rows = new ArrayList<>(students.size());
        for (Student s : students) {
            Map<MealType, AttendanceStatus> map = byStudent.getOrDefault(s.getId(), Map.of());
            rows.add(new DailyAttendanceRow(
                    s.getId(),
                    s.getName(),
                    s.getRollNumber(),
                    statusName(map.get(MealType.BREAKFAST)),
                    statusName(map.get(MealType.LUNCH)),
                    statusName(map.get(MealType.DINNER)),
                    statusName(map.get(MealType.SPECIAL_DINNER))
            ));
        }
        return rows;
    }

    /** A student's own rows for a date range. */
    @Transactional(readOnly = true)
    public List<MealAttendanceDTO> getStudentAttendance(Long studentId, LocalDate from, LocalDate to) {
        if (studentId == null) throw new BadRequestException("studentId is required");
        if (from == null || to == null) throw new BadRequestException("from and to are required");

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        List<MealAttendance> rows = attendanceRepo.findByStudentIdAndDateBetween(studentId, from, to);
        rows.sort(Comparator
                .comparing(MealAttendance::getDate)
                .thenComparing(r -> r.getMealType().ordinal()));

        List<MealAttendanceDTO> out = new ArrayList<>(rows.size());
        for (MealAttendance r : rows) out.add(toDTO(r, student));
        return out;
    }

    /* ──────────────────────────────────────────────────────────── *
     *  Billing
     * ──────────────────────────────────────────────────────────── */

    @Transactional(readOnly = true)
    public DailyCharge calculateDailyCharge(Long studentId, LocalDate date) {
        if (studentId == null) throw new BadRequestException("studentId is required");
        if (date == null)      throw new BadRequestException("date is required");

        Map<MealType, AttendanceStatus> map = new HashMap<>();
        for (MealAttendance r : attendanceRepo.findByStudentIdAndDateBetween(studentId, date, date)) {
            map.put(r.getMealType(), r.getStatus());
        }
        return computeDailyCharge(date, map);
    }

    @Transactional(readOnly = true)
    public MonthlyBill calculateMonthlyBill(Long studentId, int year, int month) {
        if (month < 1 || month > 12) throw new BadRequestException("month must be 1..12");

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        YearMonth ym = YearMonth.of(year, month);
        LocalDate from = ym.atDay(1);
        LocalDate to   = ym.atEndOfMonth();

        // Bucket rows by date → mealType → status, ordered by date ASC.
        Map<LocalDate, Map<MealType, AttendanceStatus>> byDate = new LinkedHashMap<>();
        List<MealAttendance> rows = attendanceRepo.findByStudentIdAndDateBetween(studentId, from, to);
        rows.sort(Comparator.comparing(MealAttendance::getDate));
        for (MealAttendance r : rows) {
            byDate
                .computeIfAbsent(r.getDate(), k -> new HashMap<>())
                .put(r.getMealType(), r.getStatus());
        }

        MonthlyBill bill = new MonthlyBill();
        bill.setStudentId(student.getId());
        bill.setName(student.getName());
        bill.setRollNumber(student.getRollNumber());
        bill.setYear(year);
        bill.setMonth(month);

        int b = 0, l = 0, d = 0, sd = 0, totalMeals = 0, daysAttended = 0, grand = 0;
        List<DailyCharge> days = new ArrayList<>(byDate.size());

        for (Map.Entry<LocalDate, Map<MealType, AttendanceStatus>> entry : byDate.entrySet()) {
            LocalDate day = entry.getKey();
            Map<MealType, AttendanceStatus> map = entry.getValue();

            DailyCharge dc = computeDailyCharge(day, map);
            days.add(dc);

            grand += dc.getTotal();
            if (isPresent(map.get(MealType.BREAKFAST)))      { b++;  totalMeals++; }
            if (isPresent(map.get(MealType.LUNCH)))          { l++;  totalMeals++; }
            if (isPresent(map.get(MealType.DINNER)))         { d++;  totalMeals++; }
            if (isPresent(map.get(MealType.SPECIAL_DINNER))) { sd++; }
            if (dc.getTotal() > 0) daysAttended++;
        }

        bill.setDays(days);
        bill.setBreakfastCount(b);
        bill.setLunchCount(l);
        bill.setDinnerCount(d);
        bill.setSpecialDinnerCount(sd);
        bill.setTotalMeals(totalMeals);
        bill.setDaysAttended(daysAttended);
        bill.setGrandTotal(grand);
        return bill;
    }

    /** Admin-only: aggregate revenue across every active student for a month. */
    @Transactional(readOnly = true)
    public Map<String, Object> getMonthlyRevenue(int year, int month) {
        if (month < 1 || month > 12) throw new BadRequestException("month must be 1..12");

        List<Student> students = studentRepo.findByIsActiveTrue();
        students.sort(Comparator.comparing(s -> safeStr(s.getRollNumber()),
                String.CASE_INSENSITIVE_ORDER));

        int totalRevenue = 0;
        int totalMeals   = 0;
        int totalSpecial = 0;
        List<Map<String, Object>> byStudent = new ArrayList<>();

        for (Student s : students) {
            MonthlyBill bill = calculateMonthlyBill(s.getId(), year, month);
            totalRevenue += bill.getGrandTotal();
            totalMeals   += bill.getTotalMeals();
            totalSpecial += bill.getSpecialDinnerCount();

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("studentId",  s.getId());
            row.put("name",       s.getName());
            row.put("rollNumber", s.getRollNumber());
            row.put("total",      bill.getGrandTotal());
            row.put("meals",      bill.getTotalMeals());
            row.put("specialDinners", bill.getSpecialDinnerCount());
            byStudent.add(row);
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("year",                year);
        out.put("month",               month);
        out.put("totalRevenue",        totalRevenue);
        out.put("totalMeals",          totalMeals);
        out.put("totalSpecialDinners", totalSpecial);
        out.put("byStudent",           byStudent);
        return out;
    }

    /* ──────────────────────────────────────────────────────────── *
     *  Pricing primitive (the single source of truth)
     * ──────────────────────────────────────────────────────────── */

    private DailyCharge computeDailyCharge(LocalDate date, Map<MealType, AttendanceStatus> map) {
        int meals = 0;
        if (isPresent(map.get(MealType.BREAKFAST))) meals++;
        if (isPresent(map.get(MealType.LUNCH)))     meals++;
        if (isPresent(map.get(MealType.DINNER)))    meals++;

        int base = switch (meals) {
            case 0 -> 0;
            case 1 -> 50;
            case 2 -> 100;
            case 3 -> 115;
            default -> 0;
        };

        boolean specialPresent = isPresent(map.get(MealType.SPECIAL_DINNER));
        int specialCharge = specialPresent ? 50 : 0;

        return new DailyCharge(
                date.toString(), meals, base, specialPresent, specialCharge, base + specialCharge);
    }

    /* ──────────────────────────────────────────────────────────── *
     *  Helpers
     * ──────────────────────────────────────────────────────────── */

    private static boolean isPresent(AttendanceStatus s) { return s == AttendanceStatus.PRESENT; }

    private static String statusName(AttendanceStatus s) {
        return s == null ? AttendanceStatus.ABSENT.name() : s.name();
    }

    private static String safeStr(String s) { return s == null ? "" : s; }

    private MealAttendanceDTO toDTO(MealAttendance r, Student fallbackStudent) {
        Student s = r.getStudent() != null ? r.getStudent() : fallbackStudent;
        return new MealAttendanceDTO(
                r.getId(),
                s != null ? s.getId() : null,
                s != null ? s.getName() : null,
                s != null ? s.getRollNumber() : null,
                r.getDate() != null ? r.getDate().toString() : null,
                r.getMealType() != null ? r.getMealType().name() : null,
                r.getStatus() != null ? r.getStatus().name() : null
        );
    }

    /** Wire-friendly bulk entry struct. */
    public static class BulkEntry {
        public Long studentId;
        public MealType mealType;
        public AttendanceStatus status;

        public BulkEntry() {}
        public BulkEntry(Long studentId, MealType mealType, AttendanceStatus status) {
            this.studentId = studentId;
            this.mealType  = mealType;
            this.status    = status;
        }
    }
}
