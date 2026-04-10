package backend.backend.Service.Impl;

import backend.backend.Dto.Request.InstructorSignupRequest;
import backend.backend.Dto.Request.LoginRequest;
import backend.backend.Dto.Request.StudentSignupRequest;
import backend.backend.Dto.Response.AuthResponse;
import backend.backend.Dto.Response.UserProfileResponse;
import backend.backend.Entity.Instructor;
import backend.backend.Entity.Student;
import backend.backend.Entity.User;
import backend.backend.Enums.Role;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Exceptions.UnauthorizedException;
import backend.backend.Repository.InstructorRepository;
import backend.backend.Repository.StudentRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Security.JwtUtil;
import backend.backend.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

        private final UserRepository userRepository;
        private final StudentRepository studentRepository;
        private final InstructorRepository instructorRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;

        @Override
        @Transactional
        public AuthResponse studentSignup(StudentSignupRequest request) {

                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new BadRequestException("Email already in use");
                }

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.STUDENT)
                                .build();
                userRepository.save(user);

                Student student = Student.builder()
                                .user(user)
                                .college(request.getCollege())
                                .yearOfStudy(request.getYearOfStudy())
                                .interests(request.getInterests() != null ? request.getInterests()
                                                : new java.util.ArrayList<>())
                                .build();
                studentRepository.save(student);

                String token = jwtUtil.generateToken(user.getId(), user.getEmail(),
                                user.getRole().name());

                return AuthResponse.builder()
                                .token(token)
                                .userId(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .profile(UserProfileResponse.builder()
                                                .college(student.getCollege())
                                                .yearOfStudy(student.getYearOfStudy())
                                                .interests(student.getInterests())
                                                .build())
                                .build();
        }

        @Override
        @Transactional
        public AuthResponse instructorSignup(InstructorSignupRequest request) {

                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new BadRequestException("Email already in use");
                }

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.INSTRUCTOR)
                                .build();
                userRepository.save(user);

                Instructor instructor = Instructor.builder()
                                .user(user)
                                .qualification(request.getQualification())
                                .experience(request.getExperience())
                                .specialization(request.getSpecialization())
                                .bio(request.getBio())
                                .ugCertificateUrl(request.getUgCertificateUrl())
                                .pgCertificateUrl(request.getPgCertificateUrl())
                                .phdCertificateUrl(request.getPhdCertificateUrl())
                                .rating(0.0f)
                                .totalStudents(0)
                                .build();
                instructorRepository.save(instructor);

                String token = jwtUtil.generateToken(user.getId(), user.getEmail(),
                                user.getRole().name());

                return AuthResponse.builder()
                                .token(token)
                                .userId(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .profile(UserProfileResponse.builder()
                                                .qualification(instructor.getQualification())
                                                .experience(instructor.getExperience())
                                                .specialization(instructor.getSpecialization())
                                                .bio(instructor.getBio())
                                                .rating(instructor.getRating())
                                                .totalStudents(instructor.getTotalStudents())
                                                .ugCertificateUrl(instructor.getUgCertificateUrl())
                                                .pgCertificateUrl(instructor.getPgCertificateUrl())
                                                .phdCertificateUrl(instructor.getPhdCertificateUrl())
                                                .approvalStatus(instructor.getApprovalStatus() != null ? instructor.getApprovalStatus().name() : "PENDING")
                                                .rejectionReason(instructor.getRejectionReason())
                                                .flagMessage(instructor.getFlagMessage())
                                                .build())
                                .build();
        }

        @Override
        public AuthResponse login(LoginRequest request) {

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        throw new UnauthorizedException("Invalid email or password");
                }

                String token = jwtUtil.generateToken(user.getId(), user.getEmail(),
                                user.getRole().name());

                UserProfileResponse profile;

                if (user.getRole() == Role.STUDENT) {
                        Student student = studentRepository.findById(user.getId())
                                        .orElseThrow(() -> new UnauthorizedException("Student profile not found"));
                        profile = UserProfileResponse.builder()
                                        .avatarUrl(user.getAvatarUrl())
                                        .college(student.getCollege())
                                        .yearOfStudy(student.getYearOfStudy())
                                        .bio(student.getBio())
                                        .interests(student.getInterests())
                                        .build();
                } else if (user.getRole() == Role.INSTRUCTOR) {
                        Instructor instructor = instructorRepository.findById(user.getId())
                                        .orElseThrow(() -> new UnauthorizedException("Instructor profile not found"));
                        
                        // Allowed to login, removed status will be handled in frontend Waiting Room

                        profile = UserProfileResponse.builder()
                                        .avatarUrl(user.getAvatarUrl())
                                        .qualification(instructor.getQualification())
                                        .experience(instructor.getExperience())
                                        .specialization(instructor.getSpecialization())
                                        .bio(instructor.getBio())
                                        .rating(instructor.getRating())
                                        .totalStudents(instructor.getTotalStudents())
                                        .ugCertificateUrl(instructor.getUgCertificateUrl())
                                        .pgCertificateUrl(instructor.getPgCertificateUrl())
                                        .phdCertificateUrl(instructor.getPhdCertificateUrl())
                                        .approvalStatus(instructor.getApprovalStatus() != null ? instructor.getApprovalStatus().name() : "PENDING")
                                        .rejectionReason(instructor.getRejectionReason())
                                        .flagMessage(instructor.getFlagMessage())
                                        .build();
                } else {
                        // ADMIN — no profile needed
                        profile = UserProfileResponse.builder()
                                        .avatarUrl(user.getAvatarUrl())
                                        .build();
                }

                return AuthResponse.builder()
                                .token(token)
                                .userId(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .profile(profile)
                                .build();
        }
}