package com.hostel.mapper;

import com.hostel.dto.EventDTO;
import com.hostel.entity.Event;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = CommonConverters.class,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface EventMapper {

    @Mapping(target = "category", expression = "java(entity.getCategory() == null ? null : entity.getCategory().name())")
    @Mapping(target = "status", expression = "java(entity.getStatus() == null ? null : entity.getStatus().name())")
    @Mapping(target = "eventDate", source = "eventDate", qualifiedByName = "localDateToString")
    @Mapping(target = "startTime", source = "startTime", qualifiedByName = "localTimeToString")
    @Mapping(target = "endTime", source = "endTime", qualifiedByName = "localTimeToString")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "localDateTimeToString")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "localDateTimeToString")
    EventDTO toDto(Event entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "category", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Event.Category.class, dto.getCategory()))")
    @Mapping(target = "status", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Event.Status.class, dto.getStatus()))")
    @Mapping(target = "eventDate", source = "eventDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "startTime", source = "startTime", qualifiedByName = "stringToLocalTime")
    @Mapping(target = "endTime", source = "endTime", qualifiedByName = "stringToLocalTime")
    Event toEntity(EventDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "category", expression = "java(dto.getCategory() == null ? entity.getCategory() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Event.Category.class, dto.getCategory()))")
    @Mapping(target = "status", expression = "java(dto.getStatus() == null ? entity.getStatus() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Event.Status.class, dto.getStatus()))")
    @Mapping(target = "eventDate", source = "eventDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "startTime", source = "startTime", qualifiedByName = "stringToLocalTime")
    @Mapping(target = "endTime", source = "endTime", qualifiedByName = "stringToLocalTime")
    void updateEntityFromDto(EventDTO dto, @MappingTarget Event entity);
}
