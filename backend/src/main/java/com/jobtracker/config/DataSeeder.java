package com.jobtracker.config;

import com.jobtracker.entity.*;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Seeds a demo account with realistic sample applications so the app is
 * immediately explorable after a fresh clone. Disable with app.seed.enabled=false.
 *
 * Demo login: demo@jobtrack.com / demo1234
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Override
    public void run(String... args) {
        if (!seedEnabled) return;
        if (userRepository.existsByEmail("demo@jobtrack.com")) return;

        User demoUser = User.builder()
                .name("Demo User")
                .email("demo@jobtrack.com")
                .password(passwordEncoder.encode("demo1234"))
                .build();
        demoUser = userRepository.save(demoUser);

        seedApplication(demoUser, "TCS", "Java Developer", "Chennai", JobType.FULL_TIME,
                ApplicationStatus.INTERVIEW, LocalDate.now().minusDays(2),
                LocalDateTime.now().plusDays(3).withHour(10).withMinute(30),
                "https://www.tcs.com/careers", "Prepare Java, Spring Boot and SQL for the technical interview.");

        seedApplication(demoUser, "Infosys", "Software Engineer", "Pune", JobType.FULL_TIME,
                ApplicationStatus.ASSESSMENT, LocalDate.now().minusDays(4), null,
                "https://www.infosys.com/careers", "Online assessment covers aptitude and coding.");

        seedApplication(demoUser, "Zoho", "Backend Developer", "Chennai", JobType.FULL_TIME,
                ApplicationStatus.APPLIED, LocalDate.now().minusDays(7), null,
                "https://www.zoho.com/careers", "Applied through referral.");

        seedApplication(demoUser, "Wipro", "Software Developer", "Bangalore", JobType.FULL_TIME,
                ApplicationStatus.REJECTED, LocalDate.now().minusDays(12), null,
                "https://careers.wipro.com", "Did not move past the first screening round.");

        seedApplication(demoUser, "Accenture", "Associate Software Engineer", "Chennai", JobType.FULL_TIME,
                ApplicationStatus.SELECTED, LocalDate.now().minusDays(20), null,
                "https://www.accenture.com/careers", "Offer received. Awaiting joining formalities.");

        seedApplication(demoUser, "HCLTech", "Graduate Engineer Trainee", "Coimbatore", JobType.FULL_TIME,
                ApplicationStatus.INTERVIEW, LocalDate.now().minusDays(1),
                LocalDateTime.now().plusDays(1).withHour(14).withMinute(0),
                "https://www.hcltech.com/careers", "Focus on DSA and computer networks fundamentals.");
    }

    private void seedApplication(User user, String company, String title, String location, JobType type,
                                  ApplicationStatus status, LocalDate appliedDate, LocalDateTime interviewDate,
                                  String url, String notes) {
        JobApplication app = JobApplication.builder()
                .user(user)
                .companyName(company)
                .jobTitle(title)
                .location(location)
                .jobType(type)
                .status(status)
                .applicationDate(appliedDate)
                .interviewDate(interviewDate)
                .jobUrl(url)
                .notes(notes)
                .build();
        jobApplicationRepository.save(app);
    }
}
