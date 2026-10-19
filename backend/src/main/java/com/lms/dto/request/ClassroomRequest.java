package com.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ClassroomRequest {

    @NotNull(message = "Khóa học không được để trống")
    private Long courseId;

    @NotBlank(message = "Tên lớp học không được để trống")
    @Size(max = 255, message = "Tên lớp học không được vượt quá 255 ký tự")
    private String name;

    private LocalDate startDate;
    private LocalDate endDate;

    @Positive(message = "Số lượng học viên tối đa phải lớn hơn 0")
    private Integer maxStudents;
}
