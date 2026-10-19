package com.lms.service;

import com.lms.dto.request.OptionRequest;
import com.lms.dto.request.QuestionRequest;
import com.lms.dto.request.QuizAttemptRequest;
import com.lms.dto.request.QuizRequest;
import com.lms.dto.response.OptionResponse;
import com.lms.dto.response.QuestionResponse;
import com.lms.dto.response.QuizAttemptResponse;
import com.lms.dto.response.QuizResponse;

public interface QuizService {

    QuizResponse createQuiz(Long lessonId, QuizRequest request, String currentUserEmail);

    QuestionResponse addQuestion(Long quizId, QuestionRequest request, String currentUserEmail);

    OptionResponse addOption(Long questionId, OptionRequest request, String currentUserEmail);

    QuizResponse getQuiz(Long quizId, String currentUserEmail);

    QuizResponse getQuizByLessonId(Long lessonId, String currentUserEmail);

    void deleteQuiz(Long quizId, String currentUserEmail);

    void deleteQuestion(Long questionId, String currentUserEmail);

    QuizAttemptResponse submitAttempt(Long quizId, QuizAttemptRequest request, String studentEmail);

    QuizAttemptResponse getLatestAttempt(Long quizId, String studentEmail);

    java.util.List<QuizAttemptResponse> getQuizAttempts(Long quizId, String instructorEmail);

    QuizAttemptResponse getAttemptDetail(Long attemptId, String currentUserEmail);
}
