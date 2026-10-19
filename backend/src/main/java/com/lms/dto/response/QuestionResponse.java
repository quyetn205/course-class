package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuestionResponse {

    private Long id;
    private String content;
    private List<OptionResponse> options;
}
