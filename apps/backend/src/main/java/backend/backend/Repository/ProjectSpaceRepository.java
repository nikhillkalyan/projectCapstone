package backend.backend.Repository;

import backend.backend.Entity.ProjectSpace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectSpaceRepository extends JpaRepository<ProjectSpace, UUID> {
    Optional<ProjectSpace> findByCourseId(UUID courseId);
    boolean existsByCourseId(UUID courseId);
}
