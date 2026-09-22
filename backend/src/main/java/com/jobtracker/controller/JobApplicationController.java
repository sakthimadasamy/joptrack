package com.jobtracker.controller;

import com.jobtracker.dto.JobApplicationRequest;
import com.jobtracker.dto.JobApplicationResponse;
import com.jobtracker.dto.StatusUpdateRequest;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobType;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @PostMapping
    public ResponseEntity<JobApplicationResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                           @Valid @RequestBody JobApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobApplicationService.create(principal.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<JobApplicationResponse>> getAll(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) String location,
            @RequestParam(required = false, defaultValue = "newest") String sort) {

        return ResponseEntity.ok(
                jobApplicationService.getAll(principal.getId(), search, status, jobType, location, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> getById(@AuthenticationPrincipal UserPrincipal principal,
                                                            @PathVariable Long id) {
        return ResponseEntity.ok(jobApplicationService.getById(principal.getId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> update(@AuthenticationPrincipal UserPrincipal principal,
                                                           @PathVariable Long id,
                                                           @Valid @RequestBody JobApplicationRequest request) {
        return ResponseEntity.ok(jobApplicationService.update(principal.getId(), id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplicationResponse> updateStatus(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @PathVariable Long id,
                                                                 @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(jobApplicationService.updateStatus(principal.getId(), id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        jobApplicationService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
