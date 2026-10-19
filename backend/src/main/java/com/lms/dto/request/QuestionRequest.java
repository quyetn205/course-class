package com.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String content;

    private List<OptionRequest> options;
}
