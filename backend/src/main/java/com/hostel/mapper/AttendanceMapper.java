package com.hostel.mapper;

import com.hostel.dto.AttendanceDTO;
import com.hostel.entity.Attendance;
import com.hostel.entity.Student;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * Maps between {@link Attendance} and {@link AttendanceDTO}.
 *
 * <p>Like {@link FeeMapper}, the {@code Student} association is supplied by
 * the service layer rather than re-fetched in the mapper.
 */
@Mapper(componentModel = "spring", uses = CommonConverters.class)
public interface AttendanceMapper {

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.name")
    @Mapping(target = "rollNumber", source = "student.rollNumber")
    @Mapping(target = "date", source = "date", qualifiedByName = "localDateToString")
    @Mapping(target = "status", expression = "java(attendance.getStatus() == null ? null : attendance.getStatus().name())")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "localDateTimeToString")
    AttendanceDTO toDto(Attendance attendance);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "student", source = "student")
    @Mapping(target = "date", source = "dto.date", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "status", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Attendance.AttendanceStatus.class, dto.getStatus()))")
    Attendance toEntity(AttendanceDTO dto, Student student);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "date", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "status", expression = "java(dto.getStatus() == null ? entity.getStatus() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Attendance.AttendanceStatus.class, dto.getStatus()))")
    void updateEntityFromDto(AttendanceDTO dto, @MappingTarget Attendance entity);
}
