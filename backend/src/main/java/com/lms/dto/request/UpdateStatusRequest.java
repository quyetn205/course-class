package com.lms.dto.request;

import com.lms.common.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {

    @NotNull(message = "Trạng thái không được để trống")
    private UserStatus status;
}
