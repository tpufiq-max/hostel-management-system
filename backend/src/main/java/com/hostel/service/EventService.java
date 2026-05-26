package com.hostel.service;

import com.hostel.dto.EventDTO;
import com.hostel.entity.Event;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public Page<EventDTO> list(String status, String category, Pageable pageable) {
        Objects.requireNonNull(pageable, "Pageable must not be null");
        if (status != null && !status.isBlank()) {
            return eventRepository.findByStatus(parseStatus(status), pageable).map(this::mapToDTO);
        }
        if (category != null && !category.isBlank()) {
            return eventRepository.findByCategory(parseCategory(category), pageable).map(this::mapToDTO);
        }
        return eventRepository.findAll(pageable).map(this::mapToDTO);
    }

    public List<EventDTO> listInRange(String from, String to) {
        LocalDate fromDate = parseDate(from);
        LocalDate toDate = parseDate(to);
        if (fromDate == null || toDate == null) {
            throw new BadRequestException("Both 'from' and 'to' dates are required (yyyy-MM-dd)");
        }
        return eventRepository.findByEventDateBetween(fromDate, toDate).stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    public EventDTO getById(Long id) {
        return mapToDTO(loadOrFail(id));
    }

    public EventDTO create(EventDTO dto) {
        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .eventDate(parseDate(dto.getEventDate()))
                .startTime(parseTime(dto.getStartTime()))
                .endTime(parseTime(dto.getEndTime()))
                .venue(dto.getVenue())
                .organizer(dto.getOrganizer())
                .category(dto.getCategory() != null ? parseCategory(dto.getCategory()) : Event.Category.OTHER)
                .status(dto.getStatus() != null ? parseStatus(dto.getStatus()) : Event.Status.UPCOMING)
                .maxParticipants(dto.getMaxParticipants())
                .registeredCount(dto.getRegisteredCount() != null ? dto.getRegisteredCount() : 0)
                .build();
        return mapToDTO(eventRepository.save(Objects.requireNonNull(event)));
    }

    public EventDTO update(Long id, EventDTO dto) {
        Event e = loadOrFail(id);

        if (dto.getTitle() != null) e.setTitle(dto.getTitle());
        if (dto.getDescription() != null) e.setDescription(dto.getDescription());
        if (dto.getEventDate() != null) e.setEventDate(parseDate(dto.getEventDate()));
        if (dto.getStartTime() != null) e.setStartTime(parseTime(dto.getStartTime()));
        if (dto.getEndTime() != null) e.setEndTime(parseTime(dto.getEndTime()));
        if (dto.getVenue() != null) e.setVenue(dto.getVenue());
        if (dto.getOrganizer() != null) e.setOrganizer(dto.getOrganizer());
        if (dto.getCategory() != null) e.setCategory(parseCategory(dto.getCategory()));
        if (dto.getStatus() != null) e.setStatus(parseStatus(dto.getStatus()));
        if (dto.getMaxParticipants() != null) e.setMaxParticipants(dto.getMaxParticipants());
        if (dto.getRegisteredCount() != null) e.setRegisteredCount(dto.getRegisteredCount());

        return mapToDTO(eventRepository.save(Objects.requireNonNull(e)));
    }

    public void delete(Long id) {
        Objects.requireNonNull(id, "ID must not be null");
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    /* ── Helpers ─────────────────────────────────────────────── */

    private Event loadOrFail(Long id) {
        Objects.requireNonNull(id, "ID must not be null");
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    private static LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s); }
        catch (Exception e) { throw new BadRequestException("Invalid date (expected yyyy-MM-dd): " + s); }
    }

    private static LocalTime parseTime(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalTime.parse(s); }
        catch (Exception e) { throw new BadRequestException("Invalid time (expected HH:mm or HH:mm:ss): " + s); }
    }

    private static Event.Status parseStatus(String s) {
        try { return Event.Status.valueOf(s); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid status: " + s); }
    }

    private static Event.Category parseCategory(String s) {
        try { return Event.Category.valueOf(s); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid category: " + s); }
    }

    private EventDTO mapToDTO(Event e) {
        return EventDTO.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .eventDate(e.getEventDate() != null ? e.getEventDate().toString() : null)
                .startTime(e.getStartTime() != null ? e.getStartTime().toString() : null)
                .endTime(e.getEndTime() != null ? e.getEndTime().toString() : null)
                .venue(e.getVenue())
                .organizer(e.getOrganizer())
                .category(e.getCategory() != null ? e.getCategory().name() : null)
                .status(e.getStatus() != null ? e.getStatus().name() : null)
                .maxParticipants(e.getMaxParticipants())
                .registeredCount(e.getRegisteredCount())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .updatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().toString() : null)
                .build();
    }
}
