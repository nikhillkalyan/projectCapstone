package backend.backend.Repository;

import backend.backend.Entity.ProjectGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectGroupRepository extends JpaRepository<ProjectGroup, UUID> {
    List<ProjectGroup> findByCourseId(UUID courseId);
}
