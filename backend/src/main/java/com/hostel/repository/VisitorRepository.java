package com.hostel.repository;

import com.hostel.entity.Visitor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    Page<Visitor> findByStatus(Visitor.Status status, Pageable pageable);
    Page<Visitor> findByCheckInTimeBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
    Page<Visitor> findByStudentId(Long studentId, Pageable pageable);
    long countByStatus(Visitor.Status status);
}
