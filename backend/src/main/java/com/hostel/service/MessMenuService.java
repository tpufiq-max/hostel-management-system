package com.hostel.service;

import com.hostel.dto.MessMenuDTO;
import com.hostel.entity.MessMenu;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.MessMenuRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Objects;

@Service
@Transactional
public class MessMenuService {

    private final MessMenuRepository messMenuRepository;

    public MessMenuService(MessMenuRepository messMenuRepository) {
        this.messMenuRepository = messMenuRepository;
    }

    public Page<MessMenuDTO> list(String day, String mealType, Pageable pageable) {
        Objects.requireNonNull(pageable, "Pageable must not be null");
        if (day != null && !day.isBlank()) {
            return messMenuRepository.findByDay(parseDay(day), pageable).map(this::mapToDTO);
        }
        if (mealType != null && !mealType.isBlank()) {
            return messMenuRepository.findByMealType(parseMealType(mealType), pageable).map(this::mapToDTO);
        }
        return messMenuRepository.findAll(pageable).map(this::mapToDTO);
    }

    public MessMenuDTO getById(Long id) {
        return mapToDTO(loadOrFail(id));
    }

    public MessMenuDTO create(MessMenuDTO dto) {
        MessMenu menu = MessMenu.builder()
                .day(parseDay(dto.getDay()))
                .mealType(parseMealType(dto.getMealType()))
                .items(dto.getItems())
                .specialNote(dto.getSpecialNote())
                .isActive(dto.getIsActive() == null || dto.getIsActive())
                .effectiveFrom(parseDate(dto.getEffectiveFrom()))
                .build();
        try {
            return mapToDTO(messMenuRepository.save(Objects.requireNonNull(menu)));
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException(
                    "A menu already exists for " + dto.getDay() + " / " + dto.getMealType()
                            + ". Update it instead of creating a duplicate.");
        }
    }

    public MessMenuDTO update(Long id, MessMenuDTO dto) {
        MessMenu m = loadOrFail(id);

        if (dto.getDay() != null) m.setDay(parseDay(dto.getDay()));
        if (dto.getMealType() != null) m.setMealType(parseMealType(dto.getMealType()));
        if (dto.getItems() != null) m.setItems(dto.getItems());
        if (dto.getSpecialNote() != null) m.setSpecialNote(dto.getSpecialNote());
        if (dto.getIsActive() != null) m.setActive(dto.getIsActive());
        if (dto.getEffectiveFrom() != null) m.setEffectiveFrom(parseDate(dto.getEffectiveFrom()));

        return mapToDTO(messMenuRepository.save(Objects.requireNonNull(m)));
    }

    public void delete(Long id) {
        Objects.requireNonNull(id, "ID must not be null");
        if (!messMenuRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mess menu not found with id: " + id);
        }
        messMenuRepository.deleteById(id);
    }

    /* ── Helpers ─────────────────────────────────────────────── */

    private MessMenu loadOrFail(Long id) {
        Objects.requireNonNull(id, "ID must not be null");
        return messMenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mess menu not found with id: " + id));
    }

    private static LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s); }
        catch (Exception e) { throw new BadRequestException("Invalid date (expected yyyy-MM-dd): " + s); }
    }

    private static MessMenu.Day parseDay(String s) {
        try { return MessMenu.Day.valueOf(s); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid day (expected MON..SUN): " + s); }
    }

    private static MessMenu.MealType parseMealType(String s) {
        try { return MessMenu.MealType.valueOf(s); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid meal type: " + s); }
    }

    private MessMenuDTO mapToDTO(MessMenu m) {
        return MessMenuDTO.builder()
                .id(m.getId())
                .day(m.getDay() != null ? m.getDay().name() : null)
                .mealType(m.getMealType() != null ? m.getMealType().name() : null)
                .items(m.getItems())
                .specialNote(m.getSpecialNote())
                .isActive(m.isActive())
                .effectiveFrom(m.getEffectiveFrom() != null ? m.getEffectiveFrom().toString() : null)
                .createdAt(m.getCreatedAt() != null ? m.getCreatedAt().toString() : null)
                .updatedAt(m.getUpdatedAt() != null ? m.getUpdatedAt().toString() : null)
                .build();
    }
}
