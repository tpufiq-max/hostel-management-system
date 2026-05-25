package com.hostel.service;

import com.hostel.dto.MaintenanceRequestDTO;
import com.hostel.entity.MaintenanceRequest;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.CommonConverters;
import com.hostel.mapper.MaintenanceRequestMapper;
import com.hostel.repository.MaintenanceRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MaintenanceRequestService {

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final MaintenanceRequestMapper maintenanceRequestMapper;

    public MaintenanceRequestService(MaintenanceRequestRepository maintenanceRequestRepository,
                                     MaintenanceRequestMapper maintenanceRequestMapper) {
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.maintenanceRequestMapper = maintenanceRequestMapper;
    }

    @Transactional(readOnly = true)
    public Page<MaintenanceRequestDTO> getAllRequests(@NonNull Pageable pageable) {
        return maintenanceRequestRepository.findAll(pageable).map(maintenanceRequestMapper::toDto);
    }

    @Transactional(readOnly = true)
    public MaintenanceRequestDTO getRequestById(@NonNull Long id) {
        return maintenanceRequestMapper.toDto(loadRequest(id));
    }

    @Transactional(readOnly = true)
    public Page<MaintenanceRequestDTO> getRequestsByStatus(String status, @NonNull Pageable pageable) {
        MaintenanceRequest.Status statusEnum = CommonConverters.toEnum(MaintenanceRequest.Status.class, status);
        return maintenanceRequestRepository.findByStatus(statusEnum, pageable).map(maintenanceRequestMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<MaintenanceRequestDTO> getRequestsByPriority(String priority, @NonNull Pageable pageable) {
        MaintenanceRequest.Priority priorityEnum = CommonConverters.toEnum(MaintenanceRequest.Priority.class, priority);
        return maintenanceRequestRepository.findByPriority(priorityEnum, pageable).map(maintenanceRequestMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<MaintenanceRequestDTO> getRequestsByCategory(String category, @NonNull Pageable pageable) {
        MaintenanceRequest.Category categoryEnum = CommonConverters.toEnum(MaintenanceRequest.Category.class, category);
        return maintenanceRequestRepository.findByCategory(categoryEnum, pageable).map(maintenanceRequestMapper::toDto);
    }

    public MaintenanceRequestDTO createRequest(MaintenanceRequestDTO dto) {
        MaintenanceRequest entity = maintenanceRequestMapper.toEntity(dto);
        return maintenanceRequestMapper.toDto(maintenanceRequestRepository.save(entity));
    }

    public MaintenanceRequestDTO updateRequest(@NonNull Long id, MaintenanceRequestDTO dto) {
        MaintenanceRequest entity = loadRequest(id);
        maintenanceRequestMapper.updateEntityFromDto(dto, entity);
        return maintenanceRequestMapper.toDto(maintenanceRequestRepository.save(entity));
    }

    public void deleteRequest(@NonNull Long id) {
        if (!maintenanceRequestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Maintenance request not found with id: " + id);
        }
        maintenanceRequestRepository.deleteById(id);
    }

    private MaintenanceRequest loadRequest(Long id) {
        return maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
    }
}
