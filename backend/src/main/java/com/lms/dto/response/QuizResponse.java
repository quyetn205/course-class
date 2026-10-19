package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuizResponse {

    private Long id;
    private Long lessonId;
    private String title;
    private List<QuestionResponse> questions;
}
