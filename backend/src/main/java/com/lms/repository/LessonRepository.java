package com.lms.repository;

import com.lms.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByChapterIdOrderByOrderNoAsc(Long chapterId);

    @Query("SELECT l FROM Lesson l JOIN l.chapter c WHERE c.course.id = :courseId ORDER BY c.orderNo ASC, l.orderNo ASC")
    List<Lesson> findAllByCourseIdOrdered(@Param("courseId") Long courseId);

    @Query("SELECT l FROM Lesson l JOIN l.chapter c WHERE c.course.id = :courseId AND " +
           "((c.orderNo < :chapterOrder) OR (c.orderNo = :chapterOrder AND l.orderNo < :lessonOrder)) " +
           "ORDER BY c.orderNo DESC, l.orderNo DESC")
    List<Lesson> findPreviousLessons(@Param("courseId") Long courseId,
                                     @Param("chapterOrder") Integer chapterOrder,
                                     @Param("lessonOrder") Integer lessonOrder);
}
