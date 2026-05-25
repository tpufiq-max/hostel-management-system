package com.hostel.mapper;

import com.hostel.dto.MessMenuDTO;
import com.hostel.entity.MessMenu;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = CommonConverters.class,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface MessMenuMapper {

    @Mapping(target = "day", expression = "java(entity.getDay() == null ? null : entity.getDay().name())")
    @Mapping(target = "mealType", expression = "java(entity.getMealType() == null ? null : entity.getMealType().name())")
    @Mapping(target = "effectiveFrom", source = "effectiveFrom", qualifiedByName = "localDateToString")
    @Mapping(target = "effectiveTo", source = "effectiveTo", qualifiedByName = "localDateToString")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "localDateTimeToString")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "localDateTimeToString")
    MessMenuDTO toDto(MessMenu entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "day", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.MessMenu.Day.class, dto.getDay()))")
    @Mapping(target = "mealType", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.MessMenu.MealType.class, dto.getMealType()))")
    @Mapping(target = "effectiveFrom", source = "effectiveFrom", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "effectiveTo", source = "effectiveTo", qualifiedByName = "stringToLocalDate")
    MessMenu toEntity(MessMenuDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "day", expression = "java(dto.getDay() == null ? entity.getDay() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.MessMenu.Day.class, dto.getDay()))")
    @Mapping(target = "mealType", expression = "java(dto.getMealType() == null ? entity.getMealType() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.MessMenu.MealType.class, dto.getMealType()))")
    @Mapping(target = "effectiveFrom", source = "effectiveFrom", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "effectiveTo", source = "effectiveTo", qualifiedByName = "stringToLocalDate")
    void updateEntityFromDto(MessMenuDTO dto, @MappingTarget MessMenu entity);
}
