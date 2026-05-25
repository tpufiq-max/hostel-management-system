package com.hostel.repository;

import com.hostel.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Page<Event> findByStatus(Event.Status status, Pageable pageable);
    Page<Event> findByCategory(Event.Category category, Pageable pageable);
    Page<Event> findByEventDateBetween(LocalDate start, LocalDate end, Pageable pageable);
    long countByStatusAndEventDateAfter(Event.Status status, LocalDate date);
}
