package backend.backend.Service.Impl;

import backend.backend.Dto.Request.CreateReviewRequest;
import backend.backend.Dto.Response.CourseResponse;
import backend.backend.Dto.Response.EnrollmentResponse;
import backend.backend.Dto.Response.ReviewResponse;
import backend.backend.Entity.*;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Repository.*;
import backend.backend.Service.StudentService;
import backend.backend.Utils.SecurityUtils;
import backend.backend.Service.Impl.CourseServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final ReviewRepository reviewRepository;
    private final CourseServiceImpl courseServiceImpl;
    private final SecurityUtils securityUtils;

    // ─── Enroll ───────────────────────────────────────────────
    @Override
    @Transactional
    public EnrollmentResponse enrollInCourse(UUID courseId) {
        User currentUser = securityUtils.getCurrentUser();

        Student student = studentRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + courseId));

        if (enrollmentRepository.existsByStudentIdAndCourseId(
                student.getId(), courseId)) {
            throw new BadRequestException("Already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .overallProgress(0.0f)
                .isCompleted(false)
                .build();

        enrollmentRepository.save(enrollment);

        // Update course total enrollments
        course.setTotalEnrollments(course.getTotalEnrollments() + 1);
        courseRepository.save(course);

        return mapToEnrollmentResponse(enrollment);
    }

    // ─── Get Enrolled Courses ─────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrolledCourses() {
        User currentUser = securityUtils.getCurrentUser();

        return enrollmentRepository.findByStudentId(currentUser.getId())
                .stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    // ─── Toggle Favorite ──────────────────────────────────────
    @Override
    @Transactional
    public String toggleFavorite(UUID courseId) {
        User currentUser = securityUtils.getCurrentUser();

        Student student = studentRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + courseId));

        boolean alreadyFavorited = student.getFavoriteCourses()
                .stream()
                .anyMatch(c -> c.getId().equals(courseId));

        if (alreadyFavorited) {
            student.getFavoriteCourses().removeIf(c -> c.getId().equals(courseId));
            studentRepository.save(student);
            return "Course removed from favorites";
        } else {
            student.getFavoriteCourses().add(course);
            studentRepository.save(student);
            return "Course added to favorites";
        }
    }

    // ─── Get Favorites ────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getFavoriteCourses() {
        User currentUser = securityUtils.getCurrentUser();

        Student student = studentRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return student.getFavoriteCourses()
                .stream()
                .map(courseServiceImpl::mapToCourseResponse)
                .collect(Collectors.toList());
    }

    // ─── Submit Review ────────────────────────────────────────
    @Override
    @Transactional
    public ReviewResponse submitReview(UUID courseId, CreateReviewRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Student student = studentRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with id: " + courseId));

        if (!enrollmentRepository.existsByStudentIdAndCourseId(
                student.getId(), courseId)) {
            throw new BadRequestException("You must be enrolled to review this course");
        }

        if (reviewRepository.existsByStudentIdAndCourseId(
                student.getId(), courseId)) {
            throw new BadRequestException("You have already reviewed this course");
        }

        Review review = Review.builder()
                .student(student)
                .course(course)
                .rating(request.getRating())
                .reviewText(request.getReviewText())
                .build();

        reviewRepository.save(review);

        // Recalculate course rating
        List<Review> allReviews = reviewRepository.findByCourseId(courseId);
        float avgRating = (float) allReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        course.setRating(avgRating);
        courseRepository.save(course);

        return mapToReviewResponse(review, currentUser);
    }

    // ─── Mappers ──────────────────────────────────────────────
    private EnrollmentResponse mapToEnrollmentResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getId())
                .overallProgress(enrollment.getOverallProgress())
                .isCompleted(enrollment.getIsCompleted())
                .enrolledAt(enrollment.getEnrolledAt())
                .course(courseServiceImpl.mapToCourseResponse(enrollment.getCourse()))
                .build();
    }

    private ReviewResponse mapToReviewResponse(Review review, User user) {
        return ReviewResponse.builder()
                .id(review.getId())
                .studentId(user.getId())
                .studentName(user.getName())
                .studentAvatar(user.getAvatarUrl())
                .rating(review.getRating())
                .reviewText(review.getReviewText())
                .createdAt(review.getCreatedAt())
                .build();
    }
}