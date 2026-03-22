package backend.backend.Controller;

import backend.backend.Dto.Request.CreateReviewRequest;
import backend.backend.Dto.Response.CourseResponse;
import backend.backend.Dto.Response.EnrollmentResponse;
import backend.backend.Dto.Response.ReviewResponse;
import backend.backend.Service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping("/api/v1/student/enroll/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentResponse> enrollInCourse(
            @PathVariable UUID courseId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(studentService.enrollInCourse(courseId));
    }

    @GetMapping("/api/v1/student/enrolled")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<EnrollmentResponse>> getEnrolledCourses() {
        return ResponseEntity.ok(studentService.getEnrolledCourses());
    }

    @PostMapping("/api/v1/student/favorites/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> toggleFavorite(@PathVariable UUID courseId) {
        return ResponseEntity.ok(studentService.toggleFavorite(courseId));
    }

    @GetMapping("/api/v1/student/favorites")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CourseResponse>> getFavoriteCourses() {
        return ResponseEntity.ok(studentService.getFavoriteCourses());
    }

    @PostMapping("/api/v1/courses/{courseId}/reviews")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ReviewResponse> submitReview(
            @PathVariable UUID courseId,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(studentService.submitReview(courseId, request));
    }
}
