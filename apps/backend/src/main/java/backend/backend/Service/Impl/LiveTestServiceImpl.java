package backend.backend.Service.Impl;

import backend.backend.Dto.Request.CreateLiveTestRequest;
import backend.backend.Dto.Request.SubmitLiveTestRequest;
import backend.backend.Dto.Response.LiveTestResponse;
import backend.backend.Dto.Response.LiveTestResultResponse;
import backend.backend.Entity.Course;
import backend.backend.Entity.Instructor;
import backend.backend.Entity.LiveTest;
import backend.backend.Entity.LiveTestSubmission;
import backend.backend.Entity.MarksSheet;
import backend.backend.Entity.Student;
import backend.backend.Entity.User;
import backend.backend.Enums.MarksSheetStatus;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Exceptions.UnauthorizedException;
import backend.backend.Repository.CourseRepository;
import backend.backend.Repository.EnrollmentRepository;
import backend.backend.Repository.InstructorRepository;
import backend.backend.Repository.LiveTestRepository;
import backend.backend.Repository.LiveTestSubmissionRepository;
import backend.backend.Repository.MarksSheetRepository;
import backend.backend.Repository.StudentRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Service.LiveTestNotificationService;
import backend.backend.Service.LiveTestService;
import backend.backend.Service.NotificationService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LiveTestServiceImpl implements LiveTestService {

    private final LiveTestRepository liveTestRepository;
    private final LiveTestSubmissionRepository submissionRepository;
    private final CourseRepository courseRepository;
    private final InstructorRepository instructorRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final MarksSheetRepository marksSheetRepository;
    private final LiveTestNotificationService liveTestNotificationService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public LiveTestResponse createLiveTest(UUID courseId, CreateLiveTestRequest request, String email) {
        Instructor instructor = resolveInstructor(email);
        Course course = resolveCourse(courseId);
        verifyInstructorOwnsCourse(instructor, course);
        validateCreateRequest(request);

        LiveTest test = LiveTest.builder()
                .title(request.getTitle().trim())
                .course(course)
                .instructor(instructor)
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 30)
                .passingScore(request.getPassingScore() != null ? request.getPassingScore() : 70)
                .questionsJson(serializeQuestions(request.getQuestions()))
                .scheduledAt(request.getScheduledAt())
                .isLive(false)
                .isClosed(false)
                .build();

        return mapToResponse(liveTestRepository.save(test), true, null, null);
    }

    @Override
    @Transactional
    public LiveTestResponse launchLiveTest(UUID liveTestId, String email) {
        Instructor instructor = resolveInstructor(email);
        LiveTest test = resolveLiveTest(liveTestId);
        verifyInstructorOwnsCourse(instructor, test.getCourse());

        if (Boolean.TRUE.equals(test.getIsClosed())) {
            throw new BadRequestException("This live test has already been closed.");
        }
        if (Boolean.TRUE.equals(test.getIsLive())) {
            throw new BadRequestException("This live test is already live.");
        }

        liveTestRepository.findByCourseIdAndIsLiveTrueAndIsClosedFalse(test.getCourse().getId())
                .ifPresent(existing -> {
                    throw new BadRequestException("Another live test is already running for this course.");
                });

        test.setIsLive(true);
        test.setStartTime(LocalDateTime.now());
        LiveTest saved = liveTestRepository.save(test);
        liveTestNotificationService.notifyLiveTestStarted(saved);
        notificationService.notifyEnrolledStudentsLiveTestStarted(saved);
        return mapToResponse(saved, true, null, null);
    }

    @Override
    @Transactional
    public LiveTestResponse closeLiveTest(UUID liveTestId, String email) {
        Instructor instructor = resolveInstructor(email);
        LiveTest test = resolveLiveTest(liveTestId);
        verifyInstructorOwnsCourse(instructor, test.getCourse());

        test.setIsLive(false);
        test.setIsClosed(true);
        test.setEndTime(LocalDateTime.now());
        LiveTest saved = liveTestRepository.save(test);
        liveTestNotificationService.notifyLiveTestClosed(saved);
        notificationService.notifyEnrolledStudentsLiveTestClosed(saved);

        Integer submissionCount = submissionRepository.findByLiveTestId(saved.getId()).size();
        Double averageScore = submissionRepository.findAverageScoreByLiveTestId(saved.getId());
        return mapToResponse(saved, true, submissionCount, averageScore);
    }

    @Override
    @Transactional
    public void deleteLiveTest(UUID liveTestId, String email) {
        Instructor instructor = resolveInstructor(email);
        LiveTest test = resolveLiveTest(liveTestId);
        verifyInstructorOwnsCourse(instructor, test.getCourse());

        if (Boolean.TRUE.equals(test.getIsLive())) {
            throw new BadRequestException("Cannot delete a live test that is currently running. Close it first.");
        }

        liveTestRepository.delete(test);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LiveTestResponse> getLiveTestsForCourse(UUID courseId, String email) {
        Instructor instructor = resolveInstructor(email);
        Course course = resolveCourse(courseId);
        verifyInstructorOwnsCourse(instructor, course);

        return liveTestRepository.findByCourseId(courseId).stream()
                .sorted(Comparator.comparing(LiveTest::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(test -> mapToResponse(
                        test,
                        true,
                        Boolean.TRUE.equals(test.getIsClosed()) ? submissionRepository.findByLiveTestId(test.getId()).size() : null,
                        Boolean.TRUE.equals(test.getIsClosed()) ? submissionRepository.findAverageScoreByLiveTestId(test.getId()) : null
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LiveTestResponse getLiveTestWithSubmissions(UUID liveTestId, String email) {
        Instructor instructor = resolveInstructor(email);
        LiveTest test = resolveLiveTest(liveTestId);
        verifyInstructorOwnsCourse(instructor, test.getCourse());

        Integer submissionCount = submissionRepository.findByLiveTestId(liveTestId).size();
        Double averageScore = submissionRepository.findAverageScoreByLiveTestId(liveTestId);
        return mapToResponse(test, true, submissionCount, averageScore);
    }

    @Override
    @Transactional(readOnly = true)
    public LiveTestResponse getActiveLiveTest(UUID courseId, String email) {
        Student student = resolveStudent(email);
        verifyStudentEnrollment(student, courseId);

        return liveTestRepository.findByCourseIdAndIsLiveTrueAndIsClosedFalse(courseId)
                .filter(test -> !submissionRepository.existsByLiveTestIdAndStudentId(test.getId(), student.getId()))
                .map(test -> mapToResponse(test, false, null, null))
                .orElse(null);
    }

    @Override
    @Transactional
    public LiveTestResultResponse submitLiveTest(UUID liveTestId, SubmitLiveTestRequest request, String email) {
        Student student = resolveStudent(email);
        LiveTest test = resolveLiveTest(liveTestId);
        verifyStudentEnrollment(student, test.getCourse().getId());

        if (!Boolean.TRUE.equals(test.getIsLive()) || Boolean.TRUE.equals(test.getIsClosed())) {
            throw new BadRequestException("This live test is not currently accepting submissions.");
        }
        if (submissionRepository.existsByLiveTestIdAndStudentId(liveTestId, student.getId())) {
            throw new BadRequestException("You have already submitted this live test.");
        }

        List<Map<String, Object>> questions = deserializeQuestions(test.getQuestionsJson());
        List<Integer> answers = request.getAnswers() != null ? request.getAnswers() : List.of();

        int correctAnswers = 0;
        for (int index = 0; index < questions.size(); index++) {
            int expected = toInt(questions.get(index).get("correctOptionIndex"));
            int given = index < answers.size() && answers.get(index) != null ? answers.get(index) : -1;
            if (expected == given) {
                correctAnswers++;
            }
        }

        double score = questions.isEmpty() ? 0.0 : round2((correctAnswers * 100.0) / questions.size());
        boolean passed = score >= (test.getPassingScore() != null ? test.getPassingScore() : 70);

        LiveTestSubmission submission = LiveTestSubmission.builder()
                .liveTest(test)
                .student(student)
                .answersJson(serializeAnswers(answers))
                .score(score)
                .passed(passed)
                .build();
        submissionRepository.save(submission);

        syncLiveTestScoreToMarksSheet(student, test.getCourse());

        return LiveTestResultResponse.builder()
                .liveTestId(test.getId())
                .title(test.getTitle())
                .score(score)
                .passed(passed)
                .passingScore(test.getPassingScore())
                .totalQuestions(questions.size())
                .correctAnswers(correctAnswers)
                .build();
    }

    private LiveTestResponse mapToResponse(
            LiveTest test,
            boolean includeInstructorView,
            Integer submissionCount,
            Double averageScore
    ) {
        List<LiveTestResponse.QuestionDto> questions = deserializeQuestions(test.getQuestionsJson()).stream()
                .map(question -> LiveTestResponse.QuestionDto.builder()
                        .questionText((String) question.get("questionText"))
                        .options(toStringList(question.get("options")))
                        .build())
                .collect(Collectors.toList());

        List<LiveTestResponse.SubmissionDto> submissions = null;
        if (includeInstructorView && (Boolean.TRUE.equals(test.getIsClosed()) || Boolean.TRUE.equals(test.getIsLive()))) {
            submissions = submissionRepository.findByLiveTestId(test.getId()).stream()
                    .map(submission -> {
                        Student student = submission.getStudent();
                        User user = student != null ? student.getUser() : null;
                        String sectionName = student != null && student.getSection() != null
                                ? student.getSection().getName()
                                : null;

                        return LiveTestResponse.SubmissionDto.builder()
                                .submissionId(submission.getId())
                                .studentId(student != null ? student.getId() : null)
                                .studentName(user != null ? user.getName() : "Unknown")
                                .rollNumber(student != null ? student.getRollNumber() : null)
                                .sectionName(sectionName)
                                .score(submission.getScore())
                                .passed(submission.getPassed())
                                .submittedAt(submission.getSubmittedAt())
                                .build();
                    })
                    .sorted(Comparator.comparing(
                            LiveTestResponse.SubmissionDto::getScore,
                            Comparator.nullsLast(Comparator.reverseOrder())
                    ))
                    .collect(Collectors.toList());
        }

        return LiveTestResponse.builder()
                .id(test.getId())
                .title(test.getTitle())
                .courseId(test.getCourse().getId())
                .courseTitle(test.getCourse().getTitle())
                .durationMinutes(test.getDurationMinutes())
                .passingScore(test.getPassingScore())
                .isLive(test.getIsLive())
                .isClosed(test.getIsClosed())
                .scheduledAt(test.getScheduledAt())
                .startTime(test.getStartTime())
                .endTime(test.getEndTime())
                .createdAt(test.getCreatedAt())
                .questions(questions)
                .submissionCount(includeInstructorView ? submissionCount : null)
                .averageScore(includeInstructorView && averageScore != null ? round2(averageScore) : null)
                .submissions(submissions)
                .build();
    }

    private void syncLiveTestScoreToMarksSheet(Student student, Course course) {
        List<LiveTestSubmission> submissions = submissionRepository.findByStudentIdAndLiveTestCourseId(student.getId(), course.getId());
        double averageScore = submissions.stream()
                .map(LiveTestSubmission::getScore)
                .filter(score -> score != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        MarksSheet marksSheet = marksSheetRepository.findByStudentIdAndCourseId(student.getId(), course.getId())
                .orElseGet(() -> MarksSheet.builder()
                        .course(course)
                        .student(student)
                        .status(MarksSheetStatus.DRAFT)
                        .isApprovedByUniAdmin(false)
                        .build());

        if (marksSheet.getStatus() == MarksSheetStatus.SUBMITTED || marksSheet.getStatus() == MarksSheetStatus.APPROVED) {
            return;
        }

        Map<String, Object> breakdown = deserializeBreakdown(marksSheet.getBreakdownJson());
        breakdown.put("liveTestsScore", round2(averageScore));
        marksSheet.setBreakdownJson(serializeBreakdown(breakdown));
        marksSheetRepository.save(marksSheet);
    }

    private void validateCreateRequest(CreateLiveTestRequest request) {
        if (request == null || request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("Live test title is required.");
        }
        if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
            throw new BadRequestException("Live test must have at least one question.");
        }
        for (CreateLiveTestRequest.QuestionDto question : request.getQuestions()) {
            if (question.getQuestionText() == null || question.getQuestionText().isBlank()) {
                throw new BadRequestException("Each question must include question text.");
            }
            if (question.getOptions() == null || question.getOptions().size() < 2) {
                throw new BadRequestException("Each question must include at least two options.");
            }
            if (question.getOptions().stream().anyMatch(option -> option == null || option.isBlank())) {
                throw new BadRequestException("Question options cannot be blank.");
            }
            if (question.getCorrectOptionIndex() == null
                    || question.getCorrectOptionIndex() < 0
                    || question.getCorrectOptionIndex() >= question.getOptions().size()) {
                throw new BadRequestException("Each question must have a valid correct option index.");
            }
        }
    }

    private String serializeQuestions(List<CreateLiveTestRequest.QuestionDto> questions) {
        try {
            List<Map<String, Object>> payload = new ArrayList<>();
            for (CreateLiveTestRequest.QuestionDto question : questions) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("questionText", question.getQuestionText());
                item.put("options", question.getOptions());
                item.put("correctOptionIndex", question.getCorrectOptionIndex());
                payload.add(item);
            }
            return objectMapper.writeValueAsString(payload);
        } catch (Exception exception) {
            throw new BadRequestException("Invalid questions format.");
        }
    }

    private String serializeAnswers(List<Integer> answers) {
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (Exception exception) {
            return "[]";
        }
    }

    private List<Map<String, Object>> deserializeQuestions(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception exception) {
            return List.of();
        }
    }

    private Map<String, Object> deserializeBreakdown(String json) {
        if (json == null || json.isBlank()) {
            return new LinkedHashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<LinkedHashMap<String, Object>>() {});
        } catch (Exception exception) {
            return new LinkedHashMap<>();
        }
    }

    private String serializeBreakdown(Map<String, Object> breakdown) {
        try {
            return objectMapper.writeValueAsString(breakdown);
        } catch (Exception exception) {
            return "{}";
        }
    }

    private Course resolveCourse(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
    }

    private LiveTest resolveLiveTest(UUID liveTestId) {
        return liveTestRepository.findById(liveTestId)
                .orElseThrow(() -> new ResourceNotFoundException("Live test not found"));
    }

    private Instructor resolveInstructor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return instructorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
    }

    private Student resolveStudent(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    private void verifyInstructorOwnsCourse(Instructor instructor, Course course) {
        if (course.getInstructor() == null || !course.getInstructor().getId().equals(instructor.getId())) {
            throw new UnauthorizedException("You do not own this course.");
        }
    }

    private void verifyStudentEnrollment(Student student, UUID courseId) {
        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new UnauthorizedException("You are not enrolled in this course.");
        }
    }

    private List<String> toStringList(Object options) {
        if (!(options instanceof List<?> optionList)) {
            return List.of();
        }
        return optionList.stream()
                .map(option -> option != null ? option.toString() : "")
                .collect(Collectors.toList());
    }

    private int toInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value != null) {
            try {
                return Integer.parseInt(value.toString());
            } catch (NumberFormatException ignored) {
                return -1;
            }
        }
        return -1;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
