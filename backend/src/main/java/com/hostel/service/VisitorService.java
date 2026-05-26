package com.hostel.service;

import com.hostel.dto.VisitorDTO;
import com.hostel.entity.Student;
import com.hostel.entity.Visitor;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.StudentRepository;
import com.hostel.repository.VisitorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@Transactional
public class VisitorService {

    private final VisitorRepository visitorRepository;
    private final StudentRepository studentRepository;

    public VisitorService(VisitorRepository visitorRepository, StudentRepository studentRepository) {
        this.visitorRepository = visitorRepository;
        this.studentRepository = studentRepository;
    }

    public Page<VisitorDTO> list(String status, Pageable pageable) {
        Objects.requireNonNull(pageable, "Pageable must not be null");
        if (status != null && !status.isBlank()) {
            return visitorRepository
                    .findByStatus(parseStatus(status), pageable)
                    .map(this::mapToDTO);
        }
        return visitorRepository.findAll(pageable).map(this::mapToDTO);
    }

    public VisitorDTO getById(Long id) {
        Objects.requireNonNull(id, "ID must not be null");
        return mapToDTO(loadOrFail(id));
    }

    public VisitorDTO create(VisitorDTO dto) {
        Visitor visitor = Visitor.builder()
                .visitorName(dto.getVisitorName())
                .relation(parseRelation(dto.getRelation()))
                .student(resolveStudent(dto.getStudentId()))
                .purpose(dto.getPurpose())
                .phoneNumber(dto.getPhoneNumber())
                .idProof(dto.getIdProof())
                .checkInTime(LocalDateTime.now())
                .status(Visitor.Status.CHECKED_IN)
                .approvedBy(dto.getApprovedBy())
                .notes(dto.getNotes())
                .build();
        return mapToDTO(visitorRepository.save(Objects.requireNonNull(visitor)));
    }

    public VisitorDTO update(Long id, VisitorDTO dto) {
        Visitor v = loadOrFail(id);

        if (dto.getVisitorName() != null) v.setVisitorName(dto.getVisitorName());
        if (dto.getRelation() != null) v.setRelation(parseRelation(dto.getRelation()));
        if (dto.getStudentId() != null) v.setStudent(resolveStudent(dto.getStudentId()));
        if (dto.getPurpose() != null) v.setPurpose(dto.getPurpose());
        if (dto.getPhoneNumber() != null) v.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getIdProof() != null) v.setIdProof(dto.getIdProof());
        if (dto.getStatus() != null) v.setStatus(parseStatus(dto.getStatus()));
        if (dto.getApprovedBy() != null) v.setApprovedBy(dto.getApprovedBy());
        if (dto.getNotes() != null) v.setNotes(dto.getNotes());

        return mapToDTO(visitorRepository.save(Objects.requireNonNull(v)));
    }

    public VisitorDTO checkout(Long id) {
        Visitor v = loadOrFail(id);
        if (v.getStatus() == Visitor.Status.CHECKED_OUT) {
            throw new BadRequestException("Visitor is already checked out");
        }
        v.setStatus(Visitor.Status.CHECKED_OUT);
        v.setCheckOutTime(LocalDateTime.now());
        return mapToDTO(visitorRepository.save(Objects.requireNonNull(v)));
    }

    public void delete(Long id) {
        Objects.requireNonNull(id, "ID must not be null");
        if (!visitorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Visitor not found with id: " + id);
        }
        visitorRepository.deleteById(id);
    }

    /* ── Helpers ─────────────────────────────────────────────── */

    private Visitor loadOrFail(Long id) {
        Objects.requireNonNull(id, "ID must not be null");
        return visitorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visitor not found with id: " + id));
    }

    private Student resolveStudent(Long studentId) {
        if (studentId == null) return null;
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
    }

    private static Visitor.Status parseStatus(String s) {
        try {
            return Visitor.Status.valueOf(s);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + s);
        }
    }

    private static Visitor.Relation parseRelation(String s) {
        try {
            return Visitor.Relation.valueOf(s);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid relation: " + s);
        }
    }

    private VisitorDTO mapToDTO(Visitor v) {
        return VisitorDTO.builder()
                .id(v.getId())
                .visitorName(v.getVisitorName())
                .relation(v.getRelation() != null ? v.getRelation().name() : null)
                .studentId(v.getStudent() != null ? v.getStudent().getId() : null)
                .studentName(v.getStudent() != null ? v.getStudent().getName() : null)
                .purpose(v.getPurpose())
                .phoneNumber(v.getPhoneNumber())
                .idProof(v.getIdProof())
                .checkInTime(v.getCheckInTime() != null ? v.getCheckInTime().toString() : null)
                .checkOutTime(v.getCheckOutTime() != null ? v.getCheckOutTime().toString() : null)
                .status(v.getStatus() != null ? v.getStatus().name() : null)
                .approvedBy(v.getApprovedBy())
                .notes(v.getNotes())
                .createdAt(v.getCreatedAt() != null ? v.getCreatedAt().toString() : null)
                .build();
    }
}
