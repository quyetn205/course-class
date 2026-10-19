package com.lms.controller;

import com.lms.common.ApiResponse;
import com.lms.dto.response.ClassroomResponse;
import com.lms.dto.response.LessonProgressResponse;
import com.lms.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Student", description = "Chức năng học tập (Student)")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/api/students/me/dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Tổng quan học tập sinh viên", description = "Lấy dữ liệu tổng hợp KPIs, bài học tiếp tục học, deadline bài tập và điểm số")
    public ResponseEntity<ApiResponse<com.lms.dto.response.StudentDashboardResponse>> getStudentDashboard(Authentication auth) {
        com.lms.dto.response.StudentDashboardResponse response = studentService.getStudentDashboard(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/api/students/me/classes")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Danh sách lớp của tôi", description = "Lấy danh sách lớp học đã ghi danh")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> getMyClasses(Authentication auth) {
        List<ClassroomResponse> response = studentService.getMyClasses(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/api/students/me/courses/{courseId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Tiến độ học tập", description = "Xem tiến độ hoàn thành bài học trong khóa")
    public ResponseEntity<ApiResponse<List<LessonProgressResponse>>> getCourseProgress(
            @PathVariable Long courseId, Authentication auth) {
        List<LessonProgressResponse> response = studentService.getCourseProgress(courseId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/api/lessons/{lessonId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Hoàn thành bài học", description = "Đánh dấu bài học hoàn thành, áp quy tắc khóa tuần tự")
    public ResponseEntity<ApiResponse<LessonProgressResponse>> completeLesson(
            @PathVariable Long lessonId, Authentication auth) {
        LessonProgressResponse response = studentService.completeLesson(lessonId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Hoàn thành bài học thành công", response));
    }
}
