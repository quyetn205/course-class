package com.lms.service.impl;

import com.lms.common.PageResponse;
import com.lms.common.enums.ClassroomStatus;
import com.lms.common.enums.CourseStatus;
import com.lms.common.enums.UserRole;
import com.lms.common.enums.UserStatus;
import com.lms.dto.request.AddStudentRequest;
import com.lms.dto.request.ClassroomRequest;
import com.lms.dto.request.UpdateClassroomRequest;
import com.lms.dto.response.ClassroomResponse;
import com.lms.dto.response.EnrollmentResponse;
import com.lms.entity.*;
import com.lms.exception.BusinessException;
import com.lms.exception.DuplicateResourceException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.ClassEnrollmentRepository;
import com.lms.repository.ClassroomRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import com.lms.security.CourseSecurityHelper;
import com.lms.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import com.lms.common.enums.LessonProgressStatus;
import com.lms.dto.response.ClassGradebookResponse;
import com.lms.dto.response.ClassGradebookResponse.*;
import com.lms.dto.response.StudentGradebookResponse;
import com.lms.dto.response.StudentGradebookResponse.StudentGradeItem;
import com.lms.repository.LessonRepository;
import com.lms.repository.LessonProgressRepository;
import com.lms.repository.QuizRepository;
import com.lms.repository.QuizAttemptRepository;
import com.lms.repository.AssignmentRepository;
import com.lms.repository.SubmissionRepository;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomServiceImpl implements ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ClassEnrollmentRepository enrollmentRepository;
    private final CourseSecurityHelper courseSecurityHelper;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    private void validateClassroomAccess(Classroom classroom, String userEmail, String action) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new AccessDeniedException("Yêu cầu đăng nhập để thực hiện thao tác");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + userEmail));

        // ADMIN có toàn quyền
        if (user.getRole() == UserRole.ADMIN) {
            return;
        }

        // Giảng viên phải là người phụ trách lớp học
        if (classroom.getInstructor() == null || !classroom.getInstructor().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền " + action + " lớp học của giảng viên khác");
        }
    }

    @Override
    @Transactional
    public ClassroomResponse createClassroom(ClassroomRequest request, String instructorEmail) {
        // Rule 5.5: Course phải ở trạng thái PUBLISHED
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Khóa học", request.getCourseId()));

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new BusinessException("Chỉ có thể tạo lớp học từ khóa học đã xuất bản (PUBLISHED)");
        }

        courseSecurityHelper.validateCourseAccess(course, instructorEmail, "tạo lớp học từ");

        if (request.getStartDate() != null && request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("Ngày kết thúc lớp học không được trước ngày bắt đầu");
        }

        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        Classroom classroom = Classroom.builder()
                .course(course)
                .instructor(instructor)
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .maxStudents(request.getMaxStudents() != null ? request.getMaxStudents() : 30)
                .status(ClassroomStatus.OPEN)
                .build();

        classroom = classroomRepository.save(classroom);
        return toResponse(classroom);
    }

    @Override
    @Transactional(readOnly = true)
    public ClassroomResponse getClassroom(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", id));
        return toResponse(classroom);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ClassroomResponse> getClassrooms(
            Long instructorId, Long courseId, ClassroomStatus status, String search,
            Pageable pageable, String currentUserEmail) {

        Long effectiveInstructorId = instructorId;

        if (currentUserEmail != null && !currentUserEmail.isBlank()) {
            User user = userRepository.findByEmail(currentUserEmail).orElse(null);
            if (user != null && user.getRole() == UserRole.INSTRUCTOR) {
                // Giảng viên chỉ xem lớp do chính mình quản lý
                effectiveInstructorId = user.getId();
            }
        }

        Page<ClassroomResponse> page;
        if (search != null && !search.isBlank()) {
            page = classroomRepository
                    .findByFiltersWithSearch(effectiveInstructorId, courseId, status, search.trim(), pageable)
                    .map(this::toResponse);
        } else {
            page = classroomRepository
                    .findByFilters(effectiveInstructorId, courseId, status, pageable)
                    .map(this::toResponse);
        }

        return PageResponse.of(page);
    }

    @Override
    @Transactional
    public ClassroomResponse updateClassroom(Long id, UpdateClassroomRequest request, String currentUserEmail) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", id));

        validateClassroomAccess(classroom, currentUserEmail, "chỉnh sửa");

        LocalDate nextStart = request.getStartDate() != null ? request.getStartDate() : classroom.getStartDate();
        LocalDate nextEnd = request.getEndDate() != null ? request.getEndDate() : classroom.getEndDate();
        if (nextStart != null && nextEnd != null && nextEnd.isBefore(nextStart)) {
            throw new BusinessException("Ngày kết thúc lớp học không được trước ngày bắt đầu");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            classroom.setName(request.getName().trim());
        }
        if (request.getStartDate() != null) {
            classroom.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            classroom.setEndDate(request.getEndDate());
        }
        if (request.getMaxStudents() != null) {
            long currentCount = enrollmentRepository.countByClassroomId(id);
            if (request.getMaxStudents() < currentCount) {
                throw new BusinessException("Sĩ số tối đa không thể nhỏ hơn số học viên hiện tại trong lớp (" + currentCount + " học viên)");
            }
            classroom.setMaxStudents(request.getMaxStudents());
        }
        if (request.getStatus() != null) {
            classroom.setStatus(request.getStatus());
        }

        classroom = classroomRepository.save(classroom);
        return toResponse(classroom);
    }

    @Override
    @Transactional
    public ClassroomResponse updateClassroomStatus(Long id, ClassroomStatus status, String currentUserEmail) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", id));

        validateClassroomAccess(classroom, currentUserEmail, "thay đổi trạng thái");

        classroom.setStatus(status);
        classroom = classroomRepository.save(classroom);
        return toResponse(classroom);
    }

    @Override
    @Transactional
    public void deleteClassroom(Long id, String currentUserEmail) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", id));

        validateClassroomAccess(classroom, currentUserEmail, "xóa");

        long currentCount = enrollmentRepository.countByClassroomId(id);
        if (currentCount > 0) {
            throw new BusinessException("Không thể xóa lớp học đã có " + currentCount + " học viên ghi danh. Hãy chuyển trạng thái sang CLOSED.");
        }

        classroomRepository.delete(classroom);
    }

    @Override
    @Transactional
    public EnrollmentResponse addStudent(Long classId, AddStudentRequest request, String currentUserEmail) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", classId));

        validateClassroomAccess(classroom, currentUserEmail, "thêm học viên vào");

        if (classroom.getStatus() == ClassroomStatus.CLOSED) {
            throw new BusinessException("Không thể thêm học viên vào lớp học đã kết thúc (CLOSED)");
        }

        // Rule 5.1: Kiểm tra tuần tự — mỗi bước lỗi riêng
        // Bước 1: Kiểm tra học viên tồn tại
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Học viên không tồn tại với id: " + request.getStudentId()));

        // Bước 2: Kiểm tra trạng thái ACTIVE
        if (student.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("Tài khoản học viên đang bị khóa, không thể thêm vào lớp");
        }

        // Kiểm tra role là STUDENT
        if (student.getRole() != UserRole.STUDENT) {
            throw new BusinessException("Người dùng không phải là học viên");
        }

        // Bước 3: Kiểm tra trùng lặp (Rule 5.3)
        if (enrollmentRepository.existsByClassroomIdAndStudentId(classId, request.getStudentId())) {
            throw new DuplicateResourceException("Học viên đã có trong lớp học này");
        }

        // Bước 4: Kiểm tra sĩ số
        long currentCount = enrollmentRepository.countByClassroomId(classId);
        if (currentCount >= classroom.getMaxStudents()) {
            throw new BusinessException("Lớp học đã đầy. Sĩ số tối đa: " + classroom.getMaxStudents());
        }

        ClassEnrollment enrollment = ClassEnrollment.builder()
                .classroom(classroom)
                .student(student)
                .build();

        enrollment = enrollmentRepository.save(enrollment);
        return toEnrollmentResponse(enrollment);
    }

    @Override
    @Transactional
    public void removeStudent(Long classId, Long studentId, String currentUserEmail) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", classId));

        validateClassroomAccess(classroom, currentUserEmail, "xóa học viên khỏi");

        ClassEnrollment enrollment = enrollmentRepository.findByClassroomIdAndStudentId(classId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy học viên trong lớp học"));
        enrollmentRepository.delete(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EnrollmentResponse> getStudents(Long classId, Pageable pageable) {
        // Kiểm tra lớp học tồn tại
        classroomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", classId));

        Page<EnrollmentResponse> page = enrollmentRepository.findByClassroomId(classId, pageable)
                .map(this::toEnrollmentResponse);
        return PageResponse.of(page);
    }

    private ClassroomResponse toResponse(Classroom classroom) {
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
    }

    private EnrollmentResponse toEnrollmentResponse(ClassEnrollment enrollment) {
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .classId(enrollment.getClassroom().getId())
                .studentId(enrollment.getStudent().getId())
                .studentName(enrollment.getStudent().getName())
                .studentEmail(enrollment.getStudent().getEmail())
                .enrolledDate(enrollment.getEnrolledDate())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ClassGradebookResponse getClassGradebook(Long classId, String currentUserEmail) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", classId));

        validateClassroomAccess(classroom, currentUserEmail, "xem bảng điểm");

        Course course = classroom.getCourse();
        List<Lesson> lessons = lessonRepository.findAllByCourseIdOrdered(course.getId());
        int totalLessons = lessons.size();

        List<Quiz> quizzes = quizRepository.findByCourseId(course.getId());
        List<GradebookItemColumn> quizCols = quizzes.stream().map(q -> GradebookItemColumn.builder()
                .id(q.getId())
                .title(q.getTitle())
                .lessonTitle(q.getLesson() != null ? q.getLesson().getTitle() : "")
                .maxScore(10.0)
                .build()).collect(Collectors.toList());

        List<Assignment> assignments = assignmentRepository.findByCourseId(course.getId());
        List<GradebookItemColumn> assignmentCols = assignments.stream().map(a -> GradebookItemColumn.builder()
                .id(a.getId())
                .title(a.getTitle())
                .lessonTitle(a.getLesson() != null ? a.getLesson().getTitle() : "")
                .maxScore(a.getMaxScore() != null ? a.getMaxScore() : 10.0)
                .build()).collect(Collectors.toList());

        List<ClassEnrollment> enrollments = enrollmentRepository.findAllByClassroomId(classId);

        List<StudentGradeRow> studentRows = new ArrayList<>();
        for (ClassEnrollment enrollment : enrollments) {
            User student = enrollment.getStudent();

            List<LessonProgress> progresses = progressRepository.findByStudentIdAndLessonChapterCourseId(student.getId(), course.getId());
            long completedCount = progresses.stream()
                    .filter(p -> p.getStatus() == LessonProgressStatus.COMPLETED)
                    .count();
            int progressPercent = totalLessons > 0 ? (int) Math.round(((double) completedCount / totalLessons) * 100) : 0;

            Map<Long, QuizScoreItem> quizMap = new HashMap<>();
            List<Double> scoreValues = new ArrayList<>();

            for (Quiz q : quizzes) {
                List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndStudentIdOrderBySubmittedAtDesc(q.getId(), student.getId());
                if (!attempts.isEmpty()) {
                    QuizAttempt latest = attempts.get(0);
                    quizMap.put(q.getId(), QuizScoreItem.builder()
                            .score(latest.getScore())
                            .correctCount(latest.getCorrectCount())
                            .totalQuestions(latest.getTotalQuestions())
                            .submittedAt(latest.getSubmittedAt() != null ? latest.getSubmittedAt().toString() : null)
                            .build());
                    if (latest.getScore() != null) {
                        scoreValues.add(latest.getScore());
                    }
                }
            }

            Map<Long, AssignmentScoreItem> assignmentMap = new HashMap<>();
            for (Assignment a : assignments) {
                Optional<Submission> subOpt = submissionRepository.findByAssignmentIdAndStudentId(a.getId(), student.getId());
                if (subOpt.isPresent()) {
                    Submission sub = subOpt.get();
                    assignmentMap.put(a.getId(), AssignmentScoreItem.builder()
                            .score(sub.getScore())
                            .maxScore(a.getMaxScore())
                            .status(sub.getStatus() != null ? sub.getStatus().name() : null)
                            .comment(sub.getComment())
                            .submittedAt(sub.getFile() != null ? "Đã nộp" : null)
                            .build());
                    if (sub.getScore() != null) {
                        double norm = a.getMaxScore() != null && a.getMaxScore() > 0
                                ? (sub.getScore() / a.getMaxScore()) * 10.0
                                : sub.getScore();
                        scoreValues.add(norm);
                    }
                }
            }

            Double avg = null;
            if (!scoreValues.isEmpty()) {
                double sum = scoreValues.stream().mapToDouble(Double::doubleValue).sum();
                avg = Math.round((sum / scoreValues.size()) * 10.0) / 10.0;
            }

            studentRows.add(StudentGradeRow.builder()
                    .studentId(student.getId())
                    .studentName(student.getName())
                    .studentEmail(student.getEmail())
                    .completedLessons((int) completedCount)
                    .progressPercentage(progressPercent)
                    .quizScores(quizMap)
                    .assignmentScores(assignmentMap)
                    .averageScore(avg)
                    .build());
        }

        return ClassGradebookResponse.builder()
                .classId(classroom.getId())
                .className(classroom.getName())
                .courseId(course.getId())
                .courseName(course.getTitle())
                .instructorName(classroom.getInstructor() != null ? classroom.getInstructor().getName() : "")
                .totalLessons(totalLessons)
                .quizzes(quizCols)
                .assignments(assignmentCols)
                .studentRows(studentRows)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentGradebookResponse getStudentGradebook(Long classId, String studentEmail) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", classId));

        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + studentEmail));

        // Nếu là STUDENT thì phải đang ghi danh trong lớp
        if (user.getRole() == UserRole.STUDENT) {
            if (!enrollmentRepository.existsByClassroomIdAndStudentId(classId, user.getId())) {
                throw new AccessDeniedException("Bạn chưa ghi danh vào lớp học này");
            }
        }

        Course course = classroom.getCourse();
        List<Lesson> lessons = lessonRepository.findAllByCourseIdOrdered(course.getId());
        int totalLessons = lessons.size();

        List<LessonProgress> progresses = progressRepository.findByStudentIdAndLessonChapterCourseId(user.getId(), course.getId());
        long completedCount = progresses.stream()
                .filter(p -> p.getStatus() == LessonProgressStatus.COMPLETED)
                .count();
        int progressPercent = totalLessons > 0 ? (int) Math.round(((double) completedCount / totalLessons) * 100) : 0;

        List<Quiz> quizzes = quizRepository.findByCourseId(course.getId());
        List<Assignment> assignments = assignmentRepository.findByCourseId(course.getId());

        List<StudentGradeItem> items = new ArrayList<>();
        List<Double> scoreValues = new ArrayList<>();

        for (Quiz q : quizzes) {
            List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndStudentIdOrderBySubmittedAtDesc(q.getId(), user.getId());
            if (!attempts.isEmpty()) {
                QuizAttempt att = attempts.get(0);
                items.add(StudentGradeItem.builder()
                        .type("QUIZ")
                        .itemId(q.getId())
                        .title(q.getTitle())
                        .lessonTitle(q.getLesson() != null ? q.getLesson().getTitle() : "")
                        .score(att.getScore())
                        .maxScore(10.0)
                        .status("COMPLETED")
                        .correctCount(att.getCorrectCount())
                        .totalQuestions(att.getTotalQuestions())
                        .submittedAt(att.getSubmittedAt() != null ? att.getSubmittedAt().toString() : null)
                        .build());
                if (att.getScore() != null) {
                    scoreValues.add(att.getScore());
                }
            } else {
                items.add(StudentGradeItem.builder()
                        .type("QUIZ")
                        .itemId(q.getId())
                        .title(q.getTitle())
                        .lessonTitle(q.getLesson() != null ? q.getLesson().getTitle() : "")
                        .score(null)
                        .maxScore(10.0)
                        .status("NOT_STARTED")
                        .build());
            }
        }

        for (Assignment a : assignments) {
            Optional<Submission> subOpt = submissionRepository.findByAssignmentIdAndStudentId(a.getId(), user.getId());
            if (subOpt.isPresent()) {
                Submission sub = subOpt.get();
                items.add(StudentGradeItem.builder()
                        .type("ASSIGNMENT")
                        .itemId(a.getId())
                        .title(a.getTitle())
                        .lessonTitle(a.getLesson() != null ? a.getLesson().getTitle() : "")
                        .score(sub.getScore())
                        .maxScore(a.getMaxScore() != null ? a.getMaxScore() : 10.0)
                        .status(sub.getStatus() != null ? sub.getStatus().name() : "SUBMITTED")
                        .comment(sub.getComment())
                        .submittedAt(sub.getFile() != null ? "Đã nộp" : null)
                        .build());
                if (sub.getScore() != null) {
                    double norm = a.getMaxScore() != null && a.getMaxScore() > 0
                            ? (sub.getScore() / a.getMaxScore()) * 10.0
                            : sub.getScore();
                    scoreValues.add(norm);
                }
            } else {
                items.add(StudentGradeItem.builder()
                        .type("ASSIGNMENT")
                        .itemId(a.getId())
                        .title(a.getTitle())
                        .lessonTitle(a.getLesson() != null ? a.getLesson().getTitle() : "")
                        .score(null)
                        .maxScore(a.getMaxScore() != null ? a.getMaxScore() : 10.0)
                        .status("NOT_STARTED")
                        .build());
            }
        }

        Double overall = null;
        if (!scoreValues.isEmpty()) {
            double sum = scoreValues.stream().mapToDouble(Double::doubleValue).sum();
            overall = Math.round((sum / scoreValues.size()) * 10.0) / 10.0;
        }

        return StudentGradebookResponse.builder()
                .classId(classroom.getId())
                .className(classroom.getName())
                .courseId(course.getId())
                .courseName(course.getTitle())
                .instructorName(classroom.getInstructor() != null ? classroom.getInstructor().getName() : "")
                .completedLessons((int) completedCount)
                .totalLessons(totalLessons)
                .progressPercentage(progressPercent)
                .overallAverageScore(overall)
                .items(items)
                .build();
    }
}
