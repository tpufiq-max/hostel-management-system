package com.hostel.config;

import com.hostel.entity.*;
import com.hostel.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * DataSeeder — populates demo records for the new modules
 * (MessMenu, MaintenanceRequest, Visitor, Notice, Event).
 *
 * Runs only when {@code app.seed.demo-data.enabled=true} (set in
 * application-dev.properties; off by default and explicitly off in prod).
 *
 * Skips per-table when records already exist, so it's idempotent.
 *
 * Ordered to run AFTER DataInitializer (which creates the admin/student
 * users + sample rooms + sample students), so visitors and maintenance
 * requests can reference real students.
 */
@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    @Order(2)
    CommandLineRunner seedDemoData(
            @Value("${app.seed.demo-data.enabled:false}") boolean enabled,
            MessMenuRepository messMenuRepository,
            MaintenanceRequestRepository maintenanceRepository,
            VisitorRepository visitorRepository,
            NoticeRepository noticeRepository,
            EventRepository eventRepository,
            StudentRepository studentRepository) {

        return args -> {
            if (!enabled) {
                log.info("DataSeeder: app.seed.demo-data.enabled=false - skipping demo data seeding");
                return;
            }

            try {
                int messCount        = seedMessMenus(messMenuRepository);
                int maintenanceCount = seedMaintenanceRequests(maintenanceRepository, studentRepository);
                int visitorCount     = seedVisitors(visitorRepository);
                int noticeCount      = seedNotices(noticeRepository);
                int eventCount       = seedEvents(eventRepository);

                log.info("DataSeeder: seeded {} mess menus, {} maintenance requests, {} visitors, {} notices, {} events",
                        messCount, maintenanceCount, visitorCount, noticeCount, eventCount);
            } catch (Exception e) {
                // Don't crash the app on a seed failure - the schema may differ in some envs.
                log.warn("DataSeeder: error during seeding (non-fatal): {}", e.getMessage(), e);
            }
        };
    }

    /* MessMenu */

    private int seedMessMenus(MessMenuRepository repo) {
        if (repo.count() > 0) return 0;

        record Meal(MessMenu.Day day, MessMenu.MealType type, String items, String note) {}

        List<Meal> meals = List.of(
                // Breakfast
                new Meal(MessMenu.Day.MON, MessMenu.MealType.BREAKFAST, "Idli, Sambar, Coconut Chutney, Tea/Coffee", null),
                new Meal(MessMenu.Day.TUE, MessMenu.MealType.BREAKFAST, "Aloo Paratha, Curd, Pickle, Tea", null),
                new Meal(MessMenu.Day.WED, MessMenu.MealType.BREAKFAST, "Masala Dosa, Sambar, Chutney, Coffee", null),
                new Meal(MessMenu.Day.THU, MessMenu.MealType.BREAKFAST, "Poha, Boiled Egg, Bread Toast, Tea", null),
                new Meal(MessMenu.Day.FRI, MessMenu.MealType.BREAKFAST, "Upma, Coconut Chutney, Banana, Tea", null),
                new Meal(MessMenu.Day.SAT, MessMenu.MealType.BREAKFAST, "Puri, Aloo Sabji, Halwa, Tea", "Special weekend menu"),
                new Meal(MessMenu.Day.SUN, MessMenu.MealType.BREAKFAST, "Chole Bhature, Onion Salad, Lassi", "Special weekend menu"),
                // Lunch
                new Meal(MessMenu.Day.MON, MessMenu.MealType.LUNCH, "Rice, Chapati, Dal Tadka, Mixed Veg, Curd", null),
                new Meal(MessMenu.Day.TUE, MessMenu.MealType.LUNCH, "Rice, Chapati, Rajma, Aloo Gobi, Salad", null),
                new Meal(MessMenu.Day.WED, MessMenu.MealType.LUNCH, "Rice, Chapati, Sambar, Beans Poriyal, Curd", null),
                new Meal(MessMenu.Day.THU, MessMenu.MealType.LUNCH, "Rice, Chapati, Chana Masala, Bhindi Fry, Salad", null),
                new Meal(MessMenu.Day.FRI, MessMenu.MealType.LUNCH, "Rice, Chapati, Dal Fry, Cauliflower Curry, Curd", null),
                new Meal(MessMenu.Day.SAT, MessMenu.MealType.LUNCH, "Veg Biryani, Raita, Boiled Egg, Salad, Pickle", "Saturday special"),
                new Meal(MessMenu.Day.SUN, MessMenu.MealType.LUNCH, "Rice, Chapati, Paneer Butter Masala, Dal, Sweet", "Sunday special"),
                // Dinner
                new Meal(MessMenu.Day.MON, MessMenu.MealType.DINNER, "Chapati, Rice, Yellow Dal, Aloo Matar, Salad", null),
                new Meal(MessMenu.Day.TUE, MessMenu.MealType.DINNER, "Chapati, Rice, Dal Makhani, Mixed Veg, Curd", null),
                new Meal(MessMenu.Day.WED, MessMenu.MealType.DINNER, "Chapati, Rice, Sambar, Cabbage Sabji, Salad", null),
                new Meal(MessMenu.Day.THU, MessMenu.MealType.DINNER, "Chapati, Rice, Tadka Dal, Paneer Bhurji, Curd", null),
                new Meal(MessMenu.Day.FRI, MessMenu.MealType.DINNER, "Chapati, Rice, Egg Curry, Dal, Salad", "Egg day"),
                new Meal(MessMenu.Day.SAT, MessMenu.MealType.DINNER, "Chapati, Rice, Dal, Veg Kofta, Gulab Jamun", "Sweet day"),
                new Meal(MessMenu.Day.SUN, MessMenu.MealType.DINNER, "Chapati, Rice, Dal, Mixed Veg, Curd, Pickle", null),
                // Snacks
                new Meal(MessMenu.Day.MON, MessMenu.MealType.SNACKS, "Samosa, Tea/Coffee", null),
                new Meal(MessMenu.Day.TUE, MessMenu.MealType.SNACKS, "Veg Sandwich, Tea/Coffee", null),
                new Meal(MessMenu.Day.WED, MessMenu.MealType.SNACKS, "Maggi Noodles, Lemon Tea", null),
                new Meal(MessMenu.Day.THU, MessMenu.MealType.SNACKS, "Pakora, Tea/Coffee", null),
                new Meal(MessMenu.Day.FRI, MessMenu.MealType.SNACKS, "Bread Pakora, Coffee", null),
                new Meal(MessMenu.Day.SAT, MessMenu.MealType.SNACKS, "Pav Bhaji, Buttermilk", null),
                new Meal(MessMenu.Day.SUN, MessMenu.MealType.SNACKS, "Biscuits, Tea/Coffee, Fruit", null)
        );

        for (Meal m : meals) {
            repo.save(Objects.requireNonNull(MessMenu.builder()
                    .day(m.day())
                    .mealType(m.type())
                    .items(m.items())
                    .specialNote(m.note())
                    .isActive(true)
                    .effectiveFrom(LocalDate.now())
                    .build()));
        }
        return meals.size();
    }

    /* MaintenanceRequest */

    private int seedMaintenanceRequests(MaintenanceRequestRepository repo, StudentRepository studentRepository) {
        if (repo.count() > 0) return 0;

        List<Student> students = studentRepository.findAll();
        Student firstStudent = students.isEmpty() ? null : students.get(0);

        record Req(String title, String description, MaintenanceRequest.Category category,
                   MaintenanceRequest.Priority priority, MaintenanceRequest.Status status,
                   String room, String assignee, int reportedDaysAgo, Integer completedDaysAgo, String notes) {}

        List<Req> requests = new ArrayList<>(List.of(
                // 10 OPEN
                new Req("Leaking faucet in bathroom",   "Constant drip from main tap",  MaintenanceRequest.Category.PLUMBING,   MaintenanceRequest.Priority.MEDIUM, MaintenanceRequest.Status.OPEN, "101", null, 1, null, null),
                new Req("Broken ceiling fan",            "Fan stopped working completely", MaintenanceRequest.Category.ELECTRICAL, MaintenanceRequest.Priority.HIGH, MaintenanceRequest.Status.OPEN, "205", null, 2, null, null),
                new Req("Door lock not working",         "Key not turning, jammed",       MaintenanceRequest.Category.STRUCTURAL, MaintenanceRequest.Priority.HIGH, MaintenanceRequest.Status.OPEN, "302", null, 1, null, null),
                new Req("Refrigerator not cooling",      "Common area fridge issue",      MaintenanceRequest.Category.APPLIANCE,  MaintenanceRequest.Priority.MEDIUM, MaintenanceRequest.Status.OPEN, "Common-1", null, 3, null, null),
                new Req("Cracked window glass",          "Right side window cracked",     MaintenanceRequest.Category.STRUCTURAL, MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.OPEN, "108", null, 4, null, null),
                new Req("Geyser not heating water",      "No hot water for 2 days",       MaintenanceRequest.Category.APPLIANCE,  MaintenanceRequest.Priority.HIGH, MaintenanceRequest.Status.OPEN, "201", null, 2, null, null),
                new Req("Loose floor tile",              "Tile near bed is loose",        MaintenanceRequest.Category.STRUCTURAL, MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.OPEN, "115", null, 5, null, null),
                new Req("Power socket not working",      "One wall socket dead",          MaintenanceRequest.Category.ELECTRICAL, MaintenanceRequest.Priority.MEDIUM, MaintenanceRequest.Status.OPEN, "210", null, 1, null, null),
                new Req("Leaking shower head",           "Drips even when off",           MaintenanceRequest.Category.PLUMBING,   MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.OPEN, "303", null, 6, null, null),
                new Req("Pest control needed",           "Cockroaches in kitchen area",   MaintenanceRequest.Category.CLEANING,   MaintenanceRequest.Priority.HIGH, MaintenanceRequest.Status.OPEN, "Common-2", null, 1, null, null),

                // 5 ASSIGNED
                new Req("Bed frame creaking",            "Loose bolts on bed frame",      MaintenanceRequest.Category.FURNITURE,  MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.ASSIGNED, "104", "Ravi (Carpenter)", 7, null, null),
                new Req("Tube light flickering",         "Bathroom tube light",           MaintenanceRequest.Category.ELECTRICAL, MaintenanceRequest.Priority.MEDIUM, MaintenanceRequest.Status.ASSIGNED, "207", "Suresh (Electrician)", 3, null, null),
                new Req("Cupboard door broken",          "Hinge fell off",                MaintenanceRequest.Category.FURNITURE,  MaintenanceRequest.Priority.MEDIUM, MaintenanceRequest.Status.ASSIGNED, "112", "Ravi (Carpenter)", 5, null, null),
                new Req("AC not cooling efficiently",    "Needs gas refill probably",     MaintenanceRequest.Category.APPLIANCE,  MaintenanceRequest.Priority.HIGH, MaintenanceRequest.Status.ASSIGNED, "305", "AC Service Co.", 2, null, null),
                new Req("Toilet flush broken",           "Lever stuck",                   MaintenanceRequest.Category.PLUMBING,   MaintenanceRequest.Priority.HIGH, MaintenanceRequest.Status.ASSIGNED, "208", "Mohan (Plumber)", 1, null, null),

                // 5 IN_PROGRESS
                new Req("Wall paint peeling",            "Damp wall, paint coming off",    MaintenanceRequest.Category.STRUCTURAL, MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.IN_PROGRESS, "106", "Painting Crew",     14, null, "Repaint scheduled this week"),
                new Req("Electrical wiring issue",       "Spark from main switch",         MaintenanceRequest.Category.ELECTRICAL, MaintenanceRequest.Priority.URGENT, MaintenanceRequest.Status.IN_PROGRESS, "204", "Suresh (Electrician)", 3, null, "Critical - partial work done"),
                new Req("Replace mattress",              "Old mattress, lumpy",            MaintenanceRequest.Category.FURNITURE,  MaintenanceRequest.Priority.MEDIUM, MaintenanceRequest.Status.IN_PROGRESS, "117", "Furniture Co.",     8, null, "New mattress ordered"),
                new Req("Drainage cleaning",             "Slow drain in bathroom",         MaintenanceRequest.Category.PLUMBING,   MaintenanceRequest.Priority.MEDIUM, MaintenanceRequest.Status.IN_PROGRESS, "211", "Mohan (Plumber)",   4, null, null),
                new Req("Door painting",                 "Re-paint room doors",            MaintenanceRequest.Category.STRUCTURAL, MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.IN_PROGRESS, "Block-A",  "Painting Crew",    10, null, null),

                // 8 COMPLETED
                new Req("Replaced ceiling bulb",         "Burnt out bulb",                 MaintenanceRequest.Category.ELECTRICAL, MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.COMPLETED, "103", "Suresh (Electrician)", 12, 10, "Replaced with LED"),
                new Req("Fixed leaking pipe",            "Joint leak under sink",          MaintenanceRequest.Category.PLUMBING,   MaintenanceRequest.Priority.HIGH, MaintenanceRequest.Status.COMPLETED, "206", "Mohan (Plumber)",     15, 13, "Joint resealed"),
                new Req("Repaired study chair",          "Backrest loose",                 MaintenanceRequest.Category.FURNITURE,  MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.COMPLETED, "111", "Ravi (Carpenter)",    20, 18, "Tightened bolts"),
                new Req("Deep cleaning of corridor",     "Monthly deep clean",             MaintenanceRequest.Category.CLEANING,   MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.COMPLETED, "Block-A",  "Cleaning Crew",      8, 7, null),
                new Req("Fixed bathroom door",           "Door not closing",               MaintenanceRequest.Category.STRUCTURAL, MaintenanceRequest.Priority.MEDIUM, MaintenanceRequest.Status.COMPLETED, "118", "Ravi (Carpenter)",   18, 16, "Hinge replaced"),
                new Req("Microwave repaired",            "Common kitchen microwave",       MaintenanceRequest.Category.APPLIANCE,  MaintenanceRequest.Priority.MEDIUM, MaintenanceRequest.Status.COMPLETED, "Common-1", "Service Engineer",   25, 22, null),
                new Req("Replaced toilet seat",          "Cracked seat",                   MaintenanceRequest.Category.PLUMBING,   MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.COMPLETED, "203", "Mohan (Plumber)",    16, 14, null),
                new Req("Window screen installed",       "Mosquito mesh added",            MaintenanceRequest.Category.STRUCTURAL, MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.COMPLETED, "109", "Carpentry Crew",     30, 28, null),

                // 2 REJECTED
                new Req("Personal heater request",       "Personal room heater",            MaintenanceRequest.Category.APPLIANCE,  MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.REJECTED, "215", null, 9, null, "Personal appliances not provided by hostel"),
                new Req("Wallpaper installation",        "Decorative wallpaper for room",   MaintenanceRequest.Category.STRUCTURAL, MaintenanceRequest.Priority.LOW, MaintenanceRequest.Status.REJECTED, "120", null, 11, null, "Modifications to walls not permitted")
        ));

        for (Req r : requests) {
            MaintenanceRequest entity = MaintenanceRequest.builder()
                    .title(r.title())
                    .description(r.description())
                    .category(r.category())
                    .priority(r.priority())
                    .status(r.status())
                    .roomNumber(r.room())
                    .reportedBy(firstStudent)
                    .assignedTo(r.assignee())
                    .reportedDate(LocalDate.now().minusDays(r.reportedDaysAgo()))
                    .completedDate(r.completedDaysAgo() != null ? LocalDate.now().minusDays(r.completedDaysAgo()) : null)
                    .notes(r.notes())
                    .build();
            repo.save(Objects.requireNonNull(entity));
        }
        return requests.size();
    }

    /* Visitor */

    private int seedVisitors(VisitorRepository repo) {
        if (repo.count() > 0) return 0;

        record V(String name, Visitor.Relation relation, String purpose, String phone,
                 String idProof, int checkInHoursAgo, Integer checkOutHoursAgo,
                 Visitor.Status status, String approvedBy, String notes) {}

        List<V> visitors = new ArrayList<>(List.of(
                // 15 CHECKED_IN
                new V("Rajesh Kumar",   Visitor.Relation.PARENT,   "Weekend visit",         "9876543210", "AADHAAR-XXXX-1234", 4,  null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Priya Sharma",   Visitor.Relation.SIBLING,  "Birthday celebration",  "9876543220", "PAN-AABCD1234E",    6,  null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Arjun Mehta",    Visitor.Relation.FRIEND,   "Catching up",           "9876543230", "DL-MH12-2024",      8,  null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Sunita Reddy",   Visitor.Relation.PARENT,   "Documents delivery",    "9876543240", "AADHAAR-YYYY-5678", 2,  null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Vikram Singh",   Visitor.Relation.GUARDIAN, "Health checkup",        "9876543250", "AADHAAR-ZZZZ-9012", 12, null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Anita Desai",    Visitor.Relation.PARENT,   "Family visit",          "9876543260", "PAN-XYBCD5678F",    24, null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Rohit Patel",    Visitor.Relation.SIBLING,  "Festival celebration",  "9876543270", "AADHAAR-AAAA-3456", 3,  null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Meera Iyer",     Visitor.Relation.RELATIVE, "Personal visit",        "9876543280", "VOTER-ABC123456",   18, null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Suresh Nair",    Visitor.Relation.PARENT,   "Project discussion",    "9876543290", "AADHAAR-BBBB-7890", 5,  null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Kavita Joshi",   Visitor.Relation.OTHER,    "Tutor visit",           "9876543300", "PAN-LMNOP1234Q",    10, null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Mahesh Gupta",   Visitor.Relation.FRIEND,   "Project work",          "9876543310", "DL-DL07-9876",      7,  null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Pooja Rao",      Visitor.Relation.SIBLING,  "Movie outing planning", "9876543320", "AADHAAR-CCCC-1357", 14, null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Anil Malhotra",  Visitor.Relation.GUARDIAN, "Medical emergency",     "9876543330", "AADHAAR-DDDD-2468", 1,  null, Visitor.Status.CHECKED_IN, "Warden", "Urgent - escorted to clinic"),
                new V("Deepa Krishnan", Visitor.Relation.RELATIVE, "Marriage invitation",   "9876543340", "PAN-QRSTU5678V",    9,  null, Visitor.Status.CHECKED_IN, "Warden", null),
                new V("Tarun Verma",    Visitor.Relation.FRIEND,   "Books exchange",        "9876543350", "AADHAAR-EEEE-3579", 16, null, Visitor.Status.CHECKED_IN, "Warden", null),

                // 20 CHECKED_OUT
                new V("Ramesh Babu",    Visitor.Relation.PARENT,   "Monthly visit",         "9876544010", "AADHAAR-1111-1111", 72,  68,  Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Sangeeta Devi",  Visitor.Relation.PARENT,   "Document signing",      "9876544020", "PAN-PQRST2345Z",    96,  92,  Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Karan Kapoor",   Visitor.Relation.FRIEND,   "Lunch together",        "9876544030", "DL-KA01-3456",      120, 116, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Lakshmi Menon",  Visitor.Relation.RELATIVE, "Diwali greetings",      "9876544040", "AADHAAR-2222-2222", 144, 138, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Naresh Yadav",   Visitor.Relation.GUARDIAN, "Hospital escort",       "9876544050", "AADHAAR-3333-3333", 168, 160, Visitor.Status.CHECKED_OUT, "Warden", "Returned same day"),
                new V("Geeta Bhat",     Visitor.Relation.SIBLING,  "Project help",          "9876544060", "PAN-UVWXY6789A",    192, 188, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Prakash Jain",   Visitor.Relation.PARENT,   "Quarterly visit",       "9876544070", "AADHAAR-4444-4444", 216, 210, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Divya Pillai",   Visitor.Relation.FRIEND,   "Birthday party",        "9876544080", "VOTER-DEF456789",   240, 230, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Manoj Tiwari",   Visitor.Relation.RELATIVE, "Wedding invitation",    "9876544090", "DL-UP72-1234",      264, 260, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Reema Chowdhury", Visitor.Relation.SIBLING, "Result discussion",     "9876544100", "AADHAAR-5555-5555", 288, 284, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Vinay Kumar",    Visitor.Relation.GUARDIAN, "Career counseling",     "9876544110", "PAN-EFGHI3456J",    312, 306, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Asha Pillai",    Visitor.Relation.OTHER,    "Project mentor",        "9876544120", "AADHAAR-6666-6666", 336, 330, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Ganesh Pawar",   Visitor.Relation.PARENT,   "Health checkup",        "9876544130", "AADHAAR-7777-7777", 360, 354, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Smita Sinha",    Visitor.Relation.SIBLING,  "Casual visit",          "9876544140", "PAN-KLMNO4567P",    384, 378, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Harish Rao",     Visitor.Relation.FRIEND,   "Hostel reunion",        "9876544150", "DL-AP09-5678",      408, 402, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Latha Mohan",    Visitor.Relation.RELATIVE, "Sweets distribution",   "9876544160", "AADHAAR-8888-8888", 432, 426, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Bharat Shukla",  Visitor.Relation.GUARDIAN, "Fee payment",           "9876544170", "PAN-QRSTU8901V",    456, 450, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Komal Trivedi",  Visitor.Relation.OTHER,    "Yoga instructor",       "9876544180", "AADHAAR-9999-9999", 480, 474, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Sanjay Mishra",  Visitor.Relation.PARENT,   "Year-end visit",        "9876544190", "AADHAAR-0000-0000", 504, 498, Visitor.Status.CHECKED_OUT, "Warden", null),
                new V("Neha Bansal",    Visitor.Relation.SIBLING,  "Care package delivery", "9876544200", "PAN-WXYZA1234B",    528, 522, Visitor.Status.CHECKED_OUT, "Warden", null),

                // 5 REJECTED
                new V("Unknown Person 1", Visitor.Relation.OTHER, "Vague purpose",         "9999999991", "ID not provided",     2,  null, Visitor.Status.REJECTED, "Warden", "No valid ID proof presented"),
                new V("Unknown Person 2", Visitor.Relation.OTHER, "Late night visit",      "9999999992", "Expired ID",           1,  null, Visitor.Status.REJECTED, "Warden", "Outside visiting hours; ID expired"),
                new V("Unknown Person 3", Visitor.Relation.OTHER, "Refused screening",     "9999999993", "Refused ID check",    3,  null, Visitor.Status.REJECTED, "Warden", "Refused security screening"),
                new V("Unknown Person 4", Visitor.Relation.OTHER, "No appointment",        "9999999994", "AADHAAR-XXXX-0001",   5,  null, Visitor.Status.REJECTED, "Warden", "Student not on premises and no prior approval"),
                new V("Unknown Person 5", Visitor.Relation.OTHER, "Suspicious behavior",   "9999999995", "AADHAAR-XXXX-0002",   24, null, Visitor.Status.REJECTED, "Warden", "Security flagged for follow-up")
        ));

        for (V v : visitors) {
            LocalDateTime checkIn  = LocalDateTime.now().minusHours(v.checkInHoursAgo());
            LocalDateTime checkOut = v.checkOutHoursAgo() != null ? LocalDateTime.now().minusHours(v.checkOutHoursAgo()) : null;
            repo.save(Objects.requireNonNull(Visitor.builder()
                    .visitorName(v.name())
                    .relation(v.relation())
                    .student(null) // FK is nullable; avoid coupling to specific student data
                    .purpose(v.purpose())
                    .phoneNumber(v.phone())
                    .idProof(v.idProof())
                    .checkInTime(checkIn)
                    .checkOutTime(checkOut)
                    .status(v.status())
                    .approvedBy(v.approvedBy())
                    .notes(v.notes())
                    .build()));
        }
        return visitors.size();
    }

    /* Notice */

    private int seedNotices(NoticeRepository repo) {
        if (repo.count() > 0) return 0;

        record N(String title, String content, Notice.Category category, Notice.Priority priority,
                 Notice.TargetAudience audience, int publishedDaysAgo, Integer expiresInDays, boolean active) {}

        List<N> notices = List.of(
                // GENERAL (5)
                new N("Hostel Rules and Regulations", "Please familiarise yourself with the updated hostel rules. Quiet hours: 10 PM - 6 AM. Common areas to be vacated by 11 PM.", Notice.Category.GENERAL, Notice.Priority.NORMAL, Notice.TargetAudience.STUDENTS, 30, 365, true),
                new N("New Visiting Hours",           "Effective immediately, visiting hours are 9 AM - 7 PM on weekdays and 9 AM - 9 PM on weekends.", Notice.Category.GENERAL, Notice.Priority.NORMAL, Notice.TargetAudience.ALL, 14, 180, true),
                new N("Mess Timing Reminder",         "Breakfast 7-9 AM, Lunch 12-2 PM, Snacks 4-5 PM, Dinner 7-9 PM. Strict adherence required.", Notice.Category.GENERAL, Notice.Priority.LOW, Notice.TargetAudience.STUDENTS, 7, 90, true),
                new N("Laundry Schedule",             "Laundry pickup every Monday and Thursday at 9 AM. Tag clothes properly to avoid mix-ups.", Notice.Category.GENERAL, Notice.Priority.LOW, Notice.TargetAudience.STUDENTS, 21, 90, true),
                new N("Stay Hydrated",                "With rising temperatures, drink at least 3 litres of water daily. Filtered water is available 24/7.", Notice.Category.GENERAL, Notice.Priority.LOW, Notice.TargetAudience.STUDENTS, 3, 30, true),

                // ACADEMIC (4)
                new N("Mid-Sem Exam Schedule Released", "Mid-semester exams from 10th-18th. Detailed schedule on the academic portal. Library extended hours from 2nd onwards.", Notice.Category.ACADEMIC, Notice.Priority.HIGH, Notice.TargetAudience.STUDENTS, 5, 30, true),
                new N("Library Extended Hours",         "Library will remain open till midnight during exam season (1st-20th).", Notice.Category.ACADEMIC, Notice.Priority.NORMAL, Notice.TargetAudience.STUDENTS, 4, 25, true),
                new N("Group Study Rooms Booking",      "Book group study rooms via the academic portal. Max 4 hours per slot. Bookings open 24h in advance.", Notice.Category.ACADEMIC, Notice.Priority.LOW, Notice.TargetAudience.STUDENTS, 10, 60, true),
                new N("Career Counseling Sessions",     "1-on-1 career counseling available every Wednesday 4-6 PM at the warden's office. Sign up at reception.", Notice.Category.ACADEMIC, Notice.Priority.NORMAL, Notice.TargetAudience.STUDENTS, 2, 60, true),

                // HOSTEL (4)
                new N("Scheduled Maintenance - Block A", "Block A water supply will be shut off from 10 AM - 2 PM on Saturday for tank cleaning. Please store water in advance.", Notice.Category.HOSTEL, Notice.Priority.HIGH, Notice.TargetAudience.STUDENTS, 1, 7, true),
                new N("Pest Control Drive",              "Quarterly pest control on Sunday across all blocks. Please clear personal items from kitchen and balcony areas.", Notice.Category.HOSTEL, Notice.Priority.NORMAL, Notice.TargetAudience.STUDENTS, 3, 14, true),
                new N("Generator Maintenance",            "DG set servicing on Tuesday 11 AM - 1 PM. Power may flicker briefly during the cutover.", Notice.Category.HOSTEL, Notice.Priority.NORMAL, Notice.TargetAudience.ALL, 6, 14, true),
                new N("Fire Drill - Mandatory",            "Building-wide fire drill on Friday at 11 AM. Evacuation to the front lawn. Attendance compulsory.", Notice.Category.HOSTEL, Notice.Priority.HIGH, Notice.TargetAudience.ALL, 4, 14, true),

                // EMERGENCY (3)
                new N("Power Outage Tonight",             "Scheduled power outage 11 PM - 1 AM tonight for transformer replacement. Backup generator will run for emergency lighting only.", Notice.Category.EMERGENCY, Notice.Priority.URGENT, Notice.TargetAudience.ALL, 0, 2, true),
                new N("Water Disruption - Block B",        "Burst pipe in Block B; water shut until repaired. Use Block A washrooms in the interim. Estimated fix: 6 hours.", Notice.Category.EMERGENCY, Notice.Priority.URGENT, Notice.TargetAudience.STUDENTS, 0, 3, true),
                new N("Severe Weather Advisory",            "Heavy rainfall warning for tomorrow. Stay indoors after 6 PM. Classes may be moved online - check email.", Notice.Category.EMERGENCY, Notice.Priority.HIGH, Notice.TargetAudience.ALL, 1, 3, true),

                // EVENT (4)
                new N("Annual Cultural Fest - Save the Date", "Three-day cultural extravaganza from the 25th. Music, dance, food stalls. External pass-holders welcome.", Notice.Category.EVENT, Notice.Priority.HIGH, Notice.TargetAudience.ALL, 14, 60, true),
                new N("Inter-Hostel Cricket Tournament",       "Tournament starts on Saturday. Registration at the sports office by Friday 5 PM. Each team: 11 players + 4 reserves.", Notice.Category.EVENT, Notice.Priority.NORMAL, Notice.TargetAudience.STUDENTS, 7, 21, true),
                new N("Career Guidance Workshop",              "Industry experts on Friday 3-5 PM at the auditorium. Resume reviews available afterwards. RSVP at reception.", Notice.Category.EVENT, Notice.Priority.NORMAL, Notice.TargetAudience.STUDENTS, 4, 14, true),
                new N("Yoga Day Celebration",                  "Yoga session on the 21st at 6:30 AM in the lawn. Mats provided. Open to all.", Notice.Category.EVENT, Notice.Priority.LOW, Notice.TargetAudience.ALL, 10, 30, true)
        );

        for (N n : notices) {
            LocalDateTime publishedAt = LocalDateTime.now().minusDays(n.publishedDaysAgo());
            LocalDateTime expiresAt   = n.expiresInDays() != null ? publishedAt.plusDays(n.expiresInDays()) : null;
            repo.save(Objects.requireNonNull(Notice.builder()
                    .title(n.title())
                    .content(n.content())
                    .category(n.category())
                    .priority(n.priority())
                    .publishedBy("Hostel Office")
                    .publishedAt(publishedAt)
                    .expiresAt(expiresAt)
                    .isActive(n.active())
                    .targetAudience(n.audience())
                    .build()));
        }
        return notices.size();
    }

    /* Event */

    private int seedEvents(EventRepository repo) {
        if (repo.count() > 0) return 0;

        record E(String title, String description, int dayOffset, LocalTime start, LocalTime end,
                 String venue, String organizer, Event.Category category, Event.Status status,
                 Integer maxParticipants, int registered) {}

        List<E> events = List.of(
                // 5 UPCOMING
                new E("Annual Cultural Fest 2026",       "Three-day cultural festival with performances and food stalls.", 25, LocalTime.of(10, 0), LocalTime.of(22, 0), "Main Auditorium", "Cultural Committee",  Event.Category.CULTURAL, Event.Status.UPCOMING, 1000, 320),
                new E("Inter-Hostel Cricket Tournament",  "Cricket tournament between hostel blocks, knockout format.",      14, LocalTime.of(8,  0), LocalTime.of(18, 0), "Sports Ground",   "Sports Committee",    Event.Category.SPORTS,    Event.Status.UPCOMING, 200,  88),
                new E("Career Guidance Workshop",         "Industry experts on resume building, interviews, networking.",   7,  LocalTime.of(15, 0), LocalTime.of(17, 0), "Seminar Hall",     "Placement Cell",      Event.Category.ACADEMIC,  Event.Status.UPCOMING, 150,  72),
                new E("Mental Health Awareness Session",  "Open discussion on stress management and student mental health.", 10, LocalTime.of(16, 0), LocalTime.of(18, 0), "Conference Room",  "Counseling Cell",     Event.Category.SOCIAL,    Event.Status.UPCOMING, 80,   31),
                new E("Photography Workshop",             "Beginner-friendly DSLR/mobile photography workshop.",             21, LocalTime.of(14, 0), LocalTime.of(17, 0), "Art Room",         "Photography Club",    Event.Category.OTHER,     Event.Status.UPCOMING, 40,   18),

                // 3 ONGOING
                new E("Hostel Movie Night",                "Weekly movie screening - community choice.",                       0, LocalTime.of(19, 0), LocalTime.of(22, 0), "Recreation Room", "Recreation Committee", Event.Category.SOCIAL,    Event.Status.ONGOING,  120, 95),
                new E("Inter-Hostel Quiz Competition",      "General knowledge quiz, teams of 4.",                              1, LocalTime.of(15, 0), LocalTime.of(18, 0), "Auditorium",      "Academic Committee",   Event.Category.ACADEMIC,  Event.Status.ONGOING,  100, 76),
                new E("Yoga & Wellness Week",                "Daily yoga sessions, meditation, healthy diet workshop.",        2, LocalTime.of(6,  30), LocalTime.of(8,  0),  "Lawn",            "Wellness Committee",   Event.Category.OTHER,     Event.Status.ONGOING,  60,  42),

                // 5 COMPLETED
                new E("Diwali Celebration 2025",            "Lights, sweets, dance performances.",                            -45, LocalTime.of(18, 0), LocalTime.of(23, 0), "Main Lawn",       "Cultural Committee",  Event.Category.CULTURAL, Event.Status.COMPLETED, 500, 480),
                new E("Annual Sports Day 2025",             "Track and field events, prizes.",                                -30, LocalTime.of(8,  0), LocalTime.of(17, 0), "Sports Ground",   "Sports Committee",    Event.Category.SPORTS,    Event.Status.COMPLETED, 300, 245),
                new E("TechFest 2025",                       "Technical workshops, hackathon, project demos.",                 -60, LocalTime.of(9,  0), LocalTime.of(20, 0), "CS Block",         "Tech Society",        Event.Category.ACADEMIC,  Event.Status.COMPLETED, 200, 180),
                new E("Republic Day Celebration",             "Flag hoisting, cultural performances, breakfast.",                -90, LocalTime.of(7,  0), LocalTime.of(11, 0), "Main Lawn",       "Hostel Office",       Event.Category.OTHER,     Event.Status.COMPLETED, 400, 350),
                new E("Inter-Hostel Football Tournament",      "Round-robin format football tournament.",                       -75, LocalTime.of(16, 0), LocalTime.of(19, 0), "Football Ground", "Sports Committee",     Event.Category.SPORTS,    Event.Status.COMPLETED, 150, 132),

                // 2 CANCELLED
                new E("Cooking Competition (Cancelled)",       "Cancelled due to mess kitchen renovation.",                    20, LocalTime.of(11, 0), LocalTime.of(15, 0), "Mess Kitchen",    "Food Club",            Event.Category.SOCIAL,    Event.Status.CANCELLED, 50, 0),
                new E("Outdoor Trek (Cancelled)",              "Cancelled due to severe weather forecast.",                     5, LocalTime.of(6,  0), LocalTime.of(20, 0), "Nearby Hills",     "Adventure Club",       Event.Category.OTHER,     Event.Status.CANCELLED, 40, 0)
        );

        for (E e : events) {
            repo.save(Objects.requireNonNull(Event.builder()
                    .title(e.title())
                    .description(e.description())
                    .eventDate(LocalDate.now().plusDays(e.dayOffset()))
                    .startTime(e.start())
                    .endTime(e.end())
                    .venue(e.venue())
                    .organizer(e.organizer())
                    .category(e.category())
                    .status(e.status())
                    .maxParticipants(e.maxParticipants())
                    .registeredCount(e.registered())
                    .build()));
        }
        return events.size();
    }
}
