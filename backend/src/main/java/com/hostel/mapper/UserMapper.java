package com.hostel.mapper;

import com.hostel.dto.UserDTO;
import com.hostel.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

/**
 * Maps {@link User} to {@link UserDTO} for auth responses.
 *
 * <p>The role is intentionally lower-cased on the way out; the existing
 * frontend uses {@code role === "admin" | "student" | "warden"}.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", source = "role", qualifiedByName = "roleToLowercase")
    UserDTO toDto(User user);

    @Named("roleToLowercase")
    default String roleToLowercase(User.Role role) {
        return role == null ? null : role.name().toLowerCase();
    }
}
