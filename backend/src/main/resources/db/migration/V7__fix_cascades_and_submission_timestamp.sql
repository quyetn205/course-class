-- V7: Sửa các khóa ngoại thiếu ON DELETE CASCADE và bổ sung trường submitted_at cho submission

-- 1. lesson_progress: Thêm ON DELETE CASCADE khi lesson hoặc student bị xóa
ALTER TABLE lesson_progress DROP CONSTRAINT IF EXISTS lesson_progress_lesson_id_fkey;
ALTER TABLE lesson_progress ADD CONSTRAINT lesson_progress_lesson_id_fkey 
    FOREIGN KEY (lesson_id) REFERENCES lesson(id) ON DELETE CASCADE;

ALTER TABLE lesson_progress DROP CONSTRAINT IF EXISTS lesson_progress_student_id_fkey;
ALTER TABLE lesson_progress ADD CONSTRAINT lesson_progress_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

-- 2. quiz_attempt: Thêm ON DELETE CASCADE khi quiz hoặc student bị xóa
ALTER TABLE quiz_attempt DROP CONSTRAINT IF EXISTS quiz_attempt_quiz_id_fkey;
ALTER TABLE quiz_attempt ADD CONSTRAINT quiz_attempt_quiz_id_fkey 
    FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE;

ALTER TABLE quiz_attempt DROP CONSTRAINT IF EXISTS quiz_attempt_student_id_fkey;
ALTER TABLE quiz_attempt ADD CONSTRAINT quiz_attempt_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. submission: Thêm ON DELETE CASCADE khi assignment hoặc student bị xóa
ALTER TABLE submission DROP CONSTRAINT IF EXISTS submission_assignment_id_fkey;
ALTER TABLE submission ADD CONSTRAINT submission_assignment_id_fkey 
    FOREIGN KEY (assignment_id) REFERENCES assignment(id) ON DELETE CASCADE;

ALTER TABLE submission DROP CONSTRAINT IF EXISTS submission_student_id_fkey;
ALTER TABLE submission ADD CONSTRAINT submission_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. submission: Bổ sung cột thời gian nộp bài submitted_at
ALTER TABLE submission ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP NOT NULL DEFAULT NOW();
