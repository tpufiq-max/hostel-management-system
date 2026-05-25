package com.hostel.service;

import com.hostel.dto.AllocationDTO;
import com.hostel.entity.Allocation;
import com.hostel.entity.Room;
import com.hostel.entity.Student;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.AllocationMapper;
import com.hostel.repository.AllocationRepository;
import com.hostel.repository.RoomRepository;
import com.hostel.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final AllocationMapper allocationMapper;

    public AllocationService(AllocationRepository allocationRepository,
                             StudentRepository studentRepository,
                             RoomRepository roomRepository,
                             AllocationMapper allocationMapper) {
        this.allocationRepository = allocationRepository;
        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
        this.allocationMapper = allocationMapper;
    }

    @Transactional(readOnly = true)
    public Page<AllocationDTO> getAllAllocations(@NonNull Pageable pageable) {
        return allocationRepository.findAll(pageable).map(allocationMapper::toDto);
    }

    @Transactional(readOnly = true)
    public AllocationDTO getAllocationById(@NonNull Long id) {
        return allocationMapper.toDto(loadAllocation(id));
    }

    public AllocationDTO createAllocation(AllocationDTO dto) {
        if (dto.getStudentId() == null) {
            throw new BadRequestException("Student ID is required");
        }
        if (dto.getRoomId() == null) {
            throw new BadRequestException("Room ID is required");
        }

        if (allocationRepository.existsByStudentIdAndRoomId(dto.getStudentId(), dto.getRoomId())) {
            throw new BadRequestException("Student is already allocated to this room");
        }

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + dto.getRoomId()));

        if (room.getOccupied() >= room.getCapacity()) {
            throw new BadRequestException("Room is at full capacity");
        }

        Allocation allocation = allocationMapper.toEntity(dto, student, room);
        Allocation saved = allocationRepository.save(allocation);

        room.setOccupied(room.getOccupied() + 1);
        roomRepository.save(room);

        return allocationMapper.toDto(saved);
    }

    public AllocationDTO updateAllocation(@NonNull Long id, AllocationDTO dto) {
        Allocation allocation = loadAllocation(id);
        allocationMapper.updateEntityFromDto(dto, allocation);

        // Handle student reassignment
        if (dto.getStudentId() != null && !dto.getStudentId().equals(allocation.getStudent().getId())) {
            Student newStudent = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));
            allocation.setStudent(newStudent);
        }

        // Handle room reassignment
        if (dto.getRoomId() != null && !dto.getRoomId().equals(allocation.getRoom().getId())) {
            Room newRoom = roomRepository.findById(dto.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + dto.getRoomId()));

            if (newRoom.getOccupied() >= newRoom.getCapacity()) {
                throw new BadRequestException("Room is at full capacity");
            }

            // Decrement old room occupied count
            Room oldRoom = allocation.getRoom();
            oldRoom.setOccupied(Math.max(0, oldRoom.getOccupied() - 1));
            roomRepository.save(oldRoom);

            // Increment new room occupied count
            newRoom.setOccupied(newRoom.getOccupied() + 1);
            roomRepository.save(newRoom);

            allocation.setRoom(newRoom);
        }

        return allocationMapper.toDto(allocationRepository.save(allocation));
    }

    public void deleteAllocation(@NonNull Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation not found with id: " + id));

        Room room = allocation.getRoom();
        room.setOccupied(Math.max(0, room.getOccupied() - 1));
        roomRepository.save(room);

        allocationRepository.delete(allocation);
    }

    private Allocation loadAllocation(Long id) {
        return allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation not found with id: " + id));
    }
}
