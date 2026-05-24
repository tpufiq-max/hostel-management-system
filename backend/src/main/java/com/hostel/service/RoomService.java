package com.hostel.service;

import com.hostel.dto.RoomDTO;
import com.hostel.entity.Room;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.RoomMapper;
import com.hostel.repository.RoomRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * CRUD and lookup operations for {@link Room}. Mapping handled by
 * {@link RoomMapper}.
 */
@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;

    public RoomService(RoomRepository roomRepository, RoomMapper roomMapper) {
        this.roomRepository = roomRepository;
        this.roomMapper = roomMapper;
    }

    @Transactional(readOnly = true)
    public Page<RoomDTO> getAllRooms(@NonNull Pageable pageable) {
        return roomRepository.findAll(pageable).map(roomMapper::toDto);
    }

    @Transactional(readOnly = true)
    public RoomDTO getRoomById(@NonNull Long id) {
        return roomMapper.toDto(loadRoom(id));
    }

    @Transactional(readOnly = true)
    public List<RoomDTO> getAvailableRooms() {
        return roomRepository.findByStatus(Room.RoomStatus.AVAILABLE).stream()
                .map(roomMapper::toDto)
                .collect(Collectors.toList());
    }

    public RoomDTO createRoom(RoomDTO dto) {
        if (roomRepository.existsByRoomNumber(dto.getRoomNumber())) {
            throw new BadRequestException("Room with this number already exists");
        }
        Room room = roomMapper.toEntity(dto);
        return roomMapper.toDto(roomRepository.save(room));
    }

    public RoomDTO updateRoom(@NonNull Long id, RoomDTO dto) {
        Room room = loadRoom(id);

        if (dto.getRoomNumber() != null && !dto.getRoomNumber().equals(room.getRoomNumber())
                && roomRepository.existsByRoomNumber(dto.getRoomNumber())) {
            throw new BadRequestException("Room with this number already exists");
        }

        roomMapper.updateEntityFromDto(dto, room);
        return roomMapper.toDto(roomRepository.save(room));
    }

    public void deleteRoom(@NonNull Long id) {
        if (!roomRepository.existsById(id)) {
            throw new ResourceNotFoundException("Room not found with id: " + id);
        }
        roomRepository.deleteById(id);
    }

    private Room loadRoom(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
    }
}
