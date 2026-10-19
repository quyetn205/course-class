package com.lms.service.impl;

import com.lms.common.enums.CourseStatus;
import com.lms.common.enums.UserRole;
import com.lms.common.enums.UserStatus;
import com.lms.dto.response.AdminDashboardResponse;
import com.lms.entity.Course;
import com.lms.entity.User;
import com.lms.repository.*;
import com.lms.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ClassroomRepository classroomRepository;
    private final CategoryRepository categoryRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;
    private final LessonRepository lessonRepository;
    private final SubmissionRepository submissionRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    @Override
    public AdminDashboardResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalStudents = userRepository.countByRole(UserRole.STUDENT);
        long totalInstructors = userRepository.countByRole(UserRole.INSTRUCTOR);
        long totalAdmins = userRepository.countByRole(UserRole.ADMIN);
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        long lockedUsers = userRepository.countByStatus(UserStatus.LOCKED);

        long totalCourses = courseRepository.count();
        long publishedCourses = courseRepository.countByStatus(CourseStatus.PUBLISHED);
        long draftCourses = courseRepository.countByStatus(CourseStatus.DRAFT);
        long totalClassrooms = classroomRepository.count();
        long totalCategories = categoryRepository.count();
        long totalLessons = lessonRepository.count();

        long totalEnrollments = classEnrollmentRepository.count();
        long totalSubmissions = submissionRepository.count();
        long totalQuizAttempts = quizAttemptRepository.count();

        // Thống kê danh mục kèm số khóa học
        List<AdminDashboardResponse.CategoryStatDto> categoryStats = new ArrayList<>();
        List<Object[]> rawCategoryCounts = categoryRepository.getCategoryCourseCounts();
        for (Object[] row : rawCategoryCounts) {
            Long catId = ((Number) row[0]).longValue();
            String catName = (String) row[1];
            long count = ((Number) row[2]).longValue();
            categoryStats.add(AdminDashboardResponse.CategoryStatDto.builder()
                    .id(catId)
                    .name(catName)
                    .courseCount(count)
                    .build());
        }

        // Người dùng mới nhất
        List<User> topUsers = userRepository.findTop5ByOrderByCreatedAtDesc();
        List<AdminDashboardResponse.RecentUserDto> recentUsers = topUsers.stream()
                .map(u -> AdminDashboardResponse.RecentUserDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .status(u.getStatus().name())
                        .avatar(u.getAvatar())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        // Khóa học mới nhất
        List<Course> topCourses = courseRepository.findTop5ByOrderByCreatedAtDesc();
        List<AdminDashboardResponse.RecentCourseDto> recentCourses = topCourses.stream()
                .map(c -> AdminDashboardResponse.RecentCourseDto.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .instructorName(c.getInstructor() != null ? c.getInstructor().getName() : "Chưa phân công")
                        .categoryName(c.getCategory() != null ? c.getCategory().getName() : "Chưa phân loại")
                        .status(c.getStatus().name())
                        .thumbnailUrl(c.getThumbnailUrl())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalInstructors(totalInstructors)
                .totalAdmins(totalAdmins)
                .activeUsers(activeUsers)
                .lockedUsers(lockedUsers)
                .totalCourses(totalCourses)
                .publishedCourses(publishedCourses)
                .draftCourses(draftCourses)
                .totalClassrooms(totalClassrooms)
                .totalCategories(totalCategories)
                .totalLessons(totalLessons)
                .totalEnrollments(totalEnrollments)
                .totalSubmissions(totalSubmissions)
                .totalQuizAttempts(totalQuizAttempts)
                .categoryStats(categoryStats)
                .recentUsers(recentUsers)
                .recentCourses(recentCourses)
                .build();
    }
}
