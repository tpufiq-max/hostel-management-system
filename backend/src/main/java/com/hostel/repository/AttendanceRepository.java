package com.hostel.repository;

import com.hostel.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
    Optional<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);
    long countByDateAndStatus(LocalDate date, Attendance.AttendanceStatus status);
    long countByDate(LocalDate date);

    @Query("SELECT a.date, a.status, COUNT(a) FROM Attendance a " +
           "WHERE a.date BETWEEN :startDate AND :endDate " +
           "GROUP BY a.date, a.status ORDER BY a.date")
    List<Object[]> countByDateRangeGrouped(@Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);
}
