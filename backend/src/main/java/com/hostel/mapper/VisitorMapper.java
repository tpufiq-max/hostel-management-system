package com.hostel.mapper;

import com.hostel.dto.VisitorDTO;
import com.hostel.entity.Visitor;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = CommonConverters.class,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface VisitorMapper {

    @Mapping(target = "relation", expression = "java(entity.getRelation() == null ? null : entity.getRelation().name())")
    @Mapping(target = "status", expression = "java(entity.getStatus() == null ? null : entity.getStatus().name())")
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.name")
    @Mapping(target = "checkInTime", source = "checkInTime", qualifiedByName = "localDateTimeToString")
    @Mapping(target = "checkOutTime", source = "checkOutTime", qualifiedByName = "localDateTimeToString")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "localDateTimeToString")
    VisitorDTO toDto(Visitor entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "relation", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Visitor.Relation.class, dto.getRelation()))")
    @Mapping(target = "status", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Visitor.Status.class, dto.getStatus()))")
    @Mapping(target = "checkInTime", source = "checkInTime", qualifiedByName = "stringToLocalDateTime")
    @Mapping(target = "checkOutTime", source = "checkOutTime", qualifiedByName = "stringToLocalDateTime")
    Visitor toEntity(VisitorDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "relation", expression = "java(dto.getRelation() == null ? entity.getRelation() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Visitor.Relation.class, dto.getRelation()))")
    @Mapping(target = "status", expression = "java(dto.getStatus() == null ? entity.getStatus() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Visitor.Status.class, dto.getStatus()))")
    @Mapping(target = "checkInTime", source = "checkInTime", qualifiedByName = "stringToLocalDateTime")
    @Mapping(target = "checkOutTime", source = "checkOutTime", qualifiedByName = "stringToLocalDateTime")
    void updateEntityFromDto(VisitorDTO dto, @MappingTarget Visitor entity);
}
