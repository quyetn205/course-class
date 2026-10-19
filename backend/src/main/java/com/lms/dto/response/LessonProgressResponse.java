package com.lms.dto.response;

import com.lms.common.enums.LessonProgressStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LessonProgressResponse {

    private Long id;
    private Long lessonId;
    private String lessonTitle;
    private Long studentId;
    private LessonProgressStatus status;
    private LocalDateTime completedAt;
    private String lessonContent;
    private String lessonType;
    private String fileUrl;
    private String fileName;
    private Integer orderNo;
    private String videoUrl;
    private Integer duration;
}
