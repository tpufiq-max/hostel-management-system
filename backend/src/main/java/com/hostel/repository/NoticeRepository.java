package com.hostel.repository;

import com.hostel.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    Page<Notice> findByIsActiveTrue(Pageable pageable);
    List<Notice> findByIsActiveTrue();
    Page<Notice> findByCategory(Notice.Category category, Pageable pageable);
    Page<Notice> findByTargetAudience(Notice.TargetAudience targetAudience, Pageable pageable);
    long countByIsActiveTrue();
}
