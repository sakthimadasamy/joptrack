package com.jobtracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {
    private long total;
    private long interviews;
    private long assessments;
    private long selected;
    private long rejected;
    private Map<String, Long> byStatus;
    private Map<String, Long> byJobType;
    private List<MonthlyCount> byMonth;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyCount {
        private String month;
        private long count;
    }
}
