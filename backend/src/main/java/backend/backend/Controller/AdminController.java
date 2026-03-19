package backend.backend.Controller;

import backend.backend.Entity.Instructor;
import backend.backend.Repository.InstructorRepository;
import backend.backend.Repository.UserRepository;
import backend.backend.Repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final InstructorRepository instructorRepository;
    private final CourseRepository courseRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCourses", courseRepository.count());
        stats.put("pendingInstructors", instructorRepository.findAll().stream().filter(i -> !i.getIsVerified()).count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/instructors/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Instructor>> getPendingInstructors() {
        return ResponseEntity.ok(instructorRepository.findAll().stream().filter(i -> !i.getIsVerified()).toList());
    }

    @PostMapping("/instructors/{id}/verify")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Instructor> verifyInstructor(@PathVariable UUID id) {
        Instructor instructor = instructorRepository.findById(id).orElseThrow();
        instructor.setIsVerified(true);
        return ResponseEntity.ok(instructorRepository.save(instructor));
    }
}
