package com.hostel.repository;

import com.hostel.entity.MaintenanceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    Page<MaintenanceRequest> findByStatus(MaintenanceRequest.Status status, Pageable pageable);
    Page<MaintenanceRequest> findByPriority(MaintenanceRequest.Priority priority, Pageable pageable);
    Page<MaintenanceRequest> findByCategory(MaintenanceRequest.Category category, Pageable pageable);
    List<MaintenanceRequest> findByReportedById(Long studentId);
    long countByStatus(MaintenanceRequest.Status status);
}
