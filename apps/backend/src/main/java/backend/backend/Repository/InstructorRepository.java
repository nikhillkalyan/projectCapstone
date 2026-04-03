package backend.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import backend.backend.Entity.Instructor;

public interface InstructorRepository extends JpaRepository<Instructor, UUID> {
}
