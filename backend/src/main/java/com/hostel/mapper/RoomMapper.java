package com.hostel.mapper;

import com.hostel.dto.RoomDTO;
import com.hostel.entity.Room;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * Maps between {@link Room} and {@link RoomDTO}.
 *
 * <p>Defaults for {@code type}, {@code status}, and {@code occupied} are
 * applied via {@link #applyDefaults} since explicit-null DTO values would
 * otherwise wipe entity field initializers.
 */
@Mapper(componentModel = "spring", uses = CommonConverters.class,
        builder = @org.mapstruct.Builder(disableBuilder = true))
public interface RoomMapper {

    @Mapping(target = "type", expression = "java(room.getType() == null ? null : room.getType().name())")
    @Mapping(target = "status", expression = "java(room.getStatus() == null ? null : room.getStatus().name())")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "localDateTimeToString")
    RoomDTO toDto(Room room);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "students", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "type", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Room.RoomType.class, dto.getType()))")
    @Mapping(target = "status", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Room.RoomStatus.class, dto.getStatus()))")
    Room toEntity(RoomDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "students", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "type", expression = "java(dto.getType() == null ? entity.getType() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Room.RoomType.class, dto.getType()))")
    @Mapping(target = "status", expression = "java(dto.getStatus() == null ? entity.getStatus() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Room.RoomStatus.class, dto.getStatus()))")
    void updateEntityFromDto(RoomDTO dto, @MappingTarget Room entity);

    @AfterMapping
    default void applyDefaults(RoomDTO dto, @MappingTarget Room entity) {
        if (entity.getType() == null) {
            entity.setType(Room.RoomType.DOUBLE);
        }
        if (entity.getStatus() == null) {
            entity.setStatus(Room.RoomStatus.AVAILABLE);
        }
        if (entity.getOccupied() == null) {
            entity.setOccupied(0);
        }
    }
}
