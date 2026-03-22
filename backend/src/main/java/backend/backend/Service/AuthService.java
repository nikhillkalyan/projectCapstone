package backend.backend.Service;

import backend.backend.Dto.Request.InstructorSignupRequest;
import backend.backend.Dto.Request.LoginRequest;
import backend.backend.Dto.Request.StudentSignupRequest;
import backend.backend.Dto.Response.AuthResponse;

public interface AuthService {
    AuthResponse studentSignup(StudentSignupRequest request);
    AuthResponse instructorSignup(InstructorSignupRequest request);
    AuthResponse login(LoginRequest request);
}