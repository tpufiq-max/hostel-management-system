package com.hostel.dto.mess;

/**
 * One meal attendance row, flattened for the wire.
 */
public class MealAttendanceDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private String date;       // ISO yyyy-MM-dd
    private String mealType;   // BREAKFAST | LUNCH | DINNER | SPECIAL_DINNER
    private String status;     // PRESENT | ABSENT

    public MealAttendanceDTO() {}

    public MealAttendanceDTO(Long id, Long studentId, String studentName, String rollNumber,
                             String date, String mealType, String status) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.rollNumber = rollNumber;
        this.date = date;
        this.mealType = mealType;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getMealType() { return mealType; }
    public void setMealType(String mealType) { this.mealType = mealType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
