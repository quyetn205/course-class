package com.lms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddStudentRequest {

    @NotNull(message = "ID học viên không được để trống")
    private Long studentId;
}
