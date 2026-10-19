package com.lms.config;

import com.lms.common.enums.UserRole;
import com.lms.common.enums.UserStatus;
import com.lms.entity.User;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.default-admin.email:admin@lms.com}")
    private String adminEmail;

    @Value("${app.default-admin.password:admin123}")
    private String adminPassword;

    @Value("${app.default-admin.name:Administrator}")
    private String adminName;

    @Override
    public void run(String... args) {
        initAdminAccount();
        initInstructorsAndStudents();
    }

    private void initAdminAccount() {
        Optional<User> existingUserOpt = userRepository.findByEmail(adminEmail);

        if (existingUserOpt.isEmpty()) {
            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(UserRole.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            log.info("==> Đã khởi tạo tài khoản admin mặc định: Email: [{}], Mật khẩu: [{}]", adminEmail, adminPassword);
        } else {
            User existingUser = existingUserOpt.get();
            boolean updated = false;
            if (existingUser.getRole() != UserRole.ADMIN) {
                existingUser.setRole(UserRole.ADMIN);
                updated = true;
            }
            if (existingUser.getStatus() != UserStatus.ACTIVE) {
                existingUser.setStatus(UserStatus.ACTIVE);
                updated = true;
            }
            if (!passwordEncoder.matches(adminPassword, existingUser.getPassword())) {
                existingUser.setPassword(passwordEncoder.encode(adminPassword));
                updated = true;
            }
            if (updated) {
                userRepository.save(existingUser);
                log.info("==> Đã cập nhật tài khoản [{}] thành ACTIVE ADMIN (mật khẩu: {})", adminEmail, adminPassword);
            } else {
                log.info("==> Tài khoản admin [{}] đã sẵn sàng", adminEmail);
            }
        }
    }

    private void initInstructorsAndStudents() {
        String defaultPassword = "123456";
        String encodedPassword = passwordEncoder.encode(defaultPassword);

        String[][] instructors = {
            {"ThS. Nguyễn Văn Hùng", "gv.hung@lms.com"},
            {"TS. Trần Thị Mai", "gv.mai@lms.com"},
            {"ThS. Lê Hoàng Nam", "gv.nam@lms.com"},
            {"TS. Phạm Minh Tuấn", "gv.tuan@lms.com"},
            {"ThS. Đỗ Thảo Linh", "gv.linh@lms.com"}
        };

        for (String[] inst : instructors) {
            initUserIfNotExists(inst[0], inst[1], encodedPassword, UserRole.INSTRUCTOR);
        }

        String[][] students = {
            {"Nguyễn Hoàng Anh", "hs.anh@lms.com"},
            {"Trần Bảo Bình", "hs.binh@lms.com"},
            {"Lê Minh Cường", "hs.cuong@lms.com"},
            {"Phạm Tiến Dũng", "hs.dung@lms.com"},
            {"Hoàng Nhật Duy", "hs.duy@lms.com"},
            {"Đặng Mỹ Duyên", "hs.duyen@lms.com"},
            {"Bùi Thu Hà", "hs.ha@lms.com"},
            {"Vũ Quốc Huy", "hs.huy@lms.com"},
            {"Đỗ Gia Khánh", "hs.khanh@lms.com"},
            {"Ngô Quang Khải", "hs.khai@lms.com"},
            {"Dương Bích Loan", "hs.loan@lms.com"},
            {"Lý Hồng Nhung", "hs.nhung@lms.com"},
            {"Mai Thành Phong", "hs.phong@lms.com"},
            {"Phan Quỳnh Phương", "hs.phuong@lms.com"},
            {"Trịnh Minh Quân", "hs.quan@lms.com"},
            {"Đoàn Thanh Sơn", "hs.son@lms.com"},
            {"Cao Anh Thái", "hs.thai@lms.com"},
            {"Đinh Thị Trang", "hs.trang@lms.com"},
            {"Hồ Anh Tú", "hs.tu@lms.com"},
            {"Võ Hải Yến", "hs.yen@lms.com"}
        };

        for (String[] stu : students) {
            initUserIfNotExists(stu[0], stu[1], encodedPassword, UserRole.STUDENT);
        }
    }

    private void initUserIfNotExists(String name, String email, String encodedPassword, UserRole role) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(encodedPassword)
                    .role(role)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(user);
            log.info("==> Đã khởi tạo tài khoản [{}]: {} ({})", role, name, email);
        }
    }
}
