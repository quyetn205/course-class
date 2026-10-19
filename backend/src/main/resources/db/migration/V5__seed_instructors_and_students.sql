-- =============================================================
-- V5: Khởi tạo dữ liệu mẫu 5 Giảng viên và 20 Học sinh
-- Mật khẩu chung: 123456 (BCrypt hash)
-- =============================================================

-- 1. Giảng viên (INSTRUCTOR)
INSERT INTO users (name, email, password, role, status, created_at)
VALUES 
    ('ThS. Nguyễn Văn Hùng', 'gv.hung@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'INSTRUCTOR', 'ACTIVE', NOW()),
    ('TS. Trần Thị Mai', 'gv.mai@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'INSTRUCTOR', 'ACTIVE', NOW()),
    ('ThS. Lê Hoàng Nam', 'gv.nam@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'INSTRUCTOR', 'ACTIVE', NOW()),
    ('TS. Phạm Minh Tuấn', 'gv.tuan@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'INSTRUCTOR', 'ACTIVE', NOW()),
    ('ThS. Đỗ Thảo Linh', 'gv.linh@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'INSTRUCTOR', 'ACTIVE', NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Học sinh (STUDENT)
INSERT INTO users (name, email, password, role, status, created_at)
VALUES 
    ('Nguyễn Hoàng Anh', 'hs.anh@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Trần Bảo Bình', 'hs.binh@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Lê Minh Cường', 'hs.cuong@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Phạm Tiến Dũng', 'hs.dung@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Hoàng Nhật Duy', 'hs.duy@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Đặng Mỹ Duyên', 'hs.duyen@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Bùi Thu Hà', 'hs.ha@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Vũ Quốc Huy', 'hs.huy@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Đỗ Gia Khánh', 'hs.khanh@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Ngô Quang Khải', 'hs.khai@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Dương Bích Loan', 'hs.loan@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Lý Hồng Nhung', 'hs.nhung@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Mai Thành Phong', 'hs.phong@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Phan Quỳnh Phương', 'hs.phuong@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Trịnh Minh Quân', 'hs.quan@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Đoàn Thanh Sơn', 'hs.son@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Cao Anh Thái', 'hs.thai@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Đinh Thị Trang', 'hs.trang@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Hồ Anh Tú', 'hs.tu@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW()),
    ('Võ Hải Yến', 'hs.yen@lms.com', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'STUDENT', 'ACTIVE', NOW())
ON CONFLICT (email) DO NOTHING;
