package com.lms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptResponse {

    private Long id;
    private Long quizId;
    private String quizTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Double score;
    private Integer totalQuestions;
    private Integer correctCount;
    private LocalDateTime submittedAt;
    private List<QuizAttemptAnswerResponse> answers;
}
