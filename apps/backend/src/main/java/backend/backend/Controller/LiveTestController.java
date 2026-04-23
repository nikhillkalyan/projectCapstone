package backend.backend.Controller;

import backend.backend.Dto.Request.CreateLiveTestRequest;
import backend.backend.Dto.Request.SubmitLiveTestRequest;
import backend.backend.Dto.Response.LiveTestResponse;
import backend.backend.Dto.Response.LiveTestResultResponse;
import backend.backend.Service.LiveTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/live-tests")
@RequiredArgsConstructor
public class LiveTestController {

    private final LiveTestService liveTestService;

    @PostMapping("/course/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<LiveTestResponse> createLiveTest(
            @PathVariable UUID courseId,
            @RequestBody CreateLiveTestRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(liveTestService.createLiveTest(courseId, request, principal.getUsername()));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<LiveTestResponse>> getLiveTestsForCourse(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(liveTestService.getLiveTestsForCourse(courseId, principal.getUsername()));
    }

    @GetMapping("/{liveTestId}/stats")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<LiveTestResponse> getLiveTestStats(
            @PathVariable UUID liveTestId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(liveTestService.getLiveTestWithSubmissions(liveTestId, principal.getUsername()));
    }

    @PostMapping("/{liveTestId}/launch")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<LiveTestResponse> launchLiveTest(
            @PathVariable UUID liveTestId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(liveTestService.launchLiveTest(liveTestId, principal.getUsername()));
    }

    @PostMapping("/{liveTestId}/close")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<LiveTestResponse> closeLiveTest(
            @PathVariable UUID liveTestId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(liveTestService.closeLiveTest(liveTestId, principal.getUsername()));
    }

    @DeleteMapping("/{liveTestId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteLiveTest(
            @PathVariable UUID liveTestId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        liveTestService.deleteLiveTest(liveTestId, principal.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/course/{courseId}/active")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LiveTestResponse> getActiveLiveTest(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserDetails principal
    ) {
        LiveTestResponse response = liveTestService.getActiveLiveTest(courseId, principal.getUsername());
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{liveTestId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LiveTestResultResponse> submitLiveTest(
            @PathVariable UUID liveTestId,
            @RequestBody SubmitLiveTestRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return ResponseEntity.ok(liveTestService.submitLiveTest(liveTestId, request, principal.getUsername()));
    }
}
