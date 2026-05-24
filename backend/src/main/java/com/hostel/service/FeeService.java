package com.hostel.service;

import com.hostel.dto.FeeDTO;
import com.hostel.entity.Fee;
import com.hostel.entity.Student;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.FeeMapper;
import com.hostel.repository.FeeRepository;
import com.hostel.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Manages fee records. Loads the {@link Student} association explicitly so
 * we can validate the FK before constructing the {@link Fee} entity, and so
 * the mapper stays free of repository dependencies.
 */
@Service
@Transactional
public class FeeService {

    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;
    private final FeeMapper feeMapper;

    public FeeService(FeeRepository feeRepository,
                      StudentRepository studentRepository,
                      FeeMapper feeMapper) {
        this.feeRepository = feeRepository;
        this.studentRepository = studentRepository;
        this.feeMapper = feeMapper;
    }

    @Transactional(readOnly = true)
    public Page<FeeDTO> getAllFees(@NonNull Pageable pageable) {
        return feeRepository.findAll(pageable).map(feeMapper::toDto);
    }

    @Transactional(readOnly = true)
    public FeeDTO getFeeById(@NonNull Long id) {
        return feeMapper.toDto(loadFee(id));
    }

    @Transactional(readOnly = true)
    public List<FeeDTO> getStudentFees(@NonNull Long studentId) {
        return feeRepository.findByStudentId(studentId).stream()
                .map(feeMapper::toDto)
                .collect(Collectors.toList());
    }

    public FeeDTO createFee(FeeDTO dto) {
        if (dto.getStudentId() == null) {
            throw new BadRequestException("Student ID is required");
        }
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        Fee fee = feeMapper.toEntity(dto, student);
        return feeMapper.toDto(feeRepository.save(fee));
    }

    public FeeDTO updateFee(@NonNull Long id, FeeDTO dto) {
        Fee fee = loadFee(id);
        feeMapper.updateEntityFromDto(dto, fee);
        return feeMapper.toDto(feeRepository.save(fee));
    }

    public void deleteFee(@NonNull Long id) {
        if (!feeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Fee record not found with id: " + id);
        }
        feeRepository.deleteById(id);
    }

    private Fee loadFee(Long id) {
        return feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee record not found with id: " + id));
    }
}
