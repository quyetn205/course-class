package com.lms.controller;

import com.lms.common.ApiResponse;
import com.lms.common.PageResponse;
import com.lms.dto.request.AssignmentRequest;
import com.lms.dto.request.GradeSubmissionRequest;
import com.lms.dto.request.SubmissionRequest;
import com.lms.dto.response.AssignmentResponse;
import com.lms.dto.response.SubmissionResponse;
import com.lms.service.AssignmentService;
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
@RequiredArgsConstructor
@Tag(name = "Assignment", description = "Quản lý bài tập")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping("/api/lessons/{lessonId}/assignment")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Tạo bài tập cho bài học")
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
            @PathVariable Long lessonId, @Valid @RequestBody AssignmentRequest request,
            Authentication auth) {
        AssignmentResponse response = assignmentService.createAssignment(lessonId, request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo bài tập thành công", response));
    }

    @GetMapping("/api/lessons/{lessonId}/assignment")
    @Operation(summary = "Xem bài tập theo bài học")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentByLessonId(
            @PathVariable Long lessonId, Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        AssignmentResponse response = assignmentService.getAssignmentByLessonId(lessonId, email);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/api/assignments/{assignmentId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Xóa bài tập")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(
            @PathVariable Long assignmentId, Authentication auth) {
        assignmentService.deleteAssignment(assignmentId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Xóa bài tập thành công", null));
    }

    @GetMapping("/api/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Danh sách bài nộp", description = "Instructor xem bài nộp của bài tập")
    public ResponseEntity<ApiResponse<PageResponse<SubmissionResponse>>> getSubmissions(
            @PathVariable Long assignmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        PageResponse<SubmissionResponse> response = assignmentService.getSubmissions(
                assignmentId, PageRequest.of(page, size), auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/api/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Nộp bài tập")
    public ResponseEntity<ApiResponse<SubmissionResponse>> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestBody SubmissionRequest request,
            Authentication auth) {
        SubmissionResponse response = assignmentService.submitAssignment(
                assignmentId, request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Nộp bài tập thành công", response));
    }

    @PutMapping("/api/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Chấm điểm bài nộp", description = "Instructor chấm điểm và nhận xét")
    public ResponseEntity<ApiResponse<SubmissionResponse>> gradeSubmission(
            @PathVariable Long submissionId,
            @Valid @RequestBody GradeSubmissionRequest request,
            Authentication auth) {
        SubmissionResponse response = assignmentService.gradeSubmission(submissionId, request, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Chấm điểm thành công", response));
    }

    @GetMapping("/api/assignments/{assignmentId}/my-submission")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Lấy bài nộp của chính mình")
    public ResponseEntity<ApiResponse<SubmissionResponse>> getMySubmission(
            @PathVariable Long assignmentId, Authentication auth) {
        SubmissionResponse response = assignmentService.getMySubmission(assignmentId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
