package com.hostel.service;

import com.hostel.dto.ComplaintDTO;
import com.hostel.entity.Complaint;
import com.hostel.entity.Student;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.ComplaintRepository;
import com.hostel.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StudentRepository studentRepository;

    public ComplaintService(ComplaintRepository complaintRepository, StudentRepository studentRepository) {
        this.complaintRepository = complaintRepository;
        this.studentRepository = studentRepository;
    }

    public Page<ComplaintDTO> getAllComplaints(Pageable pageable) {
        return complaintRepository.findAll(pageable).map(this::mapToDTO);
    }

    public ComplaintDTO getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        return mapToDTO(complaint);
    }

    public List<ComplaintDTO> getStudentComplaints(Long studentId) {
        return complaintRepository.findByStudentId(studentId).stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public ComplaintDTO createComplaint(ComplaintDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Complaint complaint = Complaint.builder()
                .student(student)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory() != null ?
                        Complaint.ComplaintCategory.valueOf(dto.getCategory()) : Complaint.ComplaintCategory.OTHER)
                .complaintStatus(Complaint.ComplaintStatus.OPEN)
                .priority(dto.getPriority() != null ?
                        Complaint.Priority.valueOf(dto.getPriority()) : Complaint.Priority.MEDIUM)
                .assignedTo(dto.getAssignedTo())
                .build();

        complaint = complaintRepository.save(complaint);
        return mapToDTO(complaint);
    }

    @Transactional
    public ComplaintDTO updateComplaint(Long id, ComplaintDTO dto) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (dto.getTitle() != null) complaint.setTitle(dto.getTitle());
        if (dto.getDescription() != null) complaint.setDescription(dto.getDescription());
        if (dto.getComplaintStatus() != null) {
            Complaint.ComplaintStatus newStatus = Complaint.ComplaintStatus.valueOf(dto.getComplaintStatus());
            complaint.setComplaintStatus(newStatus);
            if (newStatus == Complaint.ComplaintStatus.RESOLVED) {
                complaint.setResolvedAt(LocalDateTime.now());
            }
        }
        if (dto.getPriority() != null) complaint.setPriority(Complaint.Priority.valueOf(dto.getPriority()));
        if (dto.getResolutionNotes() != null) complaint.setResolutionNotes(dto.getResolutionNotes());
        if (dto.getAssignedTo() != null) complaint.setAssignedTo(dto.getAssignedTo());

        complaint = complaintRepository.save(complaint);
        return mapToDTO(complaint);
    }

    @Transactional
    public void deleteComplaint(Long id) {
        if (!complaintRepository.existsById(id)) {
            throw new ResourceNotFoundException("Complaint not found with id: " + id);
        }
        complaintRepository.deleteById(id);
    }

    private ComplaintDTO mapToDTO(Complaint c) {
        return ComplaintDTO.builder()
                .id(c.getId())
                .studentId(c.getStudent().getId())
                .studentName(c.getStudent().getName())
                .title(c.getTitle())
                .description(c.getDescription())
                .category(c.getCategory() != null ? c.getCategory().name() : null)
                .complaintStatus(c.getComplaintStatus() != null ? c.getComplaintStatus().name() : null)
                .priority(c.getPriority() != null ? c.getPriority().name() : null)
                .resolutionNotes(c.getResolutionNotes())
                .assignedTo(c.getAssignedTo())
                .resolvedAt(c.getResolvedAt() != null ? c.getResolvedAt().toString() : null)
                .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null)
                .updatedAt(c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null)
                .build();
    }
}
