package com.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LessonRequest {

    @NotBlank(message = "Tiêu đề bài học không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;

    private String content;

    @NotNull(message = "Thứ tự không được để trống")
    private Integer orderNo;

    private String lessonType;

    private String fileUrl;

    private String fileName;

    private String videoUrl;

    private Integer duration;
}
