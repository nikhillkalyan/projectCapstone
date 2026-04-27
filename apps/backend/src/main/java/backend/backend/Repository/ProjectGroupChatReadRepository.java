package backend.backend.Repository;

import backend.backend.Entity.ProjectGroupChatRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectGroupChatReadRepository extends JpaRepository<ProjectGroupChatRead, UUID> {
    Optional<ProjectGroupChatRead> findByProjectGroupIdAndUserId(UUID projectGroupId, UUID userId);

    void deleteByProjectGroupIdIn(Collection<UUID> projectGroupIds);
}
