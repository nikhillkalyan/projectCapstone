package backend.backend.Controller;

import backend.backend.Dto.Request.CreateUniversityCourseAllocationRequest;
import backend.backend.Dto.Request.CreateUniversityCourseRequest;
import backend.backend.Dto.Request.RejectRequest;
import backend.backend.Dto.Response.CourseAllocationResponse;
import backend.backend.Dto.Response.SectionResponse;
import backend.backend.Dto.Response.UniversityCourseResponse;
import backend.backend.Dto.Response.BranchResponse;
import backend.backend.Entity.User;
import backend.backend.Repository.UserRepository;
import backend.backend.Service.UniversityContextService;
import backend.backend.Service.UniversityCourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/uni-courses")
@RequiredArgsConstructor
public class UniversityCourseController {

    private final UniversityCourseService universityCourseService;
    private final UserRepository userRepository;
    private final UniversityContextService contextService;

    // ══════════════════════════════════════════════════════════════
    // INSTRUCTOR ENDPOINTS
    // ══════════════════════════════════════════════════════════════

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<UniversityCourseResponse> createCourse(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CreateUniversityCourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(universityCourseService.createCourse(principal.getUsername(), request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<UniversityCourseResponse>> getMyCourses(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(universityCourseService.getMyCourses(principal.getUsername()));
    }

    @GetMapping("/branches")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<BranchResponse>> getBranchesForInstructor(
            @AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getUniversity() == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(contextService.getBranches(principal.getUsername()));
    }

    // ══════════════════════════════════════════════════════════════
    // UNI-ADMIN ENDPOINTS
    // ══════════════════════════════════════════════════════════════

    @GetMapping("/pool")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<List<UniversityCourseResponse>> getCoursePool(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(universityCourseService.getCoursePool(principal.getUsername(), status));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<UniversityCourseResponse> approveCourse(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(universityCourseService.approveCourse(principal.getUsername(), id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<UniversityCourseResponse> rejectCourse(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id,
            @RequestBody RejectRequest request) {
        return ResponseEntity.ok(universityCourseService.rejectCourse(principal.getUsername(), id, request));
    }

    // ══════════════════════════════════════════════════════════════
    // ALLOCATIONS & SECTIONS
    // ══════════════════════════════════════════════════════════════

    @GetMapping("/allocations")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<List<CourseAllocationResponse>> getAllocations(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
            universityCourseService.getAllocations(principal.getUsername()));
    }

    @PostMapping("/allocations")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<List<CourseAllocationResponse>> allocateCourse(
            @RequestBody CreateUniversityCourseAllocationRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
            universityCourseService.allocateCourse(req, principal.getUsername()));
    }

    @DeleteMapping("/allocations/{allocationId}")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<Void> removeAllocation(
            @PathVariable UUID allocationId,
            @AuthenticationPrincipal UserDetails principal) {
        universityCourseService.removeAllocation(allocationId, principal.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sections")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<List<SectionResponse>> getSectionsForAdmin(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
            universityCourseService.getSectionsForAdmin(principal.getUsername()));
    }
}
