package com.hostel.repository;

import com.hostel.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    Page<Notice> findByCategory(Notice.Category category, Pageable pageable);
    Page<Notice> findByPriority(Notice.Priority priority, Pageable pageable);
    Page<Notice> findByIsActiveTrue(Pageable pageable);
    long countByIsActiveTrue();
}
