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
public class InstructorDashboardResponse {

    // Thống kê Khóa học
    private long totalCourses;
    private long publishedCourses;
    private long draftCourses;

    // Thống kê Lớp học
    private long totalClassrooms;
    private long openClassrooms;
    private long inProgressClassrooms;
    private long closedClassrooms;

    // Thống kê Học viên
    private long totalStudents;

    // Thống kê Tương tác & Chấm điểm
    private long pendingSubmissions;   // Bài tập chưa chấm điểm
    private long gradedSubmissions;    // Bài tập đã chấm điểm
    private long totalSubmissions;     // Tổng số bài nộp
    private long totalQuizAttempts;    // Tổng lượt làm Quiz

    // Danh sách bài nộp gần đây (cần chấm hoặc vừa nộp)
    private List<PendingSubmissionDto> recentSubmissions;

    // Danh sách lớp học đang phụ trách
    private List<InstructorClassDto> myClasses;

    // Danh sách khóa học gần đây
    private List<InstructorCourseDto> myCourses;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PendingSubmissionDto {
        private Long submissionId;
        private Long assignmentId;
        private String assignmentTitle;
        private String courseTitle;
        private String lessonTitle;
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private String fileUrl;
        private String status;
        private Double score;
        private Double maxScore;
        private LocalDateTime submittedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InstructorClassDto {
        private Long id;
        private String name;
        private Long courseId;
        private String courseTitle;
        private String status;
        private long currentStudents;
        private Integer maxStudents;
        private String startDate;
        private String endDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InstructorCourseDto {
        private Long id;
        private String title;
        private String categoryName;
        private String status;
        private String thumbnailUrl;
        private int chapterCount;
        private LocalDateTime createdAt;
    }
}
