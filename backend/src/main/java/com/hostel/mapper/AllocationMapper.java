package com.hostel.mapper;

import com.hostel.dto.AllocationDTO;
import com.hostel.entity.Allocation;
import com.hostel.entity.Room;
import com.hostel.entity.Student;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = CommonConverters.class,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface AllocationMapper {

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.name")
    @Mapping(target = "roomId", source = "room.id")
    @Mapping(target = "roomNumber", source = "room.roomNumber")
    @Mapping(target = "course", source = "student.course")
    @Mapping(target = "assignedOn", source = "assignedOn", qualifiedByName = "localDateToString")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "localDateTimeToString")
    AllocationDTO toDto(Allocation allocation);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "student", source = "student")
    @Mapping(target = "room", source = "room")
    @Mapping(target = "assignedOn", source = "dto.assignedOn", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "notes", source = "dto.notes")
    Allocation toEntity(AllocationDTO dto, Student student, Room room);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "assignedOn", source = "assignedOn", qualifiedByName = "stringToLocalDate")
    void updateEntityFromDto(AllocationDTO dto, @MappingTarget Allocation entity);
}
