package com.lms.service;

import com.lms.dto.response.ClassroomResponse;
import com.lms.dto.response.LessonProgressResponse;

import java.util.List;

public interface StudentService {

    List<ClassroomResponse> getMyClasses(String studentEmail);

    List<LessonProgressResponse> getCourseProgress(Long courseId, String studentEmail);

    LessonProgressResponse completeLesson(Long lessonId, String studentEmail);

    com.lms.dto.response.StudentDashboardResponse getStudentDashboard(String studentEmail);
}
