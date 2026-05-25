package com.hostel.repository;

import com.hostel.entity.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long> {
    List<Allocation> findByStudentId(Long studentId);
    List<Allocation> findByRoomId(Long roomId);
    boolean existsByStudentIdAndRoomId(Long studentId, Long roomId);
}
