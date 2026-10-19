package com.lms.repository;

import com.lms.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    Optional<Assignment> findByLessonId(Long lessonId);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Assignment a WHERE a.lesson.chapter.course.id = :courseId ORDER BY a.lesson.chapter.orderNo ASC, a.lesson.orderNo ASC")
    java.util.List<Assignment> findByCourseId(@org.springframework.data.repository.query.Param("courseId") Long courseId);
}
