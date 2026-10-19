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
public class QuizAttemptAnswerResponse {

    private Long id;
    private Long questionId;
    private String questionContent;
    private Long selectedOptionId;
    private String selectedOptionContent;
    private Long correctOptionId;
    private String correctOptionContent;
    private Boolean isCorrect;
    private List<OptionResponse> options;
}
