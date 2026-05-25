package com.hostel.mapper;

import com.hostel.dto.StudentDTO;
import com.hostel.entity.Student;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.LocalDate;

/**
 * Maps between {@link Student} and {@link StudentDTO}.
 *
 * <p>String dates in the DTO are converted to/from {@link LocalDate} via
 * {@link CommonConverters}. Enum-valued fields use a small inline helper.
 *
 * <p>Update mappings use {@link NullValuePropertyMappingStrategy#IGNORE} so a
 * partial PATCH-style payload only overwrites non-null fields and preserves
 * existing values for everything else.
 */
@Mapper(componentModel = "spring", uses = CommonConverters.class)
public interface StudentMapper {

    // ---------- Entity -> DTO ----------

    @Mapping(target = "dateOfBirth", source = "dateOfBirth", qualifiedByName = "localDateToString")
    @Mapping(target = "admissionDate", source = "admissionDate", qualifiedByName = "localDateToString")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "localDateTimeToString")
    @Mapping(target = "feesStatus", expression = "java(student.getFeesStatus() == null ? null : student.getFeesStatus().name())")
    StudentDTO toDto(Student student);

    // ---------- DTO -> Entity (create) ----------

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    // Lombok @Builder names the method after the field (`isActive`),
    // not the JavaBean property (`active`). MapStruct picks the builder
    // when one is available, so we have to target the field name here.
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "dateOfBirth", source = "dateOfBirth", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "admissionDate", source = "admissionDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "feesStatus", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Student.FeesStatus.class, dto.getFeesStatus()))")
    Student toEntity(StudentDTO dto);

    // ---------- DTO -> Entity (partial update; preserves nulls) ----------

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "dateOfBirth", source = "dateOfBirth", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "admissionDate", source = "admissionDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "feesStatus", expression = "java(dto.getFeesStatus() == null ? entity.getFeesStatus() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Student.FeesStatus.class, dto.getFeesStatus()))")
    void updateEntityFromDto(StudentDTO dto, @MappingTarget Student entity);

    /**
     * Apply sensible defaults that the entity-level field initializers can't
     * provide because MapStruct calls setters and an explicit {@code null}
     * from the DTO would otherwise wipe the default. The {@code if (== null)}
     * guards make this safe for partial updates: existing non-null values are
     * never overwritten.
     */
    @AfterMapping
    default void applyDefaults(StudentDTO dto, @MappingTarget Student entity) {
        if (entity.getFeesStatus() == null) {
            entity.setFeesStatus(Student.FeesStatus.PENDING);
        }
        if (entity.getAdmissionDate() == null) {
            entity.setAdmissionDate(LocalDate.now());
        }
    }
}
