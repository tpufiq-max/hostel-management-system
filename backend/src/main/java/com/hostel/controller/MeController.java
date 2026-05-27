package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.ComplaintDTO;
import com.hostel.dto.MaintenanceRequestDTO;
import com.hostel.dto.StudentDTO;
import com.hostel.dto.UserDTO;
import com.hostel.dto.mess.MealAttendanceDTO;
import com.hostel.dto.mess.MonthlyBill;
import com.hostel.entity.Student;
import com.hostel.entity.User;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.AttendanceRepository;
import com.hostel.repository.ComplaintRepository;
import com.hostel.repository.FeeRepository;
import com.hostel.repository.MaintenanceRequestRepository;
import com.hostel.repository.NoticeRepository;
import com.hostel.security.CustomUserDetails;
import com.hostel.service.MessAttendanceService;
import com.hostel.service.StudentService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * /api/me/** — per-authenticated-user endpoints.
 *
 * Every method scopes its query to the caller's own data via
 * {@link CustomUserDetails}, so a student can never see another student's
 * fees, attendance, complaints or maintenance tickets.
 *
 * Admins / wardens may also call these endpoints; they will simply receive
 * empty results because they don't have a Student profile attached.
 */
@RestController
@RequestMapping("/api/me")
@PreAuthorize("isAuthenticated()")
public class MeController {

    private final StudentService                 studentService;
    private final FeeRepository                  feeRepository;
    private final AttendanceRepository           attendanceRepository;
    private final ComplaintRepository            complaintRepository;
    private final MaintenanceRequestRepository   maintenanceRepository;
    private final NoticeRepository               noticeRepository;
    private final MessAttendanceService          messAttendanceService;

    public MeController(StudentService                 studentService,
                        FeeRepository                  feeRepository,
                        AttendanceRepository           attendanceRepository,
                        ComplaintRepository            complaintRepository,
                        MaintenanceRequestRepository   maintenanceRepository,
                        NoticeRepository               noticeRepository,
                        MessAttendanceService          messAttendanceService) {
        this.studentService        = studentService;
        this.feeRepository         = feeRepository;
        this.attendanceRepository  = attendanceRepository;
        this.complaintRepository   = complaintRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.noticeRepository      = noticeRepository;
        this.messAttendanceService = messAttendanceService;
    }

    /* ── identity ──────────────────────────────────────────────────── */

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<UserDTO>> me(@AuthenticationPrincipal CustomUserDetails ud) {
        User u = ud.getUser();
        return ResponseEntity.ok(ApiResponse.success(UserDTO.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .username(u.getUsername())
                .role(u.getRole().name().toLowerCase())
                .phone(u.getPhone())
                .profileImage(u.getProfileImage())
                .build()));
    }

    @GetMapping("/student")
    public ResponseEntity<ApiResponse<StudentDTO>> myStudent(@AuthenticationPrincipal CustomUserDetails ud) {
        Student s = requireStudent(ud);
        return ResponseEntity.ok(ApiResponse.success(toDTO(s)));
    }

    /* ── room ──────────────────────────────────────────────────────── */

    @GetMapping("/room")
    public ResponseEntity<ApiResponse<Map<String, Object>>> myRoom(@AuthenticationPrincipal CustomUserDetails ud) {
        Student s = requireStudent(ud);
        Map<String, Object> out = new HashMap<>();
        out.put("roomNumber", s.getRoomNumber());
        out.put("bedNumber",  s.getBedNumber());
        if (s.getRoom() != null) {
            out.put("roomId",   s.getRoom().getId());
            out.put("type",     s.getRoom().getType());
            out.put("floor",    s.getRoom().getFloor());
            out.put("block",    s.getRoom().getBlock());
            out.put("capacity", s.getRoom().getCapacity());
        }
        return ResponseEntity.ok(ApiResponse.success(out));
    }

    /* ── fees ──────────────────────────────────────────────────────── */

