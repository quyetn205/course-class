package com.lms.service;

import com.lms.common.PageResponse;
import com.lms.dto.request.AssignmentRequest;
import com.lms.dto.request.GradeSubmissionRequest;
import com.lms.dto.request.SubmissionRequest;
import com.lms.dto.response.AssignmentResponse;
import com.lms.dto.response.SubmissionResponse;
import org.springframework.data.domain.Pageable;

public interface AssignmentService {

    AssignmentResponse createAssignment(Long lessonId, AssignmentRequest request, String currentUserEmail);

    AssignmentResponse getAssignmentByLessonId(Long lessonId, String currentUserEmail);

    void deleteAssignment(Long assignmentId, String currentUserEmail);

    PageResponse<SubmissionResponse> getSubmissions(Long assignmentId, Pageable pageable, String currentUserEmail);

    SubmissionResponse submitAssignment(Long assignmentId, SubmissionRequest request, String studentEmail);

    SubmissionResponse getMySubmission(Long assignmentId, String studentEmail);

    SubmissionResponse gradeSubmission(Long submissionId, GradeSubmissionRequest request, String currentUserEmail);
}
