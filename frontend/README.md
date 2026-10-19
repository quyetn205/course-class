# 🎨 EduCore LMS - Frontend Client

<p align="center">
  <strong>Giao diện Người dùng Quản trị & Học tập Trực tuyến Chuẩn Doanh nghiệp</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=reactquery" alt="TanStack Query v5" />
  <img src="https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=reactrouter" alt="React Router v7" />
</p>

---

## 📌 Giới thiệu (Overview)

Ứng dụng Frontend của **EduCore LMS** cung cấp trải nghiệm hiện đại, mượt mà và trực quan cho 3 nhóm người dùng chính: **Admin**, **Giảng viên (Instructor)** và **Học viên (Student)**. 

Được thiết kế lấy cảm hứng từ các nền tảng hàng đầu như **Coursera** và **Udemy**, hệ thống cung cấp một **Không gian học tập toàn màn hình (Distraction-Free Learning Workspace)** tích hợp xem video bài giảng, đọc tài liệu PDF trực tiếp, làm bài trắc nghiệm tính điểm tự động và nộp bài tập thực hành.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

| Thành phần | Thư viện / Công nghệ | Vai trò & Mục đích |
| :--- | :--- | :--- |
| **Framework** | **React 19** | Thư viện UI hiện đại với hiệu năng rendering tối ưu |
| **Build Tool** | **Vite 8** | Bundler siêu tốc với Hot Module Replacement (HMR) tức thì |
| **Language** | **TypeScript 5.8** | Định kiểu tĩnh 100% Request DTO, Response DTO và State |
| **CSS & Styling** | **Tailwind CSS 4.0** | Engine CSS thế hệ mới tích hợp trực tiếp qua `@tailwindcss/vite` |
| **Server State** | **TanStack Query v5** | Caching, deduplication, auto-invalidation và background refetching |
| **Routing** | **React Router v7** | Quản lý định tuyến và bảo vệ phân quyền trang theo vai trò (RBAC) |
| **Icons** | **Lucide React** | Bộ icon hiện đại, tối giản, đồng bộ |
| **Form & Validation**| **React Hook Form + Zod** | Xử lý form mượt mà và thẩm định dữ liệu chặt chẽ |
| **HTTP Client** | **Axios** | Interceptor tự động gắn Bearer Token và điều hướng lỗi 401 |
| **Notification** | **React Hot Toast** | Thông báo phản hồi thao tác đẹp mắt và thân thiện |
| **Code Quality** | **Oxlint** | Công cụ kiểm tra cú pháp và chất lượng mã nguồn siêu tốc |

---

## 🌟 Tính năng chính theo phân hệ (Features by Role)

### 1. 🛡️ Quản trị viên (Admin Portal)
- **Thống kê tổng quan:** Theo dõi số lượng người dùng, tỷ lệ hoạt động, khóa học, lớp học và phân bố theo danh mục đào tạo.
- **Quản lý tài khoản (Users):** Tìm kiếm, lọc theo vai trò (Admin, Instructor, Student), lọc theo trạng thái (Active, Locked), tạo tài khoản mới, cập nhật thông tin và đặt lại mật khẩu.
- **Quản lý danh mục (Categories):** Thêm, sửa, xóa danh mục khóa học để phân loại chương trình đào tạo.

### 2. 👨‍🏫 Giảng viên (Instructor Portal)
- **Quản lý Khóa học:**
  - Tạo mới và cập nhật khóa học, chương học (Chapter) và bài học (Lesson).
  - **Nhân bản khóa học (1-Click Clone):** Sao chép toàn bộ cây chương, bài học, quiz và bài tập sang bản nháp mới chỉ với 1 thao tác.
  - Xuất bản khóa học (`DRAFT` → `PUBLISHED`) khi đã sẵn sàng đào tạo.
- **Hỗ trợ đa định dạng bài giảng:**
  - Nhúng video bài giảng (YouTube hoặc file video trực tiếp).
  - Tải lên tài liệu PDF với trình đọc PDF nhúng toàn màn hình.
  - Soạn thảo ghi chú lý thuyết định dạng phong phú.
- **Bài tập & Chấm điểm (Assignments):**
  - Đặt hạn nộp bài (Deadline) và thang điểm tối đa.
  - Tải file bài làm của sinh viên, chấm điểm và nhận xét chi tiết.
- **Ngân hàng trắc nghiệm (Quiz Engine):**
  - Tạo đề kiểm tra theo từng bài học, thêm câu hỏi và các phương án lựa chọn.
  - Xem danh sách kết quả làm bài, phổ điểm và chi tiết bài làm của từng sinh viên.
