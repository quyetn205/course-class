package com.lms.repository;

import com.lms.common.enums.CourseStatus;
import com.lms.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query(value = "SELECT c FROM Course c " +
           "JOIN FETCH c.category " +
           "JOIN FETCH c.instructor " +
           "WHERE (:instructorId IS NULL OR c.instructor.id = :instructorId) AND " +
           "(:categoryId IS NULL OR c.category.id = :categoryId) AND " +
           "(:status IS NULL OR c.status = :status)",
           countQuery = "SELECT count(c) FROM Course c " +
           "WHERE (:instructorId IS NULL OR c.instructor.id = :instructorId) AND " +
           "(:categoryId IS NULL OR c.category.id = :categoryId) AND " +
           "(:status IS NULL OR c.status = :status)")
    Page<Course> findByFilters(@Param("instructorId") Long instructorId,
                               @Param("categoryId") Long categoryId,
                               @Param("status") CourseStatus status,
                               Pageable pageable);

    long countByStatus(CourseStatus status);

    long countByInstructorId(Long instructorId);

    long countByInstructorIdAndStatus(Long instructorId, CourseStatus status);

    boolean existsByCategoryId(Long categoryId);

    java.util.List<Course> findTop5ByOrderByCreatedAtDesc();

    java.util.List<Course> findTop5ByInstructorIdOrderByCreatedAtDesc(Long instructorId);
}
