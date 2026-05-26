package com.hostel.service;

import com.hostel.dto.AllocationDTO;
import com.hostel.entity.Room;
import com.hostel.entity.Student;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.RoomRepository;
import com.hostel.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Allocation service — derives student↔room assignments from existing entities.
 * An "allocation" exists whenever Student.room is non-null.
 */
@Service
@Transactional
public class AllocationService {

    private final StudentRepository studentRepository;
    private final RoomRepository    roomRepository;

    public AllocationService(StudentRepository studentRepository,
                             RoomRepository roomRepository) {
        this.studentRepository = studentRepository;
        this.roomRepository    = roomRepository;
    }

    /** List all students that have a room assigned (paginated). */
    public Page<AllocationDTO> listAllocations(Pageable pageable) {
        Objects.requireNonNull(pageable);

        Page<Student> allocated = studentRepository.findByRoomIsNotNull(pageable);
        List<AllocationDTO> dtos = allocated.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, allocated.getTotalElements());
    }

    /** Assign a student to a room. Rejects if the room is at capacity. */
    public AllocationDTO allocate(Long studentId, Long roomId) {
        Student student = loadStudent(studentId);
        Room    room    = loadRoom(roomId);

        if (room.getOccupied() >= room.getCapacity()) {
            throw new BadRequestException(
                    "Room " + room.getRoomNumber() + " is at full capacity ("
                    + room.getCapacity() + " beds).");
        }

        // If the student already had a room, decrement that room's counter.
        if (student.getRoom() != null && !student.getRoom().getId().equals(roomId)) {
            Room old = student.getRoom();
            old.setOccupied(Math.max(0, old.getOccupied() - 1));
            if (old.getOccupied() < old.getCapacity()) {
                old.setStatus(Room.RoomStatus.AVAILABLE);
            }
            roomRepository.save(old);
        }

        student.setRoom(room);
        student.setRoomNumber(room.getRoomNumber());
        studentRepository.save(student);

        // Increment occupied count on the target room.
        room.setOccupied(room.getOccupied() + 1);
        if (room.getOccupied() >= room.getCapacity()) {
            room.setStatus(Room.RoomStatus.OCCUPIED);
        }
        roomRepository.save(room);

        return toDTO(student);
    }

    /** Remove a student from their current room. */
    public void deallocate(Long studentId) {
        Student student = loadStudent(studentId);

        if (student.getRoom() == null) {
            throw new BadRequestException("Student is not allocated to any room.");
        }

        Room room = student.getRoom();
        room.setOccupied(Math.max(0, room.getOccupied() - 1));
        if (room.getOccupied() < room.getCapacity()) {
            room.setStatus(Room.RoomStatus.AVAILABLE);
        }
        roomRepository.save(room);

        student.setRoom(null);
        student.setRoomNumber(null);
        studentRepository.save(student);
    }

    /* ── helpers ──────────────────────────────────────────────── */

    private Student loadStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
    }

    private Room loadRoom(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));
    }

    private AllocationDTO toDTO(Student s) {
        Room r = s.getRoom();
        return AllocationDTO.builder()
                .studentId(s.getId())
                .studentName(s.getName())
                .studentEmail(s.getEmail())
                .rollNumber(s.getRollNumber())
                .course(s.getCourse())
                .roomId(r != null ? r.getId() : null)
                .roomNumber(r != null ? r.getRoomNumber() : s.getRoomNumber())
                .roomType(r != null && r.getType() != null ? r.getType().name() : null)
                .roomBlock(r != null ? r.getBlock() : null)
                .roomFloor(r != null ? r.getFloor() : null)
                .roomCapacity(r != null ? r.getCapacity() : null)
                .roomOccupied(r != null ? r.getOccupied() : null)
                .admissionDate(s.getAdmissionDate() != null ? s.getAdmissionDate().toString() : null)
                .build();
    }
}
