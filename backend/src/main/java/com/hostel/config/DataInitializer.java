package com.hostel.config;

import com.hostel.entity.*;
import com.hostel.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(UserRepository userRepository, StudentRepository studentRepository,
                               RoomRepository roomRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Create admin user if not exists
            if (!userRepository.existsByEmail("admin@hostel.com")) {
                User admin = User.builder()
                        .name("Admin User")
                        .username("admin")
                        .email("admin@hostel.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(User.Role.ADMIN)
                        .phone("9876543210")
                        .isActive(true)
                        .build();
                userRepository.save(admin);
            }

            // Create student user if not exists
            if (!userRepository.existsByEmail("student@hostel.com")) {
                User studentUser = User.builder()
                        .name("John Doe")
                        .username("johndoe")
                        .email("student@hostel.com")
                        .password(passwordEncoder.encode("student123"))
                        .role(User.Role.STUDENT)
                        .phone("9876543211")
                        .isActive(true)
                        .build();
                userRepository.save(studentUser);
            }

            // Create sample rooms
            if (roomRepository.count() == 0) {
                for (int floor = 1; floor <= 3; floor++) {
                    for (int room = 1; room <= 10; room++) {
                        String roomNumber = floor + String.format("%02d", room);
                        roomRepository.save(Room.builder()
                                .roomNumber(roomNumber)
                                .capacity(room <= 5 ? 2 : 3)
                                .occupied(0)
                                .block("A")
                                .floor(floor)
                                .type(room <= 5 ? Room.RoomType.DOUBLE : Room.RoomType.TRIPLE)
                                .status(Room.RoomStatus.AVAILABLE)
                                .monthlyRent(room <= 5 ? 5000.0 : 4000.0)
                                .amenities("WiFi,AC,Attached Bathroom")
                                .build());
                    }
                }
            }

            // Create sample students
            if (studentRepository.count() == 0) {
                String[] names = {"John Doe", "Jane Smith", "Mike Johnson", "Emily Davis", "Chris Wilson"};
                String[] courses = {"B.Tech CSE", "B.Tech ECE", "B.Tech ME", "BBA", "B.Sc Physics"};
                for (int i = 0; i < names.length; i++) {
                    studentRepository.save(Student.builder()
                            .name(names[i])
                            .email(names[i].toLowerCase().replace(" ", ".") + "@student.hostel.com")
                            .phone("98765432" + (10 + i))
                            .rollNumber("2024" + String.format("%03d", i + 1))
                            .course(courses[i])
                            .department(courses[i].contains("Tech") ? "Engineering" : "Science")
                            .year(2)
                            .roomNumber("1" + String.format("%02d", i + 1))
                            .gender(i % 2 == 0 ? "Male" : "Female")
                            .feesStatus(i < 3 ? Student.FeesStatus.PAID : Student.FeesStatus.PENDING)
                            .isActive(true)
                            .admissionDate(LocalDate.of(2024, 7, 1))
                            .build());
                }
            }
        };
    }
}
