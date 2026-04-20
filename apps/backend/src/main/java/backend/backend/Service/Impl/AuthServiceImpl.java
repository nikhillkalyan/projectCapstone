package backend.backend.Service.Impl;

import backend.backend.Dto.Request.InstructorSignupRequest;
import backend.backend.Dto.Request.LoginRequest;
import backend.backend.Dto.Request.StudentSignupRequest;
import backend.backend.Dto.Response.AuthResponse;
import backend.backend.Dto.Response.UniversityLookupResponse;
import backend.backend.Dto.Response.UserProfileResponse;
import backend.backend.Entity.Branch;
import backend.backend.Entity.Instructor;
import backend.backend.Entity.Section;
import backend.backend.Entity.Student;
import backend.backend.Entity.University;
import backend.backend.Entity.User;
import backend.backend.Enums.Role;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Exceptions.UnauthorizedException;
import backend.backend.Repository.BranchRepository;
import backend.backend.Repository.InstructorRepository;
import backend.backend.Repository.SectionRepository;
import backend.backend.Repository.StudentRepository;
import backend.backend.Repository.UniversityRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Security.JwtUtil;
import backend.backend.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

        private final UserRepository userRepository;
        private final StudentRepository studentRepository;
        private final InstructorRepository instructorRepository;
        private final UniversityRepository universityRepository;
        private final BranchRepository branchRepository;
        private final SectionRepository sectionRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;

        @Override
        @Transactional
        public AuthResponse studentSignup(StudentSignupRequest request) {

                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new BadRequestException("Email already in use");
                }

                // --- University onboarding (optional) ---
                University university = null;
                Section section = null;

                if (request.getJoinCode() != null && !request.getJoinCode().isBlank()) {
                        university = universityRepository.findByJoinCode(request.getJoinCode())
                                        .orElseThrow(() -> new BadRequestException("Invalid join code. Please check with your university admin."));

                        if (!Boolean.TRUE.equals(university.getIsActive())) {
                                throw new BadRequestException("This university is currently inactive. Please contact your admin.");
                        }

                        if (request.getSectionId() != null) {
                                section = sectionRepository.findById(request.getSectionId())
                                                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));
                                // Safety: ensure section belongs to this university
                                if (!section.getBranch().getUniversity().getId().equals(university.getId())) {
                                        throw new BadRequestException("Section does not belong to this university");
                                }
                        }
                }

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.STUDENT)
                                .university(university)
                                .build();
                userRepository.save(user);

                Student student = Student.builder()
                                .user(user)
                                .college(request.getCollege())
                                .yearOfStudy(request.getYearOfStudy())
                                .section(section)
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
                                .universityId(university != null ? university.getId() : null)
                                .profile(UserProfileResponse.builder()
                                                .college(request.getCollege())
                                                .yearOfStudy(request.getYearOfStudy())
                                                .interests(student.getInterests())
                                                .universityName(university != null ? university.getName() : null)
                                                .build())
                                .build();
        }

        @Override
        @Transactional
        public AuthResponse instructorSignup(InstructorSignupRequest request) {

                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new BadRequestException("Email already in use");
                }

                // --- University onboarding (optional) ---
                University university = null;
                Branch branch = null;

                if (request.getJoinCode() != null && !request.getJoinCode().isBlank()) {
                        university = universityRepository.findByJoinCode(request.getJoinCode())
                                        .orElseThrow(() -> new BadRequestException("Invalid join code. Please check with your university admin."));

                        if (!Boolean.TRUE.equals(university.getIsActive())) {
                                throw new BadRequestException("This university is currently inactive. Please contact your admin.");
                        }

                        if (request.getBranchId() != null) {
                                branch = branchRepository.findById(request.getBranchId())
                                                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
                                // Safety: ensure branch belongs to this university
                                if (!branch.getUniversity().getId().equals(university.getId())) {
                                        throw new BadRequestException("Branch does not belong to this university");
                                }
                        }
                }

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.INSTRUCTOR)
                                .university(university)
                                .build();
                userRepository.save(user);

                Instructor instructor = Instructor.builder()
                                .user(user)
                                .branch(branch)
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
                                .universityId(university != null ? university.getId() : null)
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
                                                .universityName(university != null ? university.getName() : null)
                                                .build())
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
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
                                        .universityName(user.getUniversity() != null ? user.getUniversity().getName() : null)
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
                                        .universityName(user.getUniversity() != null ? user.getUniversity().getName() : null)
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
                } else if (user.getRole() == Role.UNIVERSITY_ADMIN) {
                        // University Admin — return the university name for the portal topbar
                        String universityName = user.getUniversity() != null ? user.getUniversity().getName() : null;
                        profile = UserProfileResponse.builder()
                                        .avatarUrl(user.getAvatarUrl())
                                        .universityName(universityName)
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
                                .universityId(user.getUniversity() != null ? user.getUniversity().getId() : null)
                                .profile(profile)
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public UniversityLookupResponse lookupUniversityByJoinCode(String joinCode) {
                University university = universityRepository.findByJoinCode(joinCode.trim().toUpperCase())
                                .orElseThrow(() -> new BadRequestException("Invalid join code. Please check with your university admin."));

                if (!Boolean.TRUE.equals(university.getIsActive())) {
                        throw new BadRequestException("This university is currently inactive. Please contact your admin.");
                }

                List<backend.backend.Dto.Response.BranchResponse> branches = branchRepository
                                .findByUniversityId(university.getId())
                                .stream()
                                .map(branch -> {
                                        List<backend.backend.Dto.Response.SectionResponse> sections = sectionRepository
                                                        .findByBranchId(branch.getId())
                                                        .stream()
                                                        .map(section -> backend.backend.Dto.Response.SectionResponse.builder()
                                                                        .id(section.getId())
                                                                        .name(section.getName())
                                                                        .year(section.getYear())
                                                                        .branchId(branch.getId())
                                                                        .branchName(branch.getName())
                                                                        .build())
                                                        .collect(Collectors.toList());

                                        return backend.backend.Dto.Response.BranchResponse.builder()
                                                        .id(branch.getId())
                                                        .name(branch.getName())
                                                        .createdAt(branch.getCreatedAt())
                                                        .sections(sections)
                                                        .build();
                                })
                                .collect(Collectors.toList());

                return UniversityLookupResponse.builder()
                                .id(university.getId())
                                .name(university.getName())
                                .joinCode(university.getJoinCode())
                                .branches(branches)
                                .build();
        }
}
