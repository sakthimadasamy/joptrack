package com.jobtracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(name = "job_title", nullable = false, length = 150)
    private String jobTitle;

    @Column(length = 150)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", length = 30)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationStatus status;

    @Column(name = "application_date")
    private LocalDate applicationDate;

    @Column(name = "interview_date")
    private LocalDateTime interviewDate;

    @Column(name = "job_url", length = 500)
    private String jobUrl;

    // Not @Lob: on PostgreSQL that maps to an out-of-band `oid` large object
    // rather than a column value. TEXT works on both PostgreSQL and MySQL.
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ApplicationStatus.APPLIED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
