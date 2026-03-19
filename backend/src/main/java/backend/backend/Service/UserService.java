package backend.backend.Service;

import backend.backend.Entity.Instructor;
import backend.backend.Entity.Student;
import backend.backend.Entity.User;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Repository.InstructorRepository;
import backend.backend.Repository.StudentRepository;
import backend.backend.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;

    public Map<String, Object> getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId().toString());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole().name());
        profile.put("avatarUrl", user.getAvatarUrl());

        if ("STUDENT".equals(user.getRole().name())) {
            Student student = studentRepository.findById(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
            profile.put("college", student.getCollege());
            profile.put("yearOfStudy", student.getYearOfStudy());
            profile.put("bio", student.getBio());
            profile.put("interests", student.getInterests());
        } else if ("INSTRUCTOR".equals(user.getRole().name())) {
            Instructor instructor = instructorRepository.findById(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor profile not found"));
            profile.put("qualification", instructor.getQualification());
            profile.put("experience", instructor.getExperience());
            profile.put("specialization", instructor.getSpecialization());
            profile.put("bio", instructor.getBio());
            profile.put("rating", instructor.getRating());
        }

        return profile;
    }
}
