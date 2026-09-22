package com.jobtracker.dto;

import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationResponse {
    private Long id;
    private String companyName;
    private String jobTitle;
    private String location;
    private JobType jobType;
    private ApplicationStatus status;
    private LocalDate applicationDate;
    private LocalDateTime interviewDate;
    private String jobUrl;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
