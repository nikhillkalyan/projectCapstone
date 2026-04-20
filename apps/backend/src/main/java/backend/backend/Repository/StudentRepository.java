package backend.backend.Repository;

import backend.backend.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    Optional<Student> findByUserId(UUID userId);

    /** Fetch all students belonging to a specific university (via user.university_id). */
    List<Student> findByUserUniversityId(UUID universityId);

    /** Count students by university for dashboard stats. */
    long countByUserUniversityId(UUID universityId);
}
