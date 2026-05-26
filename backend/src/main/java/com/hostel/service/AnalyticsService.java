package com.hostel.service;

import com.hostel.dto.AnalyticsDTO;
import com.hostel.entity.*;
import com.hostel.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final StudentRepository    studentRepository;
    private final RoomRepository       roomRepository;
    private final FeeRepository        feeRepository;
    private final ComplaintRepository  complaintRepository;
    private final AttendanceRepository attendanceRepository;
    private final VisitorRepository    visitorRepository;
    private final MaintenanceRequestRepository maintenanceRepository;
    private final NoticeRepository     noticeRepository;
    private final EventRepository      eventRepository;

    public AnalyticsService(StudentRepository studentRepository,
                            RoomRepository roomRepository,
                            FeeRepository feeRepository,
                            ComplaintRepository complaintRepository,
                            AttendanceRepository attendanceRepository,
                            VisitorRepository visitorRepository,
                            MaintenanceRequestRepository maintenanceRepository,
                            NoticeRepository noticeRepository,
                            EventRepository eventRepository) {
        this.studentRepository    = studentRepository;
        this.roomRepository       = roomRepository;
        this.feeRepository        = feeRepository;
        this.complaintRepository  = complaintRepository;
        this.attendanceRepository = attendanceRepository;
        this.visitorRepository    = visitorRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.noticeRepository     = noticeRepository;
        this.eventRepository      = eventRepository;
    }

    public AnalyticsDTO getAnalytics() {

        // ── Students ─────────────────────────────────────────────
        long totalStudents  = studentRepository.count();
        long activeStudents = studentRepository.countByIsActiveTrue();

        // ── Rooms ────────────────────────────────────────────────
        long totalRooms     = roomRepository.count();
        long occupiedRooms  = roomRepository.countByStatus(Room.RoomStatus.OCCUPIED);
        long availableRooms = roomRepository.countByStatus(Room.RoomStatus.AVAILABLE);
        double occupancyRate = totalRooms > 0
                ? Math.round((occupiedRooms * 100.0 / totalRooms) * 10.0) / 10.0
                : 0.0;

        // ── Revenue ──────────────────────────────────────────────
        double totalRevenue   = feeRepository.getTotalRevenue();
        double pendingRevenue = feeRepository.getPendingAmount();

        // Monthly revenue — last 6 months bucketed in Java
        // (avoids dialect-specific SQL date functions)
        List<AnalyticsDTO.MonthlyRevenue> monthlyRevenue = buildMonthlyRevenue();

        // ── Complaints ───────────────────────────────────────────
        long totalComplaints      = complaintRepository.count();
        long openComplaints       = complaintRepository.countByComplaintStatus(Complaint.ComplaintStatus.OPEN);
        long resolvedComplaints   = complaintRepository.countByComplaintStatus(Complaint.ComplaintStatus.RESOLVED);
        long inProgressComplaints = complaintRepository.countByComplaintStatus(Complaint.ComplaintStatus.IN_PROGRESS);

        List<AnalyticsDTO.ComplaintByCategory> complaintsByCategory = buildComplaintsByCategory();

        // ── Attendance — last 7 days ──────────────────────────────
        List<AnalyticsDTO.DailyAttendance> dailyAttendance = buildDailyAttendance(7);

        // ── Visitors ────────────────────────────────────────────
        long checkedIn  = visitorRepository.countByStatus(Visitor.Status.CHECKED_IN);
        long checkedOut = visitorRepository.countByStatus(Visitor.Status.CHECKED_OUT);

        // ── Maintenance ──────────────────────────────────────────
        long openMaintenance      = maintenanceRepository.countByStatus(MaintenanceRequest.Status.OPEN);
        long completedMaintenance = maintenanceRepository.countByStatus(MaintenanceRequest.Status.COMPLETED);

        // ── Notices / Events ─────────────────────────────────────
        long activeNotices  = noticeRepository.countByIsActiveTrue();
        long upcomingEvents = eventRepository.countByStatus(Event.Status.UPCOMING);

        return AnalyticsDTO.builder()
                .totalStudents(totalStudents)
                .activeStudents(activeStudents)
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .availableRooms(availableRooms)
                .occupancyRate(occupancyRate)
                .totalRevenue(totalRevenue)
                .pendingRevenue(pendingRevenue)
                .monthlyRevenue(monthlyRevenue)
                .totalComplaints(totalComplaints)
                .openComplaints(openComplaints)
                .resolvedComplaints(resolvedComplaints)
                .inProgressComplaints(inProgressComplaints)
                .complaintsByCategory(complaintsByCategory)
                .dailyAttendance(dailyAttendance)
                .checkedInVisitors(checkedIn)
                .checkedOutVisitors(checkedOut)
                .openMaintenanceRequests(openMaintenance)
                .completedMaintenanceRequests(completedMaintenance)
                .activeNotices(activeNotices)
                .upcomingEvents(upcomingEvents)
                .build();
    }

    /* ── helpers ─────────────────────────────────────────────── */

    private List<AnalyticsDTO.MonthlyRevenue> buildMonthlyRevenue() {
        // Load all PAID fee records and bucket them by month (last 6 months)
        List<com.hostel.entity.Fee> paidFees = feeRepository.findByPaymentStatus(
                Fee.PaymentStatus.PAID,
                org.springframework.data.domain.Pageable.unpaged()).getContent();

        LocalDate now = LocalDate.now();
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM");

        // Build ordered month buckets for last 6 months
        List<LocalDate> months = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            months.add(now.minusMonths(i).withDayOfMonth(1));
        }

        Map<String, Double> buckets = new LinkedHashMap<>();
        for (LocalDate m : months) {
            buckets.put(m.format(monthFmt), 0.0);
        }

        for (com.hostel.entity.Fee f : paidFees) {
            if (f.getPaymentDate() == null) continue;
            LocalDate pd = f.getPaymentDate();
            // Only include if within last 6 months
            if (pd.isBefore(months.get(0)) || pd.isAfter(now)) continue;
            String key = pd.withDayOfMonth(1).format(monthFmt);
            buckets.merge(key, f.getAmount(), Double::sum);
        }

        return buckets.entrySet().stream()
                .map(e -> AnalyticsDTO.MonthlyRevenue.builder()
                        .month(e.getKey())
                        .amount(Math.round(e.getValue() * 100.0) / 100.0)
                        .build())
                .collect(Collectors.toList());
    }

    private List<AnalyticsDTO.ComplaintByCategory> buildComplaintsByCategory() {
        // Load all complaints; group in Java to avoid native SQL
        List<com.hostel.entity.Complaint> all = complaintRepository.findAll();

        Map<String, Long> countMap = all.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCategory() != null ? c.getCategory().name() : "OTHER",
                        Collectors.counting()
                ));

        return countMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> AnalyticsDTO.ComplaintByCategory.builder()
                        .category(e.getKey())
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<AnalyticsDTO.DailyAttendance> buildDailyAttendance(int days) {
        LocalDate today = LocalDate.now();
        List<AnalyticsDTO.DailyAttendance> result = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long present = attendanceRepository.countByDateAndStatus(date, Attendance.AttendanceStatus.PRESENT);
            long absent  = attendanceRepository.countByDateAndStatus(date, Attendance.AttendanceStatus.ABSENT);
            long late    = attendanceRepository.countByDateAndStatus(date, Attendance.AttendanceStatus.LATE);
            long leave   = attendanceRepository.countByDateAndStatus(date, Attendance.AttendanceStatus.LEAVE);
            long total   = present + absent + late + leave;
            double pct   = total > 0 ? Math.round((present * 100.0 / total) * 10.0) / 10.0 : 0.0;

            result.add(AnalyticsDTO.DailyAttendance.builder()
                    .date(date.format(fmt))
                    .present(present)
                    .absent(absent)
                    .late(late)
                    .leave(leave)
                    .total(total)
                    .presentPct(pct)
                    .build());
        }

        return result;
    }
}
