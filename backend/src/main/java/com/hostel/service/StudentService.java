package com.hostel.service;

import com.hostel.dto.StudentDTO;
import com.hostel.entity.Student;
import com.hostel.entity.User;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.StudentRepository;
import com.hostel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * StudentService — admin CRUD for students and the linkage to login accounts.
 *
 * Security policy: students can only sign in if the admin has registered them
 * here. createStudent atomically creates a linked User (role=STUDENT) so the
 * student can log in with their email and a temporary password derived from
 * their roll number (lower-cased). deleteStudent deactivates the linked User
 * so the login is revoked even if the Student row stays for FK reasons.
 */
@Service
@Transactional
public class StudentService {

    private static final Logger log = LoggerFactory.getLogger(StudentService.class);

    private final StudentRepository  studentRepository;
    private final UserRepository     userRepository;
    private final PasswordEncoder    passwordEncoder;

    public StudentService(StudentRepository studentRepository,
                          UserRepository    userRepository,
                          PasswordEncoder   passwordEncoder) {
        this.studentRepository = studentRepository;
        this.userRepository    = userRepository;
        this.passwordEncoder   = passwordEncoder;
    }

    public Page<StudentDTO> getAllStudents(@NonNull Pageable pageable) {
        return studentRepository.findAll(pageable).map(this::mapToDTO);
    }

    public StudentDTO getStudentById(@NonNull Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return mapToDTO(student);
    }

    public Page<StudentDTO> searchStudents(String query, @NonNull Pageable pageable) {
        return studentRepository.search(query, pageable).map(this::mapToDTO);
    }

