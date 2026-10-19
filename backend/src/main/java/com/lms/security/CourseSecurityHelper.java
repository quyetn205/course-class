package com.lms.security;

import com.lms.common.enums.UserRole;
import com.lms.entity.Course;
import com.lms.entity.User;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CourseSecurityHelper {

    private final UserRepository userRepository;

    /**
     * Kiểm tra quyền sở hữu khóa học:
     * - ADMIN có toàn quyền.
     * - INSTRUCTOR chỉ được thao tác trên khóa học do chính mình tạo.
     *
     * @param course Khóa học cần kiểm tra
     * @param userEmail Email của người dùng hiện tại (từ Authentication)
     * @param action Hành động đang thực hiện (để tạo thông báo lỗi chi tiết)
     */
    public void validateCourseAccess(Course course, String userEmail, String action) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new AccessDeniedException("Yêu cầu đăng nhập để thực hiện thao tác");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + userEmail));

        // ADMIN có toàn quyền
        if (user.getRole() == UserRole.ADMIN) {
            return;
        }

        // INSTRUCTOR phải là người tạo khóa học
        if (course.getInstructor() == null || !course.getInstructor().getId().equals(user.getId())) {
            throw new AccessDeniedException(
                    "Bạn không có quyền " + action + " khóa học của giảng viên khác");
        }
    }
}
