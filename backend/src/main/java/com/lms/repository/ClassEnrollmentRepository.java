package com.lms.repository;

import com.lms.entity.ClassEnrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassEnrollmentRepository extends JpaRepository<ClassEnrollment, Long> {

    boolean existsByClassroomIdAndStudentId(Long classroomId, Long studentId);

    Optional<ClassEnrollment> findByClassroomIdAndStudentId(Long classroomId, Long studentId);

    long countByClassroomId(Long classroomId);

    Page<ClassEnrollment> findByClassroomId(Long classroomId, Pageable pageable);

    List<ClassEnrollment> findAllByClassroomId(Long classroomId);

    List<ClassEnrollment> findByStudentId(Long studentId);

    @org.springframework.data.jpa.repository.Query("SELECT CASE WHEN COUNT(ce) > 0 THEN true ELSE false END FROM ClassEnrollment ce " +
           "WHERE ce.classroom.course.id = :courseId AND ce.student.id = :studentId")
    boolean isStudentEnrolledInCourse(@org.springframework.data.repository.query.Param("courseId") Long courseId,
                                      @org.springframework.data.repository.query.Param("studentId") Long studentId);

    @org.springframework.data.jpa.repository.Query("SELECT CASE WHEN COUNT(ce) > 0 THEN true ELSE false END FROM ClassEnrollment ce " +
           "WHERE ce.classroom.course.id = :courseId AND ce.student.id = :studentId " +
           "AND ce.classroom.status IN (com.lms.common.enums.ClassroomStatus.OPEN, com.lms.common.enums.ClassroomStatus.IN_PROGRESS)")
    boolean hasActiveEnrollmentInCourse(@org.springframework.data.repository.query.Param("courseId") Long courseId,
                                       @org.springframework.data.repository.query.Param("studentId") Long studentId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(DISTINCT ce.student.id) FROM ClassEnrollment ce " +
        "WHERE ce.classroom.instructor.id = :instructorId"
    )
    long countDistinctStudentsByInstructorId(@org.springframework.data.repository.query.Param("instructorId") Long instructorId);
}
