package com.hostel.mapper;

import com.hostel.exception.BadRequestException;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

/**
 * Reusable type converters used across MapStruct mappers.
 *
 * <p>This component is referenced via {@code @Mapper(uses = CommonConverters.class)},
 * which lets MapStruct call any {@link Named}-tagged method by qualifier name.
 *
 * <p>All converters are null-safe: passing {@code null} returns {@code null} so
 * that {@link org.mapstruct.NullValuePropertyMappingStrategy#IGNORE} can skip
 * those fields instead of clobbering existing values during partial updates.
 *
 * <p>Validation conversion errors are surfaced as {@link BadRequestException}
 * so the global exception handler renders them as HTTP 400 responses.
 */
@Component
public class CommonConverters {

    // ---------- LocalDate (YYYY-MM-DD) ----------

    @Named("stringToLocalDate")
    public LocalDate stringToLocalDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            throw new BadRequestException("Invalid date format '" + value + "'. Expected YYYY-MM-DD.");
        }
    }

    @Named("localDateToString")
    public String localDateToString(LocalDate value) {
        return value == null ? null : value.toString();
    }

    // ---------- LocalDateTime (ISO-8601) ----------

    @Named("stringToLocalDateTime")
    public LocalDateTime stringToLocalDateTime(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ex) {
            throw new BadRequestException("Invalid date-time format '" + value + "'. Expected ISO-8601.");
        }
    }

    @Named("localDateTimeToString")
    public String localDateTimeToString(LocalDateTime value) {
        return value == null ? null : value.toString();
    }

    // ---------- Generic enum helpers (used via parametric generics) ----------

    /**
     * Parses an enum constant from its name, case-insensitively.
     * Throws {@link BadRequestException} if the input does not match a known
     * value, so the API surfaces 400 instead of 500.
     */
    public static <E extends Enum<E>> E toEnum(Class<E> type, String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(type, value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid value '" + value + "' for " + type.getSimpleName());
        }
    }

    public static <E extends Enum<E>> String enumToString(E value) {
        return value == null ? null : value.name();
    }
}
