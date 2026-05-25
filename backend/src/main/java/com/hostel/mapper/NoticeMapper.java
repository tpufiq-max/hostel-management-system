package com.hostel.mapper;

import com.hostel.dto.NoticeDTO;
import com.hostel.entity.Notice;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = CommonConverters.class,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface NoticeMapper {

    @Mapping(target = "category", expression = "java(entity.getCategory() == null ? null : entity.getCategory().name())")
    @Mapping(target = "priority", expression = "java(entity.getPriority() == null ? null : entity.getPriority().name())")
    @Mapping(target = "targetAudience", expression = "java(entity.getTargetAudience() == null ? null : entity.getTargetAudience().name())")
    @Mapping(target = "publishedAt", source = "publishedAt", qualifiedByName = "localDateTimeToString")
    @Mapping(target = "expiresAt", source = "expiresAt", qualifiedByName = "localDateTimeToString")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "localDateTimeToString")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "localDateTimeToString")
    NoticeDTO toDto(Notice entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "category", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Notice.Category.class, dto.getCategory()))")
    @Mapping(target = "priority", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Notice.Priority.class, dto.getPriority()))")
    @Mapping(target = "targetAudience", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Notice.TargetAudience.class, dto.getTargetAudience()))")
    @Mapping(target = "publishedAt", source = "publishedAt", qualifiedByName = "stringToLocalDateTime")
    @Mapping(target = "expiresAt", source = "expiresAt", qualifiedByName = "stringToLocalDateTime")
    Notice toEntity(NoticeDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "category", expression = "java(dto.getCategory() == null ? entity.getCategory() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Notice.Category.class, dto.getCategory()))")
    @Mapping(target = "priority", expression = "java(dto.getPriority() == null ? entity.getPriority() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Notice.Priority.class, dto.getPriority()))")
    @Mapping(target = "targetAudience", expression = "java(dto.getTargetAudience() == null ? entity.getTargetAudience() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Notice.TargetAudience.class, dto.getTargetAudience()))")
    @Mapping(target = "publishedAt", source = "publishedAt", qualifiedByName = "stringToLocalDateTime")
    @Mapping(target = "expiresAt", source = "expiresAt", qualifiedByName = "stringToLocalDateTime")
    void updateEntityFromDto(NoticeDTO dto, @MappingTarget Notice entity);
}
