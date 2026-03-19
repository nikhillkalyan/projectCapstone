package backend.backend.Service;

import backend.backend.DTO.Auth.*;
import backend.backend.Entity.Instructor;
import backend.backend.Entity.Student;
import backend.backend.Entity.User;
import backend.backend.Enums.Role;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Repository.InstructorRepository;
import backend.backend.Repository.StudentRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse studentSignup(StudentSignupRequest request) {
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already taken!");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();
        user = userRepository.save(user);

        Student student = Student.builder()
                .user(user)
                .college(request.getCollege())
                .yearOfStudy(request.getYear())
                .interests(request.getInterests())
                .build();
        studentRepository.save(student);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return createAuthResponse(token, user);
    }

    @Transactional
    public AuthResponse instructorSignup(InstructorSignupRequest request) {
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already taken!");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.INSTRUCTOR)
                .build();
        user = userRepository.save(user);

        Instructor instructor = Instructor.builder()
                .user(user)
                .qualification(request.getQualification())
                .experience(request.getExperience())
                .specialization(request.getSpecialization())
                .bio(request.getBio())
                .build();
        instructorRepository.save(instructor);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return createAuthResponse(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return createAuthResponse(token, user);
    }

    private AuthResponse createAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId().toString())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .avatarUrl(user.getAvatarUrl())
                        .build())
                .build();
    }
}
