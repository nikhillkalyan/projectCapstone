package backend.backend.Service.Impl;

import backend.backend.Dto.Request.SubmitAssessmentRequest;
import backend.backend.Dto.Response.*;
import backend.backend.Entity.*;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Exceptions.UnauthorizedException;
import backend.backend.Repository.*;
import backend.backend.Service.ProgressService;
import backend.backend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final ProgressRepository progressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final ChapterRepository chapterRepository;
    private final AssessmentRepository assessmentRepository;
    private final StudentRepository studentRepository;
    private final SecurityUtils securityUtils;

    // ─── Get Course Progress ──────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public CourseProgressResponse getCourseProgress(UUID courseId) {
        User currentUser = securityUtils.getCurrentUser();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + courseId));

        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseId(currentUser.getId(), courseId)
                .orElseThrow(() -> new BadRequestException(
                        "You are not enrolled in this course"));

        List<Chapter> chapters = chapterRepository
                .findByCourseIdOrderByChapterOrderAsc(courseId);

        List<Progress> progressList = progressRepository
                .findByStudentIdAndChapterCourseId(currentUser.getId(), courseId);

        List<ProgressResponse> chapterProgressResponses = chapters.stream()
                .map(chapter -> {
                    Progress progress = progressList.stream()
                            .filter(p -> p.getChapter().getId().equals(chapter.getId()))
                            .findFirst()
                            .orElse(null);

                    return ProgressResponse.builder()
                            .chapterId(chapter.getId())
                            .chapterTitle(chapter.getTitle())
                            .completed(progress != null && progress.getCompleted())
                            .assessmentScore(progress != null ?
                                    progress.getAssessmentScore() : null)
                            .assessmentPassed(progress != null ?
                                    progress.getAssessmentPassed() : false)
                            .completedAt(progress != null ?
                                    progress.getCompletedAt() : null)
                            .build();
                })
                .collect(Collectors.toList());

        long completedCount = chapterProgressResponses.stream()
                .filter(ProgressResponse::getCompleted)
                .count();

        // Grand assessment result
        AssessmentResultResponse grandAssessmentResult = null;
        if (enrollment.getGrandAssessmentScore() != null) {
            Assessment grandAssessment = course.getGrandAssessment();
            grandAssessmentResult = AssessmentResultResponse.builder()
                    .score(enrollment.getGrandAssessmentScore())
                    .passingScore(grandAssessment != null ?
                            grandAssessment.getPassingScore() : 70)
                    .passed(enrollment.getGrandAssessmentPassed())
                    .build();
        }

        return CourseProgressResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .overallProgress(enrollment.getOverallProgress())
                .isCompleted(enrollment.getIsCompleted())
                .totalChapters(chapters.size())
                .completedChapters((int) completedCount)
                .chapterProgress(chapterProgressResponses)
                .grandAssessmentResult(grandAssessmentResult)
                .build();
    }

    // ─── Mark Chapter Complete ────────────────────────────────
    @Override
    @Transactional
    public void markChapterComplete(UUID courseId, UUID chapterId) {
        User currentUser = securityUtils.getCurrentUser();

        enrollmentRepository.findByStudentIdAndCourseId(currentUser.getId(), courseId)
                .orElseThrow(() -> new BadRequestException(
                        "You are not enrolled in this course"));

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Chapter not found with id: " + chapterId));

        Progress progress = progressRepository
                .findByStudentIdAndChapterId(currentUser.getId(), chapterId)
                .orElse(null);

        Student student = studentRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (progress == null) {
            progress = Progress.builder()
                    .student(student)
                    .chapter(chapter)
                    .completed(true)
                    .completedAt(LocalDateTime.now())
                    .build();
        } else {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
        }

        progressRepository.save(progress);
        updateOverallProgress(currentUser.getId(), courseId);
    }

    // ─── Submit Chapter Assessment ────────────────────────────
    @Override
    @Transactional
    public AssessmentResultResponse submitChapterAssessment(UUID courseId, UUID chapterId,
                                                            SubmitAssessmentRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        enrollmentRepository.findByStudentIdAndCourseId(currentUser.getId(), courseId)
                .orElseThrow(() -> new BadRequestException(
                        "You are not enrolled in this course"));

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Chapter not found with id: " + chapterId));

        Assessment assessment = chapter.getAssessment();
        if (assessment == null) {
            throw new ResourceNotFoundException(
                    "No assessment found for this chapter");
        }

        AssessmentResultResponse result = evaluateAssessment(
                assessment, request.getAnswers());

        Student student = studentRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Progress progress = progressRepository
                .findByStudentIdAndChapterId(currentUser.getId(), chapterId)
                .orElse(Progress.builder()
                        .student(student)
                        .chapter(chapter)
                        .build());

        progress.setAssessmentScore(result.getScore());
        progress.setAssessmentPassed(result.getPassed());

        // Auto mark chapter complete if assessment passed
        if (result.getPassed()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
        }

        progressRepository.save(progress);
        updateOverallProgress(currentUser.getId(), courseId);

        return result;
    }

    // ─── Submit Grand Assessment ──────────────────────────────
    @Override
    @Transactional
    public AssessmentResultResponse submitGrandAssessment(UUID courseId,
                                                          SubmitAssessmentRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + courseId));

        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseId(currentUser.getId(), courseId)
                .orElseThrow(() -> new BadRequestException(
                        "You are not enrolled in this course"));

        Assessment grandAssessment = course.getGrandAssessment();
        if (grandAssessment == null) {
            throw new ResourceNotFoundException(
                    "No grand assessment found for this course");
        }

        AssessmentResultResponse result = evaluateAssessment(
                grandAssessment, request.getAnswers());

        enrollment.setGrandAssessmentScore(result.getScore());
        enrollment.setGrandAssessmentPassed(result.getPassed());

        // Mark course complete if grand assessment passed
        if (result.getPassed()) {
            enrollment.setIsCompleted(true);
            enrollment.setOverallProgress(100.0f);
        }

        enrollmentRepository.save(enrollment);
        return result;
    }

    // ─── Instructor: Get All Students Progress ────────────────
    @Override
    @Transactional(readOnly = true)
    public List<StudentProgressSummaryResponse> getStudentsProgressForInstructor(
            UUID courseId) {
        User currentUser = securityUtils.getCurrentUser();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + courseId));

        if (!course.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException(
                    "You are not authorized to view this course's progress");
        }

        List<Chapter> chapters = chapterRepository
                .findByCourseIdOrderByChapterOrderAsc(courseId);

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);

        return enrollments.stream()
                .map(enrollment -> {
                    Student student = enrollment.getStudent();
                    User studentUser = student.getUser();

                    List<Progress> progressList = progressRepository
                            .findByStudentIdAndChapterCourseId(
                                    student.getId(), courseId);

                    List<ProgressResponse> chapterProgressResponses = chapters.stream()
                            .map(chapter -> {
                                Progress progress = progressList.stream()
                                        .filter(p -> p.getChapter().getId()
                                                .equals(chapter.getId()))
                                        .findFirst()
                                        .orElse(null);

                                return ProgressResponse.builder()
                                        .chapterId(chapter.getId())
                                        .chapterTitle(chapter.getTitle())
                                        .completed(progress != null &&
                                                progress.getCompleted())
                                        .assessmentScore(progress != null ?
                                                progress.getAssessmentScore() : null)
                                        .assessmentPassed(progress != null ?
                                                progress.getAssessmentPassed() : false)
                                        .completedAt(progress != null ?
                                                progress.getCompletedAt() : null)
                                        .build();
                            })
                            .collect(Collectors.toList());

                    long completedCount = chapterProgressResponses.stream()
                            .filter(ProgressResponse::getCompleted)
                            .count();

                    return StudentProgressSummaryResponse.builder()
                            .studentId(studentUser.getId())
                            .studentName(studentUser.getName())
                            .studentAvatar(studentUser.getAvatarUrl())
                            .overallProgress(enrollment.getOverallProgress())
                            .isCompleted(enrollment.getIsCompleted())
                            .completedChapters((int) completedCount)
                            .totalChapters(chapters.size())
                            .chapterProgress(chapterProgressResponses)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ─── Helpers ──────────────────────────────────────────────
    private AssessmentResultResponse evaluateAssessment(Assessment assessment,
                                                        List<Integer> answers) {
        List<Question> questions = assessment.getQuestions();
        int total = questions.size();
        int correct = 0;

        for (int i = 0; i < Math.min(answers.size(), total); i++) {
            if (questions.get(i).getCorrectOptionIndex().equals(answers.get(i))) {
                correct++;
            }
        }

        int score = (int) Math.round((double) correct / total * 100);
        boolean passed = score >= assessment.getPassingScore();

        return AssessmentResultResponse.builder()
                .score(score)
                .passingScore(assessment.getPassingScore())
                .passed(passed)
                .totalQuestions(total)
                .correctAnswers(correct)
                .build();
    }

    private void updateOverallProgress(UUID studentId, UUID courseId) {
        List<Chapter> chapters = chapterRepository
                .findByCourseIdOrderByChapterOrderAsc(courseId);

        List<Progress> progressList = progressRepository
                .findByStudentIdAndChapterCourseId(studentId, courseId);

        long completedCount = progressList.stream()
                .filter(Progress::getCompleted)
                .count();

        float overallProgress = chapters.isEmpty() ? 0 :
                (float) completedCount / chapters.size() * 100;

        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        enrollment.setOverallProgress(overallProgress);
        enrollmentRepository.save(enrollment);
    }
}