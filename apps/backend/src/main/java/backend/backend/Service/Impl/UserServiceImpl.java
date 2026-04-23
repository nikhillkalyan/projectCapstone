package backend.backend.Service.Impl;

import backend.backend.Dto.Request.JoinUniversityRequest;
import backend.backend.Entity.Branch;
import backend.backend.Entity.Section;
import backend.backend.Entity.University;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Repository.BranchRepository;
import backend.backend.Repository.SectionRepository;
import backend.backend.Repository.UniversityRepository;
import backend.backend.Dto.Request.UpdateProfileRequest;
import backend.backend.Dto.Response.UserProfileResponse;
import backend.backend.Dto.Response.UserResponse;
import backend.backend.Entity.Instructor;
import backend.backend.Entity.Student;
import backend.backend.Entity.User;
import backend.backend.Enums.Role;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Repository.InstructorRepository;
import backend.backend.Repository.StudentRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Service.UserService;
import backend.backend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final UniversityRepository universityRepository;
    private final BranchRepository branchRepository;
    private final SectionRepository sectionRepository;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        User user = securityUtils.getCurrentUser();
        return buildUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUserProfile(UpdateProfileRequest request) {
        User user = securityUtils.getCurrentUser();

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        // Update avatar if provided
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        if (request.getGithubUsername() != null) {
            user.setGithubUsername(request.getGithubUsername().isBlank() ? null : request.getGithubUsername().trim());
        }

        userRepository.save(user);

        if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findById(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

            if (request.getRollNumber() != null) student.setRollNumber(request.getRollNumber().isBlank() ? null : request.getRollNumber().trim());
            if (request.getBio() != null) student.setBio(request.getBio());
            if (request.getCollege() != null) student.setCollege(request.getCollege());
            if (request.getYearOfStudy() != null) student.setYearOfStudy(request.getYearOfStudy());
            if (request.getInterests() != null) student.setInterests(request.getInterests());

            studentRepository.save(student);

        } else {
            Instructor instructor = instructorRepository.findById(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

            if (request.getEmployeeId() != null) instructor.setEmployeeId(request.getEmployeeId().isBlank() ? null : request.getEmployeeId().trim());
            if (request.getBio() != null) instructor.setBio(request.getBio());
            if (request.getQualification() != null) instructor.setQualification(request.getQualification());
            if (request.getExperience() != null) instructor.setExperience(request.getExperience());
            if (request.getSpecialization() != null) instructor.setSpecialization(request.getSpecialization());

            instructorRepository.save(instructor);
        }

        return buildUserResponse(user);
    }

    private UserResponse buildUserResponse(User user) {
        UserProfileResponse profile;

        if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findById(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

            profile = UserProfileResponse.builder()
                    .avatarUrl(user.getAvatarUrl())
                    .githubUsername(user.getGithubUsername())
                    .universityName(user.getUniversity() != null ? user.getUniversity().getName() : null)
                    .rollNumber(student.getRollNumber())
                    .college(student.getCollege())
                    .yearOfStudy(student.getYearOfStudy())
                    .bio(student.getBio())
                    .interests(student.getInterests())
                    .build();
        } else {
            Instructor instructor = instructorRepository.findById(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

            profile = UserProfileResponse.builder()
                    .avatarUrl(user.getAvatarUrl())
                    .githubUsername(user.getGithubUsername())
                    .universityName(user.getUniversity() != null ? user.getUniversity().getName() : null)
                    .employeeId(instructor.getEmployeeId())
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
        }

        return UserResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .universityId(user.getUniversity() != null ? user.getUniversity().getId() : null)
                .joinedAt(user.getJoinedAt())
                .profile(profile)
                .build();
    }

    @Override
    @Transactional
    public void joinUniversity(JoinUniversityRequest request) {
        User user = securityUtils.getCurrentUser();
        
        if (user.getUniversity() != null) {
            throw new BadRequestException("User already belongs to a university.");
        }

        University university = universityRepository.findByJoinCode(request.getJoinCode())
                .orElseThrow(() -> new BadRequestException("Invalid join code."));

        user.setUniversity(university);
        userRepository.save(user);

        if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findById(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

            student.setRollNumber(request.getRollNumber());
            if(request.getCollege() != null) student.setCollege(request.getCollege());
            if(request.getYearOfStudy() != null) student.setYearOfStudy(request.getYearOfStudy());

            if (request.getSectionId() != null) {
                Section section = sectionRepository.findById(request.getSectionId())
                        .orElseThrow(() -> new BadRequestException("Section not found"));
                if (!section.getBranch().getUniversity().getId().equals(university.getId())) {
                    throw new BadRequestException("Section belongs to another university.");
                }
                student.setSection(section);
            }

            studentRepository.save(student);
        } else if (user.getRole() == Role.INSTRUCTOR) {
            Instructor instructor = instructorRepository.findById(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

            instructor.setEmployeeId(request.getEmployeeId());
            // We intentionally do NOT reset the approval status to PENDING here.
            // If they are already approved globally, they remain approved.
            
            if (request.getBranchId() != null) {
                Branch branch = branchRepository.findById(request.getBranchId())
                        .orElseThrow(() -> new BadRequestException("Branch not found"));
                if (!branch.getUniversity().getId().equals(university.getId())) {
                    throw new BadRequestException("Branch belongs to another university.");
                }
                instructor.setBranch(branch);
            }
            
            instructorRepository.save(instructor);
        }
    }
}
