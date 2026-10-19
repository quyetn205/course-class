package com.lms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassGradebookResponse {
    private Long classId;
    private String className;
    private Long courseId;
    private String courseName;
    private String instructorName;
    private int totalLessons;
    private List<GradebookItemColumn> quizzes;
    private List<GradebookItemColumn> assignments;
    private List<StudentGradeRow> studentRows;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GradebookItemColumn {
        private Long id;
        private String title;
        private String lessonTitle;
        private Double maxScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentGradeRow {
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private int completedLessons;
        private int progressPercentage;
        private Map<Long, QuizScoreItem> quizScores; // quizId -> score item
        private Map<Long, AssignmentScoreItem> assignmentScores; // assignmentId -> score item
        private Double averageScore; // Trung bình điểm theo thang 10
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizScoreItem {
        private Double score;
        private Integer correctCount;
        private Integer totalQuestions;
        private String submittedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentScoreItem {
        private Double score;
        private Double maxScore;
        private String status; // SUBMITTED / GRADED
        private String comment;
        private String submittedAt;
    }
}
