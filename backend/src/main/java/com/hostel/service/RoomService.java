package com.hostel.service;

import com.hostel.dto.RoomDTO;
import com.hostel.entity.Room;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.RoomRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Page<RoomDTO> getAllRooms(Pageable pageable) {
        return roomRepository.findAll(pageable).map(this::mapToDTO);
    }

    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        return mapToDTO(room);
    }

    public List<RoomDTO> getAvailableRooms() {
        return roomRepository.findByStatus(Room.RoomStatus.AVAILABLE).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoomDTO createRoom(RoomDTO dto) {
        if (roomRepository.existsByRoomNumber(dto.getRoomNumber())) {
            throw new BadRequestException("Room with this number already exists");
        }
        Room room = mapToEntity(dto);
        room = roomRepository.save(room);
        return mapToDTO(room);
    }

    @Transactional
    public RoomDTO updateRoom(Long id, RoomDTO dto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));

        if (dto.getRoomNumber() != null) room.setRoomNumber(dto.getRoomNumber());
        if (dto.getCapacity() != null) room.setCapacity(dto.getCapacity());
        if (dto.getOccupied() != null) room.setOccupied(dto.getOccupied());
        if (dto.getBlock() != null) room.setBlock(dto.getBlock());
        if (dto.getFloor() != null) room.setFloor(dto.getFloor());
        if (dto.getType() != null) room.setType(Room.RoomType.valueOf(dto.getType()));
        if (dto.getStatus() != null) room.setStatus(Room.RoomStatus.valueOf(dto.getStatus()));
        if (dto.getMonthlyRent() != null) room.setMonthlyRent(dto.getMonthlyRent());
        if (dto.getAmenities() != null) room.setAmenities(dto.getAmenities());

        room = roomRepository.save(room);
        return mapToDTO(room);
    }

    @Transactional
    public void deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new ResourceNotFoundException("Room not found with id: " + id);
        }
        roomRepository.deleteById(id);
    }

    private RoomDTO mapToDTO(Room room) {
        return RoomDTO.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .capacity(room.getCapacity())
                .occupied(room.getOccupied())
                .block(room.getBlock())
                .floor(room.getFloor())
                .type(room.getType() != null ? room.getType().name() : null)
                .status(room.getStatus() != null ? room.getStatus().name() : null)
                .monthlyRent(room.getMonthlyRent())
                .amenities(room.getAmenities())
                .createdAt(room.getCreatedAt() != null ? room.getCreatedAt().toString() : null)
                .build();
    }

    private Room mapToEntity(RoomDTO dto) {
        return Room.builder()
                .roomNumber(dto.getRoomNumber())
                .capacity(dto.getCapacity())
                .occupied(dto.getOccupied() != null ? dto.getOccupied() : 0)
                .block(dto.getBlock())
                .floor(dto.getFloor())
                .type(dto.getType() != null ? Room.RoomType.valueOf(dto.getType()) : Room.RoomType.DOUBLE)
                .status(dto.getStatus() != null ? Room.RoomStatus.valueOf(dto.getStatus()) : Room.RoomStatus.AVAILABLE)
                .monthlyRent(dto.getMonthlyRent())
                .amenities(dto.getAmenities())
                .build();
    }
}
