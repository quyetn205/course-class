package com.lms.service;

import com.lms.common.PageResponse;
import com.lms.common.enums.UserRole;
import com.lms.common.enums.UserStatus;
import com.lms.dto.request.CreateUserRequest;
import com.lms.dto.request.UpdateStatusRequest;
import com.lms.dto.request.UpdateUserRequest;
import com.lms.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

public interface UserService {

    PageResponse<UserResponse> getUsers(UserRole role, UserStatus status, String keyword, Pageable pageable);

    UserResponse createUser(CreateUserRequest request);

    UserResponse updateUser(Long id, UpdateUserRequest request);

    UserResponse updateStatus(Long id, UpdateStatusRequest request);

    UserResponse getProfile(String currentUserEmail);

    UserResponse updateProfile(com.lms.dto.request.UpdateProfileRequest request, String currentUserEmail);

    void changePassword(com.lms.dto.request.ChangePasswordRequest request, String currentUserEmail);

    void resetPassword(Long userId, com.lms.dto.request.ResetPasswordRequest request, String adminEmail);
}
