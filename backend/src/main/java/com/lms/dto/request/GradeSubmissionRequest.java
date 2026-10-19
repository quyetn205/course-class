package com.lms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GradeSubmissionRequest {

    @NotNull(message = "Điểm không được để trống")
    private Double score;

    private String comment;
}
