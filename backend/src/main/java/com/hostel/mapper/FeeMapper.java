package com.hostel.mapper;

import com.hostel.dto.FeeDTO;
import com.hostel.entity.Fee;
import com.hostel.entity.Student;
import org.mapstruct.AfterMapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * Maps between {@link Fee} and {@link FeeDTO}.
 *
 * <p>The {@code Student} reference on the entity is supplied by the service
 * layer (which already loads it to validate the FK), so the mapper does not
 * make any extra queries.
 */
@Mapper(componentModel = "spring", uses = CommonConverters.class)
public interface FeeMapper {

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student.name")
    @Mapping(target = "dueDate", source = "dueDate", qualifiedByName = "localDateToString")
    @Mapping(target = "paymentDate", source = "paymentDate", qualifiedByName = "localDateToString")
    @Mapping(target = "paymentStatus", expression = "java(fee.getPaymentStatus() == null ? null : fee.getPaymentStatus().name())")
    @Mapping(target = "feeType", expression = "java(fee.getFeeType() == null ? null : fee.getFeeType().name())")
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "localDateTimeToString")
    FeeDTO toDto(Fee fee);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "student", source = "student")
    @Mapping(target = "dueDate", source = "dto.dueDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "paymentDate", source = "dto.paymentDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "paymentStatus", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Fee.PaymentStatus.class, dto.getPaymentStatus()))")
    @Mapping(target = "feeType", expression = "java(com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Fee.FeeType.class, dto.getFeeType()))")
    Fee toEntity(FeeDTO dto, Student student);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "dueDate", source = "dueDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "paymentDate", source = "paymentDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "paymentStatus", expression = "java(dto.getPaymentStatus() == null ? entity.getPaymentStatus() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Fee.PaymentStatus.class, dto.getPaymentStatus()))")
    @Mapping(target = "feeType", expression = "java(dto.getFeeType() == null ? entity.getFeeType() : com.hostel.mapper.CommonConverters.toEnum(com.hostel.entity.Fee.FeeType.class, dto.getFeeType()))")
    void updateEntityFromDto(FeeDTO dto, @MappingTarget Fee entity);

    @AfterMapping
    default void applyDefaults(@MappingTarget Fee entity) {
        if (entity.getPaymentStatus() == null) {
            entity.setPaymentStatus(Fee.PaymentStatus.PENDING);
        }
        if (entity.getFeeType() == null) {
            entity.setFeeType(Fee.FeeType.HOSTEL);
        }
    }
}
