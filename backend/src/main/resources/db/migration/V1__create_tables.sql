-- =============================================================
-- V1: Tạo đủ 14 bảng cho hệ thống LMS (Course–Class Model)
-- =============================================================

-- 1. users
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        VARCHAR(20)     NOT NULL CHECK (role IN ('ADMIN', 'INSTRUCTOR', 'STUDENT')),
    status      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LOCKED')),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 2. category
CREATE TABLE category (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    description TEXT
);

-- 3. course
CREATE TABLE course (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
    goal            TEXT,
    category_id     BIGINT          NOT NULL REFERENCES category(id),
    instructor_id   BIGINT          NOT NULL REFERENCES users(id),
    status          VARCHAR(20)     NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 4. chapter
CREATE TABLE chapter (
    id          BIGSERIAL PRIMARY KEY,
    course_id   BIGINT          NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    title       VARCHAR(255)    NOT NULL,
    order_no    INT             NOT NULL
);

-- 5. lesson
CREATE TABLE lesson (
    id          BIGSERIAL PRIMARY KEY,
    chapter_id  BIGINT          NOT NULL REFERENCES chapter(id) ON DELETE CASCADE,
    title       VARCHAR(255)    NOT NULL,
    content     TEXT,
    order_no    INT             NOT NULL,
    locked      BOOLEAN         NOT NULL DEFAULT TRUE
);

-- 6. classroom
CREATE TABLE classroom (
    id              BIGSERIAL PRIMARY KEY,
    course_id       BIGINT          NOT NULL REFERENCES course(id),
    instructor_id   BIGINT          NOT NULL REFERENCES users(id),
    name            VARCHAR(255)    NOT NULL,
    start_date      DATE,
    end_date        DATE,
    max_students    INT             NOT NULL DEFAULT 30,
    status          VARCHAR(20)     NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'CLOSED'))
);

-- 7. class_enrollment
CREATE TABLE class_enrollment (
    id              BIGSERIAL PRIMARY KEY,
    class_id        BIGINT      NOT NULL REFERENCES classroom(id) ON DELETE CASCADE,
    student_id      BIGINT      NOT NULL REFERENCES users(id),
    enrolled_date   TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (class_id, student_id)
);

-- 8. quiz
CREATE TABLE quiz (
    id          BIGSERIAL PRIMARY KEY,
    lesson_id   BIGINT          NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
    title       VARCHAR(255)    NOT NULL
);

-- 9. question
CREATE TABLE question (
    id          BIGSERIAL PRIMARY KEY,
    quiz_id     BIGINT          NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
    content     TEXT            NOT NULL
);

-- 10. option
CREATE TABLE option (
    id              BIGSERIAL PRIMARY KEY,
    question_id     BIGINT          NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    content         TEXT            NOT NULL,
    is_correct      BOOLEAN         NOT NULL DEFAULT FALSE
);

-- 11. quiz_attempt
CREATE TABLE quiz_attempt (
    id              BIGSERIAL PRIMARY KEY,
    quiz_id         BIGINT          NOT NULL REFERENCES quiz(id),
    student_id      BIGINT          NOT NULL REFERENCES users(id),
    score           DOUBLE PRECISION,
    submitted_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 12. assignment
CREATE TABLE assignment (
    id          BIGSERIAL PRIMARY KEY,
    lesson_id   BIGINT          NOT NULL REFERENCES lesson(id) ON DELETE CASCADE,
    title       VARCHAR(255)    NOT NULL,
    deadline    TIMESTAMP,
    max_score   DOUBLE PRECISION
);

-- 13. submission
CREATE TABLE submission (
    id              BIGSERIAL PRIMARY KEY,
    assignment_id   BIGINT          NOT NULL REFERENCES assignment(id),
    student_id      BIGINT          NOT NULL REFERENCES users(id),
    file            VARCHAR(500),
    status          VARCHAR(20)     NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'GRADED')),
    score           DOUBLE PRECISION,
    comment         TEXT
);

-- 14. lesson_progress
CREATE TABLE lesson_progress (
    id              BIGSERIAL PRIMARY KEY,
    lesson_id       BIGINT          NOT NULL REFERENCES lesson(id),
    student_id      BIGINT          NOT NULL REFERENCES users(id),
    status          VARCHAR(20)     NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
    completed_at    TIMESTAMP,
    UNIQUE (lesson_id, student_id)
);

-- Indexes for performance
CREATE INDEX idx_course_category ON course(category_id);
CREATE INDEX idx_course_instructor ON course(instructor_id);
CREATE INDEX idx_chapter_course ON chapter(course_id);
CREATE INDEX idx_lesson_chapter ON lesson(chapter_id);
CREATE INDEX idx_classroom_course ON classroom(course_id);
CREATE INDEX idx_enrollment_class ON class_enrollment(class_id);
CREATE INDEX idx_enrollment_student ON class_enrollment(student_id);
CREATE INDEX idx_quiz_lesson ON quiz(lesson_id);
CREATE INDEX idx_question_quiz ON question(quiz_id);
CREATE INDEX idx_option_question ON option(question_id);
CREATE INDEX idx_attempt_quiz ON quiz_attempt(quiz_id);
CREATE INDEX idx_attempt_student ON quiz_attempt(student_id);
CREATE INDEX idx_assignment_lesson ON assignment(lesson_id);
CREATE INDEX idx_submission_assignment ON submission(assignment_id);
CREATE INDEX idx_submission_student ON submission(student_id);
CREATE INDEX idx_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_progress_student ON lesson_progress(student_id);
