package com.jobtracker.repository;

import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, ApplicationStatus status);

    long countByUserId(Long userId);

    @Query("""
            SELECT j FROM JobApplication j
            WHERE j.user.id = :userId
              AND j.status = 'INTERVIEW'
              AND j.interviewDate IS NOT NULL
              AND j.interviewDate >= :from
            ORDER BY j.interviewDate ASC
            """)
    List<JobApplication> findUpcomingInterviews(@Param("userId") Long userId, @Param("from") LocalDateTime from);

    @Query("""
            SELECT j FROM JobApplication j
            WHERE j.user.id = :userId
              AND j.status = 'INTERVIEW'
              AND j.interviewDate IS NOT NULL
              AND j.interviewDate < :from
            ORDER BY j.interviewDate DESC
            """)
    List<JobApplication> findPastInterviews(@Param("userId") Long userId, @Param("from") LocalDateTime from);

    @Query("""
            SELECT j FROM JobApplication j
            WHERE j.user.id = :userId
            ORDER BY j.createdAt DESC
            """)
    List<JobApplication> findRecentByUserId(@Param("userId") Long userId);
}
