package backend.backend.Controller;

import backend.backend.Dto.Request.CreateAssessmentRequest;
import backend.backend.Dto.Request.CreateChapterRequest;
import backend.backend.Dto.Request.UpdateChapterRequest;
import backend.backend.Dto.Response.AssessmentResponse;
import backend.backend.Dto.Response.ChapterResponse;
import backend.backend.Service.ChapterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    @GetMapping
    public ResponseEntity<List<ChapterResponse>> getChapters(
            @PathVariable UUID courseId) {
        return ResponseEntity.ok(chapterService.getChaptersByCourse(courseId));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ChapterResponse> addChapter(
            @PathVariable UUID courseId,
            @Valid @RequestBody CreateChapterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chapterService.addChapter(courseId, request));
    }

    @PutMapping("/{chapterId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ChapterResponse> updateChapter(
            @PathVariable UUID courseId,
            @PathVariable UUID chapterId,
            @RequestBody UpdateChapterRequest request) {
        return ResponseEntity.ok(chapterService.updateChapter(courseId, chapterId, request));
    }

    @PostMapping("/{chapterId}/assessment")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<AssessmentResponse> addChapterAssessment(
            @PathVariable UUID courseId,
            @PathVariable UUID chapterId,
            @Valid @RequestBody CreateAssessmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chapterService.addChapterAssessment(courseId, chapterId, request));
    }

    @PostMapping("/grand-assessment")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<AssessmentResponse> addGrandAssessment(
            @PathVariable UUID courseId,
            @Valid @RequestBody CreateAssessmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chapterService.addGrandAssessment(courseId, request));
    }
}