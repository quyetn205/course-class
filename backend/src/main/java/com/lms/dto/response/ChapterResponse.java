package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ChapterResponse {

    private Long id;
    private Long courseId;
    private String title;
    private Integer orderNo;
    private List<LessonResponse> lessons;
}
