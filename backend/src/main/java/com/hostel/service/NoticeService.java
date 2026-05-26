package com.hostel.service;

import com.hostel.dto.NoticeDTO;
import com.hostel.entity.Notice;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.NoticeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@Transactional
public class NoticeService {

    private final NoticeRepository noticeRepository;

    public NoticeService(NoticeRepository noticeRepository) {
        this.noticeRepository = noticeRepository;
    }

    public Page<NoticeDTO> list(String category, String priority, Boolean active, Pageable pageable) {
        Objects.requireNonNull(pageable, "Pageable must not be null");
        if (category != null && !category.isBlank()) {
            return noticeRepository.findByCategory(parseCategory(category), pageable).map(this::mapToDTO);
        }
        if (priority != null && !priority.isBlank()) {
            return noticeRepository.findByPriority(parsePriority(priority), pageable).map(this::mapToDTO);
        }
        if (Boolean.TRUE.equals(active)) {
            return noticeRepository.findByIsActiveTrue(pageable).map(this::mapToDTO);
        }
        return noticeRepository.findAll(pageable).map(this::mapToDTO);
    }

    public NoticeDTO getById(Long id) {
        return mapToDTO(loadOrFail(id));
    }

    public NoticeDTO create(NoticeDTO dto) {
        Notice notice = Notice.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .category(dto.getCategory() != null ? parseCategory(dto.getCategory()) : Notice.Category.GENERAL)
                .priority(dto.getPriority() != null ? parsePriority(dto.getPriority()) : Notice.Priority.NORMAL)
                .publishedBy(dto.getPublishedBy())
                .publishedAt(LocalDateTime.now())
                .expiresAt(parseDateTime(dto.getExpiresAt()))
                .isActive(dto.getIsActive() == null || dto.getIsActive())
                .targetAudience(dto.getTargetAudience() != null ? parseAudience(dto.getTargetAudience()) : Notice.TargetAudience.ALL)
                .build();
        return mapToDTO(noticeRepository.save(Objects.requireNonNull(notice)));
    }

    public NoticeDTO update(Long id, NoticeDTO dto) {
        Notice n = loadOrFail(id);

        if (dto.getTitle() != null) n.setTitle(dto.getTitle());
        if (dto.getContent() != null) n.setContent(dto.getContent());
        if (dto.getCategory() != null) n.setCategory(parseCategory(dto.getCategory()));
        if (dto.getPriority() != null) n.setPriority(parsePriority(dto.getPriority()));
        if (dto.getPublishedBy() != null) n.setPublishedBy(dto.getPublishedBy());
        if (dto.getExpiresAt() != null) n.setExpiresAt(parseDateTime(dto.getExpiresAt()));
        if (dto.getIsActive() != null) n.setActive(dto.getIsActive());
        if (dto.getTargetAudience() != null) n.setTargetAudience(parseAudience(dto.getTargetAudience()));

        return mapToDTO(noticeRepository.save(Objects.requireNonNull(n)));
    }

    public void delete(Long id) {
        Objects.requireNonNull(id, "ID must not be null");
        if (!noticeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notice not found with id: " + id);
        }
        noticeRepository.deleteById(id);
    }

    /* ── Helpers ─────────────────────────────────────────────── */

    private Notice loadOrFail(Long id) {
        Objects.requireNonNull(id, "ID must not be null");
        return noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found with id: " + id));
    }

    private static LocalDateTime parseDateTime(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDateTime.parse(s);
        } catch (Exception e) {
            throw new BadRequestException("Invalid datetime (expected ISO-8601): " + s);
        }
    }

    private static Notice.Category parseCategory(String s) {
        try { return Notice.Category.valueOf(s); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid category: " + s); }
    }

    private static Notice.Priority parsePriority(String s) {
        try { return Notice.Priority.valueOf(s); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid priority: " + s); }
    }

    private static Notice.TargetAudience parseAudience(String s) {
        try { return Notice.TargetAudience.valueOf(s); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid target audience: " + s); }
    }

    private NoticeDTO mapToDTO(Notice n) {
        return NoticeDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .category(n.getCategory() != null ? n.getCategory().name() : null)
                .priority(n.getPriority() != null ? n.getPriority().name() : null)
                .publishedBy(n.getPublishedBy())
                .publishedAt(n.getPublishedAt() != null ? n.getPublishedAt().toString() : null)
                .expiresAt(n.getExpiresAt() != null ? n.getExpiresAt().toString() : null)
                .isActive(n.isActive())
                .targetAudience(n.getTargetAudience() != null ? n.getTargetAudience().name() : null)
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null)
                .updatedAt(n.getUpdatedAt() != null ? n.getUpdatedAt().toString() : null)
                .build();
    }
}
