package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LessonResponse {

    private Long id;
    private Long chapterId;
    private String title;
    private String content;
    private Integer orderNo;
    private Boolean locked;
    private String lessonType;
    private String fileUrl;
    private String fileName;
    private String videoUrl;
    private Integer duration;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
