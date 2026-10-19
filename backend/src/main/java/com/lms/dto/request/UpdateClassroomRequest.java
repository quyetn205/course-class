package com.lms.dto.request;

import com.lms.common.enums.ClassroomStatus;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateClassroomRequest {

    @Size(max = 255, message = "Tên lớp học không được vượt quá 255 ký tự")
    private String name;

    private LocalDate startDate;
    private LocalDate endDate;

    @Positive(message = "Số lượng học viên tối đa phải lớn hơn 0")
    private Integer maxStudents;

    private ClassroomStatus status;
}
