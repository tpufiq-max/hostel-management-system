package com.hostel.service;

import com.hostel.dto.MaintenanceRequestDTO;
import com.hostel.entity.MaintenanceRequest;
import com.hostel.entity.Student;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.MaintenanceRequestRepository;
import com.hostel.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Objects;

@Service
@Transactional
public class MaintenanceRequestService {

    private final MaintenanceRequestRepository maintenanceRepository;
    private final StudentRepository studentRepository;

    public MaintenanceRequestService(MaintenanceRequestRepository maintenanceRepository,
                                     StudentRepository studentRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.studentRepository = studentRepository;
    }

    public Page<MaintenanceRequestDTO> list(String status, String priority, String category, Pageable pageable) {
        Objects.requireNonNull(pageable, "Pageable must not be null");
        if (status != null && !status.isBlank()) {
            return maintenanceRepository.findByStatus(parseStatus(status), pageable).map(this::mapToDTO);
        }
        if (priority != null && !priority.isBlank()) {
            return maintenanceRepository.findByPriority(parsePriority(priority), pageable).map(this::mapToDTO);
        }
        if (category != null && !category.isBlank()) {
            return maintenanceRepository.findByCategory(parseCategory(category), pageable).map(this::mapToDTO);
        }
        return maintenanceRepository.findAll(pageable).map(this::mapToDTO);
    }

    public MaintenanceRequestDTO getById(Long id) {
        return mapToDTO(loadOrFail(id));
    }

    public MaintenanceRequestDTO create(MaintenanceRequestDTO dto) {
        MaintenanceRequest req = MaintenanceRequest.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory() != null ? parseCategory(dto.getCategory()) : MaintenanceRequest.Category.OTHER)
                .priority(dto.getPriority() != null ? parsePriority(dto.getPriority()) : MaintenanceRequest.Priority.MEDIUM)
                .status(MaintenanceRequest.Status.OPEN)
                .roomNumber(dto.getRoomNumber())
                .reportedBy(resolveStudent(dto.getReportedById()))
                .assignedTo(dto.getAssignedTo())
                .reportedDate(LocalDate.now())
                .notes(dto.getNotes())
                .build();
        return mapToDTO(maintenanceRepository.save(Objects.requireNonNull(req)));
    }

    public MaintenanceRequestDTO update(Long id, MaintenanceRequestDTO dto) {
        MaintenanceRequest req = loadOrFail(id);

        if (dto.getTitle() != null) req.setTitle(dto.getTitle());
        if (dto.getDescription() != null) req.setDescription(dto.getDescription());
        if (dto.getCategory() != null) req.setCategory(parseCategory(dto.getCategory()));
        if (dto.getPriority() != null) req.setPriority(parsePriority(dto.getPriority()));
        if (dto.getStatus() != null) {
            MaintenanceRequest.Status newStatus = parseStatus(dto.getStatus());
            req.setStatus(newStatus);
            if (newStatus == MaintenanceRequest.Status.COMPLETED && req.getCompletedDate() == null) {
                req.setCompletedDate(LocalDate.now());
            }
        }
        if (dto.getRoomNumber() != null) req.setRoomNumber(dto.getRoomNumber());
        if (dto.getAssignedTo() != null) req.setAssignedTo(dto.getAssignedTo());
        if (dto.getNotes() != null) req.setNotes(dto.getNotes());

        return mapToDTO(maintenanceRepository.save(Objects.requireNonNull(req)));
    }

    public void delete(Long id) {
        Objects.requireNonNull(id, "ID must not be null");
        if (!maintenanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Maintenance request not found with id: " + id);
        }
        maintenanceRepository.deleteById(id);
    }

    /* ── Helpers ─────────────────────────────────────────────── */

    private MaintenanceRequest loadOrFail(Long id) {
        Objects.requireNonNull(id, "ID must not be null");
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
    }

    private Student resolveStudent(Long studentId) {
        if (studentId == null) return null;
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
    }

    private static MaintenanceRequest.Status parseStatus(String s) {
        try { return MaintenanceRequest.Status.valueOf(s); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid status: " + s); }
    }

    private static MaintenanceRequest.Priority parsePriority(String s) {
        try { return MaintenanceRequest.Priority.valueOf(s); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid priority: " + s); }
    }

    private static MaintenanceRequest.Category parseCategory(String s) {
        try { return MaintenanceRequest.Category.valueOf(s); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid category: " + s); }
    }

    private MaintenanceRequestDTO mapToDTO(MaintenanceRequest r) {
        return MaintenanceRequestDTO.builder()
                .id(r.getId())
                .title(r.getTitle())
                .description(r.getDescription())
                .category(r.getCategory() != null ? r.getCategory().name() : null)
                .priority(r.getPriority() != null ? r.getPriority().name() : null)
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .roomNumber(r.getRoomNumber())
                .reportedById(r.getReportedBy() != null ? r.getReportedBy().getId() : null)
                .reportedByName(r.getReportedBy() != null ? r.getReportedBy().getName() : null)
                .assignedTo(r.getAssignedTo())
                .reportedDate(r.getReportedDate() != null ? r.getReportedDate().toString() : null)
                .completedDate(r.getCompletedDate() != null ? r.getCompletedDate().toString() : null)
                .notes(r.getNotes())
                .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                .updatedAt(r.getUpdatedAt() != null ? r.getUpdatedAt().toString() : null)
                .build();
    }
}
