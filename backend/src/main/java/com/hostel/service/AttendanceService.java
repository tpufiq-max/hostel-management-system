package com.hostel.service;

import com.hostel.dto.AttendanceDTO;
import com.hostel.entity.Attendance;
import com.hostel.entity.Student;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.AttendanceRepository;
import com.hostel.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    public List<AttendanceDTO> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getStudentAttendance(Long studentId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByStudentIdAndDateBetween(studentId, startDate, endDate).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDTO markAttendance(AttendanceDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        LocalDate date = LocalDate.parse(dto.getDate());

        // Check if attendance already marked for this student on this date
        attendanceRepository.findByStudentIdAndDate(dto.getStudentId(), date)
                .ifPresent(existing -> {
                    throw new BadRequestException("Attendance already marked for this student on " + date);
                });

        Attendance attendance = Attendance.builder()
                .student(student)
                .date(date)
                .status(Attendance.AttendanceStatus.valueOf(dto.getStatus()))
                .checkInTime(dto.getCheckInTime())
                .checkOutTime(dto.getCheckOutTime())
                .remarks(dto.getRemarks())
                .markedBy(dto.getMarkedBy())
                .build();

        attendance = attendanceRepository.save(attendance);
        return mapToDTO(attendance);
    }

    @Transactional
    public List<AttendanceDTO> markBulkAttendance(List<AttendanceDTO> dtos) {
        return dtos.stream()
                .map(this::markAttendance)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDTO updateAttendance(Long id, AttendanceDTO dto) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));

        if (dto.getStatus() != null) attendance.setStatus(Attendance.AttendanceStatus.valueOf(dto.getStatus()));
        if (dto.getCheckInTime() != null) attendance.setCheckInTime(dto.getCheckInTime());
        if (dto.getCheckOutTime() != null) attendance.setCheckOutTime(dto.getCheckOutTime());
        if (dto.getRemarks() != null) attendance.setRemarks(dto.getRemarks());

        attendance = attendanceRepository.save(attendance);
        return mapToDTO(attendance);
    }

    private AttendanceDTO mapToDTO(Attendance attendance) {
        return AttendanceDTO.builder()
                .id(attendance.getId())
                .studentId(attendance.getStudent().getId())
                .studentName(attendance.getStudent().getName())
                .rollNumber(attendance.getStudent().getRollNumber())
                .date(attendance.getDate().toString())
                .status(attendance.getStatus().name())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .remarks(attendance.getRemarks())
                .markedBy(attendance.getMarkedBy())
                .createdAt(attendance.getCreatedAt() != null ? attendance.getCreatedAt().toString() : null)
                .build();
    }
}
