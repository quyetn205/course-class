package com.lms.dto.response;

import com.lms.common.enums.ClassroomStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ClassroomResponse {

    private Long id;
    private Long courseId;
    private String courseName;
    private Long instructorId;
    private String instructorName;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer maxStudents;
    private Long currentStudents;
    private ClassroomStatus status;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
