package com.lms.controller;

import com.lms.common.ApiResponse;
import com.lms.dto.response.FileUploadResponse;
import com.lms.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "File", description = "Quản lý upload file tài liệu và media")
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload file tài liệu (PDF, Word, video, hình ảnh)")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "lessons") String folder) {

        FileUploadResponse response = fileStorageService.storeFile(file, folder);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tải lên file thành công", response));
    }

    @DeleteMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Xóa file theo đường dẫn URL")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@RequestParam("fileUrl") String fileUrl) {
        fileStorageService.deleteFile(fileUrl);
        return ResponseEntity.ok(ApiResponse.ok("Xóa file thành công", null));
    }
}
