package com.lms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDashboardResponse {

    // Thống kê tổng quan (KPIs)
    private long totalEnrolledClasses;
    private long inProgressClasses;
    private long completedLessons;
    private long totalLessons;
    private int overallProgressPercent;

    private long totalSubmissions;
    private long totalQuizAttempts;
    private Double averageScore; // Thang 10

    // Bài học gợi ý tiếp tục học ngay (Resume Learning)
    private ResumeLessonDto resumeLearning;

    // Danh sách bài tập / Quiz sắp đến hạn nộp (Deadlines)
    private List<UpcomingDeadlineDto> upcomingDeadlines;

    // Kết quả điểm số các bài gần nhất (Recent Grades & Feedback)
    private List<RecentGradeDto> recentGrades;

    // Danh sách lớp học đang theo học kèm tiến độ chi tiết
    private List<StudentClassDto> myClasses;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResumeLessonDto {
        private Long classId;
        private String className;
        private Long courseId;
        private String courseTitle;
        private Long lessonId;
        private String lessonTitle;
        private String lessonType;
        private Integer chapterOrderNo;
        private Integer lessonOrderNo;
        private int classProgressPercent;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpcomingDeadlineDto {
        private Long id;
        private String type; // "ASSIGNMENT"
        private String title;
        private Long classId;
        private String className;
        private Long courseId;
        private String courseTitle;
        private Long lessonId;
        private LocalDateTime deadline;
        private Double maxScore;
        private boolean isSubmitted;
        private String status; // "PENDING", "SUBMITTED", "GRADED"
        private Double score;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentGradeDto {
        private Long id;
        private String type; // "ASSIGNMENT" | "QUIZ"
        private String title;
        private String courseTitle;
        private Double score;
        private Double maxScore;
        private LocalDateTime submittedAt;
        private String feedback;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentClassDto {
        private Long classId;
        private String className;
        private Long courseId;
        private String courseTitle;
        private String instructorName;
        private String status;
        private int completedLessons;
        private int totalLessons;
        private int progressPercent;
        private String startDate;
        private String endDate;
    }
}
