package com.jobtracker.controller;

import com.jobtracker.dto.DashboardStatsResponse;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final JobApplicationService jobApplicationService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(jobApplicationService.getDashboardStats(principal.getId()));
    }
}
