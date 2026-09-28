package com.jobtracker.service;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobtracker.dto.AnalyticsResponse;
import com.jobtracker.dto.DashboardStatsResponse;
import com.jobtracker.dto.JobApplicationRequest;
import com.jobtracker.dto.JobApplicationResponse;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.JobType;
import com.jobtracker.entity.User;
import com.jobtracker.exception.AccessDeniedForResourceException;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;

    @Transactional
    public JobApplicationResponse create(Long userId, JobApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        ApplicationStatus status = request.getStatus() == null
            ? ApplicationStatus.APPLIED
            : request.getStatus();

        JobApplication application = JobApplication.builder()
                .user(user)
                .companyName(request.getCompanyName())
                .jobTitle(request.getJobTitle())
                .location(request.getLocation())
                .jobType(request.getJobType())
                .status(status)
                .applicationDate(request.getApplicationDate())
                .interviewDate(request.getInterviewDate())
                .jobUrl(request.getJobUrl())
                .notes(request.getNotes())
                .build();

        application = jobApplicationRepository.save(application);
        return toResponse(application);
    }

    // Reads are read-only transactions because open-in-view is disabled: without
    // one, the LAZY `user` proxy touched in findOwned() is already detached.

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getAll(Long userId, String search, ApplicationStatus status,
                                                JobType jobType, String location, String sort) {
        List<JobApplication> applications = jobApplicationRepository.findByUserId(userId);

        List<JobApplication> filtered = applications.stream()
                .filter(app -> matchesSearch(app, search))
                .filter(app -> status == null || app.getStatus() == status)
                .filter(app -> jobType == null || app.getJobType() == jobType)
                .filter(app -> location == null || location.isBlank()
                        || (app.getLocation() != null
                        && app.getLocation().toLowerCase().contains(location.toLowerCase())))
                .collect(Collectors.toList());

        sortApplications(filtered, sort);

        return filtered.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse getById(Long userId, Long applicationId) {
        JobApplication application = findOwned(userId, applicationId);
        return toResponse(application);
    }

    @Transactional
    public JobApplicationResponse update(Long userId, Long applicationId, JobApplicationRequest request) {
        JobApplication application = findOwned(userId, applicationId);
        application.setCompanyName(request.getCompanyName());
        application.setJobTitle(request.getJobTitle());
        application.setLocation(request.getLocation());
        application.setJobType(request.getJobType());
        application.setStatus(request.getStatus() == null ? ApplicationStatus.APPLIED : request.getStatus());
        application.setApplicationDate(request.getApplicationDate());
        application.setInterviewDate(request.getInterviewDate());
        application.setJobUrl(request.getJobUrl());
        application.setNotes(request.getNotes());

        application = jobApplicationRepository.save(application);
        return toResponse(application);
    }

    @Transactional
    public JobApplicationResponse updateStatus(Long userId, Long applicationId, ApplicationStatus status) {
        JobApplication application = findOwned(userId, applicationId);
        application.setStatus(status);
        application = jobApplicationRepository.save(application);
        return toResponse(application);
    }

    @Transactional
    public void delete(Long userId, Long applicationId) {
        JobApplication application = findOwned(userId, applicationId);
        jobApplicationRepository.delete(application);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(Long userId) {
        List<JobApplication> all = jobApplicationRepository.findByUserId(userId);

        Map<ApplicationStatus, Long> counts = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus status : ApplicationStatus.values()) {
            counts.put(status, 0L);
        }
        for (JobApplication app : all) {
            counts.merge(app.getStatus(), 1L, Long::sum);
        }

        List<JobApplication> recent = jobApplicationRepository.findRecentByUserId(userId);
        List<JobApplicationResponse> recentResponses = recent.stream()
                .limit(5)
                .map(this::toResponse)
                .collect(Collectors.toList());

        List<JobApplication> upcoming = jobApplicationRepository.findUpcomingInterviews(userId, LocalDateTime.now());
        List<JobApplicationResponse> upcomingResponses = upcoming.stream()
                .limit(5)
                .map(this::toResponse)
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .total(all.size())
                .applied(counts.get(ApplicationStatus.APPLIED))
                .assessment(counts.get(ApplicationStatus.ASSESSMENT))
                .interview(counts.get(ApplicationStatus.INTERVIEW))
                .selected(counts.get(ApplicationStatus.SELECTED))
                .rejected(counts.get(ApplicationStatus.REJECTED))
                .recentApplications(recentResponses)
                .upcomingInterviews(upcomingResponses)
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, List<JobApplicationResponse>> getInterviews(Long userId) {
        List<JobApplication> upcoming = jobApplicationRepository.findUpcomingInterviews(userId, LocalDateTime.now());
        List<JobApplication> past = jobApplicationRepository.findPastInterviews(userId, LocalDateTime.now());

        Map<String, List<JobApplicationResponse>> result = new HashMap<>();
        result.put("upcoming", upcoming.stream().map(this::toResponse).collect(Collectors.toList()));
        result.put("past", past.stream().map(this::toResponse).collect(Collectors.toList()));
        return result;
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(Long userId) {
        List<JobApplication> all = jobApplicationRepository.findByUserId(userId);

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            byStatus.put(status.name(), 0L);
        }
        Map<String, Long> byJobType = new LinkedHashMap<>();
        for (JobType type : JobType.values()) {
            byJobType.put(type.name(), 0L);
        }

        Map<String, Long> byMonthMap = new LinkedHashMap<>();

        for (JobApplication app : all) {
            byStatus.merge(app.getStatus().name(), 1L, Long::sum);
            if (app.getJobType() != null) {
                byJobType.merge(app.getJobType().name(), 1L, Long::sum);
            }
            if (app.getApplicationDate() != null) {
                String monthKey = app.getApplicationDate().getMonth()
                        .getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + app.getApplicationDate().getYear();
                byMonthMap.merge(monthKey, 1L, Long::sum);
            }
        }

        List<AnalyticsResponse.MonthlyCount> byMonth = byMonthMap.entrySet().stream()
                .map(e -> AnalyticsResponse.MonthlyCount.builder().month(e.getKey()).count(e.getValue()).build())
                .collect(Collectors.toList());

        return AnalyticsResponse.builder()
                .total(all.size())
                .interviews(byStatus.getOrDefault(ApplicationStatus.INTERVIEW.name(), 0L))
                .assessments(byStatus.getOrDefault(ApplicationStatus.ASSESSMENT.name(), 0L))
                .selected(byStatus.getOrDefault(ApplicationStatus.SELECTED.name(), 0L))
                .rejected(byStatus.getOrDefault(ApplicationStatus.REJECTED.name(), 0L))
                .byStatus(byStatus)
                .byJobType(byJobType)
                .byMonth(byMonth)
                .build();
    }

    // ---------- helpers ----------

    private JobApplication findOwned(Long userId, Long applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found."));

        if (!application.getUser().getId().equals(userId)) {
            throw new AccessDeniedForResourceException("You do not have access to this application.");
        }
        return application;
    }

    private boolean matchesSearch(JobApplication app, String search) {
        if (search == null || search.isBlank()) return true;
        String query = search.toLowerCase();
        return (app.getCompanyName() != null && app.getCompanyName().toLowerCase().contains(query))
                || (app.getJobTitle() != null && app.getJobTitle().toLowerCase().contains(query))
                || (app.getLocation() != null && app.getLocation().toLowerCase().contains(query));
    }

    private void sortApplications(List<JobApplication> applications, String sort) {
        if (sort == null) sort = "newest";
        switch (sort) {
            case "oldest" -> applications.sort(Comparator.comparing(JobApplication::getCreatedAt,
                    Comparator.nullsLast(Comparator.naturalOrder())));
            case "company" -> applications.sort(Comparator.comparing(JobApplication::getCompanyName,
                    String.CASE_INSENSITIVE_ORDER));
            case "interviewDate" -> applications.sort(Comparator.comparing(
                    (JobApplication a) -> a.getInterviewDate(),
                    Comparator.nullsLast(Comparator.naturalOrder())));
            default -> applications.sort(Comparator.comparing(JobApplication::getCreatedAt,
                    Comparator.nullsLast(Comparator.reverseOrder())));
        }
    }

    private JobApplicationResponse toResponse(JobApplication app) {
        return JobApplicationResponse.builder()
                .id(app.getId())
                .companyName(app.getCompanyName())
                .jobTitle(app.getJobTitle())
                .location(app.getLocation())
                .jobType(app.getJobType())
                .status(app.getStatus())
                .applicationDate(app.getApplicationDate())
                .interviewDate(app.getInterviewDate())
                .jobUrl(app.getJobUrl())
                .notes(app.getNotes())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
