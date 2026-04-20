package backend.backend.Repository;

import backend.backend.Entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByInstructorId(UUID instructorId);
    
    List<Course> findByInstructorIdAndIsUniversityCourseTrue(UUID instructorId);

    List<Course> findByUniversityIdAndIsUniversityCourseTrue(UUID universityId);
}