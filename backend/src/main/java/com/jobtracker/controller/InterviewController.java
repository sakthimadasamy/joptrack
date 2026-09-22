package com.jobtracker.controller;

import com.jobtracker.dto.JobApplicationResponse;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final JobApplicationService jobApplicationService;

    @GetMapping
    public ResponseEntity<Map<String, List<JobApplicationResponse>>> getInterviews(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(jobApplicationService.getInterviews(principal.getId()));
    }
}
