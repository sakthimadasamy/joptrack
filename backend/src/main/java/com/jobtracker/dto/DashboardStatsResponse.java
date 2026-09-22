package com.jobtracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private long total;
    private long applied;
    private long assessment;
    private long interview;
    private long selected;
    private long rejected;
    private List<JobApplicationResponse> recentApplications;
    private List<JobApplicationResponse> upcomingInterviews;
}
