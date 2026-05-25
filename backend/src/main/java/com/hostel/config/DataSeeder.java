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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Value("${app.seed.demo-data.enabled:false}")
    private boolean seedEnabled;

    @Bean
    @Order(2)
    CommandLineRunner seedDemoData(MessMenuRepository messMenuRepository,
                                   MaintenanceRequestRepository maintenanceRequestRepository,
                                   VisitorRepository visitorRepository,
                                   NoticeRepository noticeRepository,
                                   EventRepository eventRepository) {
        return args -> {
            if (!seedEnabled) {
                log.info("Demo data seeding disabled (app.seed.demo-data.enabled=false).");
                return;
            }
            if (messMenuRepository.count() > 0) {
                log.info("Demo data already exists. Skipping seeding.");
                return;
            }

            List<MessMenu> menus = seedMessMenus();
            messMenuRepository.saveAll(menus);

            List<MaintenanceRequest> requests = seedMaintenanceRequests();
            maintenanceRequestRepository.saveAll(requests);

            List<Visitor> visitors = seedVisitors();
            visitorRepository.saveAll(visitors);

            List<Notice> notices = seedNotices();
            noticeRepository.saveAll(notices);

            List<Event> events = seedEvents();
            eventRepository.saveAll(events);

            log.info("Seeded {} mess menus, {} maintenance requests, {} visitors, {} notices, {} events",
                    menus.size(), requests.size(), visitors.size(), notices.size(), events.size());
        };
    }

    private List<MessMenu> seedMessMenus() {
        List<MessMenu> menus = new ArrayList<>();
        LocalDate today = LocalDate.now();

        String[][] breakfasts = {
            {"Idli, Sambar, Coconut Chutney, Tea/Coffee", null},
            {"Masala Dosa, Sambar, Chutney, Filter Coffee", null},
            {"Poha, Jalebi, Milk, Tea", null},
            {"Aloo Paratha, Curd, Pickle, Lassi", null},
            {"Upma, Vada, Coconut Chutney, Tea/Coffee", null},
            {"Chole Bhature, Pickle, Lassi", "Weekend Special"},
            {"Puri Bhaji, Sprouts, Banana, Tea/Coffee", "Sunday Special"}
        };

        String[][] lunches = {
            {"Rice, Dal Tadka, Aloo Gobi, Chapati, Raita, Salad", null},
            {"Rice, Rajma, Bhindi Fry, Chapati, Curd, Papad", null},
            {"Rice, Sambar, Cabbage Poriyal, Chapati, Buttermilk", null},
            {"Rice, Dal Fry, Paneer Butter Masala, Chapati, Salad", null},
            {"Rice, Chana Dal, Baingan Bharta, Chapati, Curd", null},
            {"Veg Biryani, Raita, Gulab Jamun, Salad", "Weekend Special"},
            {"Rice, Dal Makhani, Mix Veg, Chapati, Kheer", "Sunday Special"}
        };

        String[][] dinners = {
            {"Chapati, Dal Tadka, Aloo Matar, Rice, Salad", null},
            {"Chapati, Mix Dal, Palak Paneer, Jeera Rice", null},
            {"Chapati, Moong Dal, Cauliflower Curry, Rice, Curd", null},
            {"Chapati, Toor Dal, Mushroom Masala, Rice, Pickle", null},
            {"Chapati, Dal Fry, Kadhai Paneer, Rice, Raita", null},
            {"Chapati, Black Dal, Shahi Paneer, Pulao, Ice Cream", "Weekend Special"},
            {"Chapati, Dal Makhani, Malai Kofta, Fried Rice, Gulab Jamun", "Sunday Special"}
        };

        String[][] snacks = {
            {"Samosa, Green Chutney, Tea", null},
            {"Bread Pakora, Ketchup, Coffee", null},
            {"Maggi Noodles, Tea/Coffee", null},
            {"Veg Sandwich, Chips, Juice", null},
            {"Biscuits, Namkeen, Tea/Coffee", null},
            {"Pav Bhaji, Lemonade", "Weekend Special"},
            {"Dhokla, Green Chutney, Masala Chai", null}
        };

        MessMenu.Day[] days = MessMenu.Day.values();
        for (int i = 0; i < 7; i++) {
            menus.add(MessMenu.builder().day(days[i]).mealType(MessMenu.MealType.BREAKFAST)
                    .items(breakfasts[i][0]).specialNote(breakfasts[i][1])
                    .isActive(true).effectiveFrom(today).build());
            menus.add(MessMenu.builder().day(days[i]).mealType(MessMenu.MealType.LUNCH)
                    .items(lunches[i][0]).specialNote(lunches[i][1])
                    .isActive(true).effectiveFrom(today).build());
            menus.add(MessMenu.builder().day(days[i]).mealType(MessMenu.MealType.DINNER)
                    .items(dinners[i][0]).specialNote(dinners[i][1])
                    .isActive(true).effectiveFrom(today).build());
            menus.add(MessMenu.builder().day(days[i]).mealType(MessMenu.MealType.SNACKS)
                    .items(snacks[i][0]).specialNote(snacks[i][1])
                    .isActive(true).effectiveFrom(today).build());
        }

        // Additional week 2 variations to exceed 50
        String[][] breakfasts2 = {
            {"Medu Vada, Sambar, Chutney, Tea", null},
            {"Stuffed Paratha, Curd, Achaar, Chai", null},
            {"Bread Toast, Butter, Jam, Boiled Eggs, Milk", null},
            {"Uttapam, Sambar, Coconut Chutney, Coffee", null},
            {"Rava Idli, Tomato Chutney, Tea/Coffee", null},
            {"Misal Pav, Lemon, Tea", "Weekend Special"},
            {"Paneer Paratha, Curd, Pickle, Juice", "Sunday Special"}
        };

        for (int i = 0; i < 7; i++) {
            menus.add(MessMenu.builder().day(days[i]).mealType(MessMenu.MealType.BREAKFAST)
                    .items(breakfasts2[i][0]).specialNote(breakfasts2[i][1])
                    .isActive(true).effectiveFrom(today.plusWeeks(1)).build());
        }

        // Week 2 lunches
        String[][] lunches2 = {
            {"Rice, Kadhi Pakora, Aloo Jeera, Chapati, Salad", null},
            {"Rice, Chole, Lauki Sabzi, Chapati, Raita", null},
            {"Rice, Moong Dal, Tinda Masala, Chapati, Buttermilk", null},
            {"Veg Pulao, Dal Palak, Boondi Raita, Papad", null},
            {"Rice, Arhar Dal, Shimla Mirch, Chapati, Curd", null},
            {"Jeera Rice, Paneer Tikka Masala, Naan, Raita", "Weekend Special"},
            {"Rice, Dal Tadka, Butter Chicken (Paneer), Chapati, Rasmalai", "Sunday Special"}
        };

        // Week 2 dinners
        String[][] dinners2 = {
            {"Chapati, Masoor Dal, Bhindi Masala, Rice, Salad", null},
            {"Chapati, Chana Dal, Aloo Palak, Rice, Curd", null},
            {"Chapati, Moong Dal, Gobhi Matar, Rice, Pickle", null},
            {"Chapati, Toor Dal, Matar Paneer, Rice, Raita", null},
            {"Chapati, Dal Fry, Mixed Veg Curry, Rice, Papad", null},
            {"Chapati, Dal Makhani, Paneer Lababdar, Pulao, Halwa", "Weekend Special"},
            {"Chapati, Black Dal, Veg Kofta Curry, Biryani, Kulfi", "Sunday Special"}
        };

        for (int i = 0; i < 7; i++) {
            menus.add(MessMenu.builder().day(days[i]).mealType(MessMenu.MealType.LUNCH)
                    .items(lunches2[i][0]).specialNote(lunches2[i][1])
                    .isActive(true).effectiveFrom(today.plusWeeks(1)).build());
            menus.add(MessMenu.builder().day(days[i]).mealType(MessMenu.MealType.DINNER)
                    .items(dinners2[i][0]).specialNote(dinners2[i][1])
                    .isActive(true).effectiveFrom(today.plusWeeks(1)).build());
        }

        // Special festive menu entries
        menus.add(MessMenu.builder().day(MessMenu.Day.SAT).mealType(MessMenu.MealType.DINNER)
                .items("Special Thali: Puri, Chole, Paneer Butter Masala, Jeera Rice, Raita, Gulab Jamun")
                .specialNote("Founders Day Special").isActive(true).effectiveFrom(today.plusDays(20)).build());
        menus.add(MessMenu.builder().day(MessMenu.Day.SUN).mealType(MessMenu.MealType.LUNCH)
                .items("Festival Special: Puri, Aloo Sabzi, Kheer, Papad, Pickle, Sweet Lassi")
                .specialNote("Festival Menu").isActive(true).effectiveFrom(today.plusDays(25)).build());

        return menus;
    }

    private List<MaintenanceRequest> seedMaintenanceRequests() {
        List<MaintenanceRequest> requests = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // OPEN requests (10)
        requests.add(MaintenanceRequest.builder().title("Leaking faucet in Room 101").description("The bathroom faucet has been dripping continuously for two days.").roomNumber("101").category(MaintenanceRequest.Category.PLUMBING).priority(MaintenanceRequest.Priority.HIGH).status(MaintenanceRequest.Status.OPEN).reportedBy("Rahul Sharma").reportedDate(today.minusDays(2)).build());
        requests.add(MaintenanceRequest.builder().title("Broken ceiling fan - Room 205").description("Fan makes loud noise and wobbles when turned on.").roomNumber("205").category(MaintenanceRequest.Category.ELECTRICAL).priority(MaintenanceRequest.Priority.MEDIUM).status(MaintenanceRequest.Status.OPEN).reportedBy("Amit Patel").reportedDate(today.minusDays(1)).build());
        requests.add(MaintenanceRequest.builder().title("Clogged drain in bathroom - Room 302").description("Water not draining properly in the shared bathroom.").roomNumber("302").category(MaintenanceRequest.Category.PLUMBING).priority(MaintenanceRequest.Priority.HIGH).status(MaintenanceRequest.Status.OPEN).reportedBy("Vikram Singh").reportedDate(today.minusDays(3)).build());
        requests.add(MaintenanceRequest.builder().title("Window glass cracked - Room 110").description("Window glass has a large crack, letting in insects.").roomNumber("110").category(MaintenanceRequest.Category.OTHER).priority(MaintenanceRequest.Priority.MEDIUM).status(MaintenanceRequest.Status.OPEN).reportedBy("Suresh Kumar").reportedDate(today.minusDays(1)).build());
        requests.add(MaintenanceRequest.builder().title("Power socket not working - Room 408").description("The power socket near the study desk is dead.").roomNumber("408").category(MaintenanceRequest.Category.ELECTRICAL).priority(MaintenanceRequest.Priority.HIGH).status(MaintenanceRequest.Status.OPEN).reportedBy("Priya Mehta").reportedDate(today).build());
        requests.add(MaintenanceRequest.builder().title("Broken chair in Room 215").description("Study chair leg is broken, unsafe to sit.").roomNumber("215").category(MaintenanceRequest.Category.FURNITURE).priority(MaintenanceRequest.Priority.LOW).status(MaintenanceRequest.Status.OPEN).reportedBy("Neha Gupta").reportedDate(today.minusDays(4)).build());
        requests.add(MaintenanceRequest.builder().title("Toilet flush not working - Room 312").description("Flush mechanism is stuck and needs replacement.").roomNumber("312").category(MaintenanceRequest.Category.PLUMBING).priority(MaintenanceRequest.Priority.CRITICAL).status(MaintenanceRequest.Status.OPEN).reportedBy("Rohan Joshi").reportedDate(today).build());
        requests.add(MaintenanceRequest.builder().title("Dustbin missing from corridor - Floor 2").description("The common corridor dustbin is missing since last week.").roomNumber("200").category(MaintenanceRequest.Category.CLEANING).priority(MaintenanceRequest.Priority.LOW).status(MaintenanceRequest.Status.OPEN).reportedBy("Ankit Verma").reportedDate(today.minusDays(5)).build());
        requests.add(MaintenanceRequest.builder().title("Light flickering in Room 503").description("Tube light flickers constantly, causing headaches.").roomNumber("503").category(MaintenanceRequest.Category.ELECTRICAL).priority(MaintenanceRequest.Priority.MEDIUM).status(MaintenanceRequest.Status.OPEN).reportedBy("Deepak Yadav").reportedDate(today.minusDays(2)).build());
        requests.add(MaintenanceRequest.builder().title("Wall paint peeling - Room 107").description("Paint is peeling off near the window due to dampness.").roomNumber("107").category(MaintenanceRequest.Category.OTHER).priority(MaintenanceRequest.Priority.LOW).status(MaintenanceRequest.Status.OPEN).reportedBy("Karan Malhotra").reportedDate(today.minusDays(6)).build());

        // ASSIGNED requests (5)
        requests.add(MaintenanceRequest.builder().title("Broken door lock - Room 404").description("Lock mechanism jammed, door cannot be locked.").roomNumber("404").category(MaintenanceRequest.Category.FURNITURE).priority(MaintenanceRequest.Priority.HIGH).status(MaintenanceRequest.Status.ASSIGNED).reportedBy("Manish Tiwari").assignedTo("Ram Bahadur").reportedDate(today.minusDays(3)).build());
        requests.add(MaintenanceRequest.builder().title("Leaking roof during rain - Room 501").description("Water seeps through ceiling during heavy rain.").roomNumber("501").category(MaintenanceRequest.Category.PLUMBING).priority(MaintenanceRequest.Priority.CRITICAL).status(MaintenanceRequest.Status.ASSIGNED).reportedBy("Sanjay Mishra").assignedTo("Mohan Lal").reportedDate(today.minusDays(4)).build());
        requests.add(MaintenanceRequest.builder().title("AC not cooling - Room 301").description("Air conditioner runs but does not cool the room.").roomNumber("301").category(MaintenanceRequest.Category.ELECTRICAL).priority(MaintenanceRequest.Priority.MEDIUM).status(MaintenanceRequest.Status.ASSIGNED).reportedBy("Pooja Reddy").assignedTo("Sunil Electricals").reportedDate(today.minusDays(2)).build());
        requests.add(MaintenanceRequest.builder().title("Wardrobe door broken - Room 210").description("Wardrobe sliding door came off its track.").roomNumber("210").category(MaintenanceRequest.Category.FURNITURE).priority(MaintenanceRequest.Priority.LOW).status(MaintenanceRequest.Status.ASSIGNED).reportedBy("Arun Nair").assignedTo("Vijay Carpenter").reportedDate(today.minusDays(5)).build());
        requests.add(MaintenanceRequest.builder().title("Bathroom tiles loose - Room 105").description("Multiple floor tiles are loose and cracked.").roomNumber("105").category(MaintenanceRequest.Category.OTHER).priority(MaintenanceRequest.Priority.MEDIUM).status(MaintenanceRequest.Status.ASSIGNED).reportedBy("Shreya Das").assignedTo("RK Constructions").reportedDate(today.minusDays(3)).build());

        // IN_PROGRESS requests (5)
        requests.add(MaintenanceRequest.builder().title("Geyser not heating - Room 402").description("Hot water geyser stopped working completely.").roomNumber("402").category(MaintenanceRequest.Category.ELECTRICAL).priority(MaintenanceRequest.Priority.HIGH).status(MaintenanceRequest.Status.IN_PROGRESS).reportedBy("Kavita Sharma").assignedTo("Sunil Electricals").reportedDate(today.minusDays(5)).build());
        requests.add(MaintenanceRequest.builder().title("Blocked sewage line - Ground Floor").description("Sewage backup in ground floor bathrooms.").roomNumber("GF").category(MaintenanceRequest.Category.PLUMBING).priority(MaintenanceRequest.Priority.CRITICAL).status(MaintenanceRequest.Status.IN_PROGRESS).reportedBy("Warden Office").assignedTo("City Plumbers").reportedDate(today.minusDays(4)).build());
        requests.add(MaintenanceRequest.builder().title("Bed frame squeaking - Room 308").description("Metal bed frame makes noise with any movement.").roomNumber("308").category(MaintenanceRequest.Category.FURNITURE).priority(MaintenanceRequest.Priority.LOW).status(MaintenanceRequest.Status.IN_PROGRESS).reportedBy("Rajesh Kumar").assignedTo("Vijay Carpenter").reportedDate(today.minusDays(7)).build());
        requests.add(MaintenanceRequest.builder().title("Corridor light replacement - Floor 3").description("Three corridor lights need bulb replacement.").roomNumber("300").category(MaintenanceRequest.Category.ELECTRICAL).priority(MaintenanceRequest.Priority.MEDIUM).status(MaintenanceRequest.Status.IN_PROGRESS).reportedBy("Security Guard").assignedTo("Ram Bahadur").reportedDate(today.minusDays(3)).build());
        requests.add(MaintenanceRequest.builder().title("Deep cleaning required - Room 201").description("Room vacated and needs thorough cleaning before new allotment.").roomNumber("201").category(MaintenanceRequest.Category.CLEANING).priority(MaintenanceRequest.Priority.HIGH).status(MaintenanceRequest.Status.IN_PROGRESS).reportedBy("Hostel Office").assignedTo("Cleaning Staff").reportedDate(today.minusDays(2)).build());

        // COMPLETED requests (8)
        requests.add(MaintenanceRequest.builder().title("Tap washer replaced - Room 103").description("Bathroom tap was leaking due to worn washer.").roomNumber("103").category(MaintenanceRequest.Category.PLUMBING).priority(MaintenanceRequest.Priority.MEDIUM).status(MaintenanceRequest.Status.COMPLETED).reportedBy("Ajay Pandey").assignedTo("Mohan Lal").reportedDate(today.minusDays(15)).completedDate(today.minusDays(13)).estimatedCost(BigDecimal.valueOf(200)).build());
        requests.add(MaintenanceRequest.builder().title("Fan regulator fixed - Room 406").description("Regulator was sparking and replaced.").roomNumber("406").category(MaintenanceRequest.Category.ELECTRICAL).priority(MaintenanceRequest.Priority.HIGH).status(MaintenanceRequest.Status.COMPLETED).reportedBy("Neeraj Kapoor").assignedTo("Sunil Electricals").reportedDate(today.minusDays(12)).completedDate(today.minusDays(10)).estimatedCost(BigDecimal.valueOf(450)).build());
        requests.add(MaintenanceRequest.builder().title("Study table repaired - Room 209").description("Table top was cracked and repaired with adhesive.").roomNumber("209").category(MaintenanceRequest.Category.FURNITURE).priority(MaintenanceRequest.Priority.LOW).status(MaintenanceRequest.Status.COMPLETED).reportedBy("Vikas Agarwal").assignedTo("Vijay Carpenter").reportedDate(today.minusDays(20)).completedDate(today.minusDays(17)).estimatedCost(BigDecimal.valueOf(350)).build());
        requests.add(MaintenanceRequest.builder().title("Bathroom exhaust fan installed - Room 310").description("New exhaust fan installed as old one was non-functional.").roomNumber("310").category(MaintenanceRequest.Category.ELECTRICAL).priority(MaintenanceRequest.Priority.MEDIUM).status(MaintenanceRequest.Status.COMPLETED).reportedBy("Gaurav Saxena").assignedTo("Sunil Electricals").reportedDate(today.minusDays(18)).completedDate(today.minusDays(14)).estimatedCost(BigDecimal.valueOf(1200)).build());
        requests.add(MaintenanceRequest.builder().title("Water tank cleaning - Terrace").description("Quarterly water tank cleaning and chlorination.").roomNumber("Terrace").category(MaintenanceRequest.Category.CLEANING).priority(MaintenanceRequest.Priority.HIGH).status(MaintenanceRequest.Status.COMPLETED).reportedBy("Warden Office").assignedTo("Cleaning Staff").reportedDate(today.minusDays(25)).completedDate(today.minusDays(24)).estimatedCost(BigDecimal.valueOf(2500)).build());
        requests.add(MaintenanceRequest.builder().title("Pipe burst fixed - Floor 2 bathroom").description("Main water pipe burst, causing flooding.").roomNumber("200").category(MaintenanceRequest.Category.PLUMBING).priority(MaintenanceRequest.Priority.CRITICAL).status(MaintenanceRequest.Status.COMPLETED).reportedBy("Security Guard").assignedTo("City Plumbers").reportedDate(today.minusDays(10)).completedDate(today.minusDays(9)).estimatedCost(BigDecimal.valueOf(3500)).build());
        requests.add(MaintenanceRequest.builder().title("Window mesh replaced - Room 415").description("Mosquito mesh was torn and replaced.").roomNumber("415").category(MaintenanceRequest.Category.OTHER).priority(MaintenanceRequest.Priority.LOW).status(MaintenanceRequest.Status.COMPLETED).reportedBy("Alok Jha").assignedTo("Ram Bahadur").reportedDate(today.minusDays(14)).completedDate(today.minusDays(12)).estimatedCost(BigDecimal.valueOf(600)).build());
        requests.add(MaintenanceRequest.builder().title("Corridor deep cleaned - Floor 4").description("Full corridor and common area deep cleaning.").roomNumber("400").category(MaintenanceRequest.Category.CLEANING).priority(MaintenanceRequest.Priority.MEDIUM).status(MaintenanceRequest.Status.COMPLETED).reportedBy("Hostel Office").assignedTo("Cleaning Staff").reportedDate(today.minusDays(8)).completedDate(today.minusDays(7)).estimatedCost(BigDecimal.valueOf(1500)).build());

        // REJECTED requests (2)
        requests.add(MaintenanceRequest.builder().title("Personal TV installation - Room 505").description("Student requested TV mounting bracket installation.").roomNumber("505").category(MaintenanceRequest.Category.ELECTRICAL).priority(MaintenanceRequest.Priority.LOW).status(MaintenanceRequest.Status.REJECTED).reportedBy("Rahul Khanna").reportedDate(today.minusDays(8)).notes("Rejected: Personal appliance installation not covered under hostel maintenance policy.").build());
        requests.add(MaintenanceRequest.builder().title("Room wall painting - Room 412").description("Student wants room repainted in different color.").roomNumber("412").category(MaintenanceRequest.Category.OTHER).priority(MaintenanceRequest.Priority.LOW).status(MaintenanceRequest.Status.REJECTED).reportedBy("Sneha Iyer").reportedDate(today.minusDays(10)).notes("Rejected: Cosmetic changes at student request are not supported. Room painting follows annual schedule.").build());

        return requests;
    }

    private List<Visitor> seedVisitors() {
        List<Visitor> visitors = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // CHECKED_IN visitors (15) - recent, within past 2 days
        visitors.add(Visitor.builder().visitorName("Ramesh Sharma").relation(Visitor.Relation.PARENT).purpose("Weekend visit").phoneNumber("9876543210").idProof("Aadhaar").checkInTime(now.minusHours(3)).status(Visitor.Status.CHECKED_IN).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Sunita Devi").relation(Visitor.Relation.PARENT).purpose("Bringing home-cooked food").phoneNumber("9876543211").idProof("Voter ID").checkInTime(now.minusHours(5)).status(Visitor.Status.CHECKED_IN).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Anil Kumar").relation(Visitor.Relation.GUARDIAN).purpose("Fee discussion with warden").phoneNumber("9876543212").idProof("Aadhaar").checkInTime(now.minusHours(1)).status(Visitor.Status.CHECKED_IN).approvedBy("Asst. Warden").build());
        visitors.add(Visitor.builder().visitorName("Priya Patel").relation(Visitor.Relation.SIBLING).purpose("Birthday celebration").phoneNumber("9876543213").idProof("College ID").checkInTime(now.minusHours(4)).status(Visitor.Status.CHECKED_IN).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Manoj Tiwari").relation(Visitor.Relation.FRIEND).purpose("Project discussion").phoneNumber("9876543214").idProof("College ID").checkInTime(now.minusHours(2)).status(Visitor.Status.CHECKED_IN).approvedBy("Security").build());
        visitors.add(Visitor.builder().visitorName("Lakshmi Narayan").relation(Visitor.Relation.PARENT).purpose("Health checkup follow-up").phoneNumber("9876543215").idProof("Aadhaar").checkInTime(now.minusDays(1).minusHours(2)).status(Visitor.Status.CHECKED_IN).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Geeta Verma").relation(Visitor.Relation.RELATIVE).purpose("Document delivery").phoneNumber("9876543216").idProof("Driving License").checkInTime(now.minusDays(1).minusHours(5)).status(Visitor.Status.CHECKED_IN).approvedBy("Asst. Warden").build());
        visitors.add(Visitor.builder().visitorName("Sanjay Gupta").relation(Visitor.Relation.PARENT).purpose("Monthly visit").phoneNumber("9876543217").idProof("PAN Card").checkInTime(now.minusHours(6)).status(Visitor.Status.CHECKED_IN).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Rekha Mishra").relation(Visitor.Relation.PARENT).purpose("Dropping off winter clothes").phoneNumber("9876543218").idProof("Aadhaar").checkInTime(now.minusHours(8)).status(Visitor.Status.CHECKED_IN).approvedBy("Security").build());
        visitors.add(Visitor.builder().visitorName("Vinod Saxena").relation(Visitor.Relation.GUARDIAN).purpose("Academic progress discussion").phoneNumber("9876543219").idProof("Aadhaar").checkInTime(now.minusDays(1).minusHours(3)).status(Visitor.Status.CHECKED_IN).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Kavita Rao").relation(Visitor.Relation.SIBLING).purpose("Bringing medicines").phoneNumber("9876543220").idProof("College ID").checkInTime(now.minusHours(7)).status(Visitor.Status.CHECKED_IN).approvedBy("Asst. Warden").build());
        visitors.add(Visitor.builder().visitorName("Dinesh Choudhary").relation(Visitor.Relation.FRIEND).purpose("Study group meeting").phoneNumber("9876543221").idProof("College ID").checkInTime(now.minusDays(1).minusHours(1)).status(Visitor.Status.CHECKED_IN).approvedBy("Security").build());
        visitors.add(Visitor.builder().visitorName("Meena Kumari").relation(Visitor.Relation.PARENT).purpose("Parent-teacher meeting").phoneNumber("9876543222").idProof("Voter ID").checkInTime(now.minusHours(9)).status(Visitor.Status.CHECKED_IN).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Rajendra Prasad").relation(Visitor.Relation.RELATIVE).purpose("Family gathering nearby").phoneNumber("9876543223").idProof("Aadhaar").checkInTime(now.minusDays(1).minusHours(6)).status(Visitor.Status.CHECKED_IN).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Anjali Deshmukh").relation(Visitor.Relation.FRIEND).purpose("Returning borrowed books").phoneNumber("9876543224").idProof("College ID").checkInTime(now.minusHours(4)).status(Visitor.Status.CHECKED_IN).approvedBy("Security").build());

        // CHECKED_OUT visitors (20) - past dates
        visitors.add(Visitor.builder().visitorName("Mohan Das").relation(Visitor.Relation.PARENT).purpose("Weekend visit").phoneNumber("9876543230").idProof("Aadhaar").checkInTime(now.minusDays(3).minusHours(6)).checkOutTime(now.minusDays(3).minusHours(2)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Sarla Jain").relation(Visitor.Relation.PARENT).purpose("Dropping off supplies").phoneNumber("9876543231").idProof("Voter ID").checkInTime(now.minusDays(4).minusHours(5)).checkOutTime(now.minusDays(4).minusHours(3)).status(Visitor.Status.CHECKED_OUT).approvedBy("Asst. Warden").build());
        visitors.add(Visitor.builder().visitorName("Harish Chandra").relation(Visitor.Relation.GUARDIAN).purpose("Hostel fee payment").phoneNumber("9876543232").idProof("PAN Card").checkInTime(now.minusDays(5).minusHours(4)).checkOutTime(now.minusDays(5).minusHours(2)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Nirmala Srivastava").relation(Visitor.Relation.PARENT).purpose("Birthday celebration").phoneNumber("9876543233").idProof("Aadhaar").checkInTime(now.minusDays(6).minusHours(7)).checkOutTime(now.minusDays(6).minusHours(1)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Pankaj Tripathi").relation(Visitor.Relation.FRIEND).purpose("Cricket match").phoneNumber("9876543234").idProof("College ID").checkInTime(now.minusDays(3).minusHours(8)).checkOutTime(now.minusDays(3).minusHours(4)).status(Visitor.Status.CHECKED_OUT).approvedBy("Security").build());
        visitors.add(Visitor.builder().visitorName("Usha Rani").relation(Visitor.Relation.PARENT).purpose("Medical emergency").phoneNumber("9876543235").idProof("Aadhaar").checkInTime(now.minusDays(7).minusHours(3)).checkOutTime(now.minusDays(7).minusHours(1)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Ashok Mehta").relation(Visitor.Relation.RELATIVE).purpose("Picking up for family function").phoneNumber("9876543236").idProof("Driving License").checkInTime(now.minusDays(8).minusHours(5)).checkOutTime(now.minusDays(8).minusHours(4)).status(Visitor.Status.CHECKED_OUT).approvedBy("Asst. Warden").build());
        visitors.add(Visitor.builder().visitorName("Savita Bhatt").relation(Visitor.Relation.PARENT).purpose("Bringing festival sweets").phoneNumber("9876543237").idProof("Aadhaar").checkInTime(now.minusDays(4).minusHours(6)).checkOutTime(now.minusDays(4).minusHours(4)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Ravi Shankar").relation(Visitor.Relation.GUARDIAN).purpose("Course counseling").phoneNumber("9876543238").idProof("Aadhaar").checkInTime(now.minusDays(9).minusHours(4)).checkOutTime(now.minusDays(9).minusHours(2)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Kamala Devi").relation(Visitor.Relation.PARENT).purpose("Monthly visit").phoneNumber("9876543239").idProof("Voter ID").checkInTime(now.minusDays(10).minusHours(5)).checkOutTime(now.minusDays(10).minusHours(2)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Sudhir Pandey").relation(Visitor.Relation.FRIEND).purpose("Joint study session").phoneNumber("9876543240").idProof("College ID").checkInTime(now.minusDays(5).minusHours(3)).checkOutTime(now.minusDays(5).minusHours(1)).status(Visitor.Status.CHECKED_OUT).approvedBy("Security").build());
        visitors.add(Visitor.builder().visitorName("Anita Kulkarni").relation(Visitor.Relation.SIBLING).purpose("Bringing laptop charger").phoneNumber("9876543241").idProof("Aadhaar").checkInTime(now.minusDays(6).minusHours(2)).checkOutTime(now.minusDays(6).minusHours(1)).status(Visitor.Status.CHECKED_OUT).approvedBy("Security").build());
        visitors.add(Visitor.builder().visitorName("Gopal Krishna").relation(Visitor.Relation.PARENT).purpose("Room inspection").phoneNumber("9876543242").idProof("Aadhaar").checkInTime(now.minusDays(11).minusHours(4)).checkOutTime(now.minusDays(11).minusHours(2)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Padma Iyer").relation(Visitor.Relation.PARENT).purpose("Festival visit").phoneNumber("9876543243").idProof("Aadhaar").checkInTime(now.minusDays(12).minusHours(6)).checkOutTime(now.minusDays(12).minusHours(1)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Balram Singh").relation(Visitor.Relation.GUARDIAN).purpose("Admission formalities").phoneNumber("9876543244").idProof("PAN Card").checkInTime(now.minusDays(7).minusHours(5)).checkOutTime(now.minusDays(7).minusHours(3)).status(Visitor.Status.CHECKED_OUT).approvedBy("Asst. Warden").build());
        visitors.add(Visitor.builder().visitorName("Shanti Devi").relation(Visitor.Relation.PARENT).purpose("Dropping home food").phoneNumber("9876543245").idProof("Voter ID").checkInTime(now.minusDays(8).minusHours(3)).checkOutTime(now.minusDays(8).minusHours(2)).status(Visitor.Status.CHECKED_OUT).approvedBy("Security").build());
        visitors.add(Visitor.builder().visitorName("Mukesh Ambani").relation(Visitor.Relation.RELATIVE).purpose("Career guidance discussion").phoneNumber("9876543246").idProof("Driving License").checkInTime(now.minusDays(13).minusHours(4)).checkOutTime(now.minusDays(13).minusHours(2)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Radha Kumari").relation(Visitor.Relation.SIBLING).purpose("Picking up for wedding").phoneNumber("9876543247").idProof("Aadhaar").checkInTime(now.minusDays(9).minusHours(6)).checkOutTime(now.minusDays(9).minusHours(5)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Om Prakash").relation(Visitor.Relation.PARENT).purpose("End of semester pickup").phoneNumber("9876543248").idProof("Aadhaar").checkInTime(now.minusDays(14).minusHours(3)).checkOutTime(now.minusDays(14).minusHours(1)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());
        visitors.add(Visitor.builder().visitorName("Jaya Bachchan").relation(Visitor.Relation.OTHER).purpose("Alumni reunion visit").phoneNumber("9876543249").idProof("Aadhaar").checkInTime(now.minusDays(15).minusHours(5)).checkOutTime(now.minusDays(15).minusHours(2)).status(Visitor.Status.CHECKED_OUT).approvedBy("Warden").build());

        // REJECTED visitors (5)
        visitors.add(Visitor.builder().visitorName("Unknown Person").relation(Visitor.Relation.OTHER).purpose("Wanted to meet student").phoneNumber("9876543250").idProof("None").checkInTime(now.minusDays(2).minusHours(4)).status(Visitor.Status.REJECTED).notes("Rejected: No valid ID proof provided. Student not informed of visit.").build());
        visitors.add(Visitor.builder().visitorName("Raju Driver").relation(Visitor.Relation.OTHER).purpose("Package delivery").phoneNumber("9876543251").idProof("Driving License").checkInTime(now.minusDays(3).minusHours(6)).status(Visitor.Status.REJECTED).notes("Rejected: Delivery personnel not allowed inside hostel premises. Package accepted at gate.").build());
        visitors.add(Visitor.builder().visitorName("Suresh Vendor").relation(Visitor.Relation.OTHER).purpose("Selling products").phoneNumber("9876543252").idProof("Aadhaar").checkInTime(now.minusDays(5).minusHours(3)).status(Visitor.Status.REJECTED).notes("Rejected: Commercial solicitation not permitted inside hostel.").build());
        visitors.add(Visitor.builder().visitorName("Late Night Visitor").relation(Visitor.Relation.FRIEND).purpose("Night stay request").phoneNumber("9876543253").idProof("College ID").checkInTime(now.minusDays(4).minusHours(1)).status(Visitor.Status.REJECTED).notes("Rejected: Visit requested after 9 PM curfew. Visiting hours are 9 AM to 8 PM only.").build());
        visitors.add(Visitor.builder().visitorName("Unauthorized Agent").relation(Visitor.Relation.OTHER).purpose("Insurance sales").phoneNumber("9876543254").idProof("Company ID").checkInTime(now.minusDays(6).minusHours(2)).status(Visitor.Status.REJECTED).notes("Rejected: External agents and solicitors not permitted without prior approval from warden.").build());

        return visitors;
    }

    private List<Notice> seedNotices() {
        List<Notice> notices = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // GENERAL notices (5)
        notices.add(Notice.builder().title("Hostel Rules and Regulations - Updated").content("All residents must adhere to the updated hostel rules effective from this semester. Key changes include: 1) Gate closure time changed to 10 PM on weekdays and 11 PM on weekends. 2) Guests must register at the security desk. 3) Noise levels must be maintained after 10 PM. 4) Common areas must be kept clean. Violations will result in disciplinary action.").category(Notice.Category.GENERAL).priority(Notice.Priority.HIGH).publishedBy("Chief Warden").publishedAt(now.minusDays(30)).isActive(true).targetAudience(Notice.TargetAudience.ALL).build());
        notices.add(Notice.builder().title("Mess Timing Changes").content("Effective immediately, mess timings are revised as follows: Breakfast 7:30 AM - 9:00 AM, Lunch 12:30 PM - 2:00 PM, Snacks 4:30 PM - 5:30 PM, Dinner 7:30 PM - 9:00 PM. Late entry will not be entertained. Students with special dietary needs should contact the mess committee.").category(Notice.Category.GENERAL).priority(Notice.Priority.NORMAL).publishedBy("Mess Committee").publishedAt(now.minusDays(15)).isActive(true).targetAudience(Notice.TargetAudience.STUDENTS).build());
        notices.add(Notice.builder().title("Wi-Fi Network Maintenance").content("The hostel Wi-Fi network will undergo scheduled maintenance every Sunday from 2 AM to 6 AM. During this period, internet connectivity may be intermittent. Please plan your downloads and submissions accordingly. Contact IT helpdesk for any extended outages.").category(Notice.Category.GENERAL).priority(Notice.Priority.NORMAL).publishedBy("IT Department").publishedAt(now.minusDays(20)).isActive(true).targetAudience(Notice.TargetAudience.ALL).build());
        notices.add(Notice.builder().title("Laundry Service Schedule").content("Laundry collection days: Monday, Wednesday, Friday (7 AM - 9 AM). Delivery: Next day by 6 PM. Please label all clothes with your room number. The hostel is not responsible for unlabelled items. Iron facility available in common room from 6 AM to 10 PM.").category(Notice.Category.GENERAL).priority(Notice.Priority.LOW).publishedBy("Hostel Admin").publishedAt(now.minusDays(45)).isActive(true).targetAudience(Notice.TargetAudience.STUDENTS).build());
        notices.add(Notice.builder().title("Visitor Policy Reminder").content("Visitors are allowed only during designated hours (9 AM - 8 PM). All visitors must register at the security gate with valid photo ID. Overnight guests are not permitted without written permission from the warden. Parents/guardians visiting from outstation should inform the warden office 24 hours in advance.").category(Notice.Category.GENERAL).priority(Notice.Priority.NORMAL).publishedBy("Security Office").publishedAt(now.minusDays(10)).isActive(true).targetAudience(Notice.TargetAudience.ALL).build());

        // ACADEMIC notices (4)
        notices.add(Notice.builder().title("End Semester Examination Schedule").content("End semester examinations will commence from next month. Detailed schedule is available on the university portal. Students are advised to collect their hall tickets from the academic section. Library will remain open till 11 PM during exam period. Silence must be maintained in study areas.").category(Notice.Category.ACADEMIC).priority(Notice.Priority.HIGH).publishedBy("Academic Section").publishedAt(now.minusDays(5)).expiresAt(now.plusDays(45)).isActive(true).targetAudience(Notice.TargetAudience.STUDENTS).build());
        notices.add(Notice.builder().title("Library Extended Hours During Exams").content("The central library will operate with extended hours during the examination period: Monday to Saturday 8 AM to 11 PM, Sunday 9 AM to 9 PM. Additional reading rooms in Block C will also be available. Students must carry their ID cards for entry.").category(Notice.Category.ACADEMIC).priority(Notice.Priority.NORMAL).publishedBy("Library Committee").publishedAt(now.minusDays(3)).expiresAt(now.plusDays(30)).isActive(true).targetAudience(Notice.TargetAudience.STUDENTS).build());
        notices.add(Notice.builder().title("Scholarship Application Deadline").content("Last date for submitting scholarship applications for the current academic year is approaching. Students with CGPA above 8.0 are eligible for merit scholarship. SC/ST/OBC students should apply for government scholarships through the portal. Contact the scholarship cell for assistance.").category(Notice.Category.ACADEMIC).priority(Notice.Priority.HIGH).publishedBy("Scholarship Cell").publishedAt(now.minusDays(7)).expiresAt(now.plusDays(14)).isActive(true).targetAudience(Notice.TargetAudience.STUDENTS).build());
        notices.add(Notice.builder().title("Workshop on Research Methodology").content("A two-day workshop on Research Methodology and Academic Writing will be conducted next week. Registration is open for all PG students and interested UG students. Limited seats available. Register at the academic office by Friday.").category(Notice.Category.ACADEMIC).priority(Notice.Priority.NORMAL).publishedBy("Research Cell").publishedAt(now.minusDays(4)).expiresAt(now.plusDays(7)).isActive(true).targetAudience(Notice.TargetAudience.STUDENTS).build());

        // HOSTEL notices (4)
        notices.add(Notice.builder().title("Monthly Room Inspection Schedule").content("Monthly room inspection will be conducted next week. All rooms will be checked for cleanliness, damage to property, and unauthorized appliances. Students found with prohibited items (heaters, hot plates, etc.) will face a fine of Rs. 500. Please ensure your rooms are clean and organized.").category(Notice.Category.HOSTEL).priority(Notice.Priority.HIGH).publishedBy("Warden").publishedAt(now.minusDays(2)).expiresAt(now.plusDays(7)).isActive(true).targetAudience(Notice.TargetAudience.STUDENTS).build());
        notices.add(Notice.builder().title("Water Supply Schedule - Summer").content("Due to summer water shortage, water supply timings are: Morning 6 AM - 8 AM, Evening 5 PM - 7 PM. Please store water for use during non-supply hours. Water tanker will supplement supply on alternate days. Report any leakages immediately to maintenance.").category(Notice.Category.HOSTEL).priority(Notice.Priority.HIGH).publishedBy("Hostel Admin").publishedAt(now.minusDays(8)).isActive(true).targetAudience(Notice.TargetAudience.ALL).build());
        notices.add(Notice.builder().title("Pest Control Drive - All Floors").content("Pest control treatment will be carried out this Saturday in all hostel blocks. Residents are advised to cover food items, water containers, and personal belongings. Rooms should be vacated between 9 AM and 12 PM. Entry allowed only after proper ventilation.").category(Notice.Category.HOSTEL).priority(Notice.Priority.NORMAL).publishedBy("Maintenance Dept").publishedAt(now.minusDays(1)).expiresAt(now.plusDays(5)).isActive(true).targetAudience(Notice.TargetAudience.STUDENTS).build());
        notices.add(Notice.builder().title("Common Room TV Schedule").content("Common room TV will be available from 6 PM to 10 PM on weekdays and 10 AM to 10 PM on weekends. Priority will be given to news during 9 PM - 10 PM. During exam period, TV hours will be reduced. Any disputes should be reported to the floor representative.").category(Notice.Category.HOSTEL).priority(Notice.Priority.LOW).publishedBy("Student Committee").publishedAt(now.minusDays(25)).isActive(true).targetAudience(Notice.TargetAudience.STUDENTS).build());

        // EMERGENCY notices (3)
        notices.add(Notice.builder().title("Scheduled Power Outage - Tomorrow").content("There will be a scheduled power outage tomorrow from 10 AM to 2 PM due to transformer maintenance. Backup generators will provide power to essential areas (corridors, security). Please charge your devices tonight. Wi-Fi will be unavailable during outage. UPS backup for servers only.").category(Notice.Category.EMERGENCY).priority(Notice.Priority.URGENT).publishedBy("Electrical Dept").publishedAt(now.minusHours(12)).expiresAt(now.plusDays(2)).isActive(true).targetAudience(Notice.TargetAudience.ALL).build());
        notices.add(Notice.builder().title("Water Pipeline Repair - Block A").content("Emergency repair work on the main water pipeline of Block A. Water supply disrupted for approximately 4-6 hours. Temporary water arrangements made on ground floor. Please use water judiciously. Normal supply expected to resume by evening.").category(Notice.Category.EMERGENCY).priority(Notice.Priority.URGENT).publishedBy("Maintenance Dept").publishedAt(now.minusDays(1)).expiresAt(now.plusDays(1)).isActive(true).targetAudience(Notice.TargetAudience.ALL).build());
        notices.add(Notice.builder().title("Fire Drill Notice - Mandatory Participation").content("A mandatory fire drill will be conducted this Thursday at 3 PM. All residents MUST evacuate to the designated assembly point (main ground). Floor wardens will guide evacuation. Do not use elevators. Attendance is compulsory - absentees will face penalty.").category(Notice.Category.EMERGENCY).priority(Notice.Priority.HIGH).publishedBy("Safety Officer").publishedAt(now.minusDays(3)).expiresAt(now.plusDays(4)).isActive(true).targetAudience(Notice.TargetAudience.ALL).build());

        // EVENT notices (4)
        notices.add(Notice.builder().title("Annual Cultural Fest - Registrations Open").content("The annual cultural fest 'Utsav 2025' is around the corner! Registrations are now open for dance, music, drama, art, and literary events. Form teams and register at the cultural committee office or online portal. Early bird registrations get priority for solo events. Exciting prizes await!").category(Notice.Category.EVENT).priority(Notice.Priority.NORMAL).publishedBy("Cultural Committee").publishedAt(now.minusDays(6)).expiresAt(now.plusDays(20)).isActive(true).targetAudience(Notice.TargetAudience.STUDENTS).build());
        notices.add(Notice.builder().title("Inter-Hostel Sports Tournament").content("Annual inter-hostel sports tournament starts next week. Events include cricket, football, badminton, table tennis, chess, and athletics. Team registrations at sports office. Practice slots available at the sports complex. Come support your hostel team!").category(Notice.Category.EVENT).priority(Notice.Priority.NORMAL).publishedBy("Sports Committee").publishedAt(now.minusDays(4)).expiresAt(now.plusDays(15)).isActive(true).targetAudience(Notice.TargetAudience.STUDENTS).build());
        notices.add(Notice.builder().title("Career Fair and Placement Drive").content("Annual career fair will be held in the auditorium with 25+ companies participating. Bring updated resumes (minimum 3 copies). Dress code: formal. Pre-registration mandatory on the placement portal. Workshops on resume building and interview skills available this week.").category(Notice.Category.EVENT).priority(Notice.Priority.HIGH).publishedBy("Placement Cell").publishedAt(now.minusDays(5)).expiresAt(now.plusDays(10)).isActive(true).targetAudience(Notice.TargetAudience.STUDENTS).build());
        notices.add(Notice.builder().title("Hostel Day Celebration").content("Annual Hostel Day will be celebrated next Saturday with cultural performances, food stalls, and games. All hostellers are invited to participate. Talent show registrations close this Wednesday. Best room award and best hosteller award will be announced during the event.").category(Notice.Category.EVENT).priority(Notice.Priority.NORMAL).publishedBy("Hostel Committee").publishedAt(now.minusDays(2)).expiresAt(now.plusDays(12)).isActive(true).targetAudience(Notice.TargetAudience.ALL).build());

        // Expired notices (2) - for variety
        notices.add(Notice.builder().title("Republic Day Flag Hoisting Ceremony").content("Flag hoisting ceremony on January 26th at 8 AM on the main ground. All students and staff are requested to attend. National anthem practice at 7:45 AM. Sweets will be distributed after the ceremony.").category(Notice.Category.EVENT).priority(Notice.Priority.NORMAL).publishedBy("Principal").publishedAt(now.minusDays(60)).expiresAt(now.minusDays(55)).isActive(false).targetAudience(Notice.TargetAudience.ALL).build());
        notices.add(Notice.builder().title("Previous Semester Results Declared").content("Results for the previous semester have been declared. Students can check their results on the university portal. Re-evaluation applications accepted till next Friday at the exam section. Grade cards will be available from the academic office next week.").category(Notice.Category.ACADEMIC).priority(Notice.Priority.HIGH).publishedBy("Exam Section").publishedAt(now.minusDays(40)).expiresAt(now.minusDays(30)).isActive(false).targetAudience(Notice.TargetAudience.STUDENTS).build());

        return notices;
    }

    private List<Event> seedEvents() {
        List<Event> events = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // UPCOMING events (5) - future dates within next 2 months
        events.add(Event.builder().title("Annual Cultural Fest - Utsav 2025").description("Three-day cultural extravaganza featuring music, dance, drama, art exhibitions, and literary competitions. Guest performances by renowned artists. Food stalls and gaming zones.").eventDate(today.plusDays(21)).startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(22, 0)).venue("Main Auditorium & Campus Grounds").organizer("Cultural Committee").category(Event.Category.CULTURAL).status(Event.Status.UPCOMING).maxParticipants(500).registeredCount(234).build());
        events.add(Event.builder().title("Inter-Hostel Cricket Tournament").description("Annual cricket tournament between all hostel blocks. Format: T20. Matches held on weekends. Trophy and cash prizes for winners and runners-up.").eventDate(today.plusDays(14)).startTime(LocalTime.of(7, 0)).endTime(LocalTime.of(18, 0)).venue("Sports Ground").organizer("Sports Committee").category(Event.Category.SPORTS).status(Event.Status.UPCOMING).maxParticipants(120).registeredCount(96).build());
        events.add(Event.builder().title("Career Guidance Workshop").description("Workshop on career planning, resume building, and interview preparation. Industry experts from IT, Finance, and Consulting will share insights. Mock interview sessions included.").eventDate(today.plusDays(7)).startTime(LocalTime.of(9, 30)).endTime(LocalTime.of(16, 30)).venue("Seminar Hall B").organizer("Placement Cell").category(Event.Category.ACADEMIC).status(Event.Status.UPCOMING).maxParticipants(200).registeredCount(178).build());
        events.add(Event.builder().title("Hostel Day Celebration").description("Annual hostel day with cultural performances, comedy night, DJ night, and food festival. Awards ceremony for best room, best hosteller, and outstanding contributions.").eventDate(today.plusDays(30)).startTime(LocalTime.of(17, 0)).endTime(LocalTime.of(23, 0)).venue("Hostel Common Ground").organizer("Hostel Committee").category(Event.Category.SOCIAL).status(Event.Status.UPCOMING).maxParticipants(300).registeredCount(156).build());
        events.add(Event.builder().title("Blood Donation Camp").description("Annual blood donation camp in collaboration with Red Cross Society. All healthy students above 18 years are encouraged to participate. Refreshments and certificates provided to all donors.").eventDate(today.plusDays(45)).startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(15, 0)).venue("Health Center").organizer("NSS Unit").category(Event.Category.SOCIAL).status(Event.Status.UPCOMING).maxParticipants(150).registeredCount(67).build());

        // ONGOING events (3) - today or this week
        events.add(Event.builder().title("Badminton Championship - Singles").description("Individual badminton championship. Knockout format. Matches scheduled daily in evening slots. Finals this Saturday.").eventDate(today).startTime(LocalTime.of(17, 0)).endTime(LocalTime.of(20, 0)).venue("Indoor Sports Complex").organizer("Sports Committee").category(Event.Category.SPORTS).status(Event.Status.ONGOING).maxParticipants(64).registeredCount(64).build());
        events.add(Event.builder().title("Photography Exhibition - Campus Life").description("Week-long photography exhibition showcasing campus life through the lens of hostel residents. Voting open for People's Choice Award.").eventDate(today.minusDays(2)).startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(18, 0)).venue("Art Gallery - Block D").organizer("Photography Club").category(Event.Category.CULTURAL).status(Event.Status.ONGOING).maxParticipants(50).registeredCount(42).build());
        events.add(Event.builder().title("Coding Hackathon - 48 Hours").description("48-hour coding hackathon. Teams of 2-4 members. Theme: Solutions for Smart Campus. Prizes worth Rs. 50,000. Mentorship from industry experts.").eventDate(today.minusDays(1)).startTime(LocalTime.of(8, 0)).endTime(LocalTime.of(8, 0)).venue("Computer Lab & Innovation Hub").organizer("Tech Club").category(Event.Category.ACADEMIC).status(Event.Status.ONGOING).maxParticipants(80).registeredCount(76).build());

        // COMPLETED events (5) - past dates
        events.add(Event.builder().title("Fresher's Welcome Party").description("Welcome party for new batch of hostel residents. Ice-breaking games, talent show, and dinner. Seniors performed skits and musical acts.").eventDate(today.minusDays(60)).startTime(LocalTime.of(18, 0)).endTime(LocalTime.of(22, 0)).venue("Main Auditorium").organizer("Senior Students Council").category(Event.Category.SOCIAL).status(Event.Status.COMPLETED).maxParticipants(400).registeredCount(380).build());
        events.add(Event.builder().title("Inter-Hostel Football Tournament").description("Annual football tournament. Six teams competed in league-cum-knockout format. Block C emerged as winners.").eventDate(today.minusDays(30)).startTime(LocalTime.of(6, 0)).endTime(LocalTime.of(10, 0)).venue("Football Ground").organizer("Sports Committee").category(Event.Category.SPORTS).status(Event.Status.COMPLETED).maxParticipants(90).registeredCount(90).build());
        events.add(Event.builder().title("Guest Lecture - AI in Healthcare").description("Distinguished lecture by Dr. Ramesh Nair on applications of Artificial Intelligence in healthcare diagnostics. Interactive Q&A session followed.").eventDate(today.minusDays(20)).startTime(LocalTime.of(14, 0)).endTime(LocalTime.of(16, 0)).venue("Seminar Hall A").organizer("CSE Department").category(Event.Category.ACADEMIC).status(Event.Status.COMPLETED).maxParticipants(150).registeredCount(142).build());
        events.add(Event.builder().title("Diwali Celebration").description("Grand Diwali celebration with rangoli competition, lamp decoration, fireworks display, and festive dinner. Cultural performances by students from all regions.").eventDate(today.minusDays(45)).startTime(LocalTime.of(17, 0)).endTime(LocalTime.of(22, 0)).venue("Hostel Common Ground").organizer("Festival Committee").category(Event.Category.CULTURAL).status(Event.Status.COMPLETED).maxParticipants(350).registeredCount(320).build());
        events.add(Event.builder().title("Health Awareness Seminar").description("Seminar on mental health awareness and stress management techniques for students. Conducted by professional counselors. Anonymous Q&A session available.").eventDate(today.minusDays(15)).startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(12, 30)).venue("Conference Room").organizer("Health Cell").category(Event.Category.SOCIAL).status(Event.Status.COMPLETED).maxParticipants(100).registeredCount(87).build());

        // CANCELLED events (2)
        events.add(Event.builder().title("Outdoor Trek to Nearby Hills").description("Day trek to nearby hills cancelled due to unseasonal heavy rainfall warning by meteorological department. Will be rescheduled to next month.").eventDate(today.minusDays(5)).startTime(LocalTime.of(6, 0)).endTime(LocalTime.of(18, 0)).venue("Nearby Hills (Off-campus)").organizer("Adventure Club").category(Event.Category.SOCIAL).status(Event.Status.CANCELLED).maxParticipants(40).registeredCount(38).build());
        events.add(Event.builder().title("Alumni Meet and Greet").description("Annual alumni interaction session cancelled due to scheduling conflicts with university convocation. New date to be announced soon.").eventDate(today.minusDays(10)).startTime(LocalTime.of(15, 0)).endTime(LocalTime.of(19, 0)).venue("Main Auditorium").organizer("Alumni Association").category(Event.Category.SOCIAL).status(Event.Status.CANCELLED).maxParticipants(200).registeredCount(145).build());

        return events;
    }
}
