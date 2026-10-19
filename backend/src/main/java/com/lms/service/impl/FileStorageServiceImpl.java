package com.lms.service.impl;

import com.lms.dto.response.FileUploadResponse;
import com.lms.exception.BusinessException;
import com.lms.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
            log.info("Initialized upload directory at: {}", this.rootLocation);
        } catch (IOException e) {
            throw new BusinessException("Không thể khởi tạo thư mục lưu trữ file: " + e.getMessage());
        }
    }

    private static final java.util.Set<String> ALLOWED_EXTENSIONS = java.util.Set.of(
            // Hình ảnh
            ".jpg", ".jpeg", ".png", ".gif", ".webp",
            // Tài liệu
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv",
            // File nén
            ".zip", ".rar", ".7z",
            // Video & Audio
            ".mp4", ".webm", ".mov", ".mp3", ".wav"
    );

    @Override
    public FileUploadResponse storeFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File không được để trống");
        }

        String originalFilename = StringUtils.cleanPath(
                Objects.requireNonNullElse(file.getOriginalFilename(), "unnamed_file"));

        if (originalFilename.contains("..")) {
            throw new BusinessException("Tên file chứa ký tự không hợp lệ: " + originalFilename);
        }

        // Tách extension
        String extension = "";
        int extIndex = originalFilename.lastIndexOf('.');
        if (extIndex > 0) {
            extension = originalFilename.substring(extIndex);
        }

        if (extension.isBlank() || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BusinessException("Định dạng file không được hỗ trợ hoặc bị chặn vì lý do an toàn (" + extension + "). Chỉ chấp nhận file hình ảnh, tài liệu (PDF, Word, Excel), file nén (ZIP, RAR) hoặc video (MP4).");
        }

        String safeFolderName = (folder != null && !folder.isBlank())
                ? folder.replaceAll("[^a-zA-Z0-9_-]", "")
                : "general";

        Path targetFolder = this.rootLocation.resolve(safeFolderName).normalize();

        try {
            Files.createDirectories(targetFolder);

            // Tên file lưu trên đĩa: uuid + extension
            String storedFileName = UUID.randomUUID() + extension;
            Path targetLocation = targetFolder.resolve(storedFileName).normalize();

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            String fileUrl = "/uploads/" + safeFolderName + "/" + storedFileName;

            log.info("Uploaded file successfully: {} -> {}", originalFilename, fileUrl);

            return FileUploadResponse.builder()
                    .fileName(originalFilename)
                    .fileUrl(fileUrl)
                    .fileSize(file.getSize())
                    .fileType(file.getContentType())
                    .build();

        } catch (IOException e) {
            log.error("Failed to store file: {}", originalFilename, e);
            throw new BusinessException("Không thể lưu file: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            return;
        }

        try {
            String relativePath = fileUrl.substring("/uploads/".length());
            Path targetPath = this.rootLocation.resolve(relativePath).normalize();

            // Đảm bảo không thoát khỏi rootLocation
            if (targetPath.startsWith(this.rootLocation) && Files.exists(targetPath)) {
                Files.delete(targetPath);
                log.info("Deleted file: {}", targetPath);
            }
        } catch (IOException e) {
            log.warn("Failed to delete file for url: {}", fileUrl, e);
        }
    }
}
