package com.jobtracker.dto;

import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class JobApplicationRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    private String location;

    private JobType jobType;

    @NotNull(message = "Status is required")
    private ApplicationStatus status;

    private LocalDate applicationDate;

    private LocalDateTime interviewDate;

    private String jobUrl;

    private String notes;
}
