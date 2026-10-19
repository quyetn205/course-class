package com.lms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentGradebookResponse {
    private Long classId;
    private String className;
    private Long courseId;
    private String courseName;
    private String instructorName;
    private int completedLessons;
    private int totalLessons;
    private int progressPercentage;
    private Double overallAverageScore; // Điểm trung bình tổng kết
    private List<StudentGradeItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentGradeItem {
        private String type; // "QUIZ" or "ASSIGNMENT"
        private Long itemId; // quizId or assignmentId
        private String title;
        private String lessonTitle;
        private Double score;
        private Double maxScore;
        private String status; // "COMPLETED", "SUBMITTED", "GRADED", "NOT_STARTED"
        private Integer correctCount;
        private Integer totalQuestions;
        private String comment;
        private String submittedAt;
    }
}
