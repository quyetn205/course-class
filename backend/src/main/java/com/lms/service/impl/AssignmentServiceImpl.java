package com.lms.service.impl;

import com.lms.common.PageResponse;
import com.lms.common.enums.CourseStatus;
import com.lms.common.enums.SubmissionStatus;
import com.lms.common.enums.UserRole;
import com.lms.dto.request.AssignmentRequest;
import com.lms.dto.request.GradeSubmissionRequest;
import com.lms.dto.request.SubmissionRequest;
import com.lms.dto.response.AssignmentResponse;
import com.lms.dto.response.SubmissionResponse;
import com.lms.entity.Assignment;
import com.lms.entity.Course;
import com.lms.entity.Lesson;
import com.lms.entity.Submission;
import com.lms.entity.User;
import com.lms.exception.BusinessException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.*;
import com.lms.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final com.lms.security.CourseSecurityHelper courseSecurityHelper;
    private final ClassEnrollmentRepository enrollmentRepository;

    private void validateStudentAccess(Course course, String userEmail) {
        if (userEmail == null || userEmail.isBlank()) return;
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user != null && user.getRole() == UserRole.STUDENT) {
            if (course.getStatus() != CourseStatus.PUBLISHED) {
                throw new BusinessException("Khóa học chưa được xuất bản. Học viên chưa thể xem hoặc nộp bài tập.");
            }
            if (!enrollmentRepository.isStudentEnrolledInCourse(course.getId(), user.getId())) {
                throw new BusinessException("Bạn chưa ghi danh vào lớp học nào thuộc khóa học này");
            }
        }
    }

    @Override
    @Transactional
    public AssignmentResponse createAssignment(Long lessonId, AssignmentRequest request, String currentUserEmail) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài học", lessonId));

        courseSecurityHelper.validateCourseAccess(lesson.getChapter().getCourse(), currentUserEmail, "tạo bài tập cho");

        Assignment assignment = Assignment.builder()
                .lesson(lesson)
                .title(request.getTitle())
                .deadline(request.getDeadline())
                .maxScore(request.getMaxScore())
                .build();

        assignment = assignmentRepository.save(assignment);
        return toAssignmentResponse(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentByLessonId(Long lessonId, String currentUserEmail) {
        Assignment assignment = assignmentRepository.findByLessonId(lessonId).orElse(null);
        if (assignment == null) return null;
        validateStudentAccess(assignment.getLesson().getChapter().getCourse(), currentUserEmail);
        return toAssignmentResponse(assignment);
    }

    @Override
    @Transactional
    public void deleteAssignment(Long assignmentId, String currentUserEmail) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài tập", assignmentId));
        courseSecurityHelper.validateCourseAccess(assignment.getLesson().getChapter().getCourse(), currentUserEmail, "xóa bài tập của");
        submissionRepository.deleteByAssignmentId(assignmentId);
        assignmentRepository.delete(assignment);
    }

    @Override
    public PageResponse<SubmissionResponse> getSubmissions(Long assignmentId, Pageable pageable, String currentUserEmail) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài tập", assignmentId));

        courseSecurityHelper.validateCourseAccess(assignment.getLesson().getChapter().getCourse(), currentUserEmail, "xem bài nộp của");

        Page<SubmissionResponse> page = submissionRepository.findByAssignmentId(assignmentId, pageable)
                .map(this::toSubmissionResponse);
        return PageResponse.of(page);
    }

    @Override
    @Transactional
    public SubmissionResponse submitAssignment(Long assignmentId, SubmissionRequest request, String studentEmail) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài tập", assignmentId));

        Course course = assignment.getLesson().getChapter().getCourse();
        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new BusinessException("Khóa học chưa được xuất bản. Học viên không thể nộp bài tập.");
        }

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên"));

        // Kiểm tra xem học viên có lớp đang học không (chặn lớp CLOSED)
        if (!enrollmentRepository.hasActiveEnrollmentInCourse(course.getId(), student.getId())) {
            if (enrollmentRepository.isStudentEnrolledInCourse(course.getId(), student.getId())) {
                throw new BusinessException("Lớp học của bạn đối với khóa học này đã kết thúc (CLOSED). Không thể nộp bài tập.");
            }
            throw new BusinessException("Bạn chưa ghi danh vào lớp học nào thuộc khóa học này");
        }

        // Kiểm tra deadline
        if (assignment.getDeadline() != null && java.time.LocalDateTime.now().isAfter(assignment.getDeadline())) {
            String formattedDeadline = assignment.getDeadline().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"));
            throw new BusinessException("Bài tập này đã quá hạn nộp (" + formattedDeadline + "). Không thể nộp hoặc sửa bài nộp.");
        }

        Submission submission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .orElse(null);
        if (submission != null) {
            submission.setFile(request.getFile());
            submission.setStatus(SubmissionStatus.SUBMITTED);
            submission.setSubmittedAt(java.time.LocalDateTime.now());
        } else {
            submission = Submission.builder()
                    .assignment(assignment)
                    .student(student)
                    .file(request.getFile())
                    .status(SubmissionStatus.SUBMITTED)
                    .submittedAt(java.time.LocalDateTime.now())
                    .build();
        }

        submission = submissionRepository.save(submission);
        return toSubmissionResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getMySubmission(Long assignmentId, String studentEmail) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài tập", assignmentId));

        validateStudentAccess(assignment.getLesson().getChapter().getCourse(), studentEmail);

        User student = userRepository.findByEmail(studentEmail).orElse(null);
        if (student == null) return null;
        Submission submission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .orElse(null);
        return submission != null ? toSubmissionResponse(submission) : null;
    }

    @Override
    @Transactional
    public SubmissionResponse gradeSubmission(Long submissionId, GradeSubmissionRequest request, String currentUserEmail) {
        // Rule 5.6: Instructor chấm tay
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài nộp", submissionId));

        courseSecurityHelper.validateCourseAccess(submission.getAssignment().getLesson().getChapter().getCourse(), currentUserEmail, "chấm điểm bài nộp của");

        submission.setScore(request.getScore());
        submission.setComment(request.getComment());
        submission.setStatus(SubmissionStatus.GRADED);

        submission = submissionRepository.save(submission);
        return toSubmissionResponse(submission);
    }

    private AssignmentResponse toAssignmentResponse(Assignment assignment) {
        return AssignmentResponse.builder()
                .id(assignment.getId())
                .lessonId(assignment.getLesson().getId())
                .title(assignment.getTitle())
                .deadline(assignment.getDeadline())
                .maxScore(assignment.getMaxScore())
                .createdAt(assignment.getCreatedAt())
                .updatedAt(assignment.getUpdatedAt())
                .build();
    }

    private SubmissionResponse toSubmissionResponse(Submission submission) {
        boolean isLate = false;
        if (submission.getSubmittedAt() != null && submission.getAssignment().getDeadline() != null) {
            isLate = submission.getSubmittedAt().isAfter(submission.getAssignment().getDeadline());
        }

        return SubmissionResponse.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignment().getId())
                .assignmentTitle(submission.getAssignment().getTitle())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getName())
                .file(submission.getFile())
                .status(submission.getStatus())
                .score(submission.getScore())
                .comment(submission.getComment())
                .submittedAt(submission.getSubmittedAt())
                .updatedAt(submission.getUpdatedAt())
                .isLate(isLate)
                .build();
    }
}
