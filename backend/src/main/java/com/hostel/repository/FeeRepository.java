package com.hostel.repository;

import com.hostel.entity.Fee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByStudentId(Long studentId);
    Page<Fee> findByPaymentStatus(Fee.PaymentStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM Fee f WHERE f.paymentStatus = 'PAID'")
    double getTotalRevenue();

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM Fee f WHERE f.paymentStatus = 'PENDING' OR f.paymentStatus = 'OVERDUE'")
    double getPendingAmount();

    long countByPaymentStatus(Fee.PaymentStatus status);

    @Query("SELECT CONCAT(YEAR(f.paymentDate), '-', LPAD(CAST(MONTH(f.paymentDate) AS String), 2, '0')) as month, " +
           "COALESCE(SUM(f.amount), 0) as total FROM Fee f " +
           "WHERE f.paymentStatus = 'PAID' AND f.paymentDate IS NOT NULL " +
           "GROUP BY YEAR(f.paymentDate), MONTH(f.paymentDate) " +
           "ORDER BY YEAR(f.paymentDate), MONTH(f.paymentDate)")
    List<Object[]> getMonthlyRevenue();
}
