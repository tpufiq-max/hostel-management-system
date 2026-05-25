package com.hostel.service;

import com.hostel.dto.EventDTO;
import com.hostel.entity.Event;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.CommonConverters;
import com.hostel.mapper.EventMapper;
import com.hostel.repository.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    public EventService(EventRepository eventRepository, EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.eventMapper = eventMapper;
    }

    @Transactional(readOnly = true)
    public Page<EventDTO> getAllEvents(@NonNull Pageable pageable) {
        return eventRepository.findAll(pageable).map(eventMapper::toDto);
    }

    @Transactional(readOnly = true)
    public EventDTO getEventById(@NonNull Long id) {
        return eventMapper.toDto(loadEvent(id));
    }

    @Transactional(readOnly = true)
    public Page<EventDTO> getEventsByStatus(String status, @NonNull Pageable pageable) {
        Event.Status statusEnum = CommonConverters.toEnum(Event.Status.class, status);
        return eventRepository.findByStatus(statusEnum, pageable).map(eventMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EventDTO> getEventsByCategory(String category, @NonNull Pageable pageable) {
        Event.Category categoryEnum = CommonConverters.toEnum(Event.Category.class, category);
        return eventRepository.findByCategory(categoryEnum, pageable).map(eventMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EventDTO> getEventsByDateRange(LocalDate start, LocalDate end, @NonNull Pageable pageable) {
        return eventRepository.findByEventDateBetween(start, end, pageable).map(eventMapper::toDto);
    }

    public EventDTO createEvent(EventDTO dto) {
        Event entity = eventMapper.toEntity(dto);
        return eventMapper.toDto(eventRepository.save(entity));
    }

    public EventDTO updateEvent(@NonNull Long id, EventDTO dto) {
        Event entity = loadEvent(id);
        eventMapper.updateEntityFromDto(dto, entity);
        return eventMapper.toDto(eventRepository.save(entity));
    }

    public void deleteEvent(@NonNull Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    private Event loadEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }
}
