package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EnrollmentResponse {

    private Long id;
    private Long classId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private LocalDateTime enrolledDate;
}
