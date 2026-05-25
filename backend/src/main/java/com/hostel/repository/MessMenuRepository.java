package com.hostel.repository;

import com.hostel.entity.MessMenu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessMenuRepository extends JpaRepository<MessMenu, Long> {
    Page<MessMenu> findByDay(MessMenu.Day day, Pageable pageable);
    Page<MessMenu> findByMealType(MessMenu.MealType mealType, Pageable pageable);
    Page<MessMenu> findByDayAndMealType(MessMenu.Day day, MessMenu.MealType mealType, Pageable pageable);
    List<MessMenu> findByIsActiveTrue();
    Page<MessMenu> findByIsActiveTrue(Pageable pageable);
}
