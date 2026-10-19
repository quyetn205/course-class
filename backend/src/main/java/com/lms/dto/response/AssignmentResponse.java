package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AssignmentResponse {

    private Long id;
    private Long lessonId;
    private String title;
    private LocalDateTime deadline;
    private Double maxScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
