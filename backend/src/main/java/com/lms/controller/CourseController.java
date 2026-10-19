package com.lms.controller;

import com.lms.common.ApiResponse;
import com.lms.common.PageResponse;
import com.lms.common.enums.CourseStatus;
import com.lms.dto.request.CourseRequest;
import com.lms.dto.response.CourseResponse;
import com.lms.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Tag(name = "Course", description = "Quản lý khóa học (Instructor)")
public class CourseController {

    private final CourseService courseService;
    private final com.lms.repository.UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Danh sách khóa học", description = "Lọc theo instructor, category, status")
    public ResponseEntity<ApiResponse<PageResponse<CourseResponse>>> getCourses(
            @RequestParam(required = false) Long instructorId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) CourseStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {

        Long effectiveInstructorId = instructorId;
        CourseStatus effectiveStatus = status;

        if (auth == null || !auth.isAuthenticated()) {
            effectiveStatus = CourseStatus.PUBLISHED;
        } else {
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            boolean isInstructor = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_INSTRUCTOR"));

            if (isAdmin) {
                // Admin xem theo bộ lọc tùy chọn
            } else if (isInstructor) {
                // Giảng viên xem danh sách (hoặc nháp) sẽ tự động giới hạn chỉ các khóa học của chính mình
                if (effectiveStatus != CourseStatus.PUBLISHED) {
                    var currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
                    if (currentUser != null) {
                        effectiveInstructorId = currentUser.getId();
                    }
                }
            } else {
                // Học viên chỉ được xem khóa học đã xuất bản
                effectiveStatus = CourseStatus.PUBLISHED;
            }
        }

        PageResponse<CourseResponse> response = courseService.getCourses(
                effectiveInstructorId, categoryId, effectiveStatus, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Tạo khóa học mới")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @Valid @RequestBody CourseRequest request, Authentication auth) {
        CourseResponse response = courseService.createCourse(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo khóa học thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Cập nhật khóa học")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id, @Valid @RequestBody CourseRequest request, Authentication auth) {
        CourseResponse response = courseService.updateCourse(id, request, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật khóa học thành công", response));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Xuất bản khóa học", description = "Chuyển trạng thái DRAFT → PUBLISHED")
    public ResponseEntity<ApiResponse<CourseResponse>> publishCourse(
            @PathVariable Long id, Authentication auth) {
        CourseResponse response = courseService.publishCourse(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Xuất bản khóa học thành công", response));
    }

    @PostMapping("/{id}/clone")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Nhân bản khóa học (Clone/Duplicate)", description = "Sao chép toàn bộ chương, bài học, quiz, assignment sang một bản nháp mới")
    public ResponseEntity<ApiResponse<CourseResponse>> cloneCourse(
            @PathVariable Long id,
            @RequestBody(required = false) com.lms.dto.request.CloneCourseRequest request,
            Authentication auth) {
        CourseResponse response = courseService.cloneCourse(id, request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Nhân bản khóa học thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Xóa khóa học", description = "Chỉ xóa khi khóa học chưa có lớp học nào liên kết")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(
            @PathVariable Long id, Authentication auth) {
        courseService.deleteCourse(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Xóa khóa học thành công", null));
    }
}