- **Quản lý Lớp học & Sổ điểm tổng hợp (Classroom & Gradebook):**
  - Mở lớp học theo khóa học đã xuất bản, quản lý sĩ số và trạng thái lớp.
  - Thêm / xóa học viên vào lớp theo quy tắc kiểm tra 4 bước an toàn.
  - **Sổ điểm lớp học tổng hợp (Class Gradebook):** Theo dõi tiến độ học tập, điểm Quiz, điểm Assignment và điểm trung bình của toàn bộ học viên trong lớp theo dạng bảng lưới trực quan.

### 3. 🎓 Học viên (Student Portal)
- **Dashboard học tập cá nhân:**
  - Thẻ **"Tiếp tục bài học"** thông minh giúp học viên ngay lập tức quay lại bài đang học dở.
  - Danh sách bài tập sắp đến hạn nộp (Upcoming Deadlines) được ưu tiên sắp xếp theo thời gian.
  - Bảng điểm và phản hồi nhận xét gần nhất từ giảng viên.
- **Không gian học tập chuyên biệt (Learning Workspace):**
  - Giao diện không phân tâm chuẩn Coursera / Udemy.
  - Tích hợp 3 thẻ làm việc tại một nơi: **Nội dung bài học**, **Bài thi trắc nghiệm (Quiz)** và **Nộp bài tập (Assignment)**.
  - Ngăn kéo bài học (Curriculum Drawer) mở/đóng linh hoạt giúp dễ dàng chuyển bài.
  - Cơ chế khóa bài học tuần tự: Học viên phải hoàn thành bài trước để mở khóa bài tiếp theo.
- **Làm bài Quiz & Xem lại đáp án:**
  - Làm bài trắc nghiệm với giao diện chọn phương án trực quan.
  - Tự động nộp bài và nhận kết quả điểm số tức thì.
  - Xem lại chi tiết từng câu hỏi đúng/sai kèm đáp án chuẩn xác.
- **Bảng điểm cá nhân (My Grades):** Xem điểm chi tiết tất cả bài kiểm tra và bài tập nộp file của chính mình trong lớp học.

---

## 📂 Cấu trúc thư mục (Project Structure)

```text
frontend/
├── index.html                   # HTML Entry point
├── package.json                 # Dependencies & Scripts
├── tsconfig.json                # TypeScript root configuration
├── tsconfig.app.json            # TypeScript frontend app rules
├── vite.config.ts               # Cấu hình Vite & Proxy /uploads
├── src/
│   ├── main.tsx                 # React DOM root entry
│   ├── index.css                # Tailwind CSS 4 directives & global styles
│   ├── router.tsx               # Cấu hình React Router & ProtectedRoute RBAC
│   │
│   ├── api/                     # Các module gọi API qua Axios Client
│   │   ├── axiosClient.ts       # Axios instance (base URL, interceptor Bearer JWT, error handler)
│   │   ├── authApi.ts           # Đăng nhập & xác thực
│   │   ├── courseApi.ts         # Khóa học, chương, bài học, nhân bản khóa học
│   │   ├── classroomApi.ts      # Lớp học, ghi danh học viên, trạng thái lớp
│   │   ├── gradebookApi.ts      # Sổ điểm tổng hợp & bảng điểm cá nhân
│   │   ├── assignmentApi.ts     # Bài tập, nộp bài, chấm điểm
│   │   ├── quizApi.ts           # Quiz, câu hỏi, làm bài, xem đáp án
│   │   ├── studentApi.ts        # Dashboard học viên, danh sách lớp, hoàn thành bài
│   │   ├── instructorApi.ts     # Dashboard giảng viên
│   │   ├── adminApi.ts          # Dashboard quản trị viên
│   │   ├── userApi.ts           # Quản lý tài khoản, hồ sơ, đổi mật khẩu
│   │   ├── categoryApi.ts       # Danh mục khóa học
│   │   └── fileApi.ts           # Upload & xóa tài liệu/media
│   │
│   ├── types/                   # Định kiểu TypeScript khớp 1-1 với backend DTOs
│   │   ├── auth.ts              # LoginRequest, LoginResponse
│   │   ├── common.ts            # ApiResponse<T>, PageResponse<T>
│   │   ├── user.ts              # UserResponse, Create/UpdateUserRequest...
│   │   ├── course.ts            # CourseResponse, ChapterResponse, LessonResponse...
│   │   ├── classroom.ts         # ClassroomResponse, EnrollmentResponse...
│   │   ├── assignment.ts        # AssignmentResponse, SubmissionResponse...
│   │   ├── quiz.ts              # QuizResponse, QuestionResponse, QuizAttemptResponse...
│   │   ├── gradebook.ts         # ClassGradebookResponse, StudentGradebookResponse...
│   │   ├── student.ts           # StudentDashboardResponse, ResumeLessonDto...
│   │   ├── instructor.ts        # InstructorDashboardResponse...
│   │   ├── admin.ts             # AdminDashboardResponse...
│   │   └── file.ts              # FileUploadResponse
│   │
│   ├── hooks/                   # Custom Hooks bọc TanStack Query
│   │   ├── useCourseHooks.ts    # useCourses, useCreateCourse, useCloneCourse...
│   │   ├── useClassroomHooks.ts # useClassrooms, useAddStudent, useClassGradebook...
│   │   ├── useAssignmentHooks.ts# useLessonAssignment, useSubmitAssignment, useGradeSubmission...
│   │   ├── useQuizHooks.ts      # useLessonQuiz, useSubmitQuizAttempt, useAttemptDetail...
│   │   ├── useStudentHooks.ts   # useStudentDashboard, useMyClasses, useCompleteLesson...
│   │   └── useUserHooks.ts      # useUsers, useProfile, useUpdateStatus...
│   │
│   ├── contexts/                # React Contexts
│   │   └── AuthContext.tsx      # Quản lý trạng thái đăng nhập, user profile, logout
│   │
│   ├── components/              # Thành phần giao diện tái sử dụng
│   │   ├── common/              # LoadingSpinner, EmptyState, VideoPlayer, PdfViewer...
│   │   ├── layout/              # Navbar, Sidebar, DashboardLayout, UserMenu
│   │   ├── ui/                  # Button, Card, Badge, Modal, Input, Select, Tabs...
│   │   ├── student/             # StudentQuizView, StudentAssignmentView, StudentGradebookView...
│   │   └── instructor/          # ClassGradebookView, QuizManager, SubmissionGrader...
│   │
│   └── pages/                   # Các trang ứng dụng
│       ├── admin/               # AdminDashboard, UserManagement, CategoryManagement
│       ├── instructor/          # InstructorDashboard, CourseManagement, ClassManagement
│       ├── student/             # StudentDashboard, MyClasses, CourseProgress, LessonWorkspace
│       └── common/              # Login, Profile, NotFound
```

