package com.lms.service.impl;

import com.lms.common.enums.ClassroomStatus;
import com.lms.common.enums.CourseStatus;
import com.lms.common.enums.LessonProgressStatus;
import com.lms.dto.response.ClassroomResponse;
import com.lms.dto.response.LessonProgressResponse;
import com.lms.dto.response.StudentDashboardResponse;
import com.lms.entity.*;
import com.lms.exception.BusinessException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.*;
import com.lms.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final UserRepository userRepository;
    private final ClassEnrollmentRepository enrollmentRepository;
    private final ClassroomRepository classroomRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;
    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ClassroomResponse> getMyClasses(String studentEmail) {
        User student = findStudent(studentEmail);

        List<ClassEnrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());

        return enrollments.stream()
                .map(enrollment -> {
                    Classroom classroom = enrollment.getClassroom();
                    long currentStudents = enrollmentRepository.countByClassroomId(classroom.getId());
                    return ClassroomResponse.builder()
                            .id(classroom.getId())
                            .courseId(classroom.getCourse().getId())
                            .courseName(classroom.getCourse().getTitle())
                            .instructorId(classroom.getInstructor().getId())
                            .instructorName(classroom.getInstructor().getName())
                            .name(classroom.getName())
                            .startDate(classroom.getStartDate())
                            .endDate(classroom.getEndDate())
                            .maxStudents(classroom.getMaxStudents())
                            .currentStudents(currentStudents)
                            .status(classroom.getStatus())
                            .createdAt(classroom.getCreatedAt())
                            .updatedAt(classroom.getUpdatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonProgressResponse> getCourseProgress(Long courseId, String studentEmail) {
        User student = findStudent(studentEmail);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Khóa học", courseId));

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new BusinessException("Khóa học chưa được xuất bản. Học viên chưa thể xem nội dung bài học.");
        }

        if (!enrollmentRepository.isStudentEnrolledInCourse(courseId, student.getId())) {
            throw new BusinessException("Bạn chưa ghi danh vào lớp học nào thuộc khóa học này");
        }

        List<Lesson> lessons = lessonRepository.findAllByCourseIdOrdered(courseId);
        List<LessonProgress> progresses = progressRepository
                .findByStudentIdAndLessonChapterCourseId(student.getId(), courseId);

        // Map lessonId → progress
        var progressMap = progresses.stream()
                .collect(Collectors.toMap(
                        p -> p.getLesson().getId(),
                        p -> p
                ));

        return lessons.stream()
                .map(lesson -> {
                    LessonProgress progress = progressMap.get(lesson.getId());
                    return LessonProgressResponse.builder()
                            .id(progress != null ? progress.getId() : null)
                            .lessonId(lesson.getId())
                            .lessonTitle(lesson.getTitle())
                            .studentId(student.getId())
                            .status(progress != null ? progress.getStatus() : LessonProgressStatus.NOT_STARTED)
                            .completedAt(progress != null ? progress.getCompletedAt() : null)
                            .lessonContent(lesson.getContent())
                            .lessonType(lesson.getLessonType())
                            .fileUrl(lesson.getFileUrl())
                            .fileName(lesson.getFileName())
                            .orderNo(lesson.getOrderNo())
                            .videoUrl(lesson.getVideoUrl())
                            .duration(lesson.getDuration())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LessonProgressResponse completeLesson(Long lessonId, String studentEmail) {
        // Rule 5.2: Khóa bài học tuần tự
        User student = findStudent(studentEmail);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài học", lessonId));

        Chapter chapter = lesson.getChapter();
        Course course = chapter.getCourse();
        Long courseId = course.getId();

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new BusinessException("Khóa học chưa được xuất bản. Không thể thực hiện bài học này.");
        }

        if (!enrollmentRepository.hasActiveEnrollmentInCourse(courseId, student.getId())) {
            if (enrollmentRepository.isStudentEnrolledInCourse(courseId, student.getId())) {
                throw new BusinessException("Lớp học của bạn đối với khóa học này đã kết thúc (CLOSED).");
            }
            throw new BusinessException("Bạn chưa ghi danh vào lớp học nào thuộc khóa học này");
        }

        // Kiểm tra bài trước đã hoàn thành chưa (trừ bài đầu tiên)
        List<Lesson> previousLessons = lessonRepository.findPreviousLessons(
                courseId, chapter.getOrderNo(), lesson.getOrderNo());

        if (!previousLessons.isEmpty()) {
            Lesson previousLesson = previousLessons.get(0); // Bài liền trước gần nhất
            LessonProgress previousProgress = progressRepository
                    .findByLessonIdAndStudentId(previousLesson.getId(), student.getId())
                    .orElse(null);

            if (previousProgress == null || previousProgress.getStatus() != LessonProgressStatus.COMPLETED) {
                throw new BusinessException(
                        "Bạn phải hoàn thành bài học \"" + previousLesson.getTitle() +
                        "\" trước khi hoàn thành bài này");
            }
        }

        // Tạo hoặc cập nhật progress
        LessonProgress progress = progressRepository
                .findByLessonIdAndStudentId(lessonId, student.getId())
                .orElse(LessonProgress.builder()
                        .lesson(lesson)
                        .student(student)
                        .build());

        progress.setStatus(LessonProgressStatus.COMPLETED);
        progress.setCompletedAt(LocalDateTime.now());

        progress = progressRepository.save(progress);

        return LessonProgressResponse.builder()
                .id(progress.getId())
                .lessonId(lesson.getId())
                .lessonTitle(lesson.getTitle())
                .studentId(student.getId())
                .status(progress.getStatus())
                .completedAt(progress.getCompletedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDashboardResponse getStudentDashboard(String studentEmail) {
        User student = findStudent(studentEmail);
        Long studentId = student.getId();

        List<ClassEnrollment> enrollments = enrollmentRepository.findByStudentId(studentId);

        long totalEnrolledClasses = enrollments.size();
        long inProgressClasses = enrollments.stream()
                .filter(e -> e.getClassroom().getStatus() == ClassroomStatus.IN_PROGRESS)
                .count();

        long totalLessons = 0;
        long completedLessons = 0;

        List<StudentDashboardResponse.StudentClassDto> myClasses = new ArrayList<>();
        StudentDashboardResponse.ResumeLessonDto resumeLesson = null;
        List<StudentDashboardResponse.UpcomingDeadlineDto> upcomingDeadlines = new ArrayList<>();

        for (ClassEnrollment enrollment : enrollments) {
            Classroom classroom = enrollment.getClassroom();
            Course course = classroom.getCourse();

            List<Lesson> courseLessons = lessonRepository.findAllByCourseIdOrdered(course.getId());
            List<LessonProgress> progresses = progressRepository.findByStudentIdAndLessonChapterCourseId(studentId, course.getId());

            Set<Long> completedLessonIds = progresses.stream()
                    .filter(p -> p.getStatus() == LessonProgressStatus.COMPLETED)
                    .map(p -> p.getLesson().getId())
                    .collect(Collectors.toSet());

            int classTotal = courseLessons.size();
            int classCompleted = (int) courseLessons.stream()
                    .filter(l -> completedLessonIds.contains(l.getId()))
                    .count();
            int classProgressPercent = classTotal > 0 ? (classCompleted * 100) / classTotal : 0;

            totalLessons += classTotal;
            completedLessons += classCompleted;

            myClasses.add(StudentDashboardResponse.StudentClassDto.builder()
                    .classId(classroom.getId())
                    .className(classroom.getName())
                    .courseId(course.getId())
                    .courseTitle(course.getTitle())
                    .instructorName(classroom.getInstructor() != null ? classroom.getInstructor().getName() : "")
                    .status(classroom.getStatus().name())
                    .completedLessons(classCompleted)
                    .totalLessons(classTotal)
                    .progressPercent(classProgressPercent)
                    .startDate(classroom.getStartDate() != null ? classroom.getStartDate().toString() : null)
                    .endDate(classroom.getEndDate() != null ? classroom.getEndDate().toString() : null)
                    .build());

            // Gợi ý bài học tiếp tục học (ưu tiên lớp OPEN hoặc IN_PROGRESS)
            if (resumeLesson == null && (classroom.getStatus() == ClassroomStatus.OPEN || classroom.getStatus() == ClassroomStatus.IN_PROGRESS)) {
                Lesson nextLesson = courseLessons.stream()
                        .filter(l -> !completedLessonIds.contains(l.getId()))
                        .findFirst()
                        .orElse(null);

                if (nextLesson != null) {
                    resumeLesson = StudentDashboardResponse.ResumeLessonDto.builder()
                            .classId(classroom.getId())
                            .className(classroom.getName())
                            .courseId(course.getId())
                            .courseTitle(course.getTitle())
                            .lessonId(nextLesson.getId())
                            .lessonTitle(nextLesson.getTitle())
                            .lessonType(nextLesson.getLessonType() != null ? nextLesson.getLessonType() : "TEXT")
                            .chapterOrderNo(nextLesson.getChapter() != null ? nextLesson.getChapter().getOrderNo() : 1)
                            .lessonOrderNo(nextLesson.getOrderNo())
                            .classProgressPercent(classProgressPercent)
                            .build();
                } else if (!courseLessons.isEmpty()) {
                    Lesson lastLesson = courseLessons.get(courseLessons.size() - 1);
                    resumeLesson = StudentDashboardResponse.ResumeLessonDto.builder()
                            .classId(classroom.getId())
                            .className(classroom.getName())
                            .courseId(course.getId())
                            .courseTitle(course.getTitle())
                            .lessonId(lastLesson.getId())
                            .lessonTitle(lastLesson.getTitle())
                            .lessonType(lastLesson.getLessonType() != null ? lastLesson.getLessonType() : "TEXT")
                            .chapterOrderNo(lastLesson.getChapter() != null ? lastLesson.getChapter().getOrderNo() : 1)
                            .lessonOrderNo(lastLesson.getOrderNo())
                            .classProgressPercent(100)
                            .build();
                }
            }

            // Bài tập thuộc khóa học này
            List<Assignment> assignments = assignmentRepository.findByCourseId(course.getId());
            for (Assignment a : assignments) {
                Optional<Submission> subOpt = submissionRepository.findByAssignmentIdAndStudentId(a.getId(), studentId);
                boolean isSubmitted = subOpt.isPresent();
                String status = isSubmitted ? subOpt.get().getStatus().name() : "PENDING";
                Double score = isSubmitted ? subOpt.get().getScore() : null;

                upcomingDeadlines.add(StudentDashboardResponse.UpcomingDeadlineDto.builder()
                        .id(a.getId())
                        .type("ASSIGNMENT")
                        .title(a.getTitle())
                        .classId(classroom.getId())
                        .className(classroom.getName())
                        .courseId(course.getId())
                        .courseTitle(course.getTitle())
                        .lessonId(a.getLesson().getId())
                        .deadline(a.getDeadline())
                        .maxScore(a.getMaxScore() != null ? a.getMaxScore() : 10.0)
                        .isSubmitted(isSubmitted)
                        .status(status)
                        .score(score)
                        .build());
            }
        }

        // Sắp xếp bài tập: chưa nộp lên trước, ưu tiên deadline gần nhất
        upcomingDeadlines.sort((a, b) -> {
            if (!a.isSubmitted() && b.isSubmitted()) return -1;
            if (a.isSubmitted() && !b.isSubmitted()) return 1;
            if (a.getDeadline() == null && b.getDeadline() == null) return 0;
            if (a.getDeadline() == null) return 1;
            if (b.getDeadline() == null) return -1;
            return a.getDeadline().compareTo(b.getDeadline());
        });
        if (upcomingDeadlines.size() > 6) {
            upcomingDeadlines = upcomingDeadlines.subList(0, 6);
        }

        // Điểm số gần đây
        List<StudentDashboardResponse.RecentGradeDto> recentGrades = new ArrayList<>();

        List<Submission> recentSubmissions = submissionRepository.findByStudentIdOrderBySubmittedAtDesc(
                studentId, PageRequest.of(0, 5));
        for (Submission s : recentSubmissions) {
            if (s.getScore() != null) {
                recentGrades.add(StudentDashboardResponse.RecentGradeDto.builder()
                        .id(s.getId())
                        .type("ASSIGNMENT")
                        .title(s.getAssignment().getTitle())
                        .courseTitle(s.getAssignment().getLesson().getChapter().getCourse().getTitle())
                        .score(s.getScore())
                        .maxScore(s.getAssignment().getMaxScore() != null ? s.getAssignment().getMaxScore() : 10.0)
                        .submittedAt(s.getSubmittedAt())
                        .feedback(s.getComment())
                        .build());
            }
        }

        List<QuizAttempt> recentAttempts = quizAttemptRepository.findByStudentIdOrderBySubmittedAtDesc(
                studentId, PageRequest.of(0, 5));
        for (QuizAttempt qa : recentAttempts) {
            recentGrades.add(StudentDashboardResponse.RecentGradeDto.builder()
                    .id(qa.getId())
                    .type("QUIZ")
                    .title("Trắc nghiệm: " + qa.getQuiz().getLesson().getTitle())
                    .courseTitle(qa.getQuiz().getLesson().getChapter().getCourse().getTitle())
                    .score(qa.getScore())
                    .maxScore(10.0)
                    .submittedAt(qa.getSubmittedAt())
                    .feedback(null)
                    .build());
        }

        recentGrades.sort((a, b) -> {
            if (a.getSubmittedAt() == null && b.getSubmittedAt() == null) return 0;
            if (a.getSubmittedAt() == null) return 1;
            if (b.getSubmittedAt() == null) return -1;
            return b.getSubmittedAt().compareTo(a.getSubmittedAt());
        });
        if (recentGrades.size() > 5) {
            recentGrades = recentGrades.subList(0, 5);
        }

        // Tính điểm trung bình (chuẩn hóa thang 10)
        List<Double> allScores = new ArrayList<>();
        for (StudentDashboardResponse.RecentGradeDto g : recentGrades) {
            if (g.getScore() != null && g.getMaxScore() != null && g.getMaxScore() > 0) {
                allScores.add((g.getScore() / g.getMaxScore()) * 10.0);
            }
        }
        Double averageScore = allScores.isEmpty() ? null :
                Math.round(allScores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0) * 10.0) / 10.0;

        int overallProgressPercent = totalLessons > 0 ? (int) ((completedLessons * 100) / totalLessons) : 0;
        long totalSubmissions = submissionRepository.countByStudentId(studentId);
        long totalQuizAttempts = quizAttemptRepository.countByStudentId(studentId);

        return StudentDashboardResponse.builder()
                .totalEnrolledClasses(totalEnrolledClasses)
                .inProgressClasses(inProgressClasses)
                .completedLessons(completedLessons)
                .totalLessons(totalLessons)
                .overallProgressPercent(overallProgressPercent)
                .totalSubmissions(totalSubmissions)
                .totalQuizAttempts(totalQuizAttempts)
                .averageScore(averageScore)
                .resumeLearning(resumeLesson)
                .upcomingDeadlines(upcomingDeadlines)
                .recentGrades(recentGrades)
                .myClasses(myClasses)
                .build();
    }

    private User findStudent(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên"));
    }
}
