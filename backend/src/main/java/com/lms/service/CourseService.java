package com.lms.service;

import com.lms.common.PageResponse;
import com.lms.common.enums.CourseStatus;
import com.lms.dto.request.CourseRequest;
import com.lms.dto.response.CourseResponse;
import org.springframework.data.domain.Pageable;

public interface CourseService {

    PageResponse<CourseResponse> getCourses(Long instructorId, Long categoryId, CourseStatus status, Pageable pageable);

    CourseResponse createCourse(CourseRequest request, String instructorEmail);

    CourseResponse updateCourse(Long id, CourseRequest request, String instructorEmail);

    CourseResponse publishCourse(Long id, String instructorEmail);

    CourseResponse cloneCourse(Long id, com.lms.dto.request.CloneCourseRequest request, String currentUserEmail);

    void deleteCourse(Long id, String currentUserEmail);
}
