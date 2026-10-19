package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OptionResponse {

    private Long id;
    private String content;
    private Boolean isCorrect;
}
