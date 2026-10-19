package com.lms.dto.response;

import com.lms.common.enums.UserRole;
import com.lms.common.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private UserStatus status;
    private String avatar;
    private String phone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
