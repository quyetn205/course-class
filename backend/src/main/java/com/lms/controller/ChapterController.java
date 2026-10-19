package com.lms.controller;

import com.lms.common.ApiResponse;
import com.lms.dto.request.ChapterRequest;
import com.lms.dto.response.ChapterResponse;
import com.lms.service.ChapterService;
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
@Tag(name = "Chapter", description = "Quản lý chương học")
public class ChapterController {

    private final ChapterService chapterService;

    @PostMapping("/api/courses/{courseId}/chapters")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Thêm chương vào khóa học")
    public ResponseEntity<ApiResponse<ChapterResponse>> createChapter(
            @PathVariable Long courseId, @Valid @RequestBody ChapterRequest request,
            org.springframework.security.core.Authentication auth) {
        ChapterResponse response = chapterService.createChapter(courseId, request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo chương thành công", response));
    }

    @PutMapping("/api/chapters/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Cập nhật chương")
    public ResponseEntity<ApiResponse<ChapterResponse>> updateChapter(
            @PathVariable Long id, @Valid @RequestBody ChapterRequest request,
            org.springframework.security.core.Authentication auth) {
        ChapterResponse response = chapterService.updateChapter(id, request, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật chương thành công", response));
    }

    @DeleteMapping("/api/chapters/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Xóa chương học")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(
            @PathVariable Long id, org.springframework.security.core.Authentication auth) {
        chapterService.deleteChapter(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Xóa chương học thành công", null));
    }
}
