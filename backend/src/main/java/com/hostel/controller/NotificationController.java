package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.entity.Complaint;
import com.hostel.entity.Fee;
import com.hostel.entity.MaintenanceRequest;
import com.hostel.entity.Student;
import com.hostel.entity.Visitor;
import com.hostel.repository.ComplaintRepository;
import com.hostel.repository.FeeRepository;
import com.hostel.repository.MaintenanceRequestRepository;
import com.hostel.repository.NoticeRepository;
import com.hostel.repository.VisitorRepository;
import com.hostel.security.CustomUserDetails;
import com.hostel.service.StudentService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * /api/notifications — live, role-aware notification feed.
 *
 * Each user gets a different set:
 *   - ADMIN / WARDEN — operational signals across the whole hostel
 *     (open complaints, open maintenance, overdue fees, currently
 *     checked-in visitors, recent notices).
 *   - STUDENT — only their own situation (own pending fees, own open
 *     complaints / maintenance, latest active notices).
 *
 * Items are derived from existing data each call — there is no
 * separate notification table to keep in sync. Read-state is tracked
 * on the client (localStorage), so the server returns deterministic
 * stable IDs of the form {type}-{entityId}.
 */
@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
@Transactional(readOnly = true) // keep the Hibernate session open while we
                                // walk lazy associations (student, room, …)
public class NotificationController {

    private static final int MAX_PER_KIND = 5;

    private final ComplaintRepository          complaintRepository;
    private final MaintenanceRequestRepository maintenanceRepository;
    private final FeeRepository                feeRepository;
    private final VisitorRepository            visitorRepository;
    private final NoticeRepository             noticeRepository;
    private final StudentService               studentService;

