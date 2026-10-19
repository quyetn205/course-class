package com.lms.repository;

import com.lms.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Optional<Quiz> findByLessonId(Long lessonId);

    @org.springframework.data.jpa.repository.Query("SELECT q FROM Quiz q WHERE q.lesson.chapter.course.id = :courseId ORDER BY q.lesson.chapter.orderNo ASC, q.lesson.orderNo ASC")
    java.util.List<Quiz> findByCourseId(@org.springframework.data.repository.query.Param("courseId") Long courseId);
}