---

## 🛠️ Hướng dẫn cài đặt & Khởi chạy (Getting Started)

### 1. Yêu cầu môi trường
* **Node.js:** Phiên bản `18.x` hoặc `20.x` trở lên
* **npm:** Đi kèm với Node.js

### 2. Cài đặt các thư viện phụ thuộc
Tại thư mục `frontend/`, chạy lệnh:
```bash
npm install
```

### 3. Cấu hình biến môi trường (Environment Variables)
Mặc định ứng dụng kết nối tới Backend tại `http://localhost:8080`. Nếu cần tùy chỉnh, bạn có thể tạo file `.env` tại thư mục `frontend/`:
```env
VITE_API_URL=http://localhost:8080
```

> **Lưu ý về xem tài liệu PDF & Video:** Trong `vite.config.ts`, frontend đã được cấu hình sẵn Reverse Proxy cho đường dẫn `/uploads` sang `http://localhost:8080`. Do đó các tài liệu xem trực tiếp qua cùng Origin không bị chặn bởi chính sách CORS của trình duyệt.

### 4. Khởi chạy môi trường phát triển (Development)
```bash
npm run dev
```
Giao diện sẽ chạy tại: **`http://localhost:5173`**

### 5. Kiểm tra mã nguồn (Linting)
```bash
npm run lint
```

### 6. Đóng gói cho Production (Build)
```bash
npm run build
```
Thư mục `dist/` sẽ được tạo ra với các file HTML, CSS và JavaScript đã được nén tối ưu.

Để xem thử bản build cục bộ:
```bash
npm run preview
```

---

## 🔐 Đăng nhập thử nghiệm (Demo Logins)

| Vai trò | Email | Mật khẩu | Trang bắt đầu |
| :--- | :--- | :---: | :--- |
| **Quản trị viên (Admin)** | `admin@lms.com` | `admin123` | `/admin/dashboard` |
| **Giảng viên (Instructor)** | `gv.hung@lms.com` | `123456` | `/instructor/dashboard` |
| **Giảng viên (Instructor)** | `gv.mai@lms.com` | `123456` | `/instructor/dashboard` |
| **Học sinh (Student)** | `hs.anh@lms.com` | `123456` | `/student/dashboard` |
| **Học sinh (Student)** | `hs.binh@lms.com` | `123456` | `/student/dashboard` |

*(Xem thêm danh sách đầy đủ 25 tài khoản tại file [DANH_SACH_TAI_KHOAN.md](../DANH_SACH_TAI_KHOAN.md))*
