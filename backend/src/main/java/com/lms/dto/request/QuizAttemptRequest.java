package com.lms.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class QuizAttemptRequest {

    @NotEmpty(message = "Danh sách câu trả lời không được để trống")
    private List<AnswerItem> answers;

    @Data
    public static class AnswerItem {
        private Long questionId;
        private Long selectedOptionId;
    }
}
