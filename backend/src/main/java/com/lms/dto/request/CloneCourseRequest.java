package com.lms.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloneCourseRequest {

    @Schema(description = "Tên khóa học mới (nếu để trống sẽ tự động lấy '[Bản sao] ' + tên cũ)", example = "Lập trình Spring Boot nâng cao - Lớp K2")
    private String title;
}
