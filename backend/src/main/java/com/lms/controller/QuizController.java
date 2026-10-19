package com.lms.controller;

import com.lms.common.ApiResponse;
import com.lms.dto.request.OptionRequest;
import com.lms.dto.request.QuestionRequest;
import com.lms.dto.request.QuizAttemptRequest;
import com.lms.dto.request.QuizRequest;
import com.lms.dto.response.OptionResponse;
import com.lms.dto.response.QuestionResponse;
import com.lms.dto.response.QuizAttemptResponse;
import com.lms.dto.response.QuizResponse;
import com.lms.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Quiz", description = "Quản lý quiz & câu hỏi")
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/api/lessons/{lessonId}/quiz")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Tạo quiz cho bài học")
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(
            @PathVariable Long lessonId, @Valid @RequestBody QuizRequest request,
            Authentication auth) {
        QuizResponse response = quizService.createQuiz(lessonId, request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo quiz thành công", response));
    }

    @PostMapping("/api/quizzes/{quizId}/questions")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Thêm câu hỏi vào quiz")
    public ResponseEntity<ApiResponse<QuestionResponse>> addQuestion(
            @PathVariable Long quizId, @Valid @RequestBody QuestionRequest request,
            Authentication auth) {
        QuestionResponse response = quizService.addQuestion(quizId, request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm câu hỏi thành công", response));
    }

    @PostMapping("/api/questions/{questionId}/options")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Thêm lựa chọn vào câu hỏi")
    public ResponseEntity<ApiResponse<OptionResponse>> addOption(
            @PathVariable Long questionId, @Valid @RequestBody OptionRequest request,
            Authentication auth) {
        OptionResponse response = quizService.addOption(questionId, request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm lựa chọn thành công", response));
    }

    @GetMapping("/api/quizzes/{quizId}")
    @Operation(summary = "Xem quiz", description = "Lấy quiz kèm danh sách câu hỏi và lựa chọn")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuiz(@PathVariable Long quizId, Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        QuizResponse response = quizService.getQuiz(quizId, email);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/api/lessons/{lessonId}/quiz")
    @Operation(summary = "Xem quiz theo bài học")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuizByLessonId(@PathVariable Long lessonId, Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        QuizResponse response = quizService.getQuizByLessonId(lessonId, email);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/api/quizzes/{quizId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Xóa quiz")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(
            @PathVariable Long quizId, Authentication auth) {
        quizService.deleteQuiz(quizId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Xóa quiz thành công", null));
    }

    @DeleteMapping("/api/questions/{questionId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Xóa câu hỏi")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(
            @PathVariable Long questionId, Authentication auth) {
        quizService.deleteQuestion(questionId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Xóa câu hỏi thành công", null));
    }

    @PostMapping("/api/quizzes/{quizId}/attempts")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Nộp bài quiz", description = "Tự động chấm điểm dựa trên đáp án đúng")
    public ResponseEntity<ApiResponse<QuizAttemptResponse>> submitAttempt(
            @PathVariable Long quizId,
            @Valid @RequestBody QuizAttemptRequest request,
            Authentication auth) {
        QuizAttemptResponse response = quizService.submitAttempt(quizId, request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Nộp bài quiz thành công", response));
    }

    @GetMapping("/api/quizzes/{quizId}/my-attempt")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Lấy kết quả làm bài gần nhất của học sinh")
    public ResponseEntity<ApiResponse<QuizAttemptResponse>> getMyAttempt(
            @PathVariable Long quizId, Authentication auth) {
        QuizAttemptResponse response = quizService.getLatestAttempt(quizId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/api/quizzes/{quizId}/attempts")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Danh sách kết quả làm bài quiz của học viên", description = "Dành cho giảng viên xem thống kê và điểm số")
    public ResponseEntity<ApiResponse<java.util.List<QuizAttemptResponse>>> getQuizAttempts(
            @PathVariable Long quizId, Authentication auth) {
        java.util.List<QuizAttemptResponse> responses = quizService.getQuizAttempts(quizId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/api/attempts/{attemptId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Xem chi tiết bài làm quiz kèm đáp án đúng/sai", description = "Học sinh xem lại bài của mình, Giảng viên xem chi tiết bài của học sinh")
    public ResponseEntity<ApiResponse<QuizAttemptResponse>> getAttemptDetail(
            @PathVariable Long attemptId, Authentication auth) {
        QuizAttemptResponse response = quizService.getAttemptDetail(attemptId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
