package backend.backend.Service;

import backend.backend.Dto.Request.CreateReviewRequest;
import backend.backend.Dto.Response.CourseResponse;
import backend.backend.Dto.Response.EnrollmentResponse;
import backend.backend.Dto.Response.ReviewResponse;

import java.util.List;
import java.util.UUID;

public interface StudentService {
    EnrollmentResponse enrollInCourse(UUID courseId);
    List<EnrollmentResponse> getEnrolledCourses();
    String toggleFavorite(UUID courseId);
    List<CourseResponse> getFavoriteCourses();
    ReviewResponse submitReview(UUID courseId, CreateReviewRequest request);
}