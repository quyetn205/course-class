package com.lms.service.impl;

import com.lms.common.enums.CourseStatus;
import com.lms.common.enums.UserRole;
import com.lms.dto.request.OptionRequest;
import com.lms.dto.request.QuestionRequest;
import com.lms.dto.request.QuizAttemptRequest;
import com.lms.dto.request.QuizRequest;
import com.lms.dto.response.OptionResponse;
import com.lms.dto.response.QuestionResponse;
import com.lms.dto.response.QuizAttemptAnswerResponse;
import com.lms.dto.response.QuizAttemptResponse;
import com.lms.dto.response.QuizResponse;
import com.lms.entity.*;
import com.lms.exception.BusinessException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.*;
import com.lms.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAttemptAnswerRepository attemptAnswerRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final com.lms.security.CourseSecurityHelper courseSecurityHelper;
    private final ClassEnrollmentRepository enrollmentRepository;

    private void validateStudentAccess(Course course, String userEmail) {
        if (userEmail == null || userEmail.isBlank()) return;
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user != null && user.getRole() == UserRole.STUDENT) {
            if (course.getStatus() != CourseStatus.PUBLISHED) {
                throw new BusinessException("Khóa học chưa được xuất bản. Học viên chưa thể xem hoặc làm bài kiểm tra.");
            }
            if (!enrollmentRepository.isStudentEnrolledInCourse(course.getId(), user.getId())) {
                throw new BusinessException("Bạn chưa ghi danh vào lớp học nào thuộc khóa học này");
            }
        }
    }

    @Override
    @Transactional
    public QuizResponse createQuiz(Long lessonId, QuizRequest request, String currentUserEmail) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài học", lessonId));

        courseSecurityHelper.validateCourseAccess(lesson.getChapter().getCourse(), currentUserEmail, "tạo quiz cho");

        Quiz quiz = Quiz.builder()
                .lesson(lesson)
                .title(request.getTitle())
                .build();

        quiz = quizRepository.save(quiz);
        return toResponse(quiz);
    }

    @Override
    @Transactional
    public QuestionResponse addQuestion(Long quizId, QuestionRequest request, String currentUserEmail) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));

        courseSecurityHelper.validateCourseAccess(quiz.getLesson().getChapter().getCourse(), currentUserEmail, "thêm câu hỏi vào quiz của");

        Question question = Question.builder()
                .quiz(quiz)
                .content(request.getContent())
                .build();

        question = questionRepository.save(question);

        List<OptionResponse> optionResponses = new java.util.ArrayList<>();
        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            for (OptionRequest optReq : request.getOptions()) {
                Option option = Option.builder()
                        .question(question)
                        .content(optReq.getContent())
                        .isCorrect(optReq.getIsCorrect() != null ? optReq.getIsCorrect() : false)
                        .build();
                option = optionRepository.save(option);
                optionResponses.add(OptionResponse.builder()
                        .id(option.getId())
                        .content(option.getContent())
                        .isCorrect(option.getIsCorrect())
                        .build());
            }
        }

        return QuestionResponse.builder()
                .id(question.getId())
                .content(question.getContent())
                .options(optionResponses)
                .build();
    }

    @Override
    @Transactional
    public OptionResponse addOption(Long questionId, OptionRequest request, String currentUserEmail) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Câu hỏi", questionId));

        courseSecurityHelper.validateCourseAccess(question.getQuiz().getLesson().getChapter().getCourse(), currentUserEmail, "thêm lựa chọn vào quiz của");

        Option option = Option.builder()
                .question(question)
                .content(request.getContent())
                .isCorrect(request.getIsCorrect())
                .build();

        option = optionRepository.save(option);
        return OptionResponse.builder()
                .id(option.getId())
                .content(option.getContent())
                .isCorrect(option.getIsCorrect())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public QuizResponse getQuiz(Long quizId, String currentUserEmail) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));
        validateStudentAccess(quiz.getLesson().getChapter().getCourse(), currentUserEmail);
        return toResponse(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizResponse getQuizByLessonId(Long lessonId, String currentUserEmail) {
        Quiz quiz = quizRepository.findByLessonId(lessonId).orElse(null);
        if (quiz == null) return null;
        validateStudentAccess(quiz.getLesson().getChapter().getCourse(), currentUserEmail);
        return toResponse(quiz);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long quizId, String currentUserEmail) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));
        courseSecurityHelper.validateCourseAccess(quiz.getLesson().getChapter().getCourse(), currentUserEmail, "xóa quiz của");
        quizRepository.delete(quiz);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long questionId, String currentUserEmail) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Câu hỏi", questionId));
        courseSecurityHelper.validateCourseAccess(question.getQuiz().getLesson().getChapter().getCourse(), currentUserEmail, "xóa câu hỏi trong quiz của");
        questionRepository.delete(question);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizAttemptResponse getLatestAttempt(Long quizId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail).orElse(null);
        if (student == null) return null;

        Quiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz != null) {
            validateStudentAccess(quiz.getLesson().getChapter().getCourse(), studentEmail);
        }

        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndStudentIdOrderBySubmittedAtDesc(quizId, student.getId());
        if (attempts.isEmpty()) return null;
        QuizAttempt latest = attempts.get(0);
        return toAttemptResponse(latest, true);
    }

    @Override
    @Transactional
    public QuizAttemptResponse submitAttempt(Long quizId, QuizAttemptRequest request, String studentEmail) {
        // Rule 5.4: Quiz tự động chấm điểm
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));

        Course course = quiz.getLesson().getChapter().getCourse();
        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new BusinessException("Khóa học chưa được xuất bản. Học viên không thể làm bài kiểm tra.");
        }

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên"));

        if (!enrollmentRepository.hasActiveEnrollmentInCourse(course.getId(), student.getId())) {
            if (enrollmentRepository.isStudentEnrolledInCourse(course.getId(), student.getId())) {
                throw new BusinessException("Lớp học của bạn đối với khóa học này đã kết thúc (CLOSED). Không thể làm bài kiểm tra.");
            }
            throw new BusinessException("Bạn chưa ghi danh vào lớp học nào thuộc khóa học này");
        }

        List<Question> questions = questionRepository.findByQuizId(quizId);
        if (questions.isEmpty()) {
            throw new BusinessException("Quiz chưa có câu hỏi nào");
        }

        // Tạo map questionId → đáp án đúng (optionId)
        Map<Long, Long> correctAnswers = questions.stream()
                .collect(Collectors.toMap(
                        Question::getId,
                        q -> q.getOptions().stream()
                                .filter(Option::getIsCorrect)
                                .findFirst()
                                .map(Option::getId)
                                .orElse(-1L)
                ));

        // Bản đồ câu trả lời của học sinh: questionId -> selectedOptionId
        Map<Long, Long> studentSelectedOptions = request.getAnswers().stream()
                .filter(a -> a.getQuestionId() != null)
                .collect(Collectors.toMap(
                        QuizAttemptRequest.AnswerItem::getQuestionId,
                        a -> a.getSelectedOptionId() != null ? a.getSelectedOptionId() : -1L,
                        (existing, replacement) -> replacement
                ));

        // Chấm điểm: so khớp lựa chọn
        int totalQuestions = questions.size();
        long correctCount = questions.stream()
                .filter(q -> {
                    Long selected = studentSelectedOptions.get(q.getId());
                    Long correct = correctAnswers.get(q.getId());
                    return selected != null && selected.equals(correct);
                })
                .count();

        double score = (double) correctCount / totalQuestions * 10.0; // Thang điểm 10

        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .student(student)
                .score(Math.round(score * 100.0) / 100.0) // Làm tròn 2 chữ số
                .totalQuestions(totalQuestions)
                .correctCount((int) correctCount)
                .build();

        attempt = quizAttemptRepository.save(attempt);

        // Lưu chi tiết từng câu trả lời vào quiz_attempt_answer
        List<QuizAttemptAnswer> attemptAnswers = new ArrayList<>();
        for (Question q : questions) {
            Long selectedOptId = studentSelectedOptions.get(q.getId());
            Option selectedOpt = null;
            if (selectedOptId != null && selectedOptId > 0) {
                selectedOpt = optionRepository.findById(selectedOptId).orElse(null);
            }
            Long correctOptId = correctAnswers.get(q.getId());
            boolean isCorrect = selectedOptId != null && selectedOptId.equals(correctOptId);

            QuizAttemptAnswer attemptAnswer = QuizAttemptAnswer.builder()
                    .attempt(attempt)
                    .question(q)
                    .selectedOption(selectedOpt)
                    .isCorrect(isCorrect)
                    .build();
            attemptAnswers.add(attemptAnswer);
        }
        attemptAnswerRepository.saveAll(attemptAnswers);

        return toAttemptResponse(attempt, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getQuizAttempts(Long quizId, String instructorEmail) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));

        courseSecurityHelper.validateCourseAccess(
                quiz.getLesson().getChapter().getCourse(),
                instructorEmail,
                "xem kết quả quiz của"
        );

        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdOrderBySubmittedAtDesc(quizId);
        return attempts.stream()
                .map(a -> toAttemptResponse(a, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QuizAttemptResponse getAttemptDetail(Long attemptId, String currentUserEmail) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Lượt làm bài", attemptId));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (currentUser.getRole() == UserRole.STUDENT) {
            if (!attempt.getStudent().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Bạn không thể xem kết quả làm bài của học viên khác");
            }
        } else {
            courseSecurityHelper.validateCourseAccess(
                    attempt.getQuiz().getLesson().getChapter().getCourse(),
                    currentUserEmail,
                    "xem chi tiết bài làm quiz của"
            );
        }

        return toAttemptResponse(attempt, true);
    }

    private QuizAttemptResponse toAttemptResponse(QuizAttempt attempt, boolean includeAnswers) {
        List<QuizAttemptAnswerResponse> answerResponses = null;
        if (includeAnswers) {
            List<QuizAttemptAnswer> answers = attemptAnswerRepository.findByAttemptId(attempt.getId());
            answerResponses = answers.stream().map(a -> {
                Question q = a.getQuestion();
                Option selected = a.getSelectedOption();
                Option correct = q.getOptions().stream()
                        .filter(Option::getIsCorrect)
                        .findFirst()
                        .orElse(null);

                List<OptionResponse> optionResponses = q.getOptions().stream().map(opt -> OptionResponse.builder()
                        .id(opt.getId())
                        .content(opt.getContent())
                        .isCorrect(opt.getIsCorrect())
                        .build()).collect(Collectors.toList());

                return QuizAttemptAnswerResponse.builder()
                        .id(a.getId())
                        .questionId(q.getId())
                        .questionContent(q.getContent())
                        .selectedOptionId(selected != null ? selected.getId() : null)
                        .selectedOptionContent(selected != null ? selected.getContent() : null)
                        .correctOptionId(correct != null ? correct.getId() : null)
                        .correctOptionContent(correct != null ? correct.getContent() : null)
                        .isCorrect(a.getIsCorrect())
                        .options(optionResponses)
                        .build();
            }).collect(Collectors.toList());
        }

        return QuizAttemptResponse.builder()
                .id(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .studentId(attempt.getStudent().getId())
                .studentName(attempt.getStudent().getName())
                .studentEmail(attempt.getStudent().getEmail())
                .score(attempt.getScore())
                .totalQuestions(attempt.getTotalQuestions())
                .correctCount(attempt.getCorrectCount())
                .submittedAt(attempt.getSubmittedAt())
                .answers(answerResponses)
                .build();
    }

    private QuizResponse toResponse(Quiz quiz) {
        return QuizResponse.builder()
                .id(quiz.getId())
                .lessonId(quiz.getLesson().getId())
                .title(quiz.getTitle())
                .questions(quiz.getQuestions() != null
                        ? quiz.getQuestions().stream().map(q -> QuestionResponse.builder()
                                .id(q.getId())
                                .content(q.getContent())
                                .options(q.getOptions() != null
                                        ? q.getOptions().stream().map(o -> OptionResponse.builder()
                                                .id(o.getId())
                                                .content(o.getContent())
                                                .isCorrect(o.getIsCorrect())
                                                .build()).collect(Collectors.toList())
                                        : List.of())
                                .build()).collect(Collectors.toList())
                        : List.of())
                .build();
    }
}
