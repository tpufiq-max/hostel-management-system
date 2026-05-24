package com.hostel.service;

import com.hostel.dto.StudentDTO;
import com.hostel.entity.Student;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Page<StudentDTO> getAllStudents(@NonNull Pageable pageable) {
        return studentRepository.findAll(pageable).map(this::mapToDTO);
    }

    public StudentDTO getStudentById(@NonNull Long id) {
        Student student = studentRepository.findById((Long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return mapToDTO(student);
    }

    public Page<StudentDTO> searchStudents(String query, @NonNull Pageable pageable) {
        return studentRepository.search(query, pageable).map(this::mapToDTO);
    }

    @SuppressWarnings("null")
    public StudentDTO createStudent(StudentDTO dto) {
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Student with this email already exists");
        }
        if (dto.getRollNumber() != null && studentRepository.existsByRollNumber(dto.getRollNumber())) {
            throw new BadRequestException("Student with this roll number already exists");
        }

        Student student = mapToEntity(dto);
        student = studentRepository.save(student);
        return mapToDTO(student);
    }

    @SuppressWarnings("null")
    public StudentDTO updateStudent(@NonNull Long id, StudentDTO dto) {
        Student student = studentRepository.findById((Long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(student.getEmail()) &&
                studentRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Student with this email already exists");
        }

        if (dto.getRollNumber() != null && !dto.getRollNumber().equals(student.getRollNumber()) &&
                studentRepository.existsByRollNumber(dto.getRollNumber())) {
            throw new BadRequestException("Student with this roll number already exists");
        }

        updateEntityFromDTO(student, dto);
        student = studentRepository.save(student);
        return mapToDTO(student);
    }

    public void deleteStudent(@NonNull Long id) {
        if (!studentRepository.existsById((Long) id)) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }
        studentRepository.deleteById((Long) id);
    }

    public List<StudentDTO> getActiveStudents() {
        return studentRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private StudentDTO mapToDTO(Student student) {
        return StudentDTO.builder()
                .id(student.getId())
                .name(student.getName())
                .email(student.getEmail())
                .phone(student.getPhone())
                .rollNumber(student.getRollNumber())
                .course(student.getCourse())
                .department(student.getDepartment())
                .year(student.getYear())
                .roomNumber(student.getRoomNumber())
                .bedNumber(student.getBedNumber())
                .guardianName(student.getGuardianName())
                .guardianPhone(student.getGuardianPhone())
                .address(student.getAddress())
                .dateOfBirth(student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : null)
                .gender(student.getGender())
                .bloodGroup(student.getBloodGroup())
                .feesStatus(student.getFeesStatus() != null ? student.getFeesStatus().name() : null)
                .profileImage(student.getProfileImage())
                .isActive(student.isActive())
                .admissionDate(student.getAdmissionDate() != null ? student.getAdmissionDate().toString() : null)
                .createdAt(student.getCreatedAt() != null ? student.getCreatedAt().toString() : null)
                .build();
    }

    private Student mapToEntity(StudentDTO dto) {
        return Student.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .rollNumber(dto.getRollNumber())
                .course(dto.getCourse())
                .department(dto.getDepartment())
                .year(dto.getYear())
                .roomNumber(dto.getRoomNumber())
                .bedNumber(dto.getBedNumber())
                .guardianName(dto.getGuardianName())
                .guardianPhone(dto.getGuardianPhone())
                .address(dto.getAddress())
                .dateOfBirth(dto.getDateOfBirth() != null ? parseDate(dto.getDateOfBirth(), "date of birth") : null)
                .gender(dto.getGender())
                .bloodGroup(dto.getBloodGroup())
                .feesStatus(parseFeesStatus(dto.getFeesStatus()))
                .profileImage(dto.getProfileImage())
                .isActive(true)
                .admissionDate(dto.getAdmissionDate() != null ? parseDate(dto.getAdmissionDate(), "admission date") : LocalDate.now())
                .build();
    }

    private LocalDate parseDate(String date, String fieldName) {
        try {
            return LocalDate.parse(date);
        } catch (DateTimeParseException ex) {
            throw new BadRequestException("Invalid " + fieldName + " format. Expected YYYY-MM-DD");
        }
    }

    private Student.FeesStatus parseFeesStatus(String feesStatus) {
        if (feesStatus == null) {
            return Student.FeesStatus.PENDING;
        }
        try {
            return Student.FeesStatus.valueOf(feesStatus.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid fees status: " + feesStatus);
        }
    }

    private void updateEntityFromDTO(Student student, StudentDTO dto) {
        if (dto.getName() != null) student.setName(dto.getName());
        if (dto.getEmail() != null) student.setEmail(dto.getEmail());
        if (dto.getPhone() != null) student.setPhone(dto.getPhone());
        if (dto.getRollNumber() != null) student.setRollNumber(dto.getRollNumber());
        if (dto.getCourse() != null) student.setCourse(dto.getCourse());
        if (dto.getDepartment() != null) student.setDepartment(dto.getDepartment());
        if (dto.getYear() != null) student.setYear(dto.getYear());
        if (dto.getRoomNumber() != null) student.setRoomNumber(dto.getRoomNumber());
        if (dto.getBedNumber() != null) student.setBedNumber(dto.getBedNumber());
        if (dto.getGuardianName() != null) student.setGuardianName(dto.getGuardianName());
        if (dto.getGuardianPhone() != null) student.setGuardianPhone(dto.getGuardianPhone());
        if (dto.getAddress() != null) student.setAddress(dto.getAddress());
        if (dto.getDateOfBirth() != null) student.setDateOfBirth(parseDate(dto.getDateOfBirth(), "date of birth"));
        if (dto.getGender() != null) student.setGender(dto.getGender());
        if (dto.getBloodGroup() != null) student.setBloodGroup(dto.getBloodGroup());
        if (dto.getFeesStatus() != null) student.setFeesStatus(parseFeesStatus(dto.getFeesStatus()));
        if (dto.getProfileImage() != null) student.setProfileImage(dto.getProfileImage());
        if (dto.getAdmissionDate() != null) student.setAdmissionDate(parseDate(dto.getAdmissionDate(), "admission date"));
    }
}
