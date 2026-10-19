package com.lms.service.impl;

import com.lms.common.enums.ClassroomStatus;
import com.lms.common.enums.CourseStatus;
import com.lms.dto.response.InstructorDashboardResponse;
import com.lms.entity.Classroom;
import com.lms.entity.Course;
import com.lms.entity.Submission;
import com.lms.entity.User;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.*;
import com.lms.service.InstructorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstructorDashboardServiceImpl implements InstructorDashboardService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;
    private final SubmissionRepository submissionRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    @Override
    public InstructorDashboardResponse getDashboardStats(String instructorEmail) {
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin giảng viên"));

        Long instructorId = instructor.getId();

        // 1. Khóa học của giảng viên
        long totalCourses = courseRepository.countByInstructorId(instructorId);
        long publishedCourses = courseRepository.countByInstructorIdAndStatus(instructorId, CourseStatus.PUBLISHED);
        long draftCourses = courseRepository.countByInstructorIdAndStatus(instructorId, CourseStatus.DRAFT);

        // 2. Lớp học của giảng viên
        long totalClassrooms = classroomRepository.countByInstructorId(instructorId);
        long openClassrooms = classroomRepository.countByInstructorIdAndStatus(instructorId, ClassroomStatus.OPEN);
        long inProgressClassrooms = classroomRepository.countByInstructorIdAndStatus(instructorId, ClassroomStatus.IN_PROGRESS);
        long closedClassrooms = classroomRepository.countByInstructorIdAndStatus(instructorId, ClassroomStatus.CLOSED);

        // 3. Học viên duy nhất đang theo học
        long totalStudents = classEnrollmentRepository.countDistinctStudentsByInstructorId(instructorId);

        // 4. Bài tập & Quiz
        long pendingSubmissions = submissionRepository.countPendingByInstructorId(instructorId);
        long totalSubmissions = submissionRepository.countTotalByInstructorId(instructorId);
        long gradedSubmissions = Math.max(0, totalSubmissions - pendingSubmissions);
        long totalQuizAttempts = quizAttemptRepository.countByInstructorId(instructorId);

        // 5. Danh sách bài nộp gần đây (cần chấm hoặc vừa nộp)
        List<Submission> rawSubmissions = submissionRepository.findRecentSubmissionsByInstructorId(
                instructorId, PageRequest.of(0, 6));

        List<InstructorDashboardResponse.PendingSubmissionDto> recentSubmissions = rawSubmissions.stream()
                .map(s -> InstructorDashboardResponse.PendingSubmissionDto.builder()
                        .submissionId(s.getId())
                        .assignmentId(s.getAssignment().getId())
                        .assignmentTitle(s.getAssignment().getTitle())
                        .courseTitle(s.getAssignment().getLesson().getChapter().getCourse().getTitle())
                        .lessonTitle(s.getAssignment().getLesson().getTitle())
                        .studentId(s.getStudent().getId())
                        .studentName(s.getStudent().getName())
                        .studentEmail(s.getStudent().getEmail())
                        .fileUrl(s.getFile())
                        .status(s.getStatus().name())
                        .score(s.getScore())
                        .maxScore(s.getAssignment().getMaxScore())
                        .submittedAt(s.getSubmittedAt())
                        .build())
                .collect(Collectors.toList());

        // 6. Danh sách lớp học đang phụ trách
        List<Classroom> rawClasses = classroomRepository.findByInstructorIdOrderByIdDesc(instructorId);
        List<InstructorDashboardResponse.InstructorClassDto> myClasses = rawClasses.stream()
                .map(c -> {
                    long currentCount = classEnrollmentRepository.countByClassroomId(c.getId());
                    return InstructorDashboardResponse.InstructorClassDto.builder()
                            .id(c.getId())
                            .name(c.getName())
                            .courseId(c.getCourse().getId())
                            .courseTitle(c.getCourse().getTitle())
                            .status(c.getStatus().name())
                            .currentStudents(currentCount)
                            .maxStudents(c.getMaxStudents())
                            .startDate(c.getStartDate() != null ? c.getStartDate().toString() : null)
                            .endDate(c.getEndDate() != null ? c.getEndDate().toString() : null)
                            .build();
                })
                .collect(Collectors.toList());

        // 7. Danh sách khóa học gần nhất
        List<Course> rawCourses = courseRepository.findTop5ByInstructorIdOrderByCreatedAtDesc(instructorId);
        List<InstructorDashboardResponse.InstructorCourseDto> myCourses = rawCourses.stream()
                .map(c -> InstructorDashboardResponse.InstructorCourseDto.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .categoryName(c.getCategory() != null ? c.getCategory().getName() : "Chưa phân loại")
                        .status(c.getStatus().name())
                        .thumbnailUrl(c.getThumbnailUrl())
                        .chapterCount(c.getChapters() != null ? c.getChapters().size() : 0)
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return InstructorDashboardResponse.builder()
                .totalCourses(totalCourses)
                .publishedCourses(publishedCourses)
                .draftCourses(draftCourses)
                .totalClassrooms(totalClassrooms)
                .openClassrooms(openClassrooms)
                .inProgressClassrooms(inProgressClassrooms)
                .closedClassrooms(closedClassrooms)
                .totalStudents(totalStudents)
                .pendingSubmissions(pendingSubmissions)
                .gradedSubmissions(gradedSubmissions)
                .totalSubmissions(totalSubmissions)
                .totalQuizAttempts(totalQuizAttempts)
                .recentSubmissions(recentSubmissions)
                .myClasses(myClasses)
                .myCourses(myCourses)
                .build();
    }
}
