package backend.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import backend.backend.Entity.Assessment;

public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {
}
