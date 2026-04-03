package backend.backend.Controller;

import backend.backend.Dto.Request.SubmitAssessmentRequest;
import backend.backend.Dto.Response.AssessmentResultResponse;
import backend.backend.Dto.Response.CourseProgressResponse;
import backend.backend.Dto.Response.StudentProgressSummaryResponse;
import backend.backend.Service.ProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CourseProgressResponse> getCourseProgress(
            @PathVariable UUID courseId) {
        return ResponseEntity.ok(progressService.getCourseProgress(courseId));
    }

    @PostMapping("/{courseId}/chapters/{chapterId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> markChapterComplete(
            @PathVariable UUID courseId,
            @PathVariable UUID chapterId) {
        progressService.markChapterComplete(courseId, chapterId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{courseId}/chapters/{chapterId}/assessment")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AssessmentResultResponse> submitChapterAssessment(
            @PathVariable UUID courseId,
            @PathVariable UUID chapterId,
            @Valid @RequestBody SubmitAssessmentRequest request) {
        return ResponseEntity.ok(progressService.submitChapterAssessment(
                courseId, chapterId, request));
    }

    @PostMapping("/{courseId}/grand-assessment")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AssessmentResultResponse> submitGrandAssessment(
            @PathVariable UUID courseId,
            @Valid @RequestBody SubmitAssessmentRequest request) {
        return ResponseEntity.ok(progressService.submitGrandAssessment(
                courseId, request));
    }

    @GetMapping("/instructor/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<StudentProgressSummaryResponse>> getStudentsProgress(
            @PathVariable UUID courseId) {
        return ResponseEntity.ok(progressService
                .getStudentsProgressForInstructor(courseId));
    }
}
