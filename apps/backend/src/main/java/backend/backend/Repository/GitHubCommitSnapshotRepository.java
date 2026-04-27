package backend.backend.Repository;

import backend.backend.Entity.GitHubCommitSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface GitHubCommitSnapshotRepository extends JpaRepository<GitHubCommitSnapshot, UUID> {
    List<GitHubCommitSnapshot> findTop30ByProjectGroupIdOrderBySyncedAtDesc(UUID projectGroupId);
    void deleteByProjectGroupId(UUID projectGroupId);
    void deleteByProjectGroupIdIn(Collection<UUID> projectGroupIds);
}
