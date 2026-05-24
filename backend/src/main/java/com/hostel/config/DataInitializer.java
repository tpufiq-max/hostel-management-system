package com.hostel.config;

import com.hostel.entity.*;
import com.hostel.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Objects;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(
            UserRepository userRepository,
            StudentRepository studentRepository,
            RoomRepository roomRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            try {
                // ── Admin user ──────────────────────────────────────────
                if (!userRepository.existsByEmail("admin@hostel.com")) {
                    userRepository.save(Objects.requireNonNull(User.builder()
                            .name("Admin User")
                            .username("admin")
                            .email("admin@hostel.com")
                            .password(passwordEncoder.encode("admin123"))
                            .role(User.Role.ADMIN)
                            .phone("9876543210")
                            .isActive(true)
                            .build()));
                    System.out.println("✓ Admin user created");
                }

                // ── Student user ────────────────────────────────────────
                if (!userRepository.existsByEmail("student@hostel.com")) {
                    userRepository.save(Objects.requireNonNull(User.builder()
                            .name("John Doe")
                            .username("johndoe")
                            .email("student@hostel.com")
                            .password(passwordEncoder.encode("student123"))
                            .role(User.Role.STUDENT)
                            .phone("9876543211")
                            .isActive(true)
                            .build()));
                    System.out.println("✓ Student user created");
                }

                // ── Sample rooms ────────────────────────────────────────
                if (roomRepository.count() == 0) {
                    for (int floor = 1; floor <= 3; floor++) {
                        for (int room = 1; room <= 5; room++) {
                            String roomNumber = floor + String.format("%02d", room);
                            roomRepository.save(Objects.requireNonNull(Room.builder()
                                    .roomNumber(roomNumber)
                                    .capacity(room <= 3 ? 2 : 3)
                                    .occupied(0)
                                    .block("A")
                                    .floor(floor)
                                    .type(room <= 3 ? Room.RoomType.DOUBLE : Room.RoomType.TRIPLE)
                                    .status(Room.RoomStatus.AVAILABLE)
                                    .monthlyRent(room <= 3 ? 5000.0 : 4000.0)
                                    .amenities("WiFi, AC, Attached Bathroom")
                                    .build()));
                        }
                    }
                    System.out.println("✓ Sample rooms created");
                }

                // ── Sample students ─────────────────────────────────────
                if (studentRepository.count() == 0) {
                    String[][] data = {
                        {"John Doe",    "B.Tech CSE", "Engineering", "Male"},
                        {"Jane Smith",  "B.Tech ECE", "Engineering", "Female"},
                        {"Mike Johnson","B.Tech ME",  "Engineering", "Male"},
                        {"Emily Davis", "BBA",        "Management",  "Female"},
                        {"Chris Wilson","B.Sc Physics","Science",    "Male"},
                    };
                    for (int i = 0; i < data.length; i++) {
                        studentRepository.save(Objects.requireNonNull(Student.builder()
                                .name(data[i][0])
                                .email(data[i][0].toLowerCase().replace(" ", ".") + "@student.hostel.com")
                                .phone("98765432" + (10 + i))
                                .rollNumber("2024" + String.format("%03d", i + 1))
                                .course(data[i][1])
                                .department(data[i][2])
                                .year(2)
                                .roomNumber("1" + String.format("%02d", i + 1))
                                .gender(data[i][3])
                                .feesStatus(i < 3 ? Student.FeesStatus.PAID : Student.FeesStatus.PENDING)
                                .isActive(true)
                                .admissionDate(LocalDate.of(2024, 7, 1))
                                .build()));
                    }
                    System.out.println("✓ Sample students created");
                }

                System.out.println("==========================================");
                System.out.println("🏠 HMS Backend Ready!");
                System.out.println("   URL  : http://localhost:8080");
                System.out.println("   H2   : http://localhost:8080/h2-console");
                System.out.println("   Admin: admin@hostel.com / admin123");
                System.out.println("   Student: student@hostel.com / student123");
                System.out.println("==========================================");

            } catch (Exception e) {
                System.err.println("⚠️ DataInitializer error (non-fatal): " + e.getMessage());
                // Don't crash the app — tables may not exist yet on first run
            }
        };
    }
}
