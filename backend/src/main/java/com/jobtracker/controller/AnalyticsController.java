package com.jobtracker.controller;

import com.jobtracker.dto.AnalyticsResponse;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final JobApplicationService jobApplicationService;

    @GetMapping
    public ResponseEntity<AnalyticsResponse> getAnalytics(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(jobApplicationService.getAnalytics(principal.getId()));
    }
}
