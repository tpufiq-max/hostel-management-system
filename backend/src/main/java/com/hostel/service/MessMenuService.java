package com.hostel.service;

import com.hostel.dto.MessMenuDTO;
import com.hostel.entity.MessMenu;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.CommonConverters;
import com.hostel.mapper.MessMenuMapper;
import com.hostel.repository.MessMenuRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MessMenuService {

    private final MessMenuRepository messMenuRepository;
    private final MessMenuMapper messMenuMapper;

    public MessMenuService(MessMenuRepository messMenuRepository, MessMenuMapper messMenuMapper) {
        this.messMenuRepository = messMenuRepository;
        this.messMenuMapper = messMenuMapper;
    }

    @Transactional(readOnly = true)
    public Page<MessMenuDTO> getAllMenus(@NonNull Pageable pageable) {
        return messMenuRepository.findAll(pageable).map(messMenuMapper::toDto);
    }

    @Transactional(readOnly = true)
    public MessMenuDTO getMenuById(@NonNull Long id) {
        return messMenuMapper.toDto(loadMenu(id));
    }

    @Transactional(readOnly = true)
    public Page<MessMenuDTO> getMenusByDay(String day, @NonNull Pageable pageable) {
        MessMenu.Day dayEnum = CommonConverters.toEnum(MessMenu.Day.class, day);
        return messMenuRepository.findByDay(dayEnum, pageable).map(messMenuMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<MessMenuDTO> getMenusByMealType(String mealType, @NonNull Pageable pageable) {
        MessMenu.MealType mealTypeEnum = CommonConverters.toEnum(MessMenu.MealType.class, mealType);
        return messMenuRepository.findByMealType(mealTypeEnum, pageable).map(messMenuMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<MessMenuDTO> getMenusByDayAndMealType(String day, String mealType, @NonNull Pageable pageable) {
        MessMenu.Day dayEnum = CommonConverters.toEnum(MessMenu.Day.class, day);
        MessMenu.MealType mealTypeEnum = CommonConverters.toEnum(MessMenu.MealType.class, mealType);
        return messMenuRepository.findByDayAndMealType(dayEnum, mealTypeEnum, pageable).map(messMenuMapper::toDto);
    }

    public MessMenuDTO createMenu(MessMenuDTO dto) {
        MessMenu entity = messMenuMapper.toEntity(dto);
        return messMenuMapper.toDto(messMenuRepository.save(entity));
    }

    public MessMenuDTO updateMenu(@NonNull Long id, MessMenuDTO dto) {
        MessMenu entity = loadMenu(id);
        messMenuMapper.updateEntityFromDto(dto, entity);
        return messMenuMapper.toDto(messMenuRepository.save(entity));
    }

    public void deleteMenu(@NonNull Long id) {
        if (!messMenuRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mess menu not found with id: " + id);
        }
        messMenuRepository.deleteById(id);
    }

    private MessMenu loadMenu(Long id) {
        return messMenuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mess menu not found with id: " + id));
    }
}
