# DANH SÁCH TÀI KHOẢN VÀ MẬT KHẨU HỆ THỐNG LMS

> **Mật khẩu chung cho tất cả Giảng viên và Học sinh:** `123456`  
> **Địa chỉ đăng nhập Web:** `http://localhost:5173/login`  
> **Backend API:** `http://localhost:8080`
cd d:\ahoc\duankhoahoc-lophoc\backend
mvn spring-boot:run
cd d:\ahoc\duankhoahoc-lophoc\frontend
npm run dev

---

## 1. Tài khoản Quản trị viên (ADMIN)
| STT | Họ và tên | Email đăng nhập | Mật khẩu | Quyền hạn |
|:---:|:---|:---|:---:|:---:|
| 1 | Administrator | `admin@lms.com` | `admin123` | Quản trị toàn hệ thống |

---

## 2. Danh sách 5 Giảng viên (INSTRUCTOR)
*Quyền hạn: Tạo khóa học, bài học (Video, PDF, Text), quản lý chương, lớp học, bài tập.*

| STT | Họ và tên | Email đăng nhập | Mật khẩu | Ghi chú |
|:---:|:---|:---|:---:|:---|
| 1 | ThS. Nguyễn Văn Hùng | `gv.hung@lms.com` | `123456` | Giảng viên Khoa CNTT |
| 2 | TS. Trần Thị Mai | `gv.mai@lms.com` | `123456` | Giảng viên Khoa Phần mềm |
| 3 | ThS. Lê Hoàng Nam | `gv.nam@lms.com` | `123456` | Giảng viên Khoa Mạng máy tính |
| 4 | TS. Phạm Minh Tuấn | `gv.tuan@lms.com` | `123456` | Giảng viên Khoa Khoa học dữ liệu |
| 5 | ThS. Đỗ Thảo Linh | `gv.linh@lms.com` | `123456` | Giảng viên Khoa Trí tuệ nhân tạo |

---

## 3. Danh sách 20 Học sinh / Sinh viên (STUDENT)
*Quyền hạn: Xem danh sách lớp đã ghi danh, học bài (xem video, đọc PDF), đánh dấu hoàn thành, làm bài tập.*

| STT | Họ và tên | Email đăng nhập | Mật khẩu | Vai trò |
|:---:|:---|:---|:---:|:---:|
| 1 | Nguyễn Hoàng Anh | `hs.anh@lms.com` | `123456` | Học sinh |
| 2 | Trần Bảo Bình | `hs.binh@lms.com` | `123456` | Học sinh |
| 3 | Lê Minh Cường | `hs.cuong@lms.com` | `123456` | Học sinh |
| 4 | Phạm Tiến Dũng | `hs.dung@lms.com` | `123456` | Học sinh |
| 5 | Hoàng Nhật Duy | `hs.duy@lms.com` | `123456` | Học sinh |
| 6 | Đặng Mỹ Duyên | `hs.duyen@lms.com` | `123456` | Học sinh |
| 7 | Bùi Thu Hà | `hs.ha@lms.com` | `123456` | Học sinh |
| 8 | Vũ Quốc Huy | `hs.huy@lms.com` | `123456` | Học sinh |
| 9 | Đỗ Gia Khánh | `hs.khanh@lms.com` | `123456` | Học sinh |
| 10 | Ngô Quang Khải | `hs.khai@lms.com` | `123456` | Học sinh |
| 11 | Dương Bích Loan | `hs.loan@lms.com` | `123456` | Học sinh |
| 12 | Lý Hồng Nhung | `hs.nhung@lms.com` | `123456` | Học sinh |
| 13 | Mai Thành Phong | `hs.phong@lms.com` | `123456` | Học sinh |
| 14 | Phan Quỳnh Phương | `hs.phuong@lms.com` | `123456` | Học sinh |
| 15 | Trịnh Minh Quân | `hs.quan@lms.com` | `123456` | Học sinh |
| 16 | Đoàn Thanh Sơn | `hs.son@lms.com` | `123456` | Học sinh |
| 17 | Cao Anh Thái | `hs.thai@lms.com` | `123456` | Học sinh |
| 18 | Đinh Thị Trang | `hs.trang@lms.com` | `123456` | Học sinh |
| 19 | Hồ Anh Tú | `hs.tu@lms.com` | `123456` | Học sinh |
| 20 | Võ Hải Yến | `hs.yen@lms.com` | `123456` | Học sinh |

---

## 4. Hướng dẫn sử dụng nhanh
1. Mở trình duyệt truy cập: **`http://localhost:5173/login`**
2. Đăng nhập bằng bất kỳ tài khoản nào ở trên.
3. Hệ thống sẽ tự động chuyển hướng đúng theo vai trò:
   - **ADMIN**: `/admin/users`
   - **INSTRUCTOR**: `/instructor/courses`
   - **STUDENT**: `/student/classes`
