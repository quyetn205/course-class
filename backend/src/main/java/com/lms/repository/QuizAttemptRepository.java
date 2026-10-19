package com.lms.repository;

import com.lms.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByQuizIdAndStudentId(Long quizId, Long studentId);

    List<QuizAttempt> findByQuizIdAndStudentIdOrderBySubmittedAtDesc(Long quizId, Long studentId);

    List<QuizAttempt> findByQuizIdOrderBySubmittedAtDesc(Long quizId);

    List<QuizAttempt> findByStudentIdOrderBySubmittedAtDesc(Long studentId, org.springframework.data.domain.Pageable pageable);

    long countByStudentId(Long studentId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(qa) FROM QuizAttempt qa " +
        "WHERE qa.quiz.lesson.chapter.course.instructor.id = :instructorId"
    )
    long countByInstructorId(@org.springframework.data.repository.query.Param("instructorId") Long instructorId);
}
