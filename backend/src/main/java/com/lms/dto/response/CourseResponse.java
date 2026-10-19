package com.lms.dto.response;

import com.lms.common.enums.CourseStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CourseResponse {

    private Long id;
    private String title;
    private String description;
    private String goal;
    private Long categoryId;
    private String categoryName;
    private Long instructorId;
    private String instructorName;
    private CourseStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String thumbnailUrl;
    private String level;
    private String prerequisites;
    private List<ChapterResponse> chapters;
}
