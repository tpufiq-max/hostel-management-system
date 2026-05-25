package com.hostel.service;

import com.hostel.dto.AttendanceDTO;
import com.hostel.entity.Attendance;
import com.hostel.entity.Student;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.AttendanceMapper;
import com.hostel.repository.AttendanceRepository;
import com.hostel.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Records and queries student attendance. The {@link Student} association is
 * loaded explicitly to validate the FK before the row is created.
 */
@Service
@Transactional
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final AttendanceMapper attendanceMapper;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             StudentRepository studentRepository,
                             AttendanceMapper attendanceMapper) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.attendanceMapper = attendanceMapper;
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date).stream()
                .map(attendanceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getStudentAttendance(Long studentId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByStudentIdAndDateBetween(studentId, startDate, endDate).stream()
                .map(attendanceMapper::toDto)
                .collect(Collectors.toList());
    }

    public AttendanceDTO markAttendance(AttendanceDTO dto) {
        if (dto.getStudentId() == null) {
            throw new BadRequestException("Student ID is required");
        }
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        LocalDate date = parseDate(dto.getDate());

        attendanceRepository.findByStudentIdAndDate(dto.getStudentId(), date)
                .ifPresent(existing -> {
                    throw new BadRequestException("Attendance already marked for this student on " + date);
                });

        Attendance attendance = attendanceMapper.toEntity(dto, student);
        return attendanceMapper.toDto(attendanceRepository.save(attendance));
    }

    public List<AttendanceDTO> markBulkAttendance(List<AttendanceDTO> dtos) {
        return dtos.stream()
                .map(this::markAttendance)
                .collect(Collectors.toList());
    }

    public AttendanceDTO updateAttendance(Long id, AttendanceDTO dto) {
        if (id == null) {
            throw new BadRequestException("Attendance ID is required");
        }
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));

        attendanceMapper.updateEntityFromDto(dto, attendance);
        return attendanceMapper.toDto(attendanceRepository.save(attendance));
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Date is required");
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            throw new BadRequestException("Invalid date format '" + value + "'. Expected YYYY-MM-DD.");
        }
    }
}
