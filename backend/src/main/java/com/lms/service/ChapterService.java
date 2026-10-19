package com.lms.service;

import com.lms.dto.request.ChapterRequest;
import com.lms.dto.response.ChapterResponse;

public interface ChapterService {

    ChapterResponse createChapter(Long courseId, ChapterRequest request, String currentUserEmail);

    ChapterResponse updateChapter(Long id, ChapterRequest request, String currentUserEmail);

    void deleteChapter(Long id, String currentUserEmail);
}
