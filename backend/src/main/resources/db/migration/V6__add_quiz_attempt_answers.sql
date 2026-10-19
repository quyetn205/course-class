-- V6: Lưu thông tin chi tiết bài làm quiz và câu trả lời của học viên
ALTER TABLE quiz_attempt ADD COLUMN IF NOT EXISTS total_questions INTEGER;
ALTER TABLE quiz_attempt ADD COLUMN IF NOT EXISTS correct_count INTEGER;

CREATE TABLE IF NOT EXISTS quiz_attempt_answer (
    id                  BIGSERIAL PRIMARY KEY,
    attempt_id          BIGINT NOT NULL REFERENCES quiz_attempt(id) ON DELETE CASCADE,
    question_id         BIGINT NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    selected_option_id  BIGINT REFERENCES option(id) ON DELETE SET NULL,
    is_correct          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_attempt_answer_attempt ON quiz_attempt_answer(attempt_id);
