package com.jobtracker.service;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.jobtracker.dto.JobApplicationRequest;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.User;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JobApplicationService jobApplicationService;

    @Test
    void create_preservesAppliedStatusWhenInterviewDateIsProvided() {
        User user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("secret");

        JobApplicationRequest request = new JobApplicationRequest();
        request.setCompanyName("Acme");
        request.setJobTitle("Java Developer");
        request.setStatus(ApplicationStatus.APPLIED);
        request.setInterviewDate(LocalDateTime.now().plusDays(2));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(jobApplicationRepository.save(any(JobApplication.class))).thenAnswer(invocation -> {
            JobApplication app = invocation.getArgument(0);
            app.setId(99L);
            return app;
        });

        var result = jobApplicationService.create(1L, request);

        assertEquals(ApplicationStatus.APPLIED, result.getStatus());
    }
}
