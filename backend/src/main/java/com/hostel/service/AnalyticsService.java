package com.hostel.service;

import com.hostel.dto.*;
import com.hostel.entity.*;
import com.hostel.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final FeeRepository feeRepository;
    private final ComplaintRepository complaintRepository;
    private final AttendanceRepository attendanceRepository;
    private final VisitorRepository visitorRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final NoticeRepository noticeRepository;
    private final EventRepository eventRepository;

    public AnalyticsService(StudentRepository studentRepository,
                            RoomRepository roomRepository,
                            FeeRepository feeRepository,
                            ComplaintRepository complaintRepository,
                            AttendanceRepository attendanceRepository,
                            VisitorRepository visitorRepository,
                            MaintenanceRequestRepository maintenanceRequestRepository,
                            NoticeRepository noticeRepository,
                            EventRepository eventRepository) {
        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
        this.feeRepository = feeRepository;
        this.complaintRepository = complaintRepository;
        this.attendanceRepository = attendanceRepository;
        this.visitorRepository = visitorRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.noticeRepository = noticeRepository;
        this.eventRepository = eventRepository;
    }

    public AnalyticsSummaryDTO getSummary() {
        long totalStudents = studentRepository.count();
        long totalRooms = roomRepository.count();
        long occupiedRooms = roomRepository.countByStatus(Room.RoomStatus.OCCUPIED);
        double totalRevenue = feeRepository.getTotalRevenue();
        double pendingFees = feeRepository.getPendingAmount();
        long openComplaints = complaintRepository.countByComplaintStatus(Complaint.ComplaintStatus.OPEN);
        long activeVisitors = visitorRepository.countByStatus(Visitor.Status.CHECKED_IN);
        long openMaintenanceRequests = maintenanceRequestRepository.countByStatus(MaintenanceRequest.Status.OPEN);
        long activeNotices = noticeRepository.countByIsActiveTrue();
        long upcomingEvents = eventRepository.countByStatusAndEventDateAfter(Event.Status.UPCOMING, LocalDate.now().minusDays(1));

        return AnalyticsSummaryDTO.builder()
                .totalStudents(totalStudents)
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .totalRevenue(totalRevenue)
                .pendingFees(pendingFees)
                .openComplaints(openComplaints)
                .activeVisitors(activeVisitors)
                .openMaintenanceRequests(openMaintenanceRequests)
                .activeNotices(activeNotices)
                .upcomingEvents(upcomingEvents)
                .build();
    }

    public RevenueAnalyticsDTO getRevenue() {
        List<Object[]> monthlyData = feeRepository.getMonthlyRevenue();
        double totalRevenue = feeRepository.getTotalRevenue();

        List<RevenueAnalyticsDTO.MonthlyRevenue> monthlyRevenue = monthlyData.stream()
                .map(row -> RevenueAnalyticsDTO.MonthlyRevenue.builder()
                        .month(String.valueOf(row[0]))
                        .amount(((Number) row[1]).doubleValue())
                        .build())
                .collect(Collectors.toList());

        return RevenueAnalyticsDTO.builder()
                .monthlyRevenue(monthlyRevenue)
                .totalRevenue(totalRevenue)
                .build();
    }

    public OccupancyAnalyticsDTO getOccupancy() {
        long totalRooms = roomRepository.count();
        long occupied = roomRepository.countByStatus(Room.RoomStatus.OCCUPIED);
        long available = roomRepository.countByStatus(Room.RoomStatus.AVAILABLE);
        long underMaintenance = roomRepository.countByStatus(Room.RoomStatus.MAINTENANCE);
        double occupancyRate = totalRooms > 0 ? ((double) occupied / totalRooms) * 100 : 0;

        return OccupancyAnalyticsDTO.builder()
                .occupied(occupied)
                .available(available)
                .underMaintenance(underMaintenance)
                .occupancyRate(occupancyRate)
                .build();
    }

    public ComplaintAnalyticsDTO getComplaints() {
        long open = complaintRepository.countByComplaintStatus(Complaint.ComplaintStatus.OPEN);
        long inProgress = complaintRepository.countByComplaintStatus(Complaint.ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByComplaintStatus(Complaint.ComplaintStatus.RESOLVED);
        long closed = complaintRepository.countByComplaintStatus(Complaint.ComplaintStatus.CLOSED);

        List<Object[]> categoryData = complaintRepository.countGroupedByCategory();
        List<ComplaintAnalyticsDTO.CategoryCount> categoryBreakdown = categoryData.stream()
                .map(row -> ComplaintAnalyticsDTO.CategoryCount.builder()
                        .category(row[0].toString())
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());

        return ComplaintAnalyticsDTO.builder()
                .open(open)
                .inProgress(inProgress)
                .resolved(resolved)
                .closed(closed)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }

    public AttendanceAnalyticsDTO getAttendance() {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(7);

        List<Object[]> rawData = attendanceRepository.countByDateRangeGrouped(startDate, endDate);

        Map<LocalDate, Long> presentMap = new HashMap<>();
        Map<LocalDate, Long> absentMap = new HashMap<>();
        Map<LocalDate, Long> totalMap = new HashMap<>();

        for (Object[] row : rawData) {
            LocalDate date = (LocalDate) row[0];
            Attendance.AttendanceStatus status = (Attendance.AttendanceStatus) row[1];
            long count = ((Number) row[2]).longValue();

            totalMap.merge(date, count, Long::sum);
            if (status == Attendance.AttendanceStatus.PRESENT || status == Attendance.AttendanceStatus.LATE) {
                presentMap.merge(date, count, Long::sum);
            } else {
                absentMap.merge(date, count, Long::sum);
            }
        }

        List<AttendanceAnalyticsDTO.DailyAttendance> dailyAttendance = totalMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    long total = entry.getValue();
                    long present = presentMap.getOrDefault(date, 0L);
                    long absent = absentMap.getOrDefault(date, 0L);
                    double percentage = total > 0 ? ((double) present / total) * 100 : 0;
                    return AttendanceAnalyticsDTO.DailyAttendance.builder()
                            .date(date.toString())
                            .presentCount(present)
                            .absentCount(absent)
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());

        return AttendanceAnalyticsDTO.builder()
                .dailyAttendance(dailyAttendance)
                .build();
    }
}
