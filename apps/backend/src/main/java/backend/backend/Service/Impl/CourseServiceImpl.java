package backend.backend.Service.Impl;

import backend.backend.Dto.Request.CreateCourseRequest;
import backend.backend.Dto.Request.UpdateCourseRequest;
import backend.backend.Dto.Response.CourseResponse;
import backend.backend.Dto.Response.InstructorSummaryResponse;
import backend.backend.Entity.Course;
import backend.backend.Entity.Instructor;
import backend.backend.Entity.User;
import backend.backend.Entity.Assessment;
import backend.backend.Dto.Response.AssessmentResponse;
import backend.backend.Dto.Response.QuestionResponse;
import backend.backend.Dto.Response.OptionResponse;
import backend.backend.Dto.Response.ReviewResponse;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Exceptions.UnauthorizedException;
import backend.backend.Repository.CourseRepository;
import backend.backend.Repository.InstructorRepository;
import backend.backend.Repository.ReviewRepository;
import backend.backend.Service.CourseService;
import backend.backend.Utils.SecurityUtils;
import backend.backend.Entity.Review;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final InstructorRepository instructorRepository;
    private final ReviewRepository reviewRepository;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses(String category, String level, String search) {
        List<Course> courses = courseRepository.findAll();

        return courses.stream()
                .filter(c -> category == null || category.isEmpty() ||
                        c.getCategory().equalsIgnoreCase(category))
                .filter(c -> level == null || level.isEmpty() ||
                        c.getLevel().name().equalsIgnoreCase(level))
                .filter(c -> search == null || search.isEmpty() ||
                        c.getTitle().toLowerCase().contains(search.toLowerCase()) ||
                        c.getDescription().toLowerCase().contains(search.toLowerCase()))
                .map(this::mapToCourseResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + courseId));
        CourseResponse response = mapToCourseResponse(course);
        
        List<Review> reviews = reviewRepository.findByCourseId(courseId);
        List<ReviewResponse> reviewResponses = reviews.stream()
                .map(r -> ReviewResponse.builder()
                        .id(r.getId())
                        .studentId(r.getStudent().getId())
                        .studentName(r.getStudent().getUser().getName())
                        .studentAvatar(r.getStudent().getUser().getAvatarUrl())
                        .rating(r.getRating())
                        .reviewText(r.getReviewText())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        
        response.setReviews(reviewResponses);
        return response;
    }

    @Override
    @Transactional
    public CourseResponse createCourse(CreateCourseRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Instructor instructor = instructorRepository.findById(currentUser.getId())
                .orElseThrow(() -> new UnauthorizedException(
                        "Only instructors can create courses"));

        Course course = Course.builder()
                .title(request.getTitle())
                .instructor(instructor)
                .category(request.getCategory())
                .level(request.getLevel())
                .duration(request.getDuration())
                .thumbnail(request.getThumbnail())
                .previewVideo(request.getPreviewVideo())
                .description(request.getDescription())
                .longDescription(request.getLongDescription())
                .price(request.getPrice())
                .rating(0.0f)
                .totalEnrollments(0)
                .build();

        courseRepository.save(course);
        return mapToCourseResponse(course);
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(UUID courseId, UpdateCourseRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + courseId));

        // Only the owner instructor can update
        if (!course.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to update this course");
        }

        if (request.getTitle() != null) course.setTitle(request.getTitle());
        if (request.getCategory() != null) course.setCategory(request.getCategory());
        if (request.getLevel() != null) course.setLevel(request.getLevel());
        if (request.getDuration() != null) course.setDuration(request.getDuration());
        if (request.getThumbnail() != null) course.setThumbnail(request.getThumbnail());
        if (request.getPreviewVideo() != null) course.setPreviewVideo(request.getPreviewVideo());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getLongDescription() != null) course.setLongDescription(request.getLongDescription());
        if (request.getPrice() != null) course.setPrice(request.getPrice());

        courseRepository.save(course);
        return mapToCourseResponse(course);
    }

    @Override
    @Transactional
    public void deleteCourse(UUID courseId) {
        User currentUser = securityUtils.getCurrentUser();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + courseId));

        if (!course.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this course");
        }

        courseRepository.delete(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getCoursesByInstructor(UUID instructorId) {
        List<Course> courses = courseRepository.findByInstructorId(instructorId);
        return courses.stream()
                .map(this::mapToCourseResponse)
                .collect(Collectors.toList());
    }

    // ─── Mapper ───────────────────────────────────────────────
    public CourseResponse mapToCourseResponse(Course course) {
        Instructor instructor = course.getInstructor();
        User instructorUser = instructor != null ? instructor.getUser() : null;

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .category(course.getCategory())
                .level(course.getLevel())
                .duration(course.getDuration())
                .thumbnail(course.getThumbnail())
                .previewVideo(course.getPreviewVideo())
                .description(course.getDescription())
                .longDescription(course.getLongDescription())
                .price(course.getPrice())
                .rating(course.getRating())
                .totalEnrollments(course.getTotalEnrollments())
                .createdAt(course.getCreatedAt())
                .instructor(instructorUser != null
                        ? InstructorSummaryResponse.builder()
                                .id(instructorUser.getId())
                                .name(instructorUser.getName())
                                .avatarUrl(instructorUser.getAvatarUrl())
                                .specialization(instructor.getSpecialization())
                                .rating(instructor.getRating())
                                .approvalStatus(instructor.getApprovalStatus() != null ? instructor.getApprovalStatus().name() : "PENDING")
                                .build()
                        : null)
                .grandAssessment(course.getGrandAssessment() != null ? mapToAssessmentResponse(course.getGrandAssessment()) : null)
                .build();
    }

    private AssessmentResponse mapToAssessmentResponse(Assessment assessment) {
        List<QuestionResponse> questions = (assessment.getQuestions() != null ? assessment.getQuestions() : Collections.<backend.backend.Entity.Question>emptyList()).stream()
                .filter(Objects::nonNull)
                .map(q -> QuestionResponse.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .correctOptionIndex(q.getCorrectOptionIndex())
                        .options((q.getOptions() != null ? q.getOptions() : Collections.<backend.backend.Entity.Option>emptyList()).stream()
                                .filter(Objects::nonNull)
                                .map(o -> OptionResponse.builder()
                                        .id(o.getId())
                                        .optionText(o.getOptionText())
                                        .optionIndex(o.getOptionIndex())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        return AssessmentResponse.builder()
                .id(assessment.getId())
                .title(assessment.getTitle())
                .passingScore(assessment.getPassingScore())
                .questions(questions)
                .build();
    }
}
