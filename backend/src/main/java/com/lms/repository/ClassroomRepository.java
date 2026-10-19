package com.lms.repository;

import com.lms.common.enums.ClassroomStatus;
import com.lms.entity.Classroom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {

    @Query(value = "SELECT c FROM Classroom c " +
           "JOIN FETCH c.course " +
           "JOIN FETCH c.instructor " +
           "WHERE (:instructorId IS NULL OR c.instructor.id = :instructorId) AND " +
           "(:courseId IS NULL OR c.course.id = :courseId) AND " +
           "(:status IS NULL OR c.status = :status)",
           countQuery = "SELECT count(c) FROM Classroom c " +
           "WHERE (:instructorId IS NULL OR c.instructor.id = :instructorId) AND " +
           "(:courseId IS NULL OR c.course.id = :courseId) AND " +
           "(:status IS NULL OR c.status = :status)")
    Page<Classroom> findByFilters(
            @Param("instructorId") Long instructorId,
            @Param("courseId") Long courseId,
            @Param("status") ClassroomStatus status,
            Pageable pageable);

    @Query(value = "SELECT c FROM Classroom c " +
           "JOIN FETCH c.course " +
           "JOIN FETCH c.instructor " +
           "WHERE (:instructorId IS NULL OR c.instructor.id = :instructorId) AND " +
           "(:courseId IS NULL OR c.course.id = :courseId) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))",
           countQuery = "SELECT count(c) FROM Classroom c " +
           "WHERE (:instructorId IS NULL OR c.instructor.id = :instructorId) AND " +
           "(:courseId IS NULL OR c.course.id = :courseId) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Classroom> findByFiltersWithSearch(
            @Param("instructorId") Long instructorId,
            @Param("courseId") Long courseId,
            @Param("status") ClassroomStatus status,
            @Param("search") String search,
            Pageable pageable);

    long countByInstructorId(Long instructorId);

    long countByInstructorIdAndStatus(Long instructorId, ClassroomStatus status);

    boolean existsByCourseId(Long courseId);

    java.util.List<Classroom> findByInstructorIdOrderByIdDesc(Long instructorId);

    java.util.List<Classroom> findByInstructorIdOrderByCreatedAtDesc(Long instructorId);
}
