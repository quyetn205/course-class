package com.lms.controller;

import com.lms.common.ApiResponse;
import com.lms.common.PageResponse;
import com.lms.common.enums.UserRole;
import com.lms.common.enums.UserStatus;
import com.lms.dto.request.CreateUserRequest;
import com.lms.dto.request.UpdateStatusRequest;
import com.lms.dto.request.UpdateUserRequest;
import com.lms.dto.response.UserResponse;
import com.lms.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "Quản lý tài khoản (Admin)")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Danh sách người dùng", description = "Lọc theo role, status, từ khóa tìm kiếm và phân trang.")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            org.springframework.security.core.Authentication auth) {

        UserRole effectiveRole = role;
        UserStatus effectiveStatus = status;

        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // Nếu là Giảng viên (không phải Admin), chỉ cho phép lấy danh sách Học viên (STUDENT) có trạng thái ACTIVE
        if (!isAdmin) {
            effectiveRole = UserRole.STUDENT;
            effectiveStatus = UserStatus.ACTIVE;
        }

        PageResponse<UserResponse> response = userService.getUsers(effectiveRole, effectiveStatus, keyword, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo tài khoản mới")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Tạo tài khoản thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật tài khoản")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật tài khoản thành công", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Khóa/mở khóa tài khoản")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @PathVariable Long id, @Valid @RequestBody UpdateStatusRequest request) {
        UserResponse response = userService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái thành công", response));
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xem hồ sơ cá nhân")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(org.springframework.security.core.Authentication auth) {
        UserResponse response = userService.getProfile(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cập nhật hồ sơ cá nhân")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody com.lms.dto.request.UpdateProfileRequest request,
            org.springframework.security.core.Authentication auth) {
        UserResponse response = userService.updateProfile(request, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin cá nhân thành công", response));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Đổi mật khẩu")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody com.lms.dto.request.ChangePasswordRequest request,
            org.springframework.security.core.Authentication auth) {
        userService.changePassword(request, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công", null));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin đặt lại mật khẩu cho tài khoản")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long id,
            @RequestBody(required = false) com.lms.dto.request.ResetPasswordRequest request,
            org.springframework.security.core.Authentication auth) {
        userService.resetPassword(id, request, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Đặt lại mật khẩu thành công", null));
    }
}
