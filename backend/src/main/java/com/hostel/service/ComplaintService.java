package com.hostel.service;

import com.hostel.dto.ComplaintDTO;
import com.hostel.entity.Complaint;
import com.hostel.entity.Student;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.ComplaintMapper;
import com.hostel.repository.ComplaintRepository;
import com.hostel.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Complaint workflow service. The "stamp resolvedAt on RESOLVED transition"
 * rule is owned by {@link ComplaintMapper#stampResolvedAt} so it cannot be
 * accidentally bypassed by callers.
 */
@Service
@Transactional
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StudentRepository studentRepository;
    private final ComplaintMapper complaintMapper;

    public ComplaintService(ComplaintRepository complaintRepository,
                            StudentRepository studentRepository,
                            ComplaintMapper complaintMapper) {
        this.complaintRepository = complaintRepository;
        this.studentRepository = studentRepository;
        this.complaintMapper = complaintMapper;
    }

    @Transactional(readOnly = true)
    public Page<ComplaintDTO> getAllComplaints(@NonNull Pageable pageable) {
        return complaintRepository.findAll(pageable).map(complaintMapper::toDto);
    }

    @Transactional(readOnly = true)
    public ComplaintDTO getComplaintById(@NonNull Long id) {
        return complaintMapper.toDto(loadComplaint(id));
    }

    @Transactional(readOnly = true)
    public List<ComplaintDTO> getStudentComplaints(@NonNull Long studentId) {
        return complaintRepository.findByStudentId(studentId).stream()
                .map(complaintMapper::toDto)
                .collect(Collectors.toList());
    }

    public ComplaintDTO createComplaint(ComplaintDTO dto) {
        if (dto.getStudentId() == null) {
            throw new BadRequestException("Student ID is required");
        }
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        Complaint complaint = complaintMapper.toEntity(dto, student);
        return complaintMapper.toDto(complaintRepository.save(complaint));
    }

    public ComplaintDTO updateComplaint(@NonNull Long id, ComplaintDTO dto) {
        Complaint complaint = loadComplaint(id);
        complaintMapper.updateEntityFromDto(dto, complaint);
        return complaintMapper.toDto(complaintRepository.save(complaint));
    }

    public void deleteComplaint(@NonNull Long id) {
        if (!complaintRepository.existsById(id)) {
            throw new ResourceNotFoundException("Complaint not found with id: " + id);
        }
        complaintRepository.deleteById(id);
    }

    private Complaint loadComplaint(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
    }
}
