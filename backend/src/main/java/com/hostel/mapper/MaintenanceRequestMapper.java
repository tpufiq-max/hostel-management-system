package com.hostel.mapper;

import com.hostel.dto.MaintenanceRequestDTO;
import com.hostel.entity.MaintenanceRequest;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = CommonConverters.class,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface MaintenanceRequestMapper {

    @Mapping(target = "category", expression = "java(entity.getCategory() == null ? null : entity.getCategory().name())")
    @Mapping(target = "priority", expression = "java(entity.getPriority() == null ? null : entity.getPriority().name())")
    @Mapping(target = "status", expression = "java(entity.getStatus() == null ? null : entity.getStatus().name())")
    @Mapping(target = "reportedDate", source = "reportedDate", qualifiedByName = "localDateToString")
    @Mapping(target = "completedDate", source = "completedDate", qualifiedByName = "localDateToString")
    @Mapping(target = "estimatedCost", expression = "java(entity.getEstimatedCost() == null ? null : entity.getEstimatedCost().toString())")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "localDateTimeToString")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "localDateTimeToString")
    MaintenanceRequestDTO toDto(MaintenanceRequest entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "category", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.MaintenanceRequest.Category.class, dto.getCategory()))")
    @Mapping(target = "priority", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.MaintenanceRequest.Priority.class, dto.getPriority()))")
    @Mapping(target = "status", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.MaintenanceRequest.Status.class, dto.getStatus()))")
    @Mapping(target = "reportedDate", source = "reportedDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "completedDate", source = "completedDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "estimatedCost", expression = "java(dto.getEstimatedCost() == null || dto.getEstimatedCost().isBlank() ? null : new java.math.BigDecimal(dto.getEstimatedCost()))")
    MaintenanceRequest toEntity(MaintenanceRequestDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "category", expression = "java(dto.getCategory() == null ? entity.getCategory() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.MaintenanceRequest.Category.class, dto.getCategory()))")
    @Mapping(target = "priority", expression = "java(dto.getPriority() == null ? entity.getPriority() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.MaintenanceRequest.Priority.class, dto.getPriority()))")
    @Mapping(target = "status", expression = "java(dto.getStatus() == null ? entity.getStatus() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.MaintenanceRequest.Status.class, dto.getStatus()))")
    @Mapping(target = "reportedDate", source = "reportedDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "completedDate", source = "completedDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "estimatedCost", expression = "java(dto.getEstimatedCost() == null ? entity.getEstimatedCost() : (dto.getEstimatedCost().isBlank() ? null : new java.math.BigDecimal(dto.getEstimatedCost())))")
    void updateEntityFromDto(MaintenanceRequestDTO dto, @MappingTarget MaintenanceRequest entity);
}
