package com.hostel.service;

import com.hostel.dto.DashboardStatsDTO;
import com.hostel.entity.*;
import com.hostel.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class DashboardService {

    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final FeeRepository feeRepository;
    private final ComplaintRepository complaintRepository;
    private final VisitorRepository visitorRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final EventRepository eventRepository;
    private final NoticeRepository noticeRepository;
    private final AttendanceRepository attendanceRepository;

    public DashboardService(StudentRepository studentRepository, RoomRepository roomRepository,
                            FeeRepository feeRepository, ComplaintRepository complaintRepository,
                            VisitorRepository visitorRepository,
                            MaintenanceRequestRepository maintenanceRequestRepository,
                            EventRepository eventRepository,
                            NoticeRepository noticeRepository,
                            AttendanceRepository attendanceRepository) {
        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
        this.feeRepository = feeRepository;
        this.complaintRepository = complaintRepository;
        this.visitorRepository = visitorRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.eventRepository = eventRepository;
        this.noticeRepository = noticeRepository;
        this.attendanceRepository = attendanceRepository;
    }

    public DashboardStatsDTO getDashboardStats() {
        long totalStudents = studentRepository.count();
        long activeStudents = studentRepository.countByIsActiveTrue();
        long totalRooms = roomRepository.count();
        long occupiedRooms = roomRepository.countByStatus(Room.RoomStatus.OCCUPIED);
        double totalRevenue = feeRepository.getTotalRevenue();
        double pendingPayments = feeRepository.getPendingAmount();
        long totalComplaints = complaintRepository.count();
        long resolvedComplaints = complaintRepository.countByComplaintStatus(Complaint.ComplaintStatus.RESOLVED);
        long openComplaints = complaintRepository.countByComplaintStatus(Complaint.ComplaintStatus.OPEN);
        double occupancyRate = totalRooms > 0 ? ((double) occupiedRooms / totalRooms) * 100 : 0;

        long activeVisitors = visitorRepository.countByStatus(Visitor.Status.CHECKED_IN);
        long openMaintenanceRequests = maintenanceRequestRepository.countByStatus(MaintenanceRequest.Status.OPEN);
        long upcomingEvents = eventRepository.countByStatusAndEventDateAfter(Event.Status.UPCOMING, LocalDate.now().minusDays(1));
        long activeNotices = noticeRepository.countByIsActiveTrue();

        LocalDate today = LocalDate.now();
        long presentToday = attendanceRepository.countByDateAndStatus(today, Attendance.AttendanceStatus.PRESENT);
        long totalToday = attendanceRepository.countByDate(today);
        double todayAttendancePercentage = totalToday > 0 ? ((double) presentToday / totalToday) * 100 : 0;

        return DashboardStatsDTO.builder()
                .totalStudents(totalStudents)
                .activeStudents(activeStudents)
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .totalRevenue(totalRevenue)
                .pendingPayments(pendingPayments)
                .totalComplaints(totalComplaints)
                .resolvedComplaints(resolvedComplaints)
                .openComplaints(openComplaints)
                .occupancyRate(occupancyRate)
                .activeVisitors(activeVisitors)
                .todayAttendancePercentage(todayAttendancePercentage)
                .openMaintenanceRequests(openMaintenanceRequests)
                .upcomingEvents(upcomingEvents)
                .activeNotices(activeNotices)
                .build();
    }
}
