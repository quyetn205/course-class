-- V4: Add thumbnail_url, level, prerequisites to course table, and video_url, duration to lesson table
ALTER TABLE course
ADD COLUMN thumbnail_url VARCHAR(1000),
ADD COLUMN level VARCHAR(50) DEFAULT 'ALL_LEVELS',
ADD COLUMN prerequisites TEXT;

ALTER TABLE lesson
ADD COLUMN video_url VARCHAR(1000),
ADD COLUMN duration INT;
