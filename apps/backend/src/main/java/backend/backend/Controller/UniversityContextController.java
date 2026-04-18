package backend.backend.Controller;

import backend.backend.Dto.Request.CreateBranchRequest;
import backend.backend.Dto.Request.CreateSectionRequest;
import backend.backend.Dto.Response.BranchResponse;
import backend.backend.Dto.Response.SectionResponse;
import backend.backend.Service.UniversityContextService;
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
@RequestMapping("/api/v1/uni-admin/context")
@RequiredArgsConstructor
@PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
public class UniversityContextController {

    private final UniversityContextService contextService;

    // ══════════════════════════════════════════════════════════════════════
    // BRANCHES
    // ══════════════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/uni-admin/context/branches
     * Returns all branches with their sections for this admin's university.
     */
    @GetMapping("/branches")
    public ResponseEntity<List<BranchResponse>> getBranches(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(contextService.getBranches(principal.getUsername()));
    }

    /**
     * POST /api/v1/uni-admin/context/branches
     * Creates a new branch under this admin's university.
     */
    @PostMapping("/branches")
    public ResponseEntity<BranchResponse> createBranch(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody CreateBranchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contextService.createBranch(principal.getUsername(), request));
    }

    /**
     * DELETE /api/v1/uni-admin/context/branches/{id}
     * Deletes a branch (and its sections cascade) if it belongs to this admin's university.
     */
    @DeleteMapping("/branches/{id}")
    public ResponseEntity<Void> deleteBranch(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id) {
        contextService.deleteBranch(principal.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    // ══════════════════════════════════════════════════════════════════════
    // SECTIONS
    // ══════════════════════════════════════════════════════════════════════

    /**
     * POST /api/v1/uni-admin/context/sections
     * Creates a new section under a branch that belongs to this admin's university.
     */
    @PostMapping("/sections")
    public ResponseEntity<SectionResponse> createSection(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody CreateSectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contextService.createSection(principal.getUsername(), request));
    }

    /**
     * DELETE /api/v1/uni-admin/context/sections/{id}
     * Deletes a section if it belongs to a branch in this admin's university.
     */
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id) {
        contextService.deleteSection(principal.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
