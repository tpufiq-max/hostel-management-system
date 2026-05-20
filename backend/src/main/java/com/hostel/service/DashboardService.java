package com.hostel.service;

import com.hostel.dto.DashboardStatsDTO;
import com.hostel.entity.Complaint;
import com.hostel.entity.Room;
import com.hostel.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final FeeRepository feeRepository;
    private final ComplaintRepository complaintRepository;

    public DashboardService(StudentRepository studentRepository, RoomRepository roomRepository,
                            FeeRepository feeRepository, ComplaintRepository complaintRepository) {
        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
        this.feeRepository = feeRepository;
        this.complaintRepository = complaintRepository;
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
                .build();
    }
}
