package com.lms.service;

import com.lms.dto.request.LessonRequest;
import com.lms.dto.response.LessonResponse;

public interface LessonService {

    LessonResponse createLesson(Long chapterId, LessonRequest request, String currentUserEmail);

    LessonResponse updateLesson(Long id, LessonRequest request, String currentUserEmail);

    LessonResponse getLessonById(Long id);

    void deleteLesson(Long id, String currentUserEmail);
}
