package com.hostel.service;

import com.hostel.dto.FeeDTO;
import com.hostel.entity.Fee;
import com.hostel.entity.Student;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.FeeRepository;
import com.hostel.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class FeeService {

    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;

    public FeeService(FeeRepository feeRepository, StudentRepository studentRepository) {
        this.feeRepository = feeRepository;
        this.studentRepository = studentRepository;
    }

    public Page<FeeDTO> getAllFees(Pageable pageable) {
        return feeRepository.findAll(pageable).map(this::mapToDTO);
    }

    public FeeDTO getFeeById(Long id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee record not found with id: " + id));
        return mapToDTO(fee);
    }

    public List<FeeDTO> getStudentFees(Long studentId) {
        return feeRepository.findByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeeDTO createFee(FeeDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        Fee fee = Fee.builder()
                .student(student)
                .amount(dto.getAmount())
                .dueDate(dto.getDueDate() != null ? LocalDate.parse(dto.getDueDate()) : null)
                .paymentDate(dto.getPaymentDate() != null ? LocalDate.parse(dto.getPaymentDate()) : null)
                .paymentStatus(dto.getPaymentStatus() != null ? Fee.PaymentStatus.valueOf(dto.getPaymentStatus()) : Fee.PaymentStatus.PENDING)
                .paymentMethod(dto.getPaymentMethod())
                .transactionId(dto.getTransactionId())
                .description(dto.getDescription())
                .feeType(dto.getFeeType() != null ? Fee.FeeType.valueOf(dto.getFeeType()) : Fee.FeeType.HOSTEL)
                .semester(dto.getSemester())
                .build();

        fee = feeRepository.save(fee);
        return mapToDTO(fee);
    }

    @Transactional
    public FeeDTO updateFee(Long id, FeeDTO dto) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee record not found with id: " + id));

        if (dto.getAmount() != null) fee.setAmount(dto.getAmount());
        if (dto.getPaymentStatus() != null) fee.setPaymentStatus(Fee.PaymentStatus.valueOf(dto.getPaymentStatus()));
        if (dto.getPaymentDate() != null) fee.setPaymentDate(LocalDate.parse(dto.getPaymentDate()));
        if (dto.getPaymentMethod() != null) fee.setPaymentMethod(dto.getPaymentMethod());
        if (dto.getTransactionId() != null) fee.setTransactionId(dto.getTransactionId());
        if (dto.getDescription() != null) fee.setDescription(dto.getDescription());

        fee = feeRepository.save(fee);
        return mapToDTO(fee);
    }

    @Transactional
    public void deleteFee(Long id) {
        if (!feeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Fee record not found with id: " + id);
        }
        feeRepository.deleteById(id);
    }

    private FeeDTO mapToDTO(Fee fee) {
        return FeeDTO.builder()
                .id(fee.getId())
                .studentId(fee.getStudent().getId())
                .studentName(fee.getStudent().getName())
                .amount(fee.getAmount())
                .dueDate(fee.getDueDate() != null ? fee.getDueDate().toString() : null)
                .paymentDate(fee.getPaymentDate() != null ? fee.getPaymentDate().toString() : null)
                .paymentStatus(fee.getPaymentStatus() != null ? fee.getPaymentStatus().name() : null)
                .paymentMethod(fee.getPaymentMethod())
                .transactionId(fee.getTransactionId())
                .description(fee.getDescription())
                .feeType(fee.getFeeType() != null ? fee.getFeeType().name() : null)
                .semester(fee.getSemester())
                .createdAt(fee.getCreatedAt() != null ? fee.getCreatedAt().toString() : null)
                .build();
    }
}
