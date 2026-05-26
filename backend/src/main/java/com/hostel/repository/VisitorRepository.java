package com.hostel.repository;

import com.hostel.entity.Visitor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    Page<Visitor> findByStatus(Visitor.Status status, Pageable pageable);
    List<Visitor> findByStudentId(Long studentId);
    long countByStatus(Visitor.Status status);
}
