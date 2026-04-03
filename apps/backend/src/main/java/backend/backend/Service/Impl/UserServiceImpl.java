package backend.backend.Service.Impl;

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
    private final SecurityUtils securityUtils;

    @Override
    public UserResponse getCurrentUserProfile() {
        User user = securityUtils.getCurrentUser();
        return buildUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUserProfile(UpdateProfileRequest request) {
        User user = securityUtils.getCurrentUser();

        // Update avatar if provided
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
            userRepository.save(user);
        }

        if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findById(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

            if (request.getBio() != null) student.setBio(request.getBio());
            if (request.getCollege() != null) student.setCollege(request.getCollege());
            if (request.getYearOfStudy() != null) student.setYearOfStudy(request.getYearOfStudy());
            if (request.getInterests() != null) student.setInterests(request.getInterests());

            studentRepository.save(student);

        } else {
            Instructor instructor = instructorRepository.findById(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

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
                    .qualification(instructor.getQualification())
                    .experience(instructor.getExperience())
                    .specialization(instructor.getSpecialization())
                    .bio(instructor.getBio())
                    .rating(instructor.getRating())
                    .totalStudents(instructor.getTotalStudents())
                    .build();
        }

        return UserResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .joinedAt(user.getJoinedAt())
                .profile(profile)
                .build();
    }
}