package com.lms.service.impl;

import com.lms.dto.request.LessonRequest;
import com.lms.dto.response.LessonResponse;
import com.lms.entity.Chapter;
import com.lms.entity.Lesson;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.ChapterRepository;
import com.lms.repository.LessonRepository;
import com.lms.service.LessonService;
import com.lms.security.CourseSecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final CourseSecurityHelper courseSecurityHelper;

    @Override
    @Transactional
    public LessonResponse createLesson(Long chapterId, LessonRequest request, String currentUserEmail) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chương", chapterId));

        courseSecurityHelper.validateCourseAccess(chapter.getCourse(), currentUserEmail, "thêm bài học vào");

        // Bài đầu tiên của khóa học luôn mở (locked = false)
        boolean isFirstLesson = isFirstLessonInCourse(chapter, request.getOrderNo());

        Lesson lesson = Lesson.builder()
                .chapter(chapter)
                .title(request.getTitle())
                .content(request.getContent())
                .orderNo(request.getOrderNo())
                .locked(!isFirstLesson)
                .lessonType(request.getLessonType() != null && !request.getLessonType().isBlank() ? request.getLessonType() : "TEXT")
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .videoUrl(request.getVideoUrl())
                .duration(request.getDuration())
                .build();

        lesson = lessonRepository.save(lesson);
        return toResponse(lesson);
    }

    @Override
    @Transactional
    public LessonResponse updateLesson(Long id, LessonRequest request, String currentUserEmail) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bài học", id));

        courseSecurityHelper.validateCourseAccess(lesson.getChapter().getCourse(), currentUserEmail, "chỉnh sửa bài học của");

        lesson.setTitle(request.getTitle());
        lesson.setContent(request.getContent());
        lesson.setOrderNo(request.getOrderNo());
        if (request.getLessonType() != null && !request.getLessonType().isBlank()) {
            lesson.setLessonType(request.getLessonType());
        }
        lesson.setFileUrl(request.getFileUrl());
        lesson.setFileName(request.getFileName());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setDuration(request.getDuration());

        lesson = lessonRepository.save(lesson);
        return toResponse(lesson);
    }

    @Override
    @Transactional(readOnly = true)
    public LessonResponse getLessonById(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bài học", id));
        return toResponse(lesson);
    }

    @Override
    @Transactional
    public void deleteLesson(Long id, String currentUserEmail) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bài học", id));

        courseSecurityHelper.validateCourseAccess(lesson.getChapter().getCourse(), currentUserEmail, "xóa bài học của");

        lessonRepository.delete(lesson);
    }

    private boolean isFirstLessonInCourse(Chapter chapter, int orderNo) {
        Long courseId = chapter.getCourse().getId();
        List<Lesson> allLessons = lessonRepository.findAllByCourseIdOrdered(courseId);

        if (allLessons.isEmpty()) {
            // Không có bài nào → bài này là đầu tiên nếu chapter.orderNo nhỏ nhất
            return chapter.getOrderNo() <= 1 && orderNo <= 1;
        }

        // Kiểm tra bài đầu tiên theo thứ tự
        Lesson first = allLessons.get(0);
        return chapter.getOrderNo() < first.getChapter().getOrderNo() ||
               (chapter.getOrderNo().equals(first.getChapter().getOrderNo()) && orderNo < first.getOrderNo());
    }

    private LessonResponse toResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .chapterId(lesson.getChapter().getId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .orderNo(lesson.getOrderNo())
                .locked(lesson.getLocked())
                .lessonType(lesson.getLessonType())
                .fileUrl(lesson.getFileUrl())
                .fileName(lesson.getFileName())
                .videoUrl(lesson.getVideoUrl())
                .duration(lesson.getDuration())
                .createdAt(lesson.getCreatedAt())
                .updatedAt(lesson.getUpdatedAt())
                .build();
    }
}
