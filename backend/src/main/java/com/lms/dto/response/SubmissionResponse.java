package com.lms.dto.response;

import com.lms.common.enums.SubmissionStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubmissionResponse {

    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private Long studentId;
    private String studentName;
    private String file;
    private SubmissionStatus status;
    private Double score;
    private String comment;
    private java.time.LocalDateTime submittedAt;
    private java.time.LocalDateTime updatedAt;
    private Boolean isLate;
}
