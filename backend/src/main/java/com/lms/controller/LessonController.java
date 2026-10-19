package com.lms.controller;

import com.lms.common.ApiResponse;
import com.lms.dto.request.LessonRequest;
import com.lms.dto.response.LessonResponse;
import com.lms.service.LessonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Lesson", description = "Quản lý bài học")
public class LessonController {

    private final LessonService lessonService;

    @PostMapping("/api/chapters/{chapterId}/lessons")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Thêm bài học vào chương")
    public ResponseEntity<ApiResponse<LessonResponse>> createLesson(
            @PathVariable Long chapterId, @Valid @RequestBody LessonRequest request,
            org.springframework.security.core.Authentication auth) {
        LessonResponse response = lessonService.createLesson(chapterId, request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo bài học thành công", response));
    }

    @PutMapping("/api/lessons/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Cập nhật bài học")
    public ResponseEntity<ApiResponse<LessonResponse>> updateLesson(
            @PathVariable Long id, @Valid @RequestBody LessonRequest request,
            org.springframework.security.core.Authentication auth) {
        LessonResponse response = lessonService.updateLesson(id, request, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật bài học thành công", response));
    }

    @GetMapping("/api/lessons/{id}")
    @Operation(summary = "Lấy chi tiết bài học")
    public ResponseEntity<ApiResponse<LessonResponse>> getLesson(@PathVariable Long id) {
        LessonResponse response = lessonService.getLessonById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/api/lessons/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Xóa bài học")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(
            @PathVariable Long id, org.springframework.security.core.Authentication auth) {
        lessonService.deleteLesson(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Xóa bài học thành công", null));
    }
}
