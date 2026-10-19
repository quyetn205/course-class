package com.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OptionRequest {

    @NotBlank(message = "Nội dung lựa chọn không được để trống")
    private String content;

    @NotNull(message = "Trạng thái đáp án đúng không được để trống")
    private Boolean isCorrect;
}
