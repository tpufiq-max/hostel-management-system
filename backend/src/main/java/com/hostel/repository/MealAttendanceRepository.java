package com.hostel.repository;

import com.hostel.entity.MealAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealAttendanceRepository extends JpaRepository<MealAttendance, Long> {

    List<MealAttendance> findByStudentIdAndDateBetween(Long studentId, LocalDate from, LocalDate to);

    List<MealAttendance> findByDate(LocalDate date);

    List<MealAttendance> findByDateBetween(LocalDate from, LocalDate to);

    Optional<MealAttendance> findByStudentIdAndDateAndMealType(
            Long studentId, LocalDate date, MealAttendance.MealType mealType);
}
