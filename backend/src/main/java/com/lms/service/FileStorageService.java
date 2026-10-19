package com.lms.service;

import com.lms.dto.response.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    FileUploadResponse storeFile(MultipartFile file, String folder);

    void deleteFile(String fileUrl);
}
