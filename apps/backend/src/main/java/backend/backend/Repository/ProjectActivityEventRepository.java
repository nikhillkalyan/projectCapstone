package backend.backend.Repository;

import backend.backend.Entity.ProjectActivityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectActivityEventRepository extends JpaRepository<ProjectActivityEvent, UUID> {
    List<ProjectActivityEvent> findTop12ByProjectSpaceIdOrderByCreatedAtDesc(UUID projectSpaceId);
    List<ProjectActivityEvent> findTop5ByProjectGroupIdOrderByCreatedAtDesc(UUID projectGroupId);
    void deleteByProjectGroupIdIn(Collection<UUID> projectGroupIds);
}
