package com.lms.service;

import com.lms.common.PageResponse;
import com.lms.common.enums.ClassroomStatus;
import com.lms.dto.request.AddStudentRequest;
import com.lms.dto.request.ClassroomRequest;
import com.lms.dto.request.UpdateClassroomRequest;
import com.lms.dto.response.ClassGradebookResponse;
import com.lms.dto.response.ClassroomResponse;
import com.lms.dto.response.EnrollmentResponse;
import com.lms.dto.response.StudentGradebookResponse;
import org.springframework.data.domain.Pageable;

public interface ClassroomService {

    ClassroomResponse createClassroom(ClassroomRequest request, String instructorEmail);

    ClassroomResponse getClassroom(Long id);

    PageResponse<ClassroomResponse> getClassrooms(
            Long instructorId, Long courseId, ClassroomStatus status, String search,
            Pageable pageable, String currentUserEmail);

    ClassroomResponse updateClassroom(Long id, UpdateClassroomRequest request, String currentUserEmail);

    ClassroomResponse updateClassroomStatus(Long id, ClassroomStatus status, String currentUserEmail);

    void deleteClassroom(Long id, String currentUserEmail);

    EnrollmentResponse addStudent(Long classId, AddStudentRequest request, String currentUserEmail);

    void removeStudent(Long classId, Long studentId, String currentUserEmail);

    PageResponse<EnrollmentResponse> getStudents(Long classId, Pageable pageable);

    ClassGradebookResponse getClassGradebook(Long classId, String currentUserEmail);

    StudentGradebookResponse getStudentGradebook(Long classId, String studentEmail);
}
