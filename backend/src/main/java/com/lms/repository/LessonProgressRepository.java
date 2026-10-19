package com.lms.repository;

import com.lms.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByLessonIdAndStudentId(Long lessonId, Long studentId);

    List<LessonProgress> findByStudentIdAndLessonChapterCourseId(Long studentId, Long courseId);

    List<LessonProgress> findByStudentIdAndStatusOrderByCompletedAtDesc(
        Long studentId,
        com.lms.common.enums.LessonProgressStatus status,
        org.springframework.data.domain.Pageable pageable
    );

    long countByStudentIdAndStatus(Long studentId, com.lms.common.enums.LessonProgressStatus status);
}
