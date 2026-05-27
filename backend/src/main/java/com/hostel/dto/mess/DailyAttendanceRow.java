package com.hostel.dto.mess;

/**
 * One row of the admin's daily attendance grid: a student plus the four
 * meal-slot statuses for a single day. Each status is "PRESENT" / "ABSENT"
 * (default ABSENT when no row exists yet) so the grid renders cleanly.
 */
public class DailyAttendanceRow {
    private Long studentId;
    private String name;
    private String rollNumber;
    private String breakfast;     // PRESENT | ABSENT
    private String lunch;
    private String dinner;
    private String specialDinner;

    public DailyAttendanceRow() {}

    public DailyAttendanceRow(Long studentId, String name, String rollNumber,
                              String breakfast, String lunch, String dinner, String specialDinner) {
        this.studentId = studentId;
        this.name = name;
        this.rollNumber = rollNumber;
        this.breakfast = breakfast;
        this.lunch = lunch;
        this.dinner = dinner;
        this.specialDinner = specialDinner;
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getBreakfast() { return breakfast; }
    public void setBreakfast(String breakfast) { this.breakfast = breakfast; }

    public String getLunch() { return lunch; }
    public void setLunch(String lunch) { this.lunch = lunch; }

    public String getDinner() { return dinner; }
    public void setDinner(String dinner) { this.dinner = dinner; }

    public String getSpecialDinner() { return specialDinner; }
    public void setSpecialDinner(String specialDinner) { this.specialDinner = specialDinner; }
}
