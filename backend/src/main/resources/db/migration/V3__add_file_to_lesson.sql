-- V3: Add lesson_type, file_url, file_name to lesson table
ALTER TABLE lesson
ADD COLUMN lesson_type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
ADD COLUMN file_url VARCHAR(1000),
ADD COLUMN file_name VARCHAR(255);
