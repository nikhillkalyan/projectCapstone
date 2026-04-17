package backend.backend.Controller;

import backend.backend.Dto.Request.CreateUniversityRequest;
import backend.backend.Dto.Response.UniversityResponse;
import backend.backend.Service.UniversityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/universities")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UniversityController {

    private final UniversityService universityService;

    /**
     * Platform Admin: Create a new university and its admin account.
     * Returns the university details including the generated join code and admin credentials.
     */
    @PostMapping
    public ResponseEntity<UniversityResponse> createUniversity(@RequestBody CreateUniversityRequest request) {
        return ResponseEntity.ok(universityService.createUniversity(request));
    }

    /**
     * Platform Admin: List all registered universities.
     */
    @GetMapping
    public ResponseEntity<List<UniversityResponse>> getAllUniversities() {
        return ResponseEntity.ok(universityService.getAllUniversities());
    }

    /**
     * Platform Admin: Toggle a university active/inactive.
     */
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<UniversityResponse> toggleStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(universityService.toggleUniversityStatus(id));
    }

    /**
     * Platform Admin: Reset the university admin's password.
     */
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetAdminPassword(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        universityService.resetAdminPassword(id, body.get("newPassword"));
        return ResponseEntity.ok().build();
    }
}
