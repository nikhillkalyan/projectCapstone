package backend.backend.Repository;

import backend.backend.Entity.GitHubPullRequestSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface GitHubPullRequestSnapshotRepository extends JpaRepository<GitHubPullRequestSnapshot, UUID> {
    List<GitHubPullRequestSnapshot> findByProjectGroupIdOrderBySyncedAtDescPrNumberDesc(UUID projectGroupId);
    void deleteByProjectGroupId(UUID projectGroupId);
    void deleteByProjectGroupIdIn(Collection<UUID> projectGroupIds);
}
