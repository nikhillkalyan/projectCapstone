package backend.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import backend.backend.Entity.Course;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {

    List<Course> findByInstructorId(UUID instructorId);

    List<Course> findByCategory(String category);

    List<Course> findByTitleContainingIgnoreCase(String keyword);
}