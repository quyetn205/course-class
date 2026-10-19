package com.lms.service.impl;

import com.lms.dto.request.ChapterRequest;
import com.lms.dto.response.ChapterResponse;
import com.lms.dto.response.LessonResponse;
import com.lms.entity.Chapter;
import com.lms.entity.Course;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.ChapterRepository;
import com.lms.repository.CourseRepository;
import com.lms.service.ChapterService;
import com.lms.security.CourseSecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;
    private final CourseRepository courseRepository;
    private final CourseSecurityHelper courseSecurityHelper;

    @Override
    @Transactional
    public ChapterResponse createChapter(Long courseId, ChapterRequest request, String currentUserEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Khóa học", courseId));

        courseSecurityHelper.validateCourseAccess(course, currentUserEmail, "thêm chương vào");

        Chapter chapter = Chapter.builder()
                .course(course)
                .title(request.getTitle())
                .orderNo(request.getOrderNo())
                .build();

        chapter = chapterRepository.save(chapter);
        return toResponse(chapter);
    }

    @Override
    @Transactional
    public ChapterResponse updateChapter(Long id, ChapterRequest request, String currentUserEmail) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chương", id));

        courseSecurityHelper.validateCourseAccess(chapter.getCourse(), currentUserEmail, "chỉnh sửa chương của");

        chapter.setTitle(request.getTitle());
        chapter.setOrderNo(request.getOrderNo());

        chapter = chapterRepository.save(chapter);
        return toResponse(chapter);
    }

    private ChapterResponse toResponse(Chapter chapter) {
        return ChapterResponse.builder()
                .id(chapter.getId())
                .courseId(chapter.getCourse().getId())
                .title(chapter.getTitle())
                .orderNo(chapter.getOrderNo())
                .lessons(chapter.getLessons() != null
                        ? chapter.getLessons().stream().map(l -> LessonResponse.builder()
                                .id(l.getId())
                                .chapterId(l.getChapter().getId())
                                .title(l.getTitle())
                                .content(l.getContent())
                                .orderNo(l.getOrderNo())
                                .locked(l.getLocked())
                                .lessonType(l.getLessonType())
                                .fileUrl(l.getFileUrl())
                                .fileName(l.getFileName())
                                .videoUrl(l.getVideoUrl())
                                .duration(l.getDuration())
                                .createdAt(l.getCreatedAt())
                                .updatedAt(l.getUpdatedAt())
                                .build()).collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }

    @Override
    @Transactional
    public void deleteChapter(Long id, String currentUserEmail) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chương", id));

        courseSecurityHelper.validateCourseAccess(chapter.getCourse(), currentUserEmail, "xóa chương của");

        chapterRepository.delete(chapter);
    }
}