    /**
     * Create a Student row AND its login account.
     *
     *   • Student.email must be unique among students AND among users.
     *   • Default password = lower-cased roll number; if no roll number,
     *     local part of email + "@123".
     *   • The plaintext temporary password is returned ONCE in the response
     *     so the admin can hand it to the student. It is never stored.
     */
    public StudentDTO createStudent(StudentDTO dto) {
        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new BadRequestException("Student email is required");
        }
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("A student with this email already exists");
        }
        if (dto.getRollNumber() != null && studentRepository.existsByRollNumber(dto.getRollNumber())) {
            throw new BadRequestException("A student with this roll number already exists");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("A user account with this email already exists");
        }

        // 1. create login account
        String tempPassword = generateTempPassword(dto);
        User user = userRepository.save(Objects.requireNonNull(User.builder()
                .name(dto.getName())
                .username(dto.getEmail())          // students log in with email; username = email
                .email(dto.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .role(User.Role.STUDENT)
                .phone(dto.getPhone())
                .isActive(true)
                .build()));

        // 2. create student profile linked to that user
        Student student = mapToEntity(dto);
        student.setUser(user);
        student = studentRepository.save(student);

        log.info("StudentService: created student {} with login {}", student.getId(), user.getEmail());

        StudentDTO out = mapToDTO(student);
        out.setTempPassword(tempPassword);
        return out;
    }

    /**
     * Update student details. If the email changes, the linked User account's
     * email/username are updated in lock-step so the login still works.
     */
    public StudentDTO updateStudent(@NonNull Long id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(student.getEmail()) &&
                studentRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("A student with this email already exists");
        }
        if (dto.getRollNumber() != null && !dto.getRollNumber().equals(student.getRollNumber()) &&
                studentRepository.existsByRollNumber(dto.getRollNumber())) {
            throw new BadRequestException("A student with this roll number already exists");
        }

        boolean emailChanged = dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(student.getEmail());
        boolean nameChanged  = dto.getName()  != null && !dto.getName().equals(student.getName());
        boolean phoneChanged = dto.getPhone() != null && !Objects.equals(dto.getPhone(), student.getPhone());

        updateEntityFromDTO(student, dto);
        student = studentRepository.save(student);

        // keep linked User in sync
        User user = student.getUser();
        if (user != null && (emailChanged || nameChanged || phoneChanged)) {
            if (emailChanged) {
                if (userRepository.existsByEmail(dto.getEmail())) {
                    throw new BadRequestException("A user account with this email already exists");
                }
                user.setEmail(dto.getEmail());
                user.setUsername(dto.getEmail());
            }
            if (nameChanged)  user.setName(dto.getName());
            if (phoneChanged) user.setPhone(dto.getPhone());
            userRepository.save(user);
        }

        return mapToDTO(student);
    }

    /**
     * Soft-delete a student.
     *
     *   • Student.isActive = false   (hidden from active queries; row preserved
     *     so historical fees / attendance / complaints stay readable)
     *   • Linked User.isActive = false  (login revoked immediately —
     *     {@code CustomUserDetails.isEnabled()} blocks future authentication)
     *
     * We deliberately do NOT hard-delete the row. JPA cascade would either need
     * to delete every fee/attendance/complaint row (data loss) or fail with a
     * FK violation that — because we're inside an @Transactional method —
     * marks the surrounding transaction rollback-only and would silently undo
     * the User-deactivation we just did. Soft-delete is the safe option.
     */
    public void deleteStudent(@NonNull Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        User user = student.getUser();
        if (user != null) {
            user.setActive(false);
            userRepository.save(user);
            log.info("StudentService: deactivated login for user {}", user.getEmail());
        }
        student.setActive(false);
        studentRepository.save(student);
        log.info("StudentService: soft-deleted student {} ({})", id, student.getEmail());
    }

    public List<StudentDTO> getActiveStudents() {
        return studentRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /* ── lookup used by /api/me/* ──────────────────────────────────── */

    /**
     * Find the Student profile linked to the given User id.
     * Returns empty for admins/wardens with no student profile.
     */
    public Optional<Student> findByUserId(Long userId) {
        return studentRepository.findAll().stream()
                .filter(s -> s.getUser() != null && Objects.equals(s.getUser().getId(), userId))
                .findFirst();
    }

    /* ── helpers ───────────────────────────────────────────────────── */

    private String generateTempPassword(StudentDTO dto) {
        if (dto.getRollNumber() != null && !dto.getRollNumber().isBlank()) {
            return dto.getRollNumber().toLowerCase().replaceAll("\\s+", "");
        }
        String email = dto.getEmail();
        int at = email.indexOf('@');
        String local = at > 0 ? email.substring(0, at) : email;
        return local.toLowerCase() + "@123";
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
        if (feesStatus == null) return Student.FeesStatus.PENDING;
        try {
            return Student.FeesStatus.valueOf(feesStatus.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid fees status: " + feesStatus);
        }
    }

    private void updateEntityFromDTO(Student s, StudentDTO d) {
        if (d.getName()           != null) s.setName(d.getName());
        if (d.getEmail()          != null) s.setEmail(d.getEmail());
        if (d.getPhone()          != null) s.setPhone(d.getPhone());
        if (d.getRollNumber()     != null) s.setRollNumber(d.getRollNumber());
        if (d.getCourse()         != null) s.setCourse(d.getCourse());
        if (d.getDepartment()     != null) s.setDepartment(d.getDepartment());
        if (d.getYear()           != null) s.setYear(d.getYear());
        if (d.getRoomNumber()     != null) s.setRoomNumber(d.getRoomNumber());
        if (d.getBedNumber()      != null) s.setBedNumber(d.getBedNumber());
        if (d.getGuardianName()   != null) s.setGuardianName(d.getGuardianName());
        if (d.getGuardianPhone()  != null) s.setGuardianPhone(d.getGuardianPhone());
        if (d.getAddress()        != null) s.setAddress(d.getAddress());
        if (d.getDateOfBirth()    != null) s.setDateOfBirth(parseDate(d.getDateOfBirth(), "date of birth"));
        if (d.getGender()         != null) s.setGender(d.getGender());
        if (d.getBloodGroup()     != null) s.setBloodGroup(d.getBloodGroup());
        if (d.getFeesStatus()     != null) s.setFeesStatus(parseFeesStatus(d.getFeesStatus()));
        if (d.getProfileImage()   != null) s.setProfileImage(d.getProfileImage());
        if (d.getAdmissionDate()  != null) s.setAdmissionDate(parseDate(d.getAdmissionDate(), "admission date"));
        // isActive is intentionally NOT touched here — primitive boolean would
        // default to false and silently deactivate students on every update.
        // Use deleteStudent to revoke a login.
    }
}
