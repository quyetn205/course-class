package com.lms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    // Tổng số người dùng
    private long totalUsers;
    private long totalStudents;
    private long totalInstructors;
    private long totalAdmins;
    private long activeUsers;
    private long lockedUsers;

    // Tổng số khóa học & lớp học
    private long totalCourses;
    private long publishedCourses;
    private long draftCourses;
    private long totalClassrooms;
    private long totalCategories;
    private long totalLessons;

    // Tương tác học tập
    private long totalEnrollments;
    private long totalSubmissions;
    private long totalQuizAttempts;

    // Thống kê khóa học theo danh mục
    private List<CategoryStatDto> categoryStats;

    // Người dùng mới đăng ký gần nhất
    private List<RecentUserDto> recentUsers;

    // Khóa học mới nhất
    private List<RecentCourseDto> recentCourses;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryStatDto {
        private Long id;
        private String name;
        private long courseCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentUserDto {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String status;
        private String avatar;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentCourseDto {
        private Long id;
        private String title;
        private String instructorName;
        private String categoryName;
        private String status;
        private String thumbnailUrl;
        private LocalDateTime createdAt;
    }
}
