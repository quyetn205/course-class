package com.lms.repository;

import com.lms.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByName(String name);

    @org.springframework.data.jpa.repository.Query("SELECT c.id, c.name, COUNT(co.id) FROM Category c " +
           "LEFT JOIN Course co ON co.category.id = c.id " +
           "GROUP BY c.id, c.name " +
           "ORDER BY COUNT(co.id) DESC")
    java.util.List<Object[]> getCategoryCourseCounts();
}
