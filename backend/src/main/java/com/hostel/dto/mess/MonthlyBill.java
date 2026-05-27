package com.hostel.dto.mess;

import java.util.ArrayList;
import java.util.List;

/**
 * One student's mess bill for a single calendar month.
 *
 *   days           — line items, one DailyCharge per day that has any
 *                    attendance row (PRESENT or ABSENT) for the student.
 *                    Days with no rows at all are omitted.
 *   breakfastCount — number of days BREAKFAST was PRESENT
 *   lunchCount     — number of days LUNCH was PRESENT
 *   dinnerCount    — number of days DINNER was PRESENT
 *   specialDinnerCount — number of days SPECIAL_DINNER was PRESENT
 *   totalMeals     — sum of breakfastCount + lunchCount + dinnerCount
 *                    (excludes special dinner; matches the pricing rule input)
 *   grandTotal     — sum of all DailyCharge.total values
 */
public class MonthlyBill {
    private Long studentId;
    private String name;
    private String rollNumber;
    private int year;
    private int month;        // 1..12
    private List<DailyCharge> days = new ArrayList<>();

    private int breakfastCount;
    private int lunchCount;
    private int dinnerCount;
    private int specialDinnerCount;
    private int totalMeals;
    private int daysAttended;
    private int grandTotal;

    public MonthlyBill() {}

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public List<DailyCharge> getDays() { return days; }
    public void setDays(List<DailyCharge> days) { this.days = days; }

    public int getBreakfastCount() { return breakfastCount; }
    public void setBreakfastCount(int breakfastCount) { this.breakfastCount = breakfastCount; }

    public int getLunchCount() { return lunchCount; }
    public void setLunchCount(int lunchCount) { this.lunchCount = lunchCount; }

    public int getDinnerCount() { return dinnerCount; }
    public void setDinnerCount(int dinnerCount) { this.dinnerCount = dinnerCount; }

    public int getSpecialDinnerCount() { return specialDinnerCount; }
    public void setSpecialDinnerCount(int specialDinnerCount) { this.specialDinnerCount = specialDinnerCount; }

    public int getTotalMeals() { return totalMeals; }
    public void setTotalMeals(int totalMeals) { this.totalMeals = totalMeals; }

    public int getDaysAttended() { return daysAttended; }
    public void setDaysAttended(int daysAttended) { this.daysAttended = daysAttended; }

    public int getGrandTotal() { return grandTotal; }
    public void setGrandTotal(int grandTotal) { this.grandTotal = grandTotal; }
}
