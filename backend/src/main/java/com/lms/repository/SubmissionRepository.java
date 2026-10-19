package com.lms.repository;

import com.lms.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    Page<Submission> findByAssignmentId(Long assignmentId, Pageable pageable);

    java.util.Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    java.util.List<Submission> findByStudentIdOrderBySubmittedAtDesc(Long studentId, Pageable pageable);

    long countByStudentId(Long studentId);

    void deleteByAssignmentId(Long assignmentId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(s) FROM Submission s " +
        "WHERE s.assignment.lesson.chapter.course.instructor.id = :instructorId AND s.status = 'SUBMITTED'"
    )
    long countPendingByInstructorId(@org.springframework.data.repository.query.Param("instructorId") Long instructorId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(s) FROM Submission s " +
        "WHERE s.assignment.lesson.chapter.course.instructor.id = :instructorId"
    )
    long countTotalByInstructorId(@org.springframework.data.repository.query.Param("instructorId") Long instructorId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT s FROM Submission s " +
        "JOIN FETCH s.assignment a " +
        "JOIN FETCH a.lesson l " +
        "JOIN FETCH l.chapter ch " +
        "JOIN FETCH ch.course c " +
        "JOIN FETCH s.student st " +
        "WHERE c.instructor.id = :instructorId " +
        "ORDER BY s.submittedAt DESC"
    )
    java.util.List<Submission> findRecentSubmissionsByInstructorId(
        @org.springframework.data.repository.query.Param("instructorId") Long instructorId,
        Pageable pageable
    );
}
