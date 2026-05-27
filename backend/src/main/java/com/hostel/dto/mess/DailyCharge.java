package com.hostel.dto.mess;

/**
 * Per-day pricing breakdown.
 *
 * Pricing rules:
 *   • Of BREAKFAST + LUNCH + DINNER, count only PRESENT entries.
 *     0 → ₹0, 1 → ₹50, 2 → ₹100, 3 → ₹115.
 *   • If SPECIAL_DINNER is PRESENT, add a flat ₹50 on top.
 */
public class DailyCharge {
    private String date;            // ISO yyyy-MM-dd
    private int mealsCount;         // 0..3 — count of PRESENT in B/L/D
    private int baseCharge;         // 0 | 50 | 100 | 115
    private boolean specialDinnerPresent;
    private int specialDinnerCharge; // 0 or 50
    private int total;              // baseCharge + specialDinnerCharge

    public DailyCharge() {}

    public DailyCharge(String date, int mealsCount, int baseCharge,
                       boolean specialDinnerPresent, int specialDinnerCharge, int total) {
        this.date = date;
        this.mealsCount = mealsCount;
        this.baseCharge = baseCharge;
        this.specialDinnerPresent = specialDinnerPresent;
        this.specialDinnerCharge = specialDinnerCharge;
        this.total = total;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public int getMealsCount() { return mealsCount; }
    public void setMealsCount(int mealsCount) { this.mealsCount = mealsCount; }

    public int getBaseCharge() { return baseCharge; }
    public void setBaseCharge(int baseCharge) { this.baseCharge = baseCharge; }

    public boolean isSpecialDinnerPresent() { return specialDinnerPresent; }
    public void setSpecialDinnerPresent(boolean specialDinnerPresent) {
        this.specialDinnerPresent = specialDinnerPresent;
    }

    public int getSpecialDinnerCharge() { return specialDinnerCharge; }
    public void setSpecialDinnerCharge(int specialDinnerCharge) {
        this.specialDinnerCharge = specialDinnerCharge;
    }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
}
