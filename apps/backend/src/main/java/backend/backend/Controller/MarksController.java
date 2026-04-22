package backend.backend.Controller;

import backend.backend.Dto.Response.MarksBreakdownResponse;
import backend.backend.Dto.Response.StudentMarksResponse;
import backend.backend.Service.MarksService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/marks")
@RequiredArgsConstructor
public class MarksController {

    private final MarksService marksService;

    @GetMapping("/student/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<MarksBreakdownResponse> getMyMarks(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.getStudentMarks(principal.getUsername(), courseId));
    }

    @GetMapping("/instructor/course/{courseId}/students")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<StudentMarksResponse>> getCourseStudentMarks(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                marksService.getCourseStudentMarks(principal.getUsername(), courseId));
    }
}