    public NotificationController(ComplaintRepository complaintRepository,
                                  MaintenanceRequestRepository maintenanceRepository,
                                  FeeRepository feeRepository,
                                  VisitorRepository visitorRepository,
                                  NoticeRepository noticeRepository,
                                  StudentService studentService) {
        this.complaintRepository   = complaintRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.feeRepository         = feeRepository;
        this.visitorRepository     = visitorRepository;
        this.noticeRepository      = noticeRepository;
        this.studentService        = studentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> myFeed(
            @AuthenticationPrincipal CustomUserDetails ud) {
        String role = ud.getUser().getRole().name();
        List<Map<String, Object>> items = switch (role) {
            case "ADMIN", "WARDEN" -> staffFeed();
            case "STUDENT"         -> studentFeed(ud);
            default                -> new ArrayList<>();
        };

        // newest-first, capped at 20
        items.sort(Comparator.comparing(
                (Map<String, Object> m) -> (String) m.getOrDefault("createdAt", ""),
                Comparator.reverseOrder()
        ));
        if (items.size() > 20) items = items.subList(0, 20);

        return ResponseEntity.ok(ApiResponse.success(items));
    }

    /* ---------- ADMIN / WARDEN feed ---------- */

    private List<Map<String, Object>> staffFeed() {
        List<Map<String, Object>> out = new ArrayList<>();

        // Open complaints
        complaintRepository.findAll().stream()
                .filter(c -> c.getComplaintStatus() != Complaint.ComplaintStatus.RESOLVED
                          && c.getComplaintStatus() != Complaint.ComplaintStatus.CLOSED)
                .sorted(Comparator.comparing(Complaint::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(MAX_PER_KIND)
                .forEach(c -> {
                    String severity = c.getPriority() == Complaint.Priority.URGENT ? "danger"
                            : c.getPriority() == Complaint.Priority.HIGH ? "warning" : "accent";
                    String roomTag = (c.getStudent() != null && c.getStudent().getRoomNumber() != null)
                            ? " - Room " + c.getStudent().getRoomNumber() : "";
                    out.add(notif("complaint-" + c.getId(), "complaint", severity, "🔔",
                            "New complaint" + roomTag, c.getTitle(),
                            "/complaint", c.getCreatedAt()));
                });

        // Open maintenance
        maintenanceRepository.findAll().stream()
                .filter(r -> r.getStatus() != MaintenanceRequest.Status.COMPLETED
                          && r.getStatus() != MaintenanceRequest.Status.REJECTED)
                .sorted(Comparator.comparing(MaintenanceRequest::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(MAX_PER_KIND)
                .forEach(r -> {
                    String severity = r.getPriority() == MaintenanceRequest.Priority.URGENT
                            ? "danger" : "accent";
                    String catLabel = niceCategory(r.getCategory() != null ? r.getCategory().name() : "");
                    String prefix = r.getRoomNumber() != null ? "Room " + r.getRoomNumber() + " - " : "";
                    out.add(notif("maintenance-" + r.getId(), "maintenance", severity, "🔧",
                            "Maintenance: " + catLabel, prefix + r.getTitle(),
                            "/maintenance", r.getCreatedAt()));
                });

        // Overdue fees
        LocalDate today = LocalDate.now();
        feeRepository.findAll().stream()
                .filter(f -> f.getPaymentStatus() != Fee.PaymentStatus.PAID
                          && f.getDueDate() != null
                          && f.getDueDate().isBefore(today))
                .sorted(Comparator.comparing(Fee::getDueDate))
                .limit(MAX_PER_KIND)
                .forEach(f -> {
                    String roomTag = (f.getStudent() != null && f.getStudent().getRoomNumber() != null)
                            ? " - Room " + f.getStudent().getRoomNumber() : "";
                    out.add(notif("fee-" + f.getId(), "fee", "warning", "💰",
                            "Fee overdue" + roomTag,
                            money(f.getAmount()) + " due " + f.getDueDate(),
                            "/fees", f.getDueDate().atStartOfDay()));
                });

        // Visitors currently checked-in
        visitorRepository.findAll().stream()
                .filter(v -> v.getStatus() == Visitor.Status.CHECKED_IN)
                .sorted(Comparator.comparing(Visitor::getCheckInTime,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(MAX_PER_KIND)
                .forEach(v -> out.add(notif("visitor-" + v.getId(), "visitor", "success", "👤",
                        "Visitor: " + v.getVisitorName(),
                        v.getRelation() != null ? v.getRelation().name() : "",
                        "/visitor", v.getCheckInTime())));

        // Latest active notices
        noticeRepository.findByIsActiveTrue(PageRequest.of(0, 3)).forEach(n -> {
            String snippet = n.getContent() != null && n.getContent().length() > 80
                    ? n.getContent().substring(0, 80) + "…" : n.getContent();
            out.add(notif("notice-" + n.getId(), "notice", "accent", "📢",
                    n.getTitle(), snippet, "/notice", n.getPublishedAt()));
        });

        return out;
    }

    /* ---------- STUDENT feed ---------- */

    private List<Map<String, Object>> studentFeed(CustomUserDetails ud) {
        List<Map<String, Object>> out = new ArrayList<>();
        Student me = studentService.findByUserId(ud.getUser().getId()).orElse(null);

        if (me != null) {
            LocalDate today = LocalDate.now();

            // Own pending / overdue fees
            feeRepository.findByStudentId(me.getId()).stream()
                    .filter(f -> f.getPaymentStatus() != Fee.PaymentStatus.PAID)
                    .sorted(Comparator.comparing(Fee::getDueDate,
                            Comparator.nullsLast(Comparator.naturalOrder())))
                    .limit(MAX_PER_KIND)
                    .forEach(f -> {
                        boolean overdue = f.getDueDate() != null && f.getDueDate().isBefore(today);
                        String when = f.getDueDate() != null ? " due " + f.getDueDate() : "";
                        out.add(notif("fee-" + f.getId(), "fee",
                                overdue ? "danger" : "warning", "💰",
                                overdue ? "Fee overdue" : "Fee pending",
                                money(f.getAmount()) + when,
                                "/me/fees",
                                f.getDueDate() != null ? f.getDueDate().atStartOfDay() : f.getCreatedAt()));
                    });

            // Own complaints
            complaintRepository.findByStudentId(me.getId()).stream()
                    .sorted(Comparator.comparing(Complaint::getCreatedAt,
                            Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(MAX_PER_KIND)
                    .forEach(c -> {
                        boolean done = c.getComplaintStatus() == Complaint.ComplaintStatus.RESOLVED;
                        String label = c.getComplaintStatus() != null
                                ? c.getComplaintStatus().name().toLowerCase() : "open";
                        out.add(notif("complaint-" + c.getId(), "complaint",
                                done ? "success" : "accent",
                                done ? "✅" : "🔔",
                                "Complaint " + label, c.getTitle(),
                                "/me/complaints", c.getCreatedAt()));
                    });

            // Own maintenance
            maintenanceRepository.findByReportedById(me.getId()).stream()
                    .sorted(Comparator.comparing(MaintenanceRequest::getCreatedAt,
                            Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(MAX_PER_KIND)
                    .forEach(r -> {
                        boolean done = r.getStatus() == MaintenanceRequest.Status.COMPLETED;
                        String label = r.getStatus() != null ? r.getStatus().name().toLowerCase() : "open";
                        out.add(notif("maintenance-" + r.getId(), "maintenance",
                                done ? "success" : "accent",
                                done ? "✅" : "🔧",
                                "Maintenance " + label, r.getTitle(),
                                "/me/maintenance", r.getCreatedAt()));
                    });
        }

        // Active notices visible to everyone
        noticeRepository.findByIsActiveTrue(PageRequest.of(0, 5)).forEach(n -> {
            String severity = n.getPriority() != null && n.getPriority().name().equals("URGENT")
                    ? "danger" : "accent";
            String snippet = n.getContent() != null && n.getContent().length() > 80
                    ? n.getContent().substring(0, 80) + "…" : n.getContent();
            out.add(notif("notice-" + n.getId(), "notice", severity, "📢",
                    n.getTitle(), snippet, "/me/notices", n.getPublishedAt()));
        });

        return out;
    }

    /* ---------- helpers ---------- */

    private static Map<String, Object> notif(String id, String type, String severity, String icon,
                                             String title, String message, String link, LocalDateTime when) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",           id);
        m.put("type",         type);
        m.put("severity",     severity);
        m.put("icon",         icon);
        m.put("title",        title);
        m.put("message",      message);
        m.put("link",         link);
        m.put("createdAt",    when != null ? when.toString() : LocalDateTime.now().toString());
        m.put("relativeTime", relativeTime(when));
        return m;
    }

    private static String niceCategory(String s) {
        if (s == null || s.isBlank()) return "request";
        return s.substring(0, 1) + s.substring(1).toLowerCase();
    }

    private static String money(Double n) {
        if (n == null) return "₹ 0";
        return "₹ " + String.format("%,d", n.longValue());
    }

    private static String relativeTime(LocalDateTime when) {
        if (when == null) return "";
        long minutes = ChronoUnit.MINUTES.between(when, LocalDateTime.now());
        if (minutes < 1)  return "just now";
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24)   return hours + "h ago";
        long days = hours / 24;
        if (days < 7)     return days + "d ago";
        return when.toLocalDate().toString();
    }
}
