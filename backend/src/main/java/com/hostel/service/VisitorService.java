package com.hostel.service;

import com.hostel.dto.VisitorDTO;
import com.hostel.entity.Student;
import com.hostel.entity.Visitor;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.CommonConverters;
import com.hostel.mapper.VisitorMapper;
import com.hostel.repository.StudentRepository;
import com.hostel.repository.VisitorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class VisitorService {

    private final VisitorRepository visitorRepository;
    private final StudentRepository studentRepository;
    private final VisitorMapper visitorMapper;

    public VisitorService(VisitorRepository visitorRepository,
                          StudentRepository studentRepository,
                          VisitorMapper visitorMapper) {
        this.visitorRepository = visitorRepository;
        this.studentRepository = studentRepository;
        this.visitorMapper = visitorMapper;
    }

    @Transactional(readOnly = true)
    public Page<VisitorDTO> getAllVisitors(@NonNull Pageable pageable) {
        return visitorRepository.findAll(pageable).map(visitorMapper::toDto);
    }

    @Transactional(readOnly = true)
    public VisitorDTO getVisitorById(@NonNull Long id) {
        return visitorMapper.toDto(loadVisitor(id));
    }

    @Transactional(readOnly = true)
    public Page<VisitorDTO> getVisitorsByStatus(String status, @NonNull Pageable pageable) {
        Visitor.Status statusEnum = CommonConverters.toEnum(Visitor.Status.class, status);
        return visitorRepository.findByStatus(statusEnum, pageable).map(visitorMapper::toDto);
    }

    public VisitorDTO createVisitor(VisitorDTO dto) {
        Visitor entity = visitorMapper.toEntity(dto);
        if (dto.getStudentId() != null) {
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));
            entity.setStudent(student);
        }
        if (entity.getCheckInTime() == null) {
            entity.setCheckInTime(LocalDateTime.now());
        }
        return visitorMapper.toDto(visitorRepository.save(entity));
    }

    public VisitorDTO updateVisitor(@NonNull Long id, VisitorDTO dto) {
        Visitor entity = loadVisitor(id);
        visitorMapper.updateEntityFromDto(dto, entity);
        if (dto.getStudentId() != null) {
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));
            entity.setStudent(student);
        }
        return visitorMapper.toDto(visitorRepository.save(entity));
    }

    public VisitorDTO checkoutVisitor(@NonNull Long id) {
        Visitor entity = loadVisitor(id);
        if (entity.getStatus() != Visitor.Status.CHECKED_IN) {
            throw new BadRequestException("Visitor is not currently checked in");
        }
        entity.setStatus(Visitor.Status.CHECKED_OUT);
        entity.setCheckOutTime(LocalDateTime.now());
        return visitorMapper.toDto(visitorRepository.save(entity));
    }

    public void deleteVisitor(@NonNull Long id) {
        if (!visitorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Visitor not found with id: " + id);
        }
        visitorRepository.deleteById(id);
    }

    private Visitor loadVisitor(Long id) {
        return visitorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visitor not found with id: " + id));
    }
}
