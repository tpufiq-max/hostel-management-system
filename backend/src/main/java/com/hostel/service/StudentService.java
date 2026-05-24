package com.hostel.service;

import com.hostel.dto.StudentDTO;
import com.hostel.entity.Student;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.StudentMapper;
import com.hostel.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * CRUD and business logic for {@link Student}. All entity-to-DTO translation
 * is delegated to {@link StudentMapper}.
 */
@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    public StudentService(StudentRepository studentRepository, StudentMapper studentMapper) {
        this.studentRepository = studentRepository;
        this.studentMapper = studentMapper;
    }

    @Transactional(readOnly = true)
    public Page<StudentDTO> getAllStudents(@NonNull Pageable pageable) {
        return studentRepository.findAll(pageable).map(studentMapper::toDto);
    }

    @Transactional(readOnly = true)
    public StudentDTO getStudentById(@NonNull Long id) {
        return studentMapper.toDto(loadStudent(id));
    }

    @Transactional(readOnly = true)
    public Page<StudentDTO> searchStudents(String query, @NonNull Pageable pageable) {
        return studentRepository.search(query, pageable).map(studentMapper::toDto);
    }

    public StudentDTO createStudent(StudentDTO dto) {
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Student with this email already exists");
        }
        if (dto.getRollNumber() != null && studentRepository.existsByRollNumber(dto.getRollNumber())) {
            throw new BadRequestException("Student with this roll number already exists");
        }

        Student student = studentMapper.toEntity(dto);
        return studentMapper.toDto(studentRepository.save(student));
    }

    public StudentDTO updateStudent(@NonNull Long id, StudentDTO dto) {
        Student student = loadStudent(id);

        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(student.getEmail())
                && studentRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Student with this email already exists");
        }
        if (dto.getRollNumber() != null && !dto.getRollNumber().equals(student.getRollNumber())
                && studentRepository.existsByRollNumber(dto.getRollNumber())) {
            throw new BadRequestException("Student with this roll number already exists");
        }

        studentMapper.updateEntityFromDto(dto, student);
        return studentMapper.toDto(studentRepository.save(student));
    }

    public void deleteStudent(@NonNull Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> getActiveStudents() {
        return studentRepository.findByIsActiveTrue().stream()
                .map(studentMapper::toDto)
                .collect(Collectors.toList());
    }

    private Student loadStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }
}