    @GetMapping("/fees")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> myFees(@AuthenticationPrincipal CustomUserDetails ud) {
        Student s = requireStudent(ud);
        List<Map<String, Object>> rows = feeRepository.findByStudentId(s.getId()).stream()
                .map(f -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",            f.getId());
                    m.put("amount",        f.getAmount());
                    m.put("dueDate",       f.getDueDate()       != null ? f.getDueDate().toString()       : null);
                    m.put("paymentDate",   f.getPaymentDate()   != null ? f.getPaymentDate().toString()   : null);
                    m.put("paymentStatus", f.getPaymentStatus() != null ? f.getPaymentStatus().name()     : null);
                    m.put("paymentMethod", f.getPaymentMethod());
                    m.put("transactionId", f.getTransactionId());
                    m.put("description",   f.getDescription());
                    m.put("feeType",       f.getFeeType()       != null ? f.getFeeType().name()           : null);
                    m.put("semester",      f.getSemester());
                    return m;
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.success(rows));
    }

    /* ── attendance ───────────────────────────────────────────────── */

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> myAttendance(@AuthenticationPrincipal CustomUserDetails ud) {
        Student s = requireStudent(ud);
        List<Map<String, Object>> rows = attendanceRepository.findByStudentId(s.getId()).stream()
                .map(a -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",     a.getId());
                    m.put("date",   a.getDate() != null ? a.getDate().toString() : null);
                    m.put("status", a.getStatus() != null ? a.getStatus().name() : null);
                    m.put("checkInTime",  a.getCheckInTime());
                    m.put("checkOutTime", a.getCheckOutTime());
                    m.put("remarks",      a.getRemarks());
                    return m;
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.success(rows));
    }

    /* ── complaints ───────────────────────────────────────────────── */

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> myComplaints(@AuthenticationPrincipal CustomUserDetails ud) {
        Student s = requireStudent(ud);
        List<Map<String, Object>> rows = complaintRepository.findByStudentId(s.getId()).stream()
                .map(c -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",          c.getId());
                    m.put("title",       c.getTitle());
                    m.put("description", c.getDescription());
                    m.put("category",    c.getCategory()         != null ? c.getCategory().name()         : null);
                    m.put("status",      c.getComplaintStatus()  != null ? c.getComplaintStatus().name()  : null);
                    m.put("priority",    c.getPriority()         != null ? c.getPriority().name()         : null);
                    m.put("createdAt",   c.getCreatedAt()        != null ? c.getCreatedAt().toString()    : null);
                    return m;
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.success(rows));
    }

    @PostMapping("/complaints")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitComplaint(
            @AuthenticationPrincipal CustomUserDetails ud,
            @RequestBody ComplaintDTO dto) {
        Student s = requireStudent(ud);

        com.hostel.entity.Complaint c = com.hostel.entity.Complaint.builder()
                .student(s)
                .title(notBlank(dto.getTitle(), "Title is required"))
                .description(dto.getDescription())
                .category(parseEnum(com.hostel.entity.Complaint.ComplaintCategory.class,
                        dto.getCategory(), "category"))
                .priority(dto.getPriority() != null
                        ? parseEnum(com.hostel.entity.Complaint.Priority.class, dto.getPriority(), "priority")
                        : com.hostel.entity.Complaint.Priority.MEDIUM)
                .complaintStatus(com.hostel.entity.Complaint.ComplaintStatus.OPEN)
                .build();

        com.hostel.entity.Complaint saved = complaintRepository.save(c);
        Map<String, Object> m = new HashMap<>();
        m.put("id",        saved.getId());
        m.put("title",     saved.getTitle());
        m.put("status",    saved.getComplaintStatus().name());
        m.put("createdAt", saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : null);
        return ResponseEntity.ok(ApiResponse.success("Complaint submitted", m));
    }

    /* ── maintenance ──────────────────────────────────────────────── */

