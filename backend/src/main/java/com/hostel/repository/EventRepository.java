package com.hostel.repository;

import com.hostel.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Page<Event> findByStatus(Event.Status status, Pageable pageable);
    Page<Event> findByCategory(Event.Category category, Pageable pageable);
    List<Event> findByEventDateBetween(LocalDate from, LocalDate to);
    long countByStatus(Event.Status status);
    long countByStatusAndEventDateAfter(Event.Status status, LocalDate date);
}
