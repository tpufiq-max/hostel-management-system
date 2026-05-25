package com.hostel.mapper;

import com.hostel.dto.ComplaintDTO;
import com.hostel.entity.Complaint;
import com.hostel.entity.Student;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.LocalDateTime;

/**
 * Maps between {@link Complaint} and {@link ComplaintDTO}.
 *
 * <p>Two pieces of business logic naturally live in the mapper:
 * <ol>
 *   <li>Newly created complaints always start with status {@code OPEN};</li>
 *   <li>An update that flips the status to {@code RESOLVED} stamps the
 *       {@code resolvedAt} timestamp — see {@link #stampResolvedAt}.</li>
 * </ol>
 */
@Mapper(componentModel = "spring", uses = CommonConverters.class,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface ComplaintMapper {

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.name")
    @Mapping(target = "category", expression = "java(complaint.getCategory() == null ? null : complaint.getCategory().name())")
    @Mapping(target = "complaintStatus", expression = "java(complaint.getComplaintStatus() == null ? null : complaint.getComplaintStatus().name())")
    @Mapping(target = "priority", expression = "java(complaint.getPriority() == null ? null : complaint.getPriority().name())")
    @Mapping(target = "resolvedAt", source = "resolvedAt", qualifiedByName = "localDateTimeToString")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "localDateTimeToString")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "localDateTimeToString")
    ComplaintDTO toDto(Complaint complaint);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "resolvedAt", ignore = true)
    @Mapping(target = "student", source = "student")
    @Mapping(target = "category", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Complaint.ComplaintCategory.class, dto.getCategory()))")
    @Mapping(target = "complaintStatus", expression = "java(com.hostel.entity.Complaint.ComplaintStatus.OPEN)")
    @Mapping(target = "priority", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Complaint.Priority.class, dto.getPriority()))")
    Complaint toEntity(ComplaintDTO dto, Student student);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "resolvedAt", ignore = true)
    @Mapping(target = "category", expression = "java(dto.getCategory() == null ? entity.getCategory() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Complaint.ComplaintCategory.class, dto.getCategory()))")
    @Mapping(target = "complaintStatus", expression = "java(dto.getComplaintStatus() == null ? entity.getComplaintStatus() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Complaint.ComplaintStatus.class, dto.getComplaintStatus()))")
    @Mapping(target = "priority", expression = "java(dto.getPriority() == null ? entity.getPriority() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Complaint.Priority.class, dto.getPriority()))")
    void updateEntityFromDto(ComplaintDTO dto, @MappingTarget Complaint entity);

    @AfterMapping
    default void applyDefaults(@MappingTarget Complaint entity) {
        if (entity.getCategory() == null) {
            entity.setCategory(Complaint.ComplaintCategory.OTHER);
        }
        if (entity.getPriority() == null) {
            entity.setPriority(Complaint.Priority.MEDIUM);
        }
    }

    /**
     * Stamp {@code resolvedAt} the moment a complaint transitions to RESOLVED.
     * No-op unless the new status is RESOLVED and the entity wasn't already
     * resolved earlier.
     */
    @AfterMapping
    default void stampResolvedAt(@MappingTarget Complaint entity) {
        if (entity.getComplaintStatus() == Complaint.ComplaintStatus.RESOLVED
                && entity.getResolvedAt() == null) {
            entity.setResolvedAt(LocalDateTime.now());
        }
    }
}