    @GetMapping("/maintenance")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> myMaintenance(@AuthenticationPrincipal CustomUserDetails ud) {
        Student s = requireStudent(ud);
        List<Map<String, Object>> rows = maintenanceRepository.findByReportedById(s.getId()).stream()
                .map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",           r.getId());
                    m.put("title",        r.getTitle());
                    m.put("description",  r.getDescription());
                    m.put("category",     r.getCategory() != null ? r.getCategory().name() : null);
                    m.put("priority",     r.getPriority() != null ? r.getPriority().name() : null);
                    m.put("status",       r.getStatus()   != null ? r.getStatus().name()   : null);
                    m.put("roomNumber",   r.getRoomNumber());
                    m.put("reportedDate", r.getReportedDate() != null ? r.getReportedDate().toString() : null);
                    return m;
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.success(rows));
    }

    @PostMapping("/maintenance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitMaintenance(
            @AuthenticationPrincipal CustomUserDetails ud,
            @RequestBody MaintenanceRequestDTO dto) {
        Student s = requireStudent(ud);

        com.hostel.entity.MaintenanceRequest r = com.hostel.entity.MaintenanceRequest.builder()
                .title(notBlank(dto.getTitle(), "Title is required"))
                .description(dto.getDescription())
                .category(parseEnum(com.hostel.entity.MaintenanceRequest.Category.class,
                        dto.getCategory(), "category"))
                .priority(dto.getPriority() != null
                        ? parseEnum(com.hostel.entity.MaintenanceRequest.Priority.class, dto.getPriority(), "priority")
                        : com.hostel.entity.MaintenanceRequest.Priority.MEDIUM)
                .status(com.hostel.entity.MaintenanceRequest.Status.OPEN)
                .roomNumber(dto.getRoomNumber() != null ? dto.getRoomNumber() : s.getRoomNumber())
                .reportedBy(s)
                .reportedDate(LocalDate.now())
                .build();

        com.hostel.entity.MaintenanceRequest saved = maintenanceRepository.save(r);
        Map<String, Object> m = new HashMap<>();
        m.put("id",     saved.getId());
        m.put("title",  saved.getTitle());
        m.put("status", saved.getStatus().name());
        return ResponseEntity.ok(ApiResponse.success("Maintenance request submitted", m));
    }

    /* ── notices (read-only, all active) ──────────────────────────── */

    @GetMapping("/notices")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> myNotices(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Map<String, Object>> rows = noticeRepository
                .findByIsActiveTrue(PageRequest.of(page, size))
                .stream()
                .map(n -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",          n.getId());
                    m.put("title",       n.getTitle());
                    m.put("content",     n.getContent());
                    m.put("category",    n.getCategory() != null ? n.getCategory().name() : null);
                    m.put("priority",    n.getPriority() != null ? n.getPriority().name() : null);
                    m.put("publishedAt", n.getPublishedAt() != null ? n.getPublishedAt().toString() : null);
                    m.put("expiresAt",   n.getExpiresAt() != null   ? n.getExpiresAt().toString()   : null);
                    return m;
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.success(rows));
    }

    /* ── mess (smart mess management) ─────────────────────────────── */

    /**
     * Caller's own mess attendance for a calendar month.
     * If year/month omitted, defaults to the current month.
     */
    @GetMapping("/mess/attendance")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<MealAttendanceDTO>>> myMessAttendance(
            @AuthenticationPrincipal CustomUserDetails ud,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        Student s = requireStudent(ud);
        YearMonth ym = resolveMonth(year, month);
        List<MealAttendanceDTO> rows = messAttendanceService
                .getStudentAttendance(s.getId(), ym.atDay(1), ym.atEndOfMonth());
        return ResponseEntity.ok(ApiResponse.success(rows));
    }

    /**
     * Caller's own mess bill for a calendar month.
     * If year/month omitted, defaults to the current month.
     */
    @GetMapping("/mess/bill")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<MonthlyBill>> myMessBill(
            @AuthenticationPrincipal CustomUserDetails ud,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        Student s = requireStudent(ud);
        YearMonth ym = resolveMonth(year, month);
        MonthlyBill bill = messAttendanceService
                .calculateMonthlyBill(s.getId(), ym.getYear(), ym.getMonthValue());
        return ResponseEntity.ok(ApiResponse.success(bill));
    }

    /* ── per-student dashboard ─────────────────────────────────────── */

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> myDashboard(@AuthenticationPrincipal CustomUserDetails ud) {
        Student s = requireStudent(ud);

        // fees
        var fees       = feeRepository.findByStudentId(s.getId());
        double paid    = fees.stream()
                .filter(f -> f.getPaymentStatus() == com.hostel.entity.Fee.PaymentStatus.PAID)
                .mapToDouble(f -> f.getAmount() == null ? 0d : f.getAmount())
                .sum();
        double pending = fees.stream()
                .filter(f -> f.getPaymentStatus() != com.hostel.entity.Fee.PaymentStatus.PAID)
                .mapToDouble(f -> f.getAmount() == null ? 0d : f.getAmount())
                .sum();

        // attendance — last 30 days
        LocalDate from = LocalDate.now().minusDays(30);
        var rows30 = attendanceRepository.findByStudentIdAndDateBetween(s.getId(), from, LocalDate.now());
        long present = rows30.stream()
                .filter(a -> a.getStatus() == com.hostel.entity.Attendance.AttendanceStatus.PRESENT)
                .count();
        int  attendancePct = rows30.isEmpty() ? 0 : (int) Math.round((present * 100.0) / rows30.size());

        // complaints
        var complaints = complaintRepository.findByStudentId(s.getId());
        long openComplaints = complaints.stream()
                .filter(c -> c.getComplaintStatus() != com.hostel.entity.Complaint.ComplaintStatus.RESOLVED
                          && c.getComplaintStatus() != com.hostel.entity.Complaint.ComplaintStatus.CLOSED)
                .count();

        // maintenance
        var mrs = maintenanceRepository.findByReportedById(s.getId());
        long openMaintenance = mrs.stream()
                .filter(r -> r.getStatus() != com.hostel.entity.MaintenanceRequest.Status.COMPLETED
                          && r.getStatus() != com.hostel.entity.MaintenanceRequest.Status.REJECTED)
                .count();

        Map<String, Object> out = new HashMap<>();
        out.put("studentId",       s.getId());
        out.put("name",            s.getName());
        out.put("rollNumber",      s.getRollNumber());
        out.put("roomNumber",      s.getRoomNumber());
        out.put("bedNumber",       s.getBedNumber());
        out.put("feesPaid",        paid);
        out.put("feesPending",     pending);
        out.put("feesStatus",      s.getFeesStatus() != null ? s.getFeesStatus().name() : "PENDING");
        out.put("attendancePct",   attendancePct);
        out.put("attendanceCount", rows30.size());
        out.put("openComplaints",  openComplaints);
        out.put("openMaintenance", openMaintenance);
        out.put("now",             LocalDateTime.now().toString());
        return ResponseEntity.ok(ApiResponse.success(out));
    }

    /* ── helpers ───────────────────────────────────────────────────── */

    private Student requireStudent(CustomUserDetails ud) {
        Long userId = ud.getUser().getId();
        return studentService.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No student profile is linked to this account. " +
                        "Ask the administrator to register you as a student."));
    }

    private static <E extends Enum<E>> E parseEnum(Class<E> type, String value, String name) {
        if (value == null) throw new BadRequestException(name + " is required");
        try {
            return Enum.valueOf(type, value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid " + name + ": " + value);
        }
    }

    private static String notBlank(String s, String message) {
        if (s == null || s.isBlank()) throw new BadRequestException(message);
        return s;
    }

    private static YearMonth resolveMonth(Integer year, Integer month) {
        YearMonth now = YearMonth.now();
        int y = year  != null ? year  : now.getYear();
        int m = month != null ? month : now.getMonthValue();
        if (m < 1 || m > 12) throw new BadRequestException("month must be 1..12");
        return YearMonth.of(y, m);
    }

    private StudentDTO toDTO(Student s) {
        return StudentDTO.builder()
                .id(s.getId())
                .name(s.getName())
                .email(s.getEmail())
                .phone(s.getPhone())
                .rollNumber(s.getRollNumber())
                .course(s.getCourse())
                .department(s.getDepartment())
                .year(s.getYear())
                .roomNumber(s.getRoomNumber())
                .bedNumber(s.getBedNumber())
                .guardianName(s.getGuardianName())
                .guardianPhone(s.getGuardianPhone())
                .address(s.getAddress())
                .dateOfBirth(s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : null)
                .gender(s.getGender())
                .bloodGroup(s.getBloodGroup())
                .feesStatus(s.getFeesStatus() != null ? s.getFeesStatus().name() : null)
                .profileImage(s.getProfileImage())
                .isActive(s.isActive())
                .admissionDate(s.getAdmissionDate() != null ? s.getAdmissionDate().toString() : null)
                .createdAt(s.getCreatedAt() != null ? s.getCreatedAt().toString() : null)
                .build();
    }
}
