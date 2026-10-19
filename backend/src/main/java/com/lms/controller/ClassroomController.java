package com.lms.controller;

import com.lms.common.ApiResponse;
import com.lms.common.PageResponse;
import com.lms.common.enums.ClassroomStatus;
import com.lms.dto.request.AddStudentRequest;
import com.lms.dto.request.ClassroomRequest;
import com.lms.dto.request.UpdateClassroomRequest;
import com.lms.dto.response.ClassroomResponse;
import com.lms.dto.response.EnrollmentResponse;
import com.lms.service.ClassroomService;
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
@RequestMapping("/api/classes")
@RequiredArgsConstructor
@Tag(name = "Classroom", description = "Quản lý lớp học (Instructor & Admin)")
public class ClassroomController {

    private final ClassroomService classroomService;

    @GetMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Danh sách lớp học", description = "Lọc theo instructor, course, status, search")
    public ResponseEntity<ApiResponse<PageResponse<ClassroomResponse>>> getClassrooms(
            @RequestParam(required = false) Long instructorId,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) ClassroomStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        PageResponse<ClassroomResponse> response = classroomService.getClassrooms(
                instructorId, courseId, status, search, PageRequest.of(page, size), auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Tạo lớp học", description = "Chỉ tạo từ khóa học đã PUBLISHED")
    public ResponseEntity<ApiResponse<ClassroomResponse>> createClassroom(
            @Valid @RequestBody ClassroomRequest request, Authentication auth) {
        ClassroomResponse response = classroomService.createClassroom(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo lớp học thành công", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết lớp học")
    public ResponseEntity<ApiResponse<ClassroomResponse>> getClassroom(@PathVariable Long id) {
        ClassroomResponse response = classroomService.getClassroom(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Cập nhật lớp học", description = "Chỉnh sửa tên, ngày, sĩ số tối đa, trạng thái")
    public ResponseEntity<ApiResponse<ClassroomResponse>> updateClassroom(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClassroomRequest request,
            Authentication auth) {
        ClassroomResponse response = classroomService.updateClassroom(id, request, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật lớp học thành công", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Đổi trạng thái lớp học", description = "OPEN, IN_PROGRESS, CLOSED")
    public ResponseEntity<ApiResponse<ClassroomResponse>> updateClassroomStatus(
            @PathVariable Long id,
            @RequestParam ClassroomStatus status,
            Authentication auth) {
        ClassroomResponse response = classroomService.updateClassroomStatus(id, status, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Xóa lớp học", description = "Chỉ xóa khi lớp chưa có học viên")
    public ResponseEntity<ApiResponse<Void>> deleteClassroom(
            @PathVariable Long id,
            Authentication auth) {
        classroomService.deleteClassroom(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Xóa lớp học thành công", null));
    }

    @PostMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Thêm học viên vào lớp", description = "Kiểm tra tuần tự: tồn tại → ACTIVE → chưa trùng → còn chỗ")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> addStudent(
            @PathVariable Long id, @Valid @RequestBody AddStudentRequest request, Authentication auth) {
        EnrollmentResponse response = classroomService.addStudent(id, request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm học viên thành công", response));
    }

    @DeleteMapping("/{id}/students/{studentId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Xóa học viên khỏi lớp")
    public ResponseEntity<ApiResponse<Void>> removeStudent(
            @PathVariable Long id, @PathVariable Long studentId, Authentication auth) {
        classroomService.removeStudent(id, studentId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Xóa học viên thành công", null));
    }

    @GetMapping("/{id}/students")
    @Operation(summary = "Danh sách học viên trong lớp")
    public ResponseEntity<ApiResponse<PageResponse<EnrollmentResponse>>> getStudents(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<EnrollmentResponse> response = classroomService.getStudents(id, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}/gradebook")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Sổ điểm tổng hợp lớp học", description = "Giảng viên xem bảng điểm tổng hợp của toàn bộ học viên trong lớp")
    public ResponseEntity<ApiResponse<com.lms.dto.response.ClassGradebookResponse>> getClassGradebook(
            @PathVariable Long id, Authentication auth) {
        com.lms.dto.response.ClassGradebookResponse response = classroomService.getClassGradebook(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}/my-grades")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Bảng điểm cá nhân trong lớp", description = "Học sinh xem toàn bộ điểm Quiz, Assignment và tiến độ của chính mình trong lớp")
    public ResponseEntity<ApiResponse<com.lms.dto.response.StudentGradebookResponse>> getStudentGradebook(
            @PathVariable Long id, Authentication auth) {
        com.lms.dto.response.StudentGradebookResponse response = classroomService.getStudentGradebook(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
