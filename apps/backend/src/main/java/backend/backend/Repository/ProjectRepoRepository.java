package backend.backend.Repository;

import backend.backend.Entity.ProjectRepo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepoRepository extends JpaRepository<ProjectRepo, UUID> {
    List<ProjectRepo> findByInstructorOwnerId(UUID instructorOwnerId);
}
