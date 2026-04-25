package backend.backend.Service.Impl;

import backend.backend.Dto.Response.MarksBreakdownResponse;
import backend.backend.Dto.Response.StudentMarksResponse;
import backend.backend.Entity.Chapter;
import backend.backend.Entity.Course;
import backend.backend.Entity.CourseAllocation;
import backend.backend.Entity.Enrollment;
import backend.backend.Entity.Instructor;
import backend.backend.Entity.Progress;
import backend.backend.Entity.Student;
import backend.backend.Entity.User;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Exceptions.UnauthorizedException;
import backend.backend.Repository.CourseRepository;
import backend.backend.Repository.CourseAllocationRepository;
import backend.backend.Repository.EnrollmentRepository;
import backend.backend.Repository.InstructorRepository;
import backend.backend.Repository.MarksSheetRepository;
import backend.backend.Repository.ProgressRepository;
import backend.backend.Repository.StudentRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Service.MarksService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class MarksServiceImpl implements MarksService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final CourseRepository courseRepository;
    private final CourseAllocationRepository courseAllocationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProgressRepository progressRepository;
    private final MarksSheetRepository marksSheetRepository;

    private MarksBreakdownResponse buildEmptyMarks(Course course, Enrollment enrollment) {
        float overallProgress = enrollment != null && enrollment.getOverallProgress() != null
                ? enrollment.getOverallProgress()
                : 0f;

        List<Chapter> chapters = (course.getChapters() != null ? course.getChapters() : Collections.<Chapter>emptyList())
                .stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return MarksBreakdownResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .attendanceScore(0.0)
                .testsScore(0.0)
                .liveTestsScore(0.0)
                .projectScore(0.0)
                .weightAttendance(course.getWeightAttendance() != null ? course.getWeightAttendance() : 0)
                .weightTests(course.getWeightTests() != null ? course.getWeightTests() : 0)
                .weightLiveTests(course.getWeightLiveTests() != null ? course.getWeightLiveTests() : 0)
                .weightProject(course.getWeightProject() != null ? course.getWeightProject() : 0)
                .attendanceWeighted(0.0)
                .testsWeighted(0.0)
                .liveTestsWeighted(0.0)
                .projectWeighted(0.0)
                .totalPenalty(0.0)
                .penaltyDescription(course.getPenaltyDescription())
                .finalScore(0.0)
                .grade("F")
                .completedChapters(0)
                .totalChapters(chapters.size())
                .overallProgress(overallProgress)
                .build();
    }

    private MarksBreakdownResponse calculateMarks(Student student, Course course) {
        List<Chapter> chapters = (course.getChapters() != null ? course.getChapters() : Collections.<Chapter>emptyList())
                .stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        int totalChapters = chapters.size();

        List<Progress> progressList = progressRepository
                .findByStudentIdAndChapterCourseId(student.getId(), course.getId())
                .stream()
                .filter(Objects::nonNull)
                .filter(progress -> progress.getChapter() != null)
                .collect(Collectors.toList());

        Map<UUID, Progress> progressMap = progressList.stream()
                .collect(Collectors.toMap(
                        progress -> progress.getChapter().getId(),
                        Function.identity(),
                        (existing, replacement) -> existing
                ));

        long completedCount = progressList.stream()
                .filter(progress -> Boolean.TRUE.equals(progress.getCompleted()))
                .count();

        double attendanceScore = totalChapters > 0
                ? (completedCount * 100.0) / totalChapters
                : 0.0;

        List<Progress> withQuizScore = progressList.stream()
                .filter(progress -> progress.getAssessmentScore() != null)
                .collect(Collectors.toList());

        double testsScore = withQuizScore.isEmpty() ? 0.0
                : withQuizScore.stream()
                .mapToDouble(progress -> progress.getAssessmentScore() != null ? progress.getAssessmentScore() : 0.0)
                .average()
                .orElse(0.0);

        double liveTestsScore = 0.0;
        double projectScore = 0.0;

        var marksSheetOpt = marksSheetRepository.findByStudentIdAndCourseId(student.getId(), course.getId());
        if (marksSheetOpt.isPresent()) {
            String json = marksSheetOpt.get().getBreakdownJson();
            if (json != null && !json.isBlank()) {
                liveTestsScore = extractJsonField(json, "liveTestsScore");
                projectScore = extractJsonField(json, "projectScore");
            }
        }

        double totalPenalty = 0.0;
        LocalDateTime now = LocalDateTime.now();

        for (Chapter chapter : chapters) {
            if (chapter.getDeadline() == null || chapter.getDeadline().isAfter(now)) {
                continue;
            }

            Progress progress = progressMap.get(chapter.getId());
            boolean completed = progress != null && Boolean.TRUE.equals(progress.getCompleted());
            if (completed) {
                continue;
            }

            double penaltyRate = chapter.getPenaltyPerDay() != null && chapter.getPenaltyPerDay() > 0
                    ? chapter.getPenaltyPerDay()
                    : (course.getDefaultPenaltyPerDay() != null ? course.getDefaultPenaltyPerDay() : 0.0);

            if (penaltyRate <= 0) {
                continue;
            }

            long daysLate = ChronoUnit.DAYS.between(chapter.getDeadline(), now);
            if (daysLate < 1) {
                daysLate = 1;
            }
            totalPenalty += penaltyRate * daysLate;
        }

        int weightAttendance = course.getWeightAttendance() != null ? course.getWeightAttendance() : 0;
        int weightTests = course.getWeightTests() != null ? course.getWeightTests() : 0;
        int weightLiveTests = course.getWeightLiveTests() != null ? course.getWeightLiveTests() : 0;
        int weightProject = course.getWeightProject() != null ? course.getWeightProject() : 0;

        double attendanceWeighted = (attendanceScore * weightAttendance) / 100.0;
        double testsWeighted = (testsScore * weightTests) / 100.0;
        double liveTestsWeighted = (liveTestsScore * weightLiveTests) / 100.0;
        double projectWeighted = (projectScore * weightProject) / 100.0;

        double rawTotal = attendanceWeighted + testsWeighted + liveTestsWeighted + projectWeighted;
        double finalScore = Math.max(0.0, rawTotal - totalPenalty);
        finalScore = Math.min(100.0, finalScore);

        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseId(student.getId(), course.getId())
                .orElse(null);

        float overallProgress = enrollment != null && enrollment.getOverallProgress() != null
                ? enrollment.getOverallProgress()
                : 0f;

        return MarksBreakdownResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .attendanceScore(round2(attendanceScore))
                .testsScore(round2(testsScore))
                .liveTestsScore(round2(liveTestsScore))
                .projectScore(round2(projectScore))
                .weightAttendance(weightAttendance)
                .weightTests(weightTests)
                .weightLiveTests(weightLiveTests)
                .weightProject(weightProject)
                .attendanceWeighted(round2(attendanceWeighted))
                .testsWeighted(round2(testsWeighted))
                .liveTestsWeighted(round2(liveTestsWeighted))
                .projectWeighted(round2(projectWeighted))
                .totalPenalty(round2(totalPenalty))
                .penaltyDescription(course.getPenaltyDescription())
                .finalScore(round2(finalScore))
                .grade(toGrade(finalScore))
                .completedChapters((int) completedCount)
                .totalChapters(totalChapters)
                .overallProgress(overallProgress)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MarksBreakdownResponse getStudentMarks(String studentEmail, UUID courseId) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        ensureUniversityCourseEnrollments(course);

        boolean enrolled = enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId);
        if (!enrolled) {
            throw new UnauthorizedException("You are not enrolled in this course");
        }

        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseId(student.getId(), course.getId())
                .orElse(null);

        try {
            return calculateMarks(student, course);
        } catch (Exception exception) {
            log.error("Failed to calculate marks for student '{}' and course '{}': {}",
                    student.getId(), course.getId(), exception.getMessage(), exception);
            return buildEmptyMarks(course, enrollment);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentMarksResponse> getCourseStudentMarks(String instructorEmail, UUID courseId) {
        User user = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Instructor instructor = instructorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new UnauthorizedException("Not your course");
        }

        ensureUniversityCourseEnrollments(course);

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);

        return enrollments.stream()
                .map(enrollment -> {
                    Student student = enrollment.getStudent();
                    MarksBreakdownResponse breakdown;
                    try {
                        breakdown = calculateMarks(student, course);
                    } catch (Exception exception) {
                        log.error("Failed to calculate marks for student '{}' and course '{}': {}",
                                student != null ? student.getId() : null,
                                course.getId(),
                                exception.getMessage(),
                                exception);
                        breakdown = buildEmptyMarks(course, enrollment);
                    }

                    return StudentMarksResponse.builder()
                            .studentId(student.getId())
                            .studentName(student.getUser().getName())
                            .rollNumber(student.getRollNumber())
                            .sectionName(student.getSection() != null ? student.getSection().getName() : null)
                            .attendanceScore(breakdown.getAttendanceScore())
                            .testsScore(breakdown.getTestsScore())
                            .liveTestsScore(breakdown.getLiveTestsScore())
                            .projectScore(breakdown.getProjectScore())
                            .totalPenalty(breakdown.getTotalPenalty())
                            .finalScore(breakdown.getFinalScore())
                            .grade(breakdown.getGrade())
                            .completedChapters(breakdown.getCompletedChapters())
                            .totalChapters(breakdown.getTotalChapters())
                            .overallProgress(breakdown.getOverallProgress())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private void ensureUniversityCourseEnrollments(Course course) {
        if (!Boolean.TRUE.equals(course.getIsUniversityCourse())) {
            return;
        }

        List<CourseAllocation> allocations = courseAllocationRepository.findByCourseId(course.getId());
        for (CourseAllocation allocation : allocations) {
            if (allocation.getSection() == null) {
                continue;
            }

            List<Student> studentsInSection = studentRepository.findBySectionId(allocation.getSection().getId());
            for (Student student : studentsInSection) {
                boolean alreadyEnrolled = enrollmentRepository
                        .existsByStudentIdAndCourseId(student.getId(), course.getId());

                if (!alreadyEnrolled) {
                    try {
                        Enrollment enrollment = Enrollment.builder()
                                .student(student)
                                .course(course)
                                .overallProgress(0.0f)
                                .isCompleted(false)
                                .build();
                        enrollmentRepository.save(enrollment);
                    } catch (DataIntegrityViolationException exception) {
                        log.debug("Enrollment already created concurrently for student '{}' and course '{}'",
                                student.getId(), course.getId());
                    }
                }
            }
        }
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private String toGrade(double score) {
        if (score >= 90) return "S";
        if (score >= 80) return "A";
        if (score >= 70) return "B";
        if (score >= 60) return "C";
        if (score >= 50) return "D";
        return "F";
    }

    private double extractJsonField(String json, String field) {
        try {
            String key = "\"" + field + "\"";
            int idx = json.indexOf(key);
            if (idx < 0) return 0.0;
            int colon = json.indexOf(':', idx);
            int end = json.indexOf(',', colon);
            if (end < 0) end = json.indexOf('}', colon);
            String raw = json.substring(colon + 1, end).trim();
            return Double.parseDouble(raw);
        } catch (Exception exception) {
            return 0.0;
        }
    }
}
