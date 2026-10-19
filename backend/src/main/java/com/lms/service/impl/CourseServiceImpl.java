package com.lms.service.impl;

import com.lms.common.PageResponse;
import com.lms.common.enums.CourseStatus;
import com.lms.dto.request.CourseRequest;
import com.lms.dto.response.ChapterResponse;
import com.lms.dto.response.CourseResponse;
import com.lms.dto.response.LessonResponse;
import com.lms.entity.Category;
import com.lms.entity.Chapter;
import com.lms.entity.Course;
import com.lms.entity.User;
import com.lms.exception.BusinessException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.common.enums.UserRole;
import com.lms.dto.request.CloneCourseRequest;
import com.lms.entity.*;
import com.lms.repository.*;
import com.lms.service.CourseService;
import com.lms.security.CourseSecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CourseSecurityHelper courseSecurityHelper;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final AssignmentRepository assignmentRepository;
    private final ClassroomRepository classroomRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourseResponse> getCourses(Long instructorId, Long categoryId,
                                                    CourseStatus status, Pageable pageable) {
        Page<CourseResponse> page = courseRepository.findByFilters(instructorId, categoryId, status, pageable)
                .map(this::toResponse);
        return PageResponse.of(page);
    }

    @Override
    @Transactional
    public CourseResponse createCourse(CourseRequest request, String instructorEmail) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", request.getCategoryId()));

        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .goal(request.getGoal())
                .thumbnailUrl(request.getThumbnailUrl())
                .level(request.getLevel() != null && !request.getLevel().isBlank() ? request.getLevel() : "ALL_LEVELS")
                .prerequisites(request.getPrerequisites())
                .category(category)
                .instructor(instructor)
                .status(CourseStatus.DRAFT)
                .build();

        course = courseRepository.save(course);
        return toResponse(course);
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request, String currentUserEmail) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khóa học", id));

        courseSecurityHelper.validateCourseAccess(course, currentUserEmail, "chỉnh sửa");

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", request.getCategoryId()));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setGoal(request.getGoal());
        course.setCategory(category);
        course.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getLevel() != null && !request.getLevel().isBlank()) {
            course.setLevel(request.getLevel());
        }
        course.setPrerequisites(request.getPrerequisites());

        course = courseRepository.save(course);
        return toResponse(course);
    }

    @Override
    @Transactional
    public CourseResponse publishCourse(Long id, String currentUserEmail) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khóa học", id));

        courseSecurityHelper.validateCourseAccess(course, currentUserEmail, "xuất bản");

        if (course.getStatus() == CourseStatus.PUBLISHED) {
            throw new BusinessException("Khóa học đã ở trạng thái PUBLISHED");
        }

        course.setStatus(CourseStatus.PUBLISHED);
        course = courseRepository.save(course);
        return toResponse(course);
    }

    @Override
    @Transactional
    public CourseResponse cloneCourse(Long id, CloneCourseRequest request, String currentUserEmail) {
        Course original = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khóa học", id));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + currentUserEmail));

        // Kiểm tra quyền:
        // - ADMIN: có thể nhân bản bất kỳ khóa học nào.
        // - INSTRUCTOR: có thể nhân bản khóa học của chính mình, HOẶC khóa học đã PUBLISHED của người khác (dùng làm mẫu).
        if (currentUser.getRole() != UserRole.ADMIN) {
            boolean isOwner = original.getInstructor() != null 
                    && original.getInstructor().getId().equals(currentUser.getId());
            if (!isOwner && original.getStatus() != CourseStatus.PUBLISHED) {
                throw new AccessDeniedException("Bạn không thể nhân bản bản nháp của giảng viên khác");
            }
        }

        String newTitle;
        if (request != null && request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            newTitle = request.getTitle().trim();
        } else {
            newTitle = "[Bản sao] " + original.getTitle();
        }

        // Tạo khóa học mới ở trạng thái DRAFT
        Course clonedCourse = Course.builder()
                .title(newTitle)
                .description(original.getDescription())
                .goal(original.getGoal())
                .thumbnailUrl(original.getThumbnailUrl())
                .level(original.getLevel())
                .prerequisites(original.getPrerequisites())
                .category(original.getCategory())
                .instructor(currentUser)
                .status(CourseStatus.DRAFT)
                .build();

        clonedCourse = courseRepository.save(clonedCourse);

        // Sao chép các chương và bài học
        if (original.getChapters() != null) {
            for (Chapter origChapter : original.getChapters()) {
                Chapter clonedChapter = Chapter.builder()
                        .course(clonedCourse)
                        .title(origChapter.getTitle())
                        .orderNo(origChapter.getOrderNo())
                        .build();
                clonedChapter = chapterRepository.save(clonedChapter);

                if (origChapter.getLessons() != null) {
                    for (Lesson origLesson : origChapter.getLessons()) {
                        Lesson clonedLesson = Lesson.builder()
                                .chapter(clonedChapter)
                                .title(origLesson.getTitle())
                                .content(origLesson.getContent())
                                .orderNo(origLesson.getOrderNo())
                                .locked(origLesson.getLocked())
                                .lessonType(origLesson.getLessonType())
                                .fileUrl(origLesson.getFileUrl())
                                .fileName(origLesson.getFileName())
                                .videoUrl(origLesson.getVideoUrl())
                                .duration(origLesson.getDuration())
                                .build();
                        clonedLesson = lessonRepository.save(clonedLesson);

                        // Sao chép Quiz (nếu bài học có quiz)
                        Optional<Quiz> origQuizOpt = quizRepository.findByLessonId(origLesson.getId());
                        if (origQuizOpt.isPresent()) {
                            Quiz origQuiz = origQuizOpt.get();
                            Quiz clonedQuiz = Quiz.builder()
                                    .lesson(clonedLesson)
                                    .title(origQuiz.getTitle())
                                    .build();
                            clonedQuiz = quizRepository.save(clonedQuiz);

                            if (origQuiz.getQuestions() != null) {
                                for (Question origQuestion : origQuiz.getQuestions()) {
                                    Question clonedQuestion = Question.builder()
                                            .quiz(clonedQuiz)
                                            .content(origQuestion.getContent())
                                            .build();
                                    clonedQuestion = questionRepository.save(clonedQuestion);

                                    if (origQuestion.getOptions() != null) {
                                        for (Option origOption : origQuestion.getOptions()) {
                                            Option clonedOption = Option.builder()
                                                    .question(clonedQuestion)
                                                    .content(origOption.getContent())
                                                    .isCorrect(origOption.getIsCorrect())
                                                    .build();
                                            optionRepository.save(clonedOption);
                                        }
                                    }
                                }
                            }
                        }

                        // Sao chép Assignment (nếu bài học có bài tập nộp file)
                        Optional<Assignment> origAssignmentOpt = assignmentRepository.findByLessonId(origLesson.getId());
                        if (origAssignmentOpt.isPresent()) {
                            Assignment origAssignment = origAssignmentOpt.get();
                            Assignment clonedAssignment = Assignment.builder()
                                    .lesson(clonedLesson)
                                    .title(origAssignment.getTitle())
                                    .deadline(origAssignment.getDeadline())
                                    .maxScore(origAssignment.getMaxScore())
                                    .build();
                            assignmentRepository.save(clonedAssignment);
                        }
                    }
                }
            }
        }

        // Tải lại toàn bộ dữ liệu kèm chapters/lessons đã lưu để trả về response
        Course refreshedCourse = courseRepository.findById(clonedCourse.getId()).orElse(clonedCourse);
        return toResponse(refreshedCourse);
    }

    private CourseResponse toResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .goal(course.getGoal())
                .thumbnailUrl(course.getThumbnailUrl())
                .level(course.getLevel())
                .prerequisites(course.getPrerequisites())
                .categoryId(course.getCategory().getId())
                .categoryName(course.getCategory().getName())
                .instructorId(course.getInstructor().getId())
                .instructorName(course.getInstructor().getName())
                .status(course.getStatus())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .chapters(course.getChapters() != null
                        ? course.getChapters().stream().map(this::toChapterResponse).collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }

    private ChapterResponse toChapterResponse(Chapter chapter) {
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
    public void deleteCourse(Long id, String currentUserEmail) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khóa học", id));

        courseSecurityHelper.validateCourseAccess(course, currentUserEmail, "xóa");

        if (classroomRepository.existsByCourseId(id)) {
            throw new BusinessException("Không thể xóa khóa học đã có lớp học liên kết! Vui lòng đóng hoặc xóa các lớp học trước.");
        }

        courseRepository.delete(course);
    }
}
