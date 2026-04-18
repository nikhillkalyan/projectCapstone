package backend.backend.Controller;

import backend.backend.Dto.Request.InstructorSignupRequest;
import backend.backend.Dto.Request.LoginRequest;
import backend.backend.Dto.Request.StudentSignupRequest;
import backend.backend.Dto.Response.AuthResponse;
import backend.backend.Dto.Response.UniversityLookupResponse;
import backend.backend.Service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/student/signup")
    public ResponseEntity<AuthResponse> studentSignup(
            @Valid @RequestBody StudentSignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.studentSignup(request));
    }

    @PostMapping("/instructor/signup")
    public ResponseEntity<AuthResponse> instructorSignup(
            @Valid @RequestBody InstructorSignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.instructorSignup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Public endpoint — no auth needed.
     * Called by the signup form to validate a join code and load the
     * university's branches + sections for the dropdowns.
     */
    @GetMapping("/university/lookup")
    public ResponseEntity<UniversityLookupResponse> lookupUniversity(
            @RequestParam String joinCode) {
        return ResponseEntity.ok(authService.lookupUniversityByJoinCode(joinCode));
    }
}