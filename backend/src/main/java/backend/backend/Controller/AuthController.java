package backend.backend.Controller;

import backend.backend.DTO.Auth.AuthResponse;
import backend.backend.DTO.Auth.InstructorSignupRequest;
import backend.backend.DTO.Auth.LoginRequest;
import backend.backend.DTO.Auth.StudentSignupRequest;
import backend.backend.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/student/signup")
    public ResponseEntity<AuthResponse> studentSignup(@RequestBody StudentSignupRequest request) {
        return ResponseEntity.ok(authService.studentSignup(request));
    }

    @PostMapping("/instructor/signup")
    public ResponseEntity<AuthResponse> instructorSignup(@RequestBody InstructorSignupRequest request) {
        return ResponseEntity.ok(authService.instructorSignup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

}
